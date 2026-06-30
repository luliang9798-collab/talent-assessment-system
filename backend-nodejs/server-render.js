const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'talent-assessment-secret-key-2026';

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// 数据库初始化
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'talent_assessment.db');
console.log('数据库路径:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('数据库连接成功');
        initDatabase();
    }
});

// 初始化数据库表
function initDatabase() {
    db.serialize(() => {
        // 用户表
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            real_name TEXT,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('创建 users 表失败:', err);
        });

        // 测评工具表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            description TEXT,
            question_count INTEGER DEFAULT 0,
            estimated_time INTEGER DEFAULT 10
        )`, (err) => {
            if (err) console.error('创建 assessment_tools 表失败:', err);
        });

        // 题目表
        db.run(`CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool_id INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            question_type TEXT DEFAULT 'single',
            options TEXT,
            order_num INTEGER DEFAULT 0,
            dimension TEXT,
            answer TEXT,
            FOREIGN KEY (tool_id) REFERENCES assessment_tools(id)
        )`, (err) => {
            if (err) console.error('创建 questions 表失败:', err);
        });

        // 测评结果表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            tool_id INTEGER,
            answers TEXT,
            total_score REAL,
            dimension_scores TEXT,
            report_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (tool_id) REFERENCES assessment_tools(id)
        )`, (err) => {
            if (err) console.error('创建 assessment_results 表失败:', err);
        });

        // 九宫格表
        db.run(`CREATE TABLE IF NOT EXISTS nine_box_grids (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('创建 nine_box_grids 表失败:', err);
        });

        // 检查是否有管理员用户，如果没有则创建
        db.get('SELECT COUNT(*) as count FROM users WHERE username = ?', ['admin'], (err, row) => {
            if (!err && (!row || row.count === 0)) {
                const password_hash = bcrypt.hashSync('admin123', 10);
                db.run('INSERT INTO users (username, password_hash, real_name, role) VALUES (?, ?, ?, ?)',
                    ['admin', password_hash, '管理员', 'admin'], (err) => {
                    if (err) console.error('创建管理员失败:', err);
                    else console.log('✅ 管理员账号已创建: admin / admin123');
                });
            }
        });

        // 检查是否有测评工具，如果没有则插入默认工具
        db.get('SELECT COUNT(*) as count FROM assessment_tools', [], (err, row) => {
            if (!err && (!row || row.count === 0)) {
                insertDefaultTools();
            } else {
                console.log('✅ 数据库已初始化');
            }
        });
    });
}

// 插入默认测评工具
function insertDefaultTools() {
    const tools = [
        {name: 'MBTI人格测评', category: '人格特质', description: 'Myers-Briggs Type Indicator', question_count: 93, estimated_time: 20},
        {name: '大五人格测评', category: '人格特质', description: 'Big Five Personality', question_count: 50, estimated_time: 15},
        {name: 'SHL胜任力测评', category: '胜任力', description: 'SHL Competency', question_count: 104, estimated_time: 30},
        {name: '霍兰德职业兴趣', category: '职业兴趣', description: 'Holland Interest', question_count: 60, estimated_time: 15},
        {name: 'DISC行为风格', category: '行为风格', description: 'DISC Behavior', question_count: 28, estimated_time: 10}
    ];

    const stmt = db.prepare('INSERT INTO assessment_tools (name, category, description, question_count, estimated_time) VALUES (?, ?, ?, ?, ?)');
    tools.forEach(tool => {
        stmt.run([tool.name, tool.category, tool.description, tool.question_count, tool.estimated_time]);
    });
    stmt.finalize(() => {
        console.log('✅ 默认测评工具已创建');
        console.log('🎉 数据库初始化完成！');
    });
}

// JWT 认证中间件
function auth(req, res, next) {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header) return res.status(401).json({ success: false, message: '未提供认证令牌' });
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : header;
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        return res.status(401).json({ success: false, message: '令牌无效或已过期' });
    }
}

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// 登录
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.json({ success: false, message: '请输入用户名和密码' });
    }
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.json({ success: false, message: '数据库错误' });
        if (!user) return res.json({ success: false, message: '用户不存在' });
        if (!bcrypt.compareSync(password, user.password_hash)) {
            return res.json({ success: false, message: '密码错误' });
        }
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            success: true,
            token: token,
            user: { id: user.id, username: user.username, realName: user.real_name || '' }
        });
    });
});

// 获取测评工具列表
app.get('/api/tools', auth, (req, res) => {
    db.all('SELECT * FROM assessment_tools ORDER BY id', [], (err, tools) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, tools: tools || [] });
    });
});

// 获取题目
app.get('/api/tools/:toolId/questions', auth, (req, res) => {
    const toolId = req.params.toolId;
    db.all('SELECT * FROM questions WHERE tool_id = ? ORDER BY order_num', [toolId], (err, questions) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, questions: questions || [], total: (questions || []).length });
    });
});

// 保存测评结果
app.post('/api/results', auth, (req, res) => {
    const { toolId, answers, totalScore, dimensionScores, reportData } = req.body;
    const userId = req.user.userId;
    
    db.run(`INSERT INTO assessment_results (user_id, tool_id, answers, total_score, dimension_scores, report_data)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, toolId, JSON.stringify(answers), totalScore, JSON.stringify(dimensionScores), JSON.stringify(reportData)],
        function(err) {
            if (err) return res.json({ success: false, message: err.message });
            res.json({ success: true, resultId: this.lastID });
        });
});

// 获取测评历史
app.get('/api/results', auth, (req, res) => {
    const userId = req.user.userId;
    db.all(`SELECT r.*, t.name as tool_name 
            FROM assessment_results r 
            LEFT JOIN assessment_tools t ON r.tool_id = t.id 
            WHERE r.user_id = ? 
            ORDER BY r.created_at DESC`, [userId], (err, results) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, results: results || [] });
    });
});

// 用户管理 - 获取用户列表
app.get('/api/users', auth, (req, res) => {
    db.all('SELECT id, username, real_name, role, created_at FROM users ORDER BY id', [], (err, users) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, users: users || [] });
    });
});

// 创建用户
app.post('/api/users', auth, (req, res) => {
    const { username, password, realName, role } = req.body;
    if (!username || !password) {
        return res.json({ success: false, message: '用户名和密码不能为空' });
    }
    const password_hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, password_hash, real_name, role) VALUES (?, ?, ?, ?)',
        [username, password_hash, realName || '', role || 'user'], function(err) {
        if (err) return res.json({ success: false, message: '用户名已存在' });
        res.json({ success: true, userId: this.lastID });
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 人才测评系统启动成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🌐 访问地址:');
    console.log('   http://localhost:' + PORT);
    console.log('');
    console.log('👤 默认账号:');
    console.log('   管理员: admin / admin123');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
});
