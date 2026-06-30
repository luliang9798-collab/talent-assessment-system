const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'talent-assessment-secret-2024';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// 数据库
const db = new sqlite3.Database('./talent_assessment_new.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('✅ 数据库连接成功');
    }
});

// 认证中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.json({ success: false, message: '未提供token' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.json({ success: false, message: 'token无效' });
        }
        req.user = user;
        next();
    });
}

// API路由

// 1. 登录
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.json({ success: false, message: '请输入用户名和密码' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
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

// 2. 获取测评工具列表
app.get('/api/tools', authenticateToken, (req, res) => {
    db.all('SELECT * FROM assessment_tools', [], (err, tools) => {
        if (err) {
            return res.json({ success: false, message: '获取工具失败' });
        }
        res.json({ success: true, tools: tools });
    });
});

// 3. 获取题目
app.get('/api/questions/:toolId', authenticateToken, (req, res) => {
    const toolId = req.params.toolId;
    
    db.all('SELECT * FROM questions WHERE tool_id = ? ORDER BY order_num', [toolId], (err, questions) => {
        if (err) {
            return res.json({ success: false, message: '获取题目失败' });
        }
        res.json({ success: true, questions: questions });
    });
});

// 4. 创建测评项目
app.post('/api/projects', authenticateToken, (req, res) => {
    const { projectName, projectType, description } = req.body;
    
    if (!projectName) {
        return res.json({ success: false, message: '项目名称不能为空' });
    }
    
    db.run('INSERT INTO assessment_projects (project_name, project_type, description, created_by) VALUES (?, ?, ?, ?)',
        [projectName, projectType || 'RECRUITMENT', description, req.user.userId],
        function(err) {
            if (err) {
                return res.json({ success: false, message: '创建项目失败: ' + err.message });
            }
            res.json({ success: true, projectId: this.lastID });
        }
    );
});

// 5. 获取项目列表
app.get('/api/projects', authenticateToken, (req, res) => {
    db.all('SELECT * FROM assessment_projects ORDER BY created_at DESC', [], (err, projects) => {
        if (err) {
            return res.json({ success: false, message: '获取项目失败' });
        }
        res.json({ success: true, projects: projects });
    });
});

// 6. 创建测评任务
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { projectId, userId, toolId } = req.body;
    
    db.run('INSERT INTO assessment_tasks (project_id, user_id, tool_id, status) VALUES (?, ?, ?, ?)',
        [projectId, userId || req.user.userId, toolId, 'pending'],
        function(err) {
            if (err) {
                return res.json({ success: false, message: '创建任务失败' });
            }
            res.json({ success: true, taskId: this.lastID });
        }
    );
});

// 7. 获取任务列表
app.get('/api/tasks', authenticateToken, (req, res) => {
    db.all(`SELECT t.*, p.project_name, u.real_name, tt.tool_name 
            FROM assessment_tasks t 
            LEFT JOIN assessment_projects p ON t.project_id = p.id 
            LEFT JOIN users u ON t.user_id = u.id 
            LEFT JOIN assessment_tools tt ON t.tool_id = tt.id 
            WHERE t.user_id = ? OR ? IN (SELECT id FROM users WHERE username = 'admin')
            ORDER BY t.id DESC`,
        [req.user.userId, req.user.userId],
        (err, tasks) => {
            if (err) {
                return res.json({ success: false, message: '获取任务失败' });
            }
            res.json({ success: true, tasks: tasks });
        }
    );
});

// 8. 提交测评结果
app.post('/api/results', authenticateToken, (req, res) => {
    const { taskId, toolId, dimensionScores, totalScore, reportData } = req.body;
    
    db.run('INSERT INTO assessment_results (task_id, user_id, tool_id, dimension_scores, total_score, report_data) VALUES (?, ?, ?, ?, ?, ?)',
        [taskId, req.user.userId, toolId, JSON.stringify(dimensionScores), totalScore, JSON.stringify(reportData)],
        function(err) {
            if (err) {
                return res.json({ success: false, message: '提交结果失败' });
            }
            
            // 更新任务状态
            db.run("UPDATE assessment_tasks SET status = ?, completed_at = datetime('now') WHERE id = ?",
                ['completed', taskId],
                (err) => {
                    if (err) console.error('更新任务状态失败:', err);
                }
            );
            
            res.json({ success: true, resultId: this.lastID });
        }
    );
});

// 9. 获取测评结果
app.get('/api/results/:userId', authenticateToken, (req, res) => {
    const userId = req.params.userId;
    
    db.all(`SELECT r.*, t.tool_name, t.tool_type 
            FROM assessment_results r 
            LEFT JOIN assessment_tools t ON r.tool_id = t.id 
            WHERE r.user_id = ? 
            ORDER BY r.created_at DESC`,
        [userId],
        (err, results) => {
            if (err) {
                return res.json({ success: false, message: '获取结果失败' });
            }
            res.json({ success: true, results: results });
        }
    );
});

// 10. 获取用户列表
app.get('/api/users', authenticateToken, (req, res) => {
    db.all('SELECT id, username, real_name, email, status FROM users', [], (err, users) => {
        if (err) {
            return res.json({ success: false, message: '获取用户失败' });
        }
        res.json({ success: true, users: users });
    });
});

// 11. 获取胜任力模型
app.get('/api/competencies', authenticateToken, (req, res) => {
    db.all('SELECT * FROM competency_models', [], (err, competencies) => {
        if (err) {
            return res.json({ success: false, message: '获取胜任力模型失败' });
        }
        res.json({ success: true, competencies: competencies });
    });
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
    console.log('====================================');
    console.log('✅ 人才测评系统启动成功！');
    console.log('====================================');
    console.log('');
    console.log('后端API: <ADDRESS_REMOVED>
    console.log('前端页面: <ADDRESS_REMOVED>
    console.log('');
    console.log('登录账号: admin');
    console.log('登录密码: admin123');
    console.log('');
    console.log('API端点:');
    console.log('  POST /api/auth/login - 登录');
    console.log('  GET  /api/tools - 获取测评工具');
    console.log('  GET  /api/questions/:toolId - 获取题目');
    console.log('  GET  /api/projects - 获取项目');
    console.log('  POST /api/projects - 创建项目');
    console.log('  GET  /api/tasks - 获取任务');
    console.log('  POST /api/tasks - 创建任务');
    console.log('  GET  /api/results/:userId - 获取结果');
    console.log('  GET  /api/users - 获取用户');
    console.log('  GET  /api/competencies - 获取胜任力模型');
    console.log('');
});
