const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'talent-assessment-secret-key-2024';

console.log('启动人才测评系统后端...');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 数据库
const db = new sqlite3.Database('./talent_assessment.db');

// 创建表
db.serialize(() => {
    console.log('初始化数据库表...');
    
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        real_name TEXT,
        email TEXT,
        status INTEGER DEFAULT 1
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS assessment_tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_name TEXT,
        tool_type TEXT,
        description TEXT,
        estimated_time INTEGER,
        total_questions INTEGER,
        status INTEGER DEFAULT 1
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS assessment_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_id INTEGER,
        dimension TEXT,
        question_text TEXT,
        question_order INTEGER,
        options TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS assessment_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        tool_id INTEGER,
        status INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// 初始化数据
setTimeout(() => {
    console.log('插入初始数据...');
    
    // 管理员用户
    const hash = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password_hash, real_name) VALUES ('admin', ?, '管理员')`, [hash]);
    
    // 测评工具
    const tools = [
        [1, '大五人格测评', 'personality', '评估开放性、尽责性、外向性、宜人性、神经质', 20, 15],
        [2, 'MBTI职业性格测试', 'personality', '评估16种人格类型', 25, 8],
        [3, 'DISC行为风格测评', 'behavior', '评估D、I、S、C四种行为风格', 15, 12]
    ];
    
    tools.forEach(t => {
        db.run(`INSERT OR IGNORE INTO assessment_tools (id, tool_name, tool_type, description, estimated_time, total_questions) 
                VALUES (?, ?, ?, ?, ?, ?)`, t);
    });
    
    // 题目
    const questions = [
        [1, 1, '开放性', '我喜欢尝试新事物', 1, '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'],
        [2, 1, '开放性', '我对艺术感兴趣', 2, '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'],
        [3, 1, '尽责性', '我总是按时完成任务', 3, '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'],
        [4, 2, 'E-I', '在社交场合，您通常：', 1, '[{"label":"主动交谈","value":"E"},{"label":"等待交谈","value":"I"}]'],
        [5, 2, 'S-N', '您更注重：', 2, '[{"label":"事实和细节","value":"S"},{"label":"整体和可能","value":"N"}]'],
        [6, 3, 'D', '我倾向于直接表达意见', 1, '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'],
        [7, 3, 'I', '我很擅长说服他人', 2, '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]']
    ];
    
    questions.forEach(q => {
        db.run(`INSERT OR IGNORE INTO assessment_questions (id, tool_id, dimension, question_text, question_order, options) 
                VALUES (?, ?, ?, ?, ?, ?)`, q);
    });
    
    console.log('✅ 数据初始化完成');
}, 1000);

// 认证中间件
function auth(req, res, next) {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (!token) return res.status(401).json({success: false, message: '未登录'});
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch(e) {
        return res.status(403).json({success: false, message: 'token无效'});
    }
}

// 登录
app.post('/api/login', (req, res) => {
    const {username, password} = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) return res.json({success: false, message: '用户不存在'});
        if (!bcrypt.compareSync(password, user.password_hash)) {
            return res.json({success: false, message: '密码错误'});
        }
        const token = jwt.sign({userId: user.id, username: user.username}, JWT_SECRET, {expiresIn: '24h'});
        res.json({success: true, token: token, user: {id: user.id, username: user.username, realName: user.real_name}});
    });
});

// 获取工具
app.get('/api/tools', auth, (req, res) => {
    db.all('SELECT * FROM assessment_tools WHERE status = 1', [], (err, tools) => {
        if (err) return res.json({success: false, message: '查询失败'});
        res.json({success: true, tools: tools});
    });
});

// 获取题目
app.get('/api/tools/:id/questions', auth, (req, res) => {
    const toolId = req.params.id;
    db.all('SELECT * FROM assessment_questions WHERE tool_id = ? ORDER BY question_order', [toolId], (err, questions) => {
        if (err) return res.json({success: false, message: '查询失败'});
        res.json({success: true, questions: questions});
    });
});

// 创建任务
app.post('/api/tasks', auth, (req, res) => {
    const {toolId} = req.body;
    db.run('INSERT INTO assessment_tasks (user_id, tool_id, status) VALUES (?, ?, 1)', 
           [req.user.userId, toolId], function(err) {
        if (err) return res.json({success: false, message: '创建失败'});
        res.json({success: true, taskId: this.lastID});
    });
});

// 获取任务
app.get('/api/tasks', auth, (req, res) => {
    db.all(`SELECT t.*, tools.tool_name FROM assessment_tasks t 
            LEFT JOIN assessment_tools tools ON t.tool_id = tools.id 
            WHERE t.user_id = ? ORDER BY t.created_at DESC`, 
           [req.user.userId], (err, tasks) => {
        if (err) return res.json({success: false, message: '查询失败'});
        res.json({success: true, tasks: tasks});
    });
});

// 启动
app.listen(PORT, () => {
    console.log('✅ 人才测评系统启动成功');
    console.log('   地址: <ADDRESS_REMOVED>
    console.log('   账号: admin');
    console.log('   密码: admin123');
});
