const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'talent-assessment-secret-2024';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '../frontend')));

// 数据库初始化
const db = new sqlite3.Database('./talent_assessment_new.db', (err) => {
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
            password TEXT NOT NULL,
            real_name TEXT,
            email TEXT,
            phone TEXT,
            status INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 角色表
        db.run(`CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_name TEXT NOT NULL,
            role_code TEXT UNIQUE NOT NULL
        )`);

        // 用户角色表
        db.run(`CREATE TABLE IF NOT EXISTS user_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            role_id INTEGER,
            UNIQUE(user_id, role_id)
        )`);

        // 部门表
        db.run(`CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dept_name TEXT NOT NULL,
            dept_code TEXT UNIQUE NOT NULL,
            parent_id INTEGER DEFAULT 0
        )`);

        // 测评项目表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT NOT NULL,
            project_code TEXT UNIQUE NOT NULL,
            description TEXT,
            project_type TEXT,
            status INTEGER DEFAULT 0,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 测评工具表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool_name TEXT NOT NULL,
            tool_code TEXT UNIQUE NOT NULL,
            tool_type TEXT,
            description TEXT,
            estimated_time INTEGER,
            status INTEGER DEFAULT 1
        )`);

        // 测评任务表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            user_id INTEGER,
            tool_id INTEGER,
            status INTEGER DEFAULT 0,
            score REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 测评报告表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_code TEXT UNIQUE NOT NULL,
            project_id INTEGER,
            user_id INTEGER,
            report_type TEXT,
            overall_score REAL,
            strengths TEXT,
            weaknesses TEXT,
            recommendations TEXT,
            status INTEGER DEFAULT 0,
            generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 插入默认数据
        insertDefaultData();
    });
}

// 插入默认数据
function insertDefaultData() {
    // 检查是否已有数据
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            // 插入默认角色
            db.run("INSERT INTO roles (role_name, role_code) VALUES (?, ?)", ['系统管理员', 'ROLE_ADMIN']);
            db.run("INSERT INTO roles (role_name, role_code) VALUES (?, ?)", ['HR管理员', 'ROLE_HR_ADMIN']);
            db.run("INSERT INTO roles (role_name, role_code) VALUES (?, ?)", ['普通用户', 'ROLE_USER']);

            // 插入默认管理员（密码：admin123）
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            db.run("INSERT INTO users (username, password, real_name, status) VALUES (?, ?, ?, ?)", 
                ['admin', hashedPassword, '系统管理员', 1], 
                function(err) {
                    if (!err) {
                        // 关联管理员角色
                        db.run("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [this.lastID, 1]);
                    }
                }
            );

            // 插入默认部门
            db.run("INSERT INTO departments (dept_name, dept_code) VALUES (?, ?)", ['总部', 'HQ']);
            db.run("INSERT INTO departments (dept_name, dept_code) VALUES (?, ?)", ['研发中心', 'RDC']);
            db.run("INSERT INTO departments (dept_name, dept_code) VALUES (?, ?)", ['生产中心', 'PC']);
            db.run("INSERT INTO departments (dept_name, dept_code) VALUES (?, ?)", ['销售中心', 'SC']);
            db.run("INSERT INTO departments (dept_name, dept_code) VALUES (?, ?)", ['人力资源部', 'HR']);

            // 插入测评工具
            const tools = [
                ['大五人格测评', 'BIG_FIVE', 'PERSONALITY', '基于大五人格理论的人格测评工具', 20],
                ['霍兰德职业兴趣测评', 'HOLLAND', 'INTEREST', '基于霍兰德职业兴趣理论', 15],
                ['MBTI职业性格测评', 'MBTI', 'PERSONALITY', 'MBTI职业性格类型测评', 20],
                ['工作动机测评', 'MOTIVATION', 'MOTIVATION', '工作动机与激励因素测评', 15],
                ['领导力测评', 'LEADERSHIP', 'SKILL', '领导力胜任力测评', 25]
            ];
            
            tools.forEach(tool => {
                db.run("INSERT INTO assessment_tools (tool_name, tool_code, tool_type, description, estimated_time) VALUES (?, ?, ?, ?, ?)",
                    tool);
            });

            console.log('默认数据插入成功');
        }
    });
}

// ============================================
// API路由
// ============================================

// 登录接口
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

        // 检查密码hash是否存在
        if (!user.password_hash) {
            console.error('用户密码hash为空:', user.username);
            return res.json({ success: false, message: '用户密码配置错误，请联系管理员' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            return res.json({ success: false, message: '密码错误' });
        }

        // 生成JWT token
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

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get("SELECT id, username, real_name, email FROM users WHERE id = ?", [req.user.userId], (err, user) => {
        if (err) {
            return res.json({ success: false, message: '获取用户信息失败' });
        }
        res.json({ success: true, user: user });
    });
});

// 获取所有项目
app.get('/api/projects', authenticateToken, (req, res) => {
    db.all("SELECT * FROM assessment_projects ORDER BY created_at DESC", [], (err, projects) => {
        if (err) {
            return res.json({ success: false, message: '获取项目失败' });
        }
        res.json(projects);
    });
});

// 创建项目
app.post('/api/projects', authenticateToken, (req, res) => {
    const { projectName, projectType, description } = req.body;
    
    if (!projectName) {
        return res.json({ success: false, message: '项目名称不能为空' });
    }

    console.log('创建项目:', { projectName, projectType, description, userId: req.user.userId });

    db.run("INSERT INTO assessment_projects (project_name, project_type, description, created_by) VALUES (?, ?, ?, ?)",
        [projectName, projectType || 'RECRUITMENT', description, req.user.userId],
        function(err) {
            if (err) {
                console.error('创建项目失败:', err);
                return res.json({ success: false, message: '创建项目失败: ' + err.message });
            }
            console.log('项目创建成功, ID:', this.lastID);
            res.json({ success: true, projectId: this.lastID });
        }
    );
});

// 删除项目
app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    const projectId = req.params.id;
    
    console.log('删除项目:', projectId);
    
    db.run("DELETE FROM assessment_projects WHERE id = ?", [projectId], function(err) {
        if (err) {
            console.error('删除项目失败:', err);
            return res.json({ success: false, message: '删除项目失败: ' + err.message });
        }
        
        if (this.changes === 0) {
            return res.json({ success: false, message: '项目不存在' });
        }
        
        console.log('项目删除成功, ID:', projectId);
        res.json({ success: true });
    });
});

// 基于项目创建测评任务
app.post('/api/projects/:projectId/tasks', authenticateToken, (req, res) => {
    const projectId = req.params.projectId;
    const { userId, toolId } = req.body;
    
    if (!userId || !toolId) {
        return res.json({ success: false, message: '用户ID和工具ID不能为空' });
    }
    
    console.log('为项目创建任务:', { projectId, userId, toolId });
    
    db.run("INSERT INTO assessment_tasks (project_id, user_id, tool_id, status) VALUES (?, ?, ?, 0)",
        [projectId, userId, toolId],
        function(err) {
            if (err) {
                console.error('创建任务失败:', err);
                return res.json({ success: false, message: '创建任务失败: ' + err.message });
            }
            console.log('任务创建成功, ID:', this.lastID);
            res.json({ success: true, taskId: this.lastID });
        }
    );
});

// 获取项目的所有任务
app.get('/api/projects/:projectId/tasks', authenticateToken, (req, res) => {
    const projectId = req.params.projectId;
    
    db.all(`SELECT t.*, u.real_name, at.tool_name, at.tool_code 
            FROM assessment_tasks t 
            LEFT JOIN users u ON t.user_id = u.id 
            LEFT JOIN assessment_tools at ON t.tool_id = at.id 
            WHERE t.project_id = ?`, 
            [projectId], 
            (err, tasks) => {
        if (err) {
            console.error('查询项目任务失败:', err);
            return res.json({ success: false, message: '查询失败: ' + err.message });
        }
        res.json({ success: true, tasks: tasks });
    });
});

// 获取所有测评工具
app.get('/api/tools', authenticateToken, (req, res) => {
    db.all("SELECT * FROM assessment_tools WHERE status = 1 OR status IS NULL", [], (err, tools) => {
        if (err) {
            return res.json({ success: false, message: '获取工具失败' });
        }
        res.json({ success: true, tools: tools });
    });
});

// 获取测评题目
app.get('/api/tools/:toolId/questions', authenticateToken, (req, res) => {
    const toolId = req.params.toolId;
    
    db.all("SELECT * FROM assessment_questions WHERE tool_id = ? ORDER BY question_order", [toolId], (err, questions) => {
        if (err) {
            return res.json({ success: false, message: '获取题目失败' });
        }
        res.json({ success: true, questions: questions });
    });
});

// 获取统计数据（首页）
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
                    res.json(stats);
                });
            });
        });
    });
});

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

// 加载第二期功能路由
const phase2Routes = require('./phase2');
app.use('/api', phase2Routes);

// 加载第三期功能路由
const phase3Routes = require('./phase3');
app.use('/api', phase3Routes);

// 加载答题功能路由
const assessmentRoutes = require('./assessment');
app.use('/api', assessmentRoutes);

// 加载测评工具配置路由
const toolConfigRoutes = require('./tool-config');
app.use('/api', toolConfigRoutes);

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================');
    console.log('人才测评系统启动成功！');
    console.log(`后端API: http://localhost:${PORT}/api`);
    console.log(`前端页面: http://localhost:${PORT}`);
    console.log('====================================');
    console.log('');
    console.log('默认登录账号:');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    console.log('');
});
