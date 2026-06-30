const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'talent-assessment-secret-key';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 数据库
const db = new sqlite3.Database('./talent_assessment.db');

// 初始化数据库
function initDatabase() {
    console.log('初始化数据库...');
    
    // 创建用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        real_name TEXT,
        email TEXT,
        phone TEXT,
        department_id INTEGER,
        position TEXT,
        status INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // 创建测评工具表
    db.run(`CREATE TABLE IF NOT EXISTS assessment_tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_name TEXT,
        tool_type TEXT,
        description TEXT,
        estimated_time INTEGER,
        total_questions INTEGER,
        status INTEGER DEFAULT 1
    )`);
    
    // 创建题目表
    db.run(`CREATE TABLE IF NOT EXISTS assessment_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_id INTEGER,
        dimension TEXT,
        question_text TEXT,
        question_order INTEGER,
        options TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // 创建项目表
    db.run(`CREATE TABLE IF NOT EXISTS assessment_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT,
        project_type TEXT,
        description TEXT,
        created_by INTEGER,
        status INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // 创建任务表
    db.run(`CREATE TABLE IF NOT EXISTS assessment_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        user_id INTEGER,
        tool_id INTEGER,
        status INTEGER DEFAULT 0,
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // 创建答案表
    db.run(`CREATE TABLE IF NOT EXISTS assessment_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        question_id INTEGER,
        answer_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // 创建报告表
    db.run(`CREATE TABLE IF NOT EXISTS assessment_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        user_id INTEGER,
        tool_id INTEGER,
        report_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // 插入管理员用户
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password_hash, real_name, email) 
            VALUES ('admin', ?, '系统管理员', 'admin@talent.com')`, [adminPassword]);
    
    // 插入测评工具
    const tools = [
        ['大五人格测评', 'personality', '评估开放性、尽责性、外向性、宜人性、神经质五个维度', 20, 60],
        ['MBTI职业性格测试', 'personality', '评估16种人格类型', 25, 93],
        ['DISC行为风格测评', 'behavior', '评估支配型、影响型、稳健型、服从型四种行为风格', 15, 24],
        ['霍兰德职业兴趣测评', 'interest', '评估六种职业兴趣类型', 20, 60],
        ['情商（EQ）测评', 'emotion', '评估情绪感知、理解、表达、调节、运用五个维度', 15, 33],
        ['工作动机测评', 'motivation', '评估成就动机、权力动机、亲和动机', 10, 20],
        ['工作价值观测评', 'values', '评估内在价值观、外在价值观、社会价值观', 10, 21]
    ];
    
    const toolStmt = db.prepare(`INSERT OR IGNORE INTO assessment_tools 
                                (tool_name, tool_type, description, estimated_time, total_questions) 
                                VALUES (?, ?, ?, ?, ?)`);
    tools.forEach(tool => toolStmt.run(tool));
    toolStmt.finalize();
    
    console.log('✅ 数据库初始化完成');
}

// 初始化数据
initDatabase();

// JWT认证中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: '未提供token' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'token无效或已过期' });
        }
        req.user = user;
        next();
    });
}

// API路由

// 登录
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.json({ success: false, message: '用户名和密码不能为空' });
    }
    
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.json({ success: false, message: '数据库错误' });
        }
        
        if (!user) {
            return res.json({ success: false, message: '用户不存在' });
        }
        
        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
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
            user: {
                id: user.id,
                username: user.username,
                realName: user.real_name
            }
        });
    });
});

// 获取测评工具列表
app.get('/api/tools', authenticateToken, (req, res) => {
    db.all("SELECT * FROM assessment_tools WHERE status = 1", [], (err, tools) => {
        if (err) {
            return res.json({ success: false, message: '获取工具失败' });
        }
        res.json({ success: true, tools: tools });
    });
});

// 获取测评题目
app.get('/api/tools/:toolId/questions', authenticateToken, (req, res) => {
    const toolId = req.params.toolId;
    
    db.all("SELECT * FROM assessment_questions WHERE tool_id = ? ORDER BY question_order", 
           [toolId], (err, questions) => {
        if (err) {
            return res.json({ success: false, message: '获取题目失败' });
        }
        res.json({ success: true, questions: questions });
    });
});

// 创建测评任务
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { projectId, userId, toolId } = req.body;
    
    db.run("INSERT INTO assessment_tasks (project_id, user_id, tool_id, status) VALUES (?, ?, ?, 0)",
           [projectId, userId, toolId], function(err) {
        if (err) {
            return res.json({ success: false, message: '创建任务失败' });
        }
        res.json({ success: true, taskId: this.lastID });
    });
});

// 获取我的测评任务
app.get('/api/my-tasks', authenticateToken, (req, res) => {
    db.all(`SELECT t.*, p.project_name, u.real_name as user_name, tools.tool_name 
            FROM assessment_tasks t
            LEFT JOIN assessment_projects p ON t.project_id = p.id
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN assessment_tools tools ON t.tool_id = tools.id
            WHERE t.user_id = ? OR p.created_by = ?
            ORDER BY t.created_at DESC`, 
           [req.user.userId, req.user.userId], (err, tasks) => {
        if (err) {
            return res.json({ success: false, message: '获取任务失败' });
        }
        res.json({ success: true, tasks: tasks });
    });
});

// 提交测评答案
app.post('/api/tasks/:taskId/submit', authenticateToken, (req, res) => {
    const taskId = req.params.taskId;
    const { answers } = req.body;
    
    // 更新任务状态
    db.run("UPDATE assessment_tasks SET status = 2, completed_at = CURRENT_TIMESTAMP WHERE id = ?", 
           [taskId], (err) => {
        if (err) {
            return res.json({ success: false, message: '更新任务失败' });
        }
        
        // 保存答案
        const stmt = db.prepare("INSERT INTO assessment_answers (task_id, question_id, answer_value) VALUES (?, ?, ?)");
        answers.forEach(answer => {
            stmt.run(taskId, answer.questionId, answer.value);
        });
        stmt.finalize();
        
        res.json({ success: true });
    });
});

// 获取统计数据
app.get('/api/statistics', authenticateToken, (req, res) => {
    const stats = {};
    
    db.get("SELECT COUNT(*) as count FROM assessment_projects", [], (err, row) => {
        stats.totalProjects = row.count;
        
        db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
            stats.totalUsers = row.count;
            
            db.get("SELECT COUNT(*) as count FROM assessment_tasks WHERE status = 2", [], (err, row) => {
                stats.completedTasks = row.count;
                
                db.get("SELECT COUNT(*) as count FROM assessment_reports", [], (err, row) => {
                    stats.totalReports = row.count;
                    res.json({ success: true, statistics: stats });
                });
            });
        });
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log('✅ 人才测评系统后端启动成功');
    console.log('   访问地址: <ADDRESS_REMOVED>
    console.log('   登录账号: admin');
    console.log('   登录密码: admin123');
});
