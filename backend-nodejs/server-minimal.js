const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// 专业报告生成模块（内联版，避免模块加载问题）

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'talent-assessment-secret-key-2026';

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// 数据库连接
const DB_PATH = './talent_assessment_new.db';
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('DB connection error:', err);
    else console.log('Database connected:', DB_PATH);
});

// ========== JWT 认证中间件 ==========
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

// ========== 健康检查 ==========
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// ========== 登录 ==========
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.json({ success: false, message: '请输入用户名和密码' });
    }
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.json({ success: false, message: '数据库错误: ' + err.message });
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

// ========== 测评工具 ==========
// 实时计算题目数量（避免 question_count 字段不同步）
app.get('/api/tools', auth, (req, res) => {
    db.all(`SELECT t.*, COUNT(q.id) as real_question_count 
            FROM assessment_tools t 
            LEFT JOIN questions q ON t.id = q.tool_id 
            GROUP BY t.id 
            ORDER BY t.id`, [], (err, tools) => {
        if (err) return res.json({ success: false, message: err.message });
        
        // 用实时计算的数量覆盖 question_count 字段
        const fixedTools = (tools || []).map(t => ({
            ...t,
            question_count: t.real_question_count
        }));
        
        res.json({ success: true, tools: fixedTools });
    });
});

app.get('/api/tools/:toolId/questions', auth, (req, res) => {
    const toolId = req.params.toolId;
    // 使用正确的表名: questions
    db.all('SELECT * FROM questions WHERE tool_id = ? ORDER BY order_num', [toolId], (err, questions) => {
        if (err) return res.json({ success: false, message: err.message });

        if (!questions || questions.length === 0) {
            const defaultQs = getDefaultQuestions(parseInt(toolId));
            return res.json({ success: true, questions: defaultQs, total: defaultQs.length });
        }

        // 转换为前端格式
        const formatted = (questions || []).map(q => ({
            id: q.id,
            tool_id: q.tool_id,
            question_text: q.question_text,
            dimension: q.dimension,
            options_type: q.question_type || 'likert',
            options: buildOptionsFromRow(q)
        }));
        res.json({ success: true, questions: formatted, total: formatted.length });
    });
});

// 将数据库行转换为选项列表
function buildOptionsFromRow(q) {
    var opts = [];
    if (q.option_a) opts.push({ value: q.score_a || 1, label: q.option_a });
    if (q.option_b) opts.push({ value: q.score_b || 2, label: q.option_b });
    if (q.option_c) opts.push({ value: q.score_c || 3, label: q.option_c });
    if (q.option_d) opts.push({ value: q.score_d || 4, label: q.option_d });
    if (opts.length === 0) {
        opts = [
            { value: 1, label: '完全不符合' },
            { value: 2, label: '不太符合' },
            { value: 3, label: '一般' },
            { value: 4, label: '比较符合' },
            { value: 5, label: '非常符合' }
        ];
    }
    return opts;
}

// ========== 测评项目管理 ==========
app.post('/api/projects', auth, (req, res) => {
    const { projectName, projectType, description } = req.body;
    if (!projectName) {
        return res.json({ success: false, message: '项目名称不能为空' });
    }

    const userId = req.user.userId || 1;

    db.run(
        `INSERT INTO assessment_projects (project_name, project_type, description, created_by, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [projectName, projectType || 'RECRUITMENT', description || '', userId],
        function (err) {
            if (err) return res.json({ success: false, message: '创建失败: ' + err.message });
            res.json({
                success: true,
                projectId: this.lastID,
                message: '项目创建成功'
            });
        }
    );
});

app.get('/api/projects', auth, (req, res) => {
    db.all('SELECT * FROM assessment_projects ORDER BY created_at DESC', [], (err, projects) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, projects: projects || [] });
    });
});

// ========== 用户管理 ==========
// 获取用户详情
app.get('/api/users/:id', auth, (req, res) => {
    const userId = req.params.id;
    db.get('SELECT id, username, real_name, email, phone, position FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) return res.json({ success: false, message: err.message });
        if (!user) return res.json({ success: false, message: '用户不存在' });
        res.json({ success: true, user });
    });
});

app.delete('/api/projects/:id', auth, (req, res) => {
    const projectId = req.params.id;
    db.run('DELETE FROM assessment_projects WHERE id = ?', [projectId], function (err) {
        if (err) return res.json({ success: false, message: '删除失败: ' + err.message });
        if (this.changes === 0) return res.json({ success: false, message: '项目不存在' });
        res.json({ success: true, message: '删除成功' });
    });
});

// ========== 测评任务管理 ==========
app.post('/api/tasks', auth, (req, res) => {
    const { taskName, projectId, toolId, assigneeId } = req.body;
    if (!taskName || !projectId || !toolId) {
        return res.json({ success: false, message: '缺少必要参数' });
    }

    db.run(
        `INSERT INTO assessment_tasks (task_name, project_id, tool_id, assignee_id, status, created_at)
         VALUES (?, ?, ?, ?, 'pending', datetime('now'))`,
        [taskName, projectId, toolId, assigneeId],
        function (err) {
            if (err) return res.json({ success: false, message: '创建任务失败: ' + err.message });
            res.json({ success: true, taskId: this.lastID, message: '任务创建成功' });
        }
    );
});

app.get('/api/tasks', auth, (req, res) => {
    db.all(`SELECT t.*, p.project_name as project_name, tool.tool_name as tool_name
            FROM assessment_tasks t
            LEFT JOIN assessment_projects p ON t.project_id = p.id
            LEFT JOIN assessment_tools tool ON t.tool_id = tool.id
            ORDER BY t.created_at DESC`, [], (err, tasks) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, tasks: tasks || [] });
    });
});

app.put('/api/tasks/:id/status', auth, (req, res) => {
    const { status } = req.body;
    if (!status) return res.json({ success: false, message: '状态不能为空' });

    let extraFields = '';
    let params = [status, req.params.id];
    if (status === 'completed') {
        extraFields = ', completed_at = datetime(\'now\')';
    }

    db.run('UPDATE assessment_tasks SET status = ?' + extraFields + ' WHERE id = ?', params, function (err) {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, message: '状态更新成功' });
    });
});


// ========== 测评报告（旧版，已迁移至增强版提交端点）==========
app.get('/api/reports', auth, (req, res) => {
    db.all('SELECT * FROM assessment_reports ORDER BY created_at DESC', [], (err, reports) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, reports: reports || [] });
    });
});

app.get('/api/reports/task/:taskId', auth, (req, res) => {
    const taskId = req.params.taskId;
    db.get('SELECT * FROM assessment_reports WHERE task_id = ?', [taskId], (err, report) => {
        if (err) return res.json({ success: false, message: err.message });
        if (!report) return res.json({ success: false, message: '报告不存在' });
        res.json({ success: true, report: report });
    });
});

// ========== 用户管理 ==========
app.get('/api/users', auth, (req, res) => {
    db.all('SELECT id, username, real_name, position, status, created_at FROM users ORDER BY id', [], (err, users) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, users: users || [] });
    });
});

app.post('/api/users', auth, (req, res) => {
    const { username, password, realName, role } = req.body;
    if (!username || !password) {
        return res.json({ success: false, message: '用户名和密码不能为空' });
    }

    const hash = bcrypt.hashSync(password, 10);
    db.run(
        "INSERT INTO users (username, password_hash, real_name, role, status, created_at) VALUES (?, ?, ?, ?, 1, datetime('now'))",
        [username, hash, realName || '', role || 'user'],
        function (err) {
            if (err) return res.json({ success: false, message: err.message });
            res.json({ success: true, userId: this.lastID, message: '用户创建成功' });
        }
    );
});

// 编辑用户
app.put('/api/users/:id', auth, (req, res) => {
    const userId = req.params.id;
    const { username, realName, role, position, email, phone } = req.body;
    
    if (!username) {
        return res.json({ success: false, message: '用户名不能为空' });
    }
    
    db.run(
        "UPDATE users SET username = ?, real_name = ?, role = ?, position = ?, email = ?, phone = ? WHERE id = ?",
        [username, realName || '', role || 'user', position || '', email || '', phone || '', userId],
        function (err) {
            if (err) return res.json({ success: false, message: err.message });
            if (this.changes === 0) return res.json({ success: false, message: '用户不存在' });
            res.json({ success: true, message: '用户更新成功' });
        }
    );
});

// 删除用户
app.delete('/api/users/:id', auth, (req, res) => {
    const userId = req.params.id;
    
    // 不允许删除自己
    if (parseInt(userId) === parseInt(req.user.userId)) {
        return res.json({ success: false, message: '不能删除当前登录的用户' });
    }
    
    db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
        if (err) return res.json({ success: false, message: '删除失败: ' + err.message });
        if (this.changes === 0) return res.json({ success: false, message: '用户不存在' });
        res.json({ success: true, message: '用户已删除' });
    });
});

// 禁用/启用用户
app.put('/api/users/:id/status', auth, (req, res) => {
    const userId = req.params.id;
    const { status } = req.body;
    
    if (!status || (status !== 0 && status !== 1)) {
        return res.json({ success: false, message: '状态参数错误' });
    }
    
    // 不允许禁用自己
    if (parseInt(userId) === parseInt(req.user.userId)) {
        return res.json({ success: false, message: '不能禁用当前登录的用户' });
    }
    
    db.run(
        "UPDATE users SET status = ? WHERE id = ?",
        [status, userId],
        function (err) {
            if (err) return res.json({ success: false, message: err.message });
            if (this.changes === 0) return res.json({ success: false, message: '用户不存在' });
            res.json({ 
                success: true, 
                message: status === 1 ? '用户已启用' : '用户已禁用' 
            });
        }
    );
});

// ========== 统计数据 ==========
app.get('/api/dashboard/stats', auth, (req, res) => {
    db.get('SELECT COUNT(*) as cnt FROM assessment_tools', [], (err, row1) => {
        db.get('SELECT COUNT(*) as cnt FROM assessment_projects', [], (err2, row2) => {
            db.get('SELECT COUNT(*) as cnt FROM assessment_tasks', [], (err3, row3) => {
                db.get("SELECT COUNT(*) as cnt FROM assessment_tasks WHERE status = 'completed'", [], (err4, row4) => {
                    const totalTasks = (row3 && row3.cnt) || 0;
                    const completedTasks = (row4 && row4.cnt) || 0;
                    res.json({
                        success: true,
                        stats: {
                            toolCount: (row1 && row1.cnt) || 7,
                            projectCount: (row2 && row2.cnt) || 0,
                            taskCount: totalTasks,
                            completionRate: totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0
                        }
                    });
                });
            });
        });
    });
});

// ========== 默认题目数据 ==========
function getDefaultQuestions(toolId) {
    const questionBank = {
        1: [ // 大五人格 - 简化版12题示例
            { id: 1, tool_id: 1, question_text: '我是一个充满活力的人', dimension: 'E', reverse: false, options_type: 'likert_5' },
            { id: 2, tool_id: 1, question_text: '我喜欢尝试新鲜事物', dimension: 'O', reverse: false, options_type: 'likert_5' },
            { id: 3, tool_id: 1, question_text: '我会把事情安排得井井有条', dimension: 'C', reverse: false, options_type: 'likert_5' },
            { id: 4, tool_id: 1, question_text: '我容易与他人建立信任关系', dimension: 'A', reverse: false, options_type: 'likert_5' },
            { id: 5, tool_id: 1, question_text: '面对压力我能保持冷静', dimension: 'N_rev', reverse: true, options_type: 'likert_5' },
            { id: 6, tool_id: 1, question_text: '我倾向于主导团队讨论', dimension: 'E', reverse: false, options_type: 'likert_5' },
            { id: 7, tool_id: 1, question_text: '我对艺术和美感很敏感', dimension: 'O', reverse: false, options_type: 'likert_5' },
            { id: 8, tool_id: 1, question_text: '我会仔细检查工作中的细节', dimension: 'C', reverse: false, options_type: 'likert_5' },
            { id: 9, tool_id: 1, question_text: '我会主动帮助遇到困难的人', dimension: 'A', reverse: false, options_type: 'likert_5' },
            { id: 10, tool_id: 1, question_text: '我经常感到焦虑或不安', dimension: 'N', reverse: false, options_type: 'likert_5' },
            { id: 11, tool_id: 1, question_text: '我在社交场合中比较活跃', dimension: 'E', reverse: false, options_type: 'likert_5' },
            { id: 12, tool_id: 1, question_text: '我对抽象概念和理论感兴趣', dimension: 'O', reverse: false, options_type: 'likert_5' }
        ],
        2: [ // MBTI - 简化版
            { id: 13, tool_id: 2, question_text: '在社交聚会中，我更倾向于与少数人深入交谈', dimension: 'I', options_type: 'choice_ab' },
            { id: 14, tool_id: 2, question_text: '我做决定时更多依赖逻辑分析而非情感感受', dimension: 'T', options_type: 'choice_ab' },
            { id: 15, tool_id: 2, question_text: '我更喜欢有计划的生活方式', dimension: 'J', options_type: 'choice_ab' },
            { id: 16, tool_id: 2, question_text: '我更关注具体的事实而非抽象的可能性', dimension: 'S', options_type: 'choice_ab' },
            { id: 17, tool_id: 2, question_text: '我从外部世界获得能量', dimension: 'E', options_type: 'choice_ab' },
            { id: 18, tool_id: 2, question_text: '做决定时我会考虑对他人的影响', dimension: 'F', options_type: 'choice_ab' },
            { id: 19, tool_id: 2, question_text: '我更喜欢灵活随性的生活方式', dimension: 'P', options_type: 'choice_ab' },
            { id: 20, tool_id: 2, question_text: '我更关注未来的可能性和潜在的含义', dimension: 'N', options_type: 'choice_ab' }
        ],
        3: [ // DISC
            { id: 21, tool_id: 3, question_text: '在团队中，我倾向于直接表达观点并推动决策', dimension: 'D', options_type: 'choice_most_least' },
            { id: 22, tool_id: 3, question_text: '我善于激励他人并营造积极的氛围', dimension: 'I', options_type: 'choice_most_least' },
            { id: 23, tool_id: 3, question_text: '我是很好的倾听者，善于维护团队和谐', dimension: 'S', options_type: 'choice_most_least' },
            { id: 24, tool_id: 3, question_text: '我注重细节和准确性，做事谨慎周全', dimension: 'C', options_type: 'choice_most_least' }
        ]
    };

    return questionBank[toolId] || [
        { id: 99, tool_id: toolId, question_text: '这是一个示例题目（该工具暂无完整题库）', dimension: 'default', options_type: 'liket_5' }
    ];
}

// ========== 分数计算（简化版）==========
function calculateScore(toolId, answers) {
    if (!answers || answers.length === 0) return { totalScore: 0, dimensions: {} };

    const dimensions = {};
    let totalScore = 0;

    answers.forEach(a => {
        const val = a.answer || a.value || a.score || 0;
        const dim = a.dimension || 'default';
        if (!dimensions[dim]) dimensions[dim] = { sum: 0, count: 0 };
        dimensions[dim].sum += val;
        dimensions[dim].count += 1;
        totalScore += val;
    });

    // 计算各维度平均分（1-5分制）
    const dimensionAvg = {};
    let dimCount = 0;
    for (const [dim, data] of Object.entries(dimensions)) {
        dimensionAvg[dim] = Math.round((data.sum / data.count) * 10) / 10;
        dimCount++;
    }

    const avgTotal = dimCount > 0 ? Math.round((totalScore / answers.length) * 10) / 10 : 0;

    return {
        totalScore: avgTotal,
        dimensions: dimensionAvg,
        rawDimensions: dimensions,
        answerCount: answers.length
    };
}

// ========== 测评答题页面所需API ==========

// GET /api/questions/:toolId - 获取某工具的全部题目（兼容旧路径）
app.get('/api/questions/:toolId', auth, (req, res) => {
    const toolId = req.params.toolId;
    db.all('SELECT * FROM questions WHERE tool_id = ? ORDER BY order_num', [toolId], (err, questions) => {
        if (err) return res.json({ success: false, message: err.message });
        if (!questions || questions.length === 0) {
            const defaultQs = getDefaultQuestions(parseInt(toolId));
            // 给默认题目也加上options
            const withOpts = defaultQs.map(q => ({
                id: q.id,
                question: q.question_text || q.question || '示例题目',
                dimension: q.dimension || 'default',
                options: getOptionsForType(q.options_type || 'likert_5')
            }));
            return res.json({ success: true, questions: withOpts });
        }
        // 转换为前端需要的格式：question + options
        const formatted = (questions || []).map(q => ({
            id: q.id,
            question: q.question_text || '题目',
            dimension: q.dimension || 'default',
            options: buildOptionsFromRow(q)
        }));
        res.json({ success: true, questions: formatted });
    });
});

// GET /api/assessment-form/:taskId - 通过任务ID加载测评表单
app.get('/api/assessment-form/:taskId', auth, (req, res) => {
    const taskId = req.params.taskId;
    
    // 查询任务信息
    db.get(`SELECT t.*, p.project_name, at.tool_name, at.description as tool_description 
            FROM assessment_tasks t
            LEFT JOIN assessment_projects p ON t.project_id = p.id
            LEFT JOIN assessment_tools at ON t.tool_id = at.id
            WHERE t.id = ?`, [taskId], (err, task) => {
        if (err) return res.json({ success: false, message: err.message });
        if (!task) return res.json({ success: false, message: '任务不存在' });

        // 查询该工具的题目（使用正确的表名 questions）
        const toolId = task.tool_id;
        db.all('SELECT * FROM questions WHERE tool_id = ? ORDER BY order_num', [toolId], (err2, questions) => {
            let finalQuestions;
            if (!questions || questions.length === 0) {
                finalQuestions = getDefaultQuestions(parseInt(toolId));
            } else {
                finalQuestions = questions;
            }

            // 格式化题目
            const formatted = (finalQuestions || []).map((q, idx) => ({
                id: q.id || (100000 + idx),
                question: q.question_text || q.question || '示例题目',
                dimension: q.dimension || 'default',
                options: (q.options_type && q.option_a) ? buildOptionsFromRow(q) : getOptionsForType(q.options_type || q.type || 'likert_5')
            }));

            res.json({
                success: true,
                task: {
                    id: task.id,
                    project_name: task.project_name || '未命名项目',
                    tool_name: task.tool_name || '测评',
                    tool_description: task.tool_description || ''
                },
                questions: formatted
            });
        });
    });
});

// POST /api/submit-assessment/:taskId - 提交测评答案
app.post('/api/submit-assessment/:taskId', auth, (req, res) => {
    const taskId = req.params.taskId;
    const { answers, timeSpent } = req.body;

    if (!answers || answers.length === 0) {
        return res.json({ success: false, message: '请完成所有题目后再提交' });
    }

    // 先查任务获取toolId
    db.get('SELECT tool_id FROM assessment_tasks WHERE id = ?', [taskId], (err, task) => {
        if (err || !task) return res.json({ success: false, message: '任务不存在' });

        const answerJson = JSON.stringify(answers);
        
        db.run(
            `INSERT INTO assessment_results (task_id, user_id, tool_id, answers, created_at)
             VALUES (?, ?, ?, ?, datetime('now'))`,
            [taskId, req.user.userId, task.tool_id, answerJson],
            function (err) {
                if (err) return res.json({ success: false, message: '提交失败: ' + err.message });

                // 更新任务状态为已完成
                db.run("UPDATE assessment_tasks SET status = 'completed', completed_at = datetime('now') WHERE id = ?", [taskId]);

                // 计算分数
                const score = calculateScore(task.tool_id, answers);

                // 生成报告摘要
                const reportSummary = generateReportSummary(task.tool_id, answers);

                res.json({
                    success: true,
                    resultId: this.lastID,
                    score: score,
                    summary: reportSummary,
                    message: '测评提交成功！'
                });
            }
        );
    });
});

// 根据题型返回选项列表
function getOptionsForType(type) {
    const optionMap = {
        likert_5: [
            { value: 1, label: '完全不符合' },
            { value: 2, label: '不太符合' },
            { value: 3, label: '一般/不确定' },
            { value: 4, label: '比较符合' },
            { value: 5, label: '非常符合' }
        ],
        choice_ab: [
            { value: 'A', label: '是 / 同意' },
            { value: 'B', label: '否 / 不同意' }
        ],
        choice_most_least: [
            { value: 4, label: '最符合' },
            { value: 3, label: '比较符合' },
            { value: 2, label: '不太符合' },
            { value: 1, label: '最不符合' }
        ]
    };
    return optionMap[type] || optionMap['likert_5'];
}

// 生成报告摘要



// ========== 胜任力测评报告生成函数 ==========

// 工具8: 领导力胜任力测评
function genLeadership(answers) {
    const dimensions = {
        '战略思维': { score: 0, count: 0 },
        '决策能力': { score: 0, count: 0 },
        '影响力': { score: 0, count: 0 },
        '发展他人': { score: 0, count: 0 },
        '变革管理': { score: 0, count: 0 }
    };
    
    answers.forEach(a => {
        if (dimensions[a.dimension]) {
            dimensions[a.dimension].score += a.score;
            dimensions[a.dimension].count++;
        }
    });
    
    // 计算各维度平均分
    Object.keys(dimensions).forEach(dim => {
        if (dimensions[dim].count > 0) {
            dimensions[dim] = Math.round(dimensions[dim].score / dimensions[dim].count * 20); // 转换为百分制
        } else {
            dimensions[dim] = 60;
        }
    });
    
    const overallScore = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / 5);
    
    // 领导力类型判断
    let leadershipType = '';
    let leadershipDesc = '';
    if (dimensions['战略思维'] >= 70 && dimensions['决策能力'] >= 70) {
        leadershipType = '战略型领导者';
        leadershipDesc = '善于全局思考和果断决策';
    } else if (dimensions['影响力'] >= 70 && dimensions['发展他人'] >= 70) {
        leadershipType = '赋能型领导者';
        leadershipDesc = '善于影响他人和发展团队';
    } else if (dimensions['变革管理'] >= 70) {
        leadershipType = '变革型领导者';
        leadershipDesc = '善于推动组织变革和创新';
    } else {
        leadershipType = '综合型领导者';
        leadershipDesc = '具备全面的领导能力';
    }
    
    return {
        type: leadershipType,
        typeDesc: leadershipDesc,
        overallScore: overallScore,
        dimensions: dimensions,
        strengths: [
            { name: '战略思维', score: dimensions['战略思维'], desc: dimensions['战略思维'] >= 70 ? '具备优秀的战略思维能力' : '战略思维有提升空间' },
            { name: '决策能力', score: dimensions['决策能力'], desc: dimensions['决策能力'] >= 70 ? '决策能力强，善于判断' : '决策能力需要加强' },
            { name: '影响力', score: dimensions['影响力'], desc: dimensions['影响力'] >= 70 ? '影响力强，善于说服' : '影响力需要提升' },
            { name: '发展他人', score: dimensions['发展他人'], desc: dimensions['发展他人'] >= 70 ? '善于培养和发展他人' : '需要加强人才培养' },
            { name: '变革管理', score: dimensions['变革管理'], desc: dimensions['变革管理'] >= 70 ? '变革管理能力强' : '变革管理能力有待提升' }
        ],
        suggestions: [
            dimensions['战略思维'] < 60 ? '建议：加强战略思维训练，学习如何从全局角度思考问题' : '',
            dimensions['决策能力'] < 60 ? '建议：提高决策能力，学习决策分析模型和方法' : '',
            dimensions['影响力'] < 60 ? '建议：提升影响力，学习说服和谈判技巧' : '',
            dimensions['发展他人'] < 60 ? '建议：加强人才培养意识，学习教练和辅导技巧' : '',
            dimensions['变革管理'] < 60 ? '建议：学习变革管理理论，提高推动变革的能力' : ''
        ].filter(s => s !== '')
    };
}

// 工具9: 沟通能力测评
function genCommunication(answers) {
    const dimensions = {
        '倾听理解': { score: 0, count: 0 },
        '清晰表达': { score: 0, count: 0 },
        '书面沟通': { score: 0, count: 0 },
        '非语言沟通': { score: 0, count: 0 },
        '冲突处理': { score: 0, count: 0 }
    };
    
    answers.forEach(a => {
        if (dimensions[a.dimension]) {
            dimensions[a.dimension].score += a.score;
            dimensions[a.dimension].count++;
        }
    });
    
    Object.keys(dimensions).forEach(dim => {
        if (dimensions[dim].count > 0) {
            dimensions[dim] = Math.round(dimensions[dim].score / dimensions[dim].count * 20);
        } else {
            dimensions[dim] = 60;
        }
    });
    
    const overallScore = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / 5);
    
    return {
        overallScore: overallScore,
        dimensions: dimensions,
        level: overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '需要提升',
        strengths: [
            { name: '倾听理解', score: dimensions['倾听理解'], desc: dimensions['倾听理解'] >= 70 ? '倾听能力强，善于理解他人' : '倾听能力需要提升' },
            { name: '清晰表达', score: dimensions['清晰表达'], desc: dimensions['清晰表达'] >= 70 ? '表达清晰，逻辑严密' : '表达能力需要加强' },
            { name: '书面沟通', score: dimensions['书面沟通'], desc: dimensions['书面沟通'] >= 70 ? '书面沟通能力强' : '书面沟通需要提升' },
            { name: '非语言沟通', score: dimensions['非语言沟通'], desc: dimensions['非语言沟通'] >= 70 ? '非语言沟通得当' : '需要注意非语言沟通' },
            { name: '冲突处理', score: dimensions['冲突处理'], desc: dimensions['冲突处理'] >= 70 ? '冲突处理能力强' : '冲突处理能力需要提升' }
        ],
        suggestions: [
            dimensions['倾听理解'] < 60 ? '建议：练习积极倾听技巧，提高理解能力' : '',
            dimensions['清晰表达'] < 60 ? '建议：加强表达训练，提高沟通清晰度' : '',
            dimensions['书面沟通'] < 60 ? '建议：提高书面沟通能力，学习商务写作' : '',
            dimensions['非语言沟通'] < 60 ? '建议：注意非语言沟通，提高沟通效果' : '',
            dimensions['冲突处理'] < 60 ? '建议：学习冲突处理技巧，提高解决能力' : ''
        ].filter(s => s !== '')
    };
}

// 工具10: 团队协作测评
function genTeamwork(answers) {
    const dimensions = {
        '合作精神': { score: 0, count: 0 },
        '信任建立': { score: 0, count: 0 },
        '角色贡献': { score: 0, count: 0 },
        '团队支持': { score: 0, count: 0 },
        '目标对齐': { score: 0, count: 0 }
    };
    
    answers.forEach(a => {
        if (dimensions[a.dimension]) {
            dimensions[a.dimension].score += a.score;
            dimensions[a.dimension].count++;
        }
    });
    
    Object.keys(dimensions).forEach(dim => {
        if (dimensions[dim].count > 0) {
            dimensions[dim] = Math.round(dimensions[dim].score / dimensions[dim].count * 20);
        } else {
            dimensions[dim] = 60;
        }
    });
    
    const overallScore = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / 5);
    
    return {
        overallScore: overallScore,
        dimensions: dimensions,
        teamRole: overallScore >= 80 ? '优秀团队成员' : overallScore >= 60 ? '良好团队成员' : '需要提升协作能力',
        strengths: Object.keys(dimensions).map(dim => ({
            name: dim,
            score: dimensions[dim],
            desc: dimensions[dim] >= 70 ? `${dim}能力强` : `${dim}需要提升`
        })),
        suggestions: [
            dimensions['合作精神'] < 60 ? '建议：培养合作精神，学习团队协作技巧' : '',
            dimensions['信任建立'] < 60 ? '建议：提高信任建立能力，学习建立互信' : '',
            dimensions['角色贡献'] < 60 ? '建议：明确团队角色，提高贡献度' : '',
            dimensions['团队支持'] < 60 ? '建议：加强团队支持，学习互助技巧' : '',
            dimensions['目标对齐'] < 60 ? '建议：提高目标对齐能力，学习目标管理' : ''
        ].filter(s => s !== '')
    };
}

// 工具11-15的报告生成函数（简化版，基于相同模式）
function genProblemSolving(answers) {
    return genGenericCompetencyReport(answers, ['分析思维', '批判性思维', '创造性解决', '决策判断', '方案执行']);
}

function genResilience(answers) {
    return genGenericCompetencyReport(answers, ['情绪调节', '压力应对', '挫折恢复', '适应性', '自我激励']);
}

function genLearning(answers) {
    return genGenericCompetencyReport(answers, ['学习意愿', '学习方法', '知识应用', '反思总结', '持续成长']);
}

function genInnovation(answers) {
    return genGenericCompetencyReport(answers, ['创新思维', '风险承担', '开放心态', '改进意识', '资源整合']);
}

function genExecution(answers) {
    return genGenericCompetencyReport(answers, ['目标导向', '计划组织', '时间管理', '结果交付', '责任心']);
}

// 通用胜任力报告生成函数
function genGenericCompetencyReport(answers, dimensionNames) {
    const dimensions = {};
    dimensionNames.forEach(dim => {
        dimensions[dim] = { score: 0, count: 0 };
    });
    
    answers.forEach(a => {
        if (dimensions[a.dimension] !== undefined) {
            dimensions[a.dimension].score += a.score;
            dimensions[a.dimension].count++;
        }
    });
    
    Object.keys(dimensions).forEach(dim => {
        if (dimensions[dim].count > 0) {
            dimensions[dim] = Math.round(dimensions[dim].score / dimensions[dim].count * 20);
        } else {
            dimensions[dim] = 60;
        }
    });
    
    const overallScore = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / dimensionNames.length);
    
    return {
        overallScore: overallScore,
        dimensions: dimensions,
        level: overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '需要提升',
        strengths: Object.keys(dimensions).map(dim => ({
            name: dim,
            score: dimensions[dim],
            desc: dimensions[dim] >= 70 ? `${dim}能力强` : `${dim}需要提升`
        })),
        suggestions: Object.keys(dimensions).filter(dim => dimensions[dim] < 60).map(dim => `建议：提升${dim}能力`)
    };
}

// ========== 结束：胜任力测评报告生成函数 ==========

function generateReportSummary(toolId, answers, userInfo) {
    // ========== 新增专业测评工具 (16-23) ==========
    if (toolId === 16) return gen360Feedback(answers);
    if (toolId === 17) return genCareerAnchor(answers);
    if (toolId === 18) return genPsyCap(answers);
    if (toolId === 19) return genOrgCommitment(answers);
    if (toolId === 20) return genLeadershipStyle(answers);
    if (toolId === 21) return genCareerMaturity(answers);
    if (toolId === 22) return genJobSatisfaction(answers);
    if (toolId === 23) return genCareerStress(answers);
    
    // ========== 胜任力测评工具 (8-15) ==========
    if (toolId === 8) return genLeadership(answers);
    if (toolId === 9) return genCommunication(answers);
    if (toolId === 10) return genTeamwork(answers);
    if (toolId === 11) return genProblemSolving(answers);
    if (toolId === 12) return genResilience(answers);
    if (toolId === 13) return genLearning(answers);
    if (toolId === 14) return genInnovation(answers);
    if (toolId === 15) return genExecution(answers);
    
    // ========== 1. 大五人格（OCEAN）- 专业版 ==========
    const genBigFive = function(answers) {
        const dims = ['开放性', '尽责性', '外向性', '宜人性', '情绪稳定性'];
        const scores = {}, counts = {};
        dims.forEach(d => { scores[d] = 0; counts[d] = 0; });
        
        answers.forEach(a => {
            const dim = a.dimension || '开放性';
            const val = a.answer || 0;
            if (scores[dim] !== undefined) { scores[dim] += val; counts[dim]++; }
        });
        
        const avg = {}, percentiles = {};
        dims.forEach(d => {
            avg[d] = counts[d] > 0 ? Math.round(scores[d] / counts[d] * 10) / 10 : 3;
            percentiles[d] = Math.min(99, Math.max(1, Math.round((avg[d] - 1) / 4 * 100)));
        });
        
        const sorted = Object.entries(avg).sort((a,b) => b[1] - a[1]);
        const maxDim = sorted[0], minDim = sorted[sorted.length-1];
        const overall = Math.round(sorted.reduce((s,x) => s+x[1], 0) / 5 * 10) / 10;

        // 团队角色映射（Belbin模型）
        const teamRoles = {
            '开放性': ['创新者', '善于提出新想法和创意方案'],
            '尽责性': ['执行者', '注重细节、按时交付、质量保证'],
            '外向性': ['协调者/资源探索者', '擅长对外联络、推动团队协作'],
            '宜人性': ['团队协作者', '营造和谐氛围、化解冲突'],
            '情绪稳定性': ['完成者', '在压力下保持冷静、确保任务完成']
        };

        return {
            toolName: '大五人格专业测评报告',
            overallScore: overall,
            dimensions: avg,
            percentiles: percentiles,
            summary: [
                '【测评概述】',
                '本次大五人格（Big Five/OCEAN）测评基于国际通用的五因素人格模型，从五个核心维度全面评估您的人格特质。该模型被广泛应用于人才选拔、职业发展、团队建设等领域，具有跨文化、跨行业的良好信效度。',
                '',
                '【综合评估】',
                '您的综合人格得分为 ' + overall + ' 分（5分制）。在' + maxDim[0] + '维度表现最为突出（' + maxDim[1] + '分），这表明您' + getBFDesc(maxDim[0], maxDim[1]) + '。相对而言，' + minDim[0] + '维度有较大提升空间（' + minDim[1] + '分），建议' + getBFSuggestion(minDim[0], minDim[1]) + '。',
                '',
                '【各维度详细解读】',
                ...dims.map(function(d) {
                    var p = percentiles[d];
                    var level = p >= 75 ? '高分段（前25%）' : p >= 50 ? '中高分段（前50%）' : p >= 25 ? '中低分段' : '低分段（后25%）';
                    return d + '（' + avg[d] + '分，常模' + level + '）：' + getBFDetail(d, avg[d]);
                }),
                '',
                '【职场优势分析】',
                ...sorted.filter(function(x) { return x[1] >= 3.5; }).map(function(x) { return '• ' + x[0] + '（' + x[1] + '分）：' + getBFDesc(x[0], x[1]); }),
                '',
                '【待发展领域】',
                ...sorted.filter(function(x) { return x[1] < 3.0; }).map(function(x) { return '• ' + x[0] + '（' + x[1] + '分）：建议' + getBFSuggestion(x[0], x[1]); }),
                '',
                '【团队角色定位】基于您的人格特质，您在团队中最适合担任「' + (teamRoles[maxDim[0]] ? teamRoles[maxDim[0]][0] : '多面手') + '」角色——' + (teamRoles[maxDim[0]] ? teamRoles[maxDim[0]][1] : '能够适应多种团队需求') + '。同时建议与' + (teamRoles[minDim[0]] ? teamRoles[minDim[0]][0] : '互补型成员') + '类型的同事协作，形成能力互补。',
                '',
                '【领导力潜质】' + (overall >= 3.8 ? '您展现出较强的领导力潜质，尤其在决策魄力和人际影响力方面表现突出。适合向管理岗位发展。' : overall >= 3.4 ? '您具备中等偏上的领导力基础，建议通过项目管理和团队协作实践进一步提升领导技能。' : '目前更适合作为个人贡献者深耕专业领域，未来可逐步培养管理意识。'),
                '',
                '【发展建议】',
                '短期（3个月）：针对' + minDim[0] + '维度进行专项提升，如参加相关培训或寻求导师指导。',
                '长期（12个月）：发挥' + maxDim[0] + '维度优势，将其转化为核心竞争力；同时系统性地改善短板维度。'
            ].join('\n'),
            strengths: sorted.filter(function(x){return x[1]>=3.5}).map(function(x,i){return{name:x[0]+'维优势',desc:getBFDesc(x[0],x[1])+'（'+x[1]+'分）'}}),
            weaknesses: sorted.filter(function(x){return x[1]<3.0}).map(function(x,i){return{name:x[0]+'维待提升',desc:getBFSuggestion(x[0],x[1])}}),
            suggestions: [getBFSuggestion(minDim[0],minDim[1]), '持续发挥'+maxDim[0]+'维度的天然优势','建立系统的自我认知和反馈机制'],
            jobMatch: getBFJobMatch(avg),
            interviewQuestions: getBFInterviewQ(avg),
            leadershipPotential: overall >= 3.8 ? '高' : overall >= 3.4 ? '中高' : '发展中',
            teamRole: teamRoles[maxDim[0]] ? teamRoles[maxDim[0]][0] : '灵活型'
        };
    };

    // ========== 2. MBTI - 专业版 ==========
    const genMBTI = function(answers) {
        var E=0,I=0,S=0,N=0,T=0,F=0,J=0,P=0;
        var eC=0,iC=0,sC=0,nC=0,tC=0,fC=0,jC=0,pC=0;
        answers.forEach(function(a) {
            var v = a.answer || 0;
            var d = a.dimension || '';
            if (d === 'E/I' || d === 'EI') { if(v>=4) { E+=v; eC++; } else { I+=(6-v); iC++; } }
            else if (d === 'S/N' || d === 'SN') { if(v>=4) { S+=v; sC++; } else { N+=(6-v); nC++; } }
            else if (d === 'T/F' || d === 'TF') { if(v>=4) { T+=v; tC++; } else { F+=(6-v); fC++; } }
            else if (d === 'J/P' || d === 'JP') { if(v>=4) { J+=v; jC++; } else { P+=(6-v); pC++; } }
        });

        function pct(a,b) { var t=a+b; return t>0 ? Math.round(a/t*100) : 50; }
        function avg(a,c) { return c>0 ? Math.round(a/c*10)/10 : 3; }

        var type = (E>=I?'E':'I')+(S>=N?'S':'N')+(T>=F?'T':'F')+(J>=P?'J':'P');

        var profiles = {
            INTJ:{t:'建筑师',core:'战略性思维，追求效率与完美主义，独立且坚定地推进复杂目标。具有极强的系统思维能力和远见卓识，善于发现模式并制定长远规划。',str:['战略规划能力出色','独立决策、不受他人影响','对复杂问题有深度洞察力','高标准驱动持续改进'],wk:['可能过度批判他人想法','社交精力有限，需主动建立关系','对执行细节缺乏耐心'],fit:'首席技术官/架构师/战略顾问/数据科学家/研发总监'},
            INTP:{t:'逻辑学家',core:'好奇心驱动的分析者，热衷于理解事物背后的原理和逻辑框架。思维灵活开放，喜欢挑战假设和探索可能性空间。',str:['逻辑推理能力强','思维开放不拘一格','能快速学习新领域知识','创新性解决问题'],wk:['执行力有时不足','可能忽视他人情感需求','容易陷入过度分析而迟迟不做决定'],fit:'研究员/算法工程师/哲学家/技术顾问/产品策略师'},
            ENTJ:{t:'指挥官',core:'天生的领导者，具有强大的组织能力和推动力。善于制定战略愿景并动员资源去实现目标，在混乱中建立秩序。',str:['卓越的领导力和组织能力','果断决策，敢于承担责任','战略思维与执行力兼具','善于激励和推动团队'],wk:['可能过于强势导致团队压力','有时忽略细节和质量控制','需要更多耐心倾听不同意见'],fit:'CEO/总经理/创业者/咨询公司合伙人/投资经理'},
            ENTP:{t:'辩论家',core:'智力敏捷的挑战者，热爱头脑风暴和辩论各种可能性。思维发散且有创造力，善于发现机会和连接看似无关的概念。',str:['创新思维和创意丰富','快速适应变化的环境','善于说服和影响他人','能看到别人看不到的机会'],wk:['可能虎头蛇尾、难以坚持','容易对常规事务感到厌倦','需要更有纪律性的执行伙伴'],fit:'创业公司创始人/产品经理/市场战略师/投资人/创意总监'},
            INFJ:{t:'提倡者',core:'理想主义者兼战略家，既有深刻的同理心又有清晰的目标导向。致力于帮助他人实现潜能，追求有意义的社会影响。',str:['深刻洞察他人的需求和潜力','强烈的使命感和价值观驱动','优秀的倾听者和咨询师','能将愿景转化为行动计划'],wk:['容易过度承担他人情绪负担','对批评过于敏感','理想化倾向可能导致失望'],fit:'组织发展顾问/HBP/培训总监/心理咨询师/社会企业创始人'},
            INFP:{t:'调停者',core:'忠于内心价值观的理想主义者，以真诚和创造力与世界互动。追求真实性和意义感，对他人的情感有敏锐的感知力。',str:['真诚且富有同理心','创造力和想象力丰富','坚定的价值观和原则性','善于理解和接纳多样性'],wk:['可能在冲突面前退缩','决策时过于依赖情感','需要更务实的目标设定'],fit:'内容创作者/用户体验研究员/品牌策划师/心理咨询师/教育工作者'},
            ENFJ:{t:'主人公',core:'富有魅力的天然领导者，善于激励和赋能他人。具有强烈的人际敏感度和利他动机，致力于创建和谐共赢的团队环境。',str:['出色的感染力和号召力','天然的教练和导师气质','善于发现和发展他人潜力','团队凝聚力的核心人物'],wk:['可能过度关注他人而忽视自己','难以做出艰难的决定','需要学会设立边界'],fit:'HRD/培训总监/公关负责人/销售总监/非营利组织领导者'},
            ENFP:{t:'竞选者',core:'热情洋溢的创新者，对人充满好奇和真诚的兴趣。思维跳跃且富有创造力，善于在各种想法和人之间建立连接。',str:['极具感染力的热情和正能量','创造性思维和发散性思考','善于建立广泛的人际网络','适应性强、学习速度快'],wk:['注意力分散、难以专注','可能过度承诺而无法兑现','需要更强的项目管理能力'],fit:'市场营销/活动策划/用户增长/媒体人/创业者'},
            ISTJ:{t:'物流师',core:'务实可靠的责任担当者，重视秩序、规则和承诺。以严谨的态度处理每一项任务，是组织中最可信赖的基石型人才。',str:['高度的责任心和可靠性','注重细节和准确性','遵守规则和流程','稳定的情绪和执行力'],wk:['可能抗拒变化和创新','灵活性不足','需要更多的冒险精神'],fit:'财务总监/运营经理/合规审计/项目经理/质量管理'},
            ISFJ:{t:'守护者',core:'温暖细致的支持者，默默为他人付出。具有超强的事务性记忆和对细节的关注，是团队中的「粘合剂「和「稳定器「。',str:['细心周到、考虑周全','忠诚可靠的团队成员','优秀的服务意识和执行力','善于维护和谐的关系'],wk:['可能过度自我牺牲','难以拒绝他人的请求','需要更多地表达自己的需求'],fit:'行政总监/客户成功负责人/HR运营/医疗护理/教育行政'},
            ESTJ:{t:'总经理',core:'高效务实的管理者，以结果为导向，善于组织和协调资源。重视传统价值和明确的层级结构，是组织中不可或缺的执行力量。',str:['高效的组织和管理能力','明确的目标感和执行力','务实的问题解决方法','值得信赖的决策者'],wk:['可能显得不够灵活','对抽象和创新理念接受度低','需要注意工作生活平衡'],fit:'运营总监/项目经理/供应链管理者/银行经理/政府管理人员'},
            ESFJ:{t:'执政官',core:'社交能力强且热心助人的组织者，致力于营造和谐温暖的人际环境。善于感知他人的情绪变化并及时给予支持。',str:['出色的人际交往能力','热忱的服务态度','善于组织社交活动','团队的润滑剂和暖心人'],wk:['可能过分在意他人评价','决策时受情感影响较大','需要发展独立性'],fit:'HRBP/客户关系经理/教师/护士/酒店管理'},
            ISTP:{t:'鉴赏家',core:'冷静理性的问题解决者，擅长分析和拆解复杂系统。动手能力强，喜欢通过实际操作来理解事物的运作原理。',str:['出色的分析和故障排查能力','冷静应对危机','动手能力强、实操经验丰富','独立自主的工作方式'],wk:['沟通表达可以更加主动','长期规划和坚持需要加强','情感表达较为内敛'],fit:'工程师/技术人员/系统运维/质量控制/金融分析师'},
            ISFP:{t:'探险家',core:'温和敏感的艺术家型，追求美学和个人表达。尊重每个人的独特性，通过行动而非言语来表达关怀和善意。',str:['审美品味和艺术感知力','真诚待人、不虚伪做作','灵活适应环境','关注当下和具体细节'],wk:['面对冲突时倾向于回避','需要更自信地表达意见','长期目标规划能力待提升'],fit:'设计师/摄影师/文案/用户研究/客户服务'},
            ESTP:{t:'企业家',core:'行动派的风险承担者，反应敏捷且充满活力。善于抓住当下的机会并通过实际行动来验证想法，是天生的谈判者和推销员。',str:['快速反应和即兴发挥能力','出色的谈判和说服力','务实且结果导向','充满活力和感染力'],wk:['冲动决策可能导致风险','长期规划能力较弱','需要更多的反思和沉淀'],fit:'销售总监/创业者/体育教练/活动执行/贸易业务'},
            ESFP:{t:'表演者',core:'热情洋溢的享乐主义者，善于享受当下并带动周围人的情绪。具有天然的舞台魅力和娱乐才能，是聚会的焦点人物。',str:['极具亲和力和幽默感','善于活跃气氛和调动情绪','活在当下、享受生活','实用主义的社交高手'],wk:['需要更长远的规划视角','可能因追求即时满足而忽略责任','需要增强深度思考的习惯'],fit:'公关/演艺/旅游服务/销售/教育培训'},
        };

        var pf = profiles[type] || profiles.INTJ;
        var eP=pct(E,I), iP=100-eP, sP=pct(S,N), nP=100-sP, tP=pct(T,F), fP=100-tP, jP=pct(J,P), pP=100-jP;

        var oScore = ((avg(E,eC)+avg(I,iC)+avg(S,sC)+avg(N,nC)+avg(T,tC)+avg(F,fC)+avg(J,jC)+avg(P,pC))/8 * 5 / 5).toFixed(1);

        return {
            toolName: 'MBTI职业性格专业测评报告',
            type: type,
            typeTitle: pf.t,
            typeDesc: pf.core,
            overallScore: parseFloat(oScore),
            totalScore: parseFloat(oScore),
            dimensions: {'外向(E)':avg(E,eC),'内向(I)':avg(I,iC),'感觉(S)':avg(S,sC),'直觉(N)':avg(N,nC),'思考(T)':avg(T,tC),'情感(F)':avg(F,fC),'判断(J)':avg(J,jC),'感知(P)':avg(P,pC)},
            typeScores: {E:eP,I:iP,S:sP,N:nP,T:tP,F:fP,J:jP,P:pP},
            careers: pf.fit.split('/'),
            summary: [
                '【MBTI职业性格测评专业报告】',
                '',
                '一、类型判定',
                '经过16道MBTI标准题目测评，您的四维偏好结果为：',
                '• 外倾(E)/内倾(I)：' + (E>=I?'偏向E-外倾('+eP+'%)':'偏向I-内倾('+iP+'%)'),
                '• 感觉(S)/直觉(N)：' + (S>=N?'偏向S-感觉('+sP+'%)':'偏向N-直觉('+nP+'%)'),
                '• 思考(T)/情感(F)：' + (T>=F?'偏向T-思考('+tP+'%)':'偏向F-情感('+fP+'%)'),
                '• 判断(J)/感知(P)：' + (J>=P?'偏向J-判断('+jP+'%)':'偏向P-感知('+pP+'%)'),
                '',
                '最终类型：' + type + ' —— 「' + pf.t + '」',
                '',
                '二、类型深度解析',
                pf.core,
                '',
                '三、核心优势',
                ...pf.str.map(function(s,i){return (i+1)+'. '+s;}),
                '',
                '四、潜在挑战与发展方向',
                ...pf.wk.map(function(w,i){return (i+1)+'. '+w;}),
                '',
                '五、职场表现特征',
                '• 决策风格：' + (type[0]==='E'?'倾向于快速决策、多方征求意见后拍板':'倾向于深思熟虑、充分分析后再做决定'),
                '• 沟通方式：' + (type[2]==='T'?'直接、逻辑化、关注事实和数据':'委婉、共情化、关注感受和人际关系'),
                '• 工作节奏：' + (type[3]==='J'?'偏好计划有序、按部就班、提前完成':'偏好灵活应变、临场发挥、截止日期前冲刺'),
                '• 压力反应：' + getTypeStress(type),
                '',
                '六、适合的职业方向',
                pf.fit,
                '',
                '七、发展建议',
                '• 发扬' + pf.str[0].substring(0,6) + '的天赋，选择能充分发挥此优势的工作环境和岗位',
                '• 针对' + pf.wk[0].substring(0,6) + '制定专项改进计划，寻找互补型的合作伙伴或导师',
                '• 在职业选择时优先考虑与' + type + '类型匹配度高的行业和组织文化'
            ].join('\n'),
            strengths: pf.str.map(function(s,i){return{name:'核心优势'+(i+1),desc:s};}),
            weaknesses: pf.wk.map(function(w,i){return{name:'发展领域'+(i+1),desc:w};}),
            workStyle: (type[0]==='E'?'外向活跃型': '内向深思型') + ' + ' + (type[2]==='T'? '理性分析型': '感性共情型') + ' + ' + (type[3]==='J'? '计划有序型': '灵活适应型'),
            communicationStyle: type[2]==='T' ? '沟通简洁有力，注重事实依据，善用数据和逻辑支撑观点' : '沟通温和细腻，善于倾听和共情，注重维护对方的面子和感受',
            stressReaction: getTypeStress(type),
            developmentSuggestions: pf.wk.slice(0,3)
        };
    };

    // ========== 3. DISC - 专业版 ==========
    const genDISC = function(answers) {
        var scores={D:0,I:0,S:0,C:0}, counts={D:0,I:0,S:0,C:0};
        answers.forEach(function(a){
            var d=(a.dimension||'D')[0];
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={};
        var maxK='D',maxV=0;
        ['D','I','S','C'].forEach(function(k){
            avg[k]=counts[k]>0?Math.round(scores[k]/counts[k]*10)/10:3;
            if(avg[k]>maxV){maxV=avg[k];maxK=k;}
        });

        var discProfiles={
            D:{name:'支配型-Dominance',core:'结果导向型领导者，目标明确、行动迅速、敢于挑战权威。在面对困难和竞争时表现出色，能够在压力下保持清晰的判断力和推动力。适合需要快速决策和突破性成果的场景。',style:'直接、简洁、聚焦结果，不喜欢冗余信息。沟通时习惯使用指令性和确定性的语言。',strengths:['目标感强，结果导向','决策果断，敢于担责','在竞争中表现突出','推动变革的能力强'],weaknesses:['可能过于强势','对细节关注度不足','耐心有待提升','需要更多倾听'],mgmt:'给予充分的授权和决策空间，设定清晰的目标和期限，减少微观管理。定期进行一对一反馈，认可其成就。',stress:'高压下可能变得更加激进和控制欲强，建议练习深呼吸和暂时抽离。',roles:'CEO/销售总监/创业者/项目经理/变革推动者'},
            I:{name:'影响型-Influence',core:'人际导向型的影响者，热情洋溢、善于表达、乐于激励他人。具有天然的感染力和说服力，能够在团队中营造积极乐观的氛围。适合需要对外联络、影响和激励的场景。',style:'生动热情、富有感染力，善于讲故事和使用比喻。喜欢得到他人的关注和认可。',strengths:['极强的影响力和感染力','善于建立人际关系','乐观积极的心态','创意和表达能力突出'],weaknesses:['可能过于乐观而忽略风险','执行力有时不足','对枯燥重复工作的耐受度低','需要注意时间管理'],mgmt:'给予公开的认可和展示平台，提供社交机会。避免过多限制其自由度，用愿景和激情驱动。',stress:'压力下可能回避现实或转移话题，建议建立跟进机制和 accountability partner。',roles:'市场总监/公关/销售/培训师/活动策划'},
            S:{name:'稳健型-Steadiness',core:'关系导向型的支持者，耐心、稳重、善于倾听和配合。高度重视团队的和谐与稳定，是组织中最可靠的支持型成员。适合需要长期服务和稳定产出的场景。',style:'温和耐心、善于倾听，语速较慢但表达真诚。不喜欢冲突和突变，需要时间思考和准备。',strengths:['极高的团队合作意识','耐心细致的服务态度','情绪稳定可信赖','善于维护客户关系'],weaknesses:['面对变化的适应速度较慢','可能回避必要的冲突','主动性可以更强','需要更多表达自己的观点'],mgmt:'提供清晰稳定的指引和支持，给予充足的时间适应变化。营造安全的工作环境，逐步增加挑战。',stress:'压力下可能沉默退缩或过度顺从，鼓励其表达真实想法并提供支持。',roles:'客户成功/HR专员/运营支持/行政/客服/培训协调'},
            C:{name:'遵从型-Conscientiousness',core:'任务导向型的分析师，严谨准确、注重质量和规范。善于收集和分析信息，在做决策前会充分权衡各方因素。适合需要高质量输出和精确分析的场景。',style:'准确严谨、逻辑清晰，喜欢用数据和事实说话。沟通时注重细节和准确性，不喜欢模糊和不确定的表达。',strengths:['出色的分析能力','高度的质量意识','做事严谨有条理','遵守流程和规范'],weaknesses:['可能过度分析导致决策缓慢','灵活性有待提升','对模糊性的容忍度较低','需要更多关注人际关系'],mgmt:'提供充分的数据和分析时间，设定明确的质量标准和检查点。减少突发变化的需求，允许充足的准备时间。',stress:'压力下可能过度谨慎甚至瘫痪，帮助其设定决策时限和降低完美主义期望。',roles:'数据分析/质量控制/财务/法务/合规/研发工程师'}
        };

        var info=discProfiles[maxK];
        var workPerf=maxK==='D'?'倾向于快速决策、推动结果，适合需要驱动结果的角色':maxK==='I'?'倾向于激励他人、营造氛围，适合需要影响和协作的角色':maxK==='S'?'倾向于维护和谐、支持队友，适合需要稳定和协作的角色':'倾向于仔细分析、确保质量，适合需要准确和分析的角色';

        return {
            toolName: 'DISC行为风格专业测评报告',
            dimensions: avg,
            dominantStyle: maxK,
            overallScore: Math.round((avg.D+avg.I+avg.S+avg.C)/4*10)/10,
            summary: [
                '【DISC行为风格测评专业报告】',
                '',
                '一、主导风格识别',
                '您的DISC四维得分：支配(D)=' + avg.D + '，影响(I)=' + avg.I + '，稳健(S)=' + avg.S + '，遵从(C)=' + avg.C + '。',
                '主导风格为 ' + maxK + ' 型——' + info.name + '。',
                '',
                '二、风格画像',
                info.core,
                '',
                '三、沟通风格',
                info.style,
                '',
                '四、职场行为特征',
                '在团队和工作场景中，您' + workPerf + '。',
                '',
                '五、核心优势',
                ...info.strengths.map(function(s,i){return (i+1)+'. '+s;}),
                '',
                '六、发展建议',
                ...info.weaknesses.map(function(w,i){return (i+1)+'. '+w;}),
                '',
                '七、压力下的行为模式',
                info.stress,
                '',
                '八、管理建议（供管理者参考）',
                info.mgmt,
                '',
                '九、推荐适配岗位',
                info.roles
            ].join('\n'),
            strengths: info.strengths.map(function(s,i){return{name:'优势'+(i+1),desc:s};}),
            weaknesses: info.weaknesses.map(function(w,i){return{name:'待提升'+(i+1),desc:w};}),
            style: info.style,
            suitableRoles: info.roles,
            communicationTips: info.style,
            stressReaction: info.stress,
            managementStyle: info.mgmt
        };
    };

    // ========== 4. 霍兰德 - 专业版 ==========
    const genHolland = function(answers) {
        var scores={R:0,I:0,A:0,S:0,E:0,C:0}, counts={R:0,I:0,A:0,S:0,E:0,C:0};
        var names={R:'现实型',I:'研究型',A:'艺术型',S:'社会型',E:'企业型',C:'常规型'};
        answers.forEach(function(a){
            var d=(a.dimension||'R')[0];
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={}, sorted=[];
        ['R','I','A','S','E','C'].forEach(function(k){
            avg[k]=counts[k]>0?Math.round(scores[k]/counts[k]*10)/10:3;
            sorted.push([k,avg[k]]);
        });
        sorted.sort(function(a,b){return b[1]-a[1];});
        var top3=sorted.slice(0,3).map(function(x){return x[0];}).join('');
        var topNames=top3.split('').map(function(x){return names[x];}).join('-');

        var hollandCareers={
            RIA:['机械工程师','电子工程师','土木工程师','技术员'],
            RIS:['外科医生','信息技术专家','生物学家','化学家'],
            RIE:['系统分析师','数学家','物理学家','地质学家'],
            RIC:['会计师','成本核算','银行职员','统计员'],
            RSE:['厨师','牙科技师','消防员','警察'],
            RSA:['园艺师','农民','兽医','宠物美容'],
            RES:['空乘','航海员','导游','采购'],
            REC:['办公室管理员','秘书','文字录入','仓库管理'],
            AIS:['建筑师','艺术家','摄影师','设计师'],
            AIR:['飞行员','计算机工程师','科学期刊编辑'],
            ASE:['心理学家','哲学研究者','大学教师','社会学'],
            AIE:['编辑/作家','翻译','语言学家','记者'],
            AIE_2:['音乐家','作曲家','指挥家','演奏家'],
            SAI:['心理咨询师','学校辅导员','社工','职业顾问'],
            SEC:['律师','法官','公务员','招聘专员'],
            SER:['体育教练/裁判','运动生理学家','理疗师','康复治疗'],
            SEI:['公共关系经理','人力资源总监','市场经理','销售经理'],
            SCA:['图书馆管理员','档案管理','博物馆讲解','税务专员'],
            SCE:['小学/幼儿园教师','职业教育师','特教老师','辅导员'],
            SIR:['护士/医生助理','物理治疗师','医学实验室技师','牙医'],
            SRI:['航空管制员','飞行员','交通调度','质检'],
            SRC:['办公室主任/行政','秘书','会员主管','办事员'],
            ECR:['财务经理','银行行长','预算分析师','审计师'],
            ECS:['商务经理','销售代表','房地产经纪人','采购代理'],
            ESR:['运动推广员','赛事组织者','旅游代理人','精品店店主'],
            ESI:['公关经理','传媒策划','营销策划','活动组织'],
            ERA:['广播/电视主持人','演说家','政治家','企业家'],
            ERI:['工业工程经理','工厂督导','项目经理','安全工程师'],
            ERC:['办公室经理','部门主管','区域经理','运营总监'],
            CRI:['会计','统计员','精算师','商业分析师'],
            CRS:['邮递员','档案管理员','银行柜员','前台接待'],
            CIA:['审计员','税务专员','法律助理','合规专员'],
            CIE:['计算机操作员','数据库管理','技术文档编写'],
            CIS:['应用软件程序员','系统分析师','网络管理员'],
            CIR:['质量检验','技术制图','建筑绘图','机械制图'],
            CSE:['法庭书记员','速记员','行政助理','人事档案'],
            CSR:['接待员','电话接线员','秘书','办公文员'],
            CSI:['调查分析师','校对员','信息整理','图书管理'],
            CES:['银行信贷员','保险核保','证券交易','预算分析师'],
            CER:['人事助理','招聘专员','薪酬福利专员','员工关系'],
            CIE_2:['计算机录入','桌面出版','数据录入','表格制作']
        };

        var careers=hollandCareers[top3]||['综合管理岗','行政助理','项目协调','客户服务'];
        var descMap={
            R:'喜欢使用工具和机器操作，偏好具体、实际的任务，动手能力强',
            I:'喜欢分析和解决智力性问题，对科学原理和理论探究感兴趣，思维缜密',
            A:'富于想象力和创造力，追求美感和自我表达，不喜欢高度结构化的工作',
            S:'乐于助人，善于与人沟通和合作，关心社会问题和他人福祉',
            E:'自信、有野心，喜欢领导和影响他人，追求经济回报和社会地位',
            C:'注重细节和条理，喜欢按照既定规程工作，重视准确性和可靠性'
        };

        return {
            toolName: '霍兰德职业兴趣专业测评报告',
            dimensions: avg,
            hollandCode: top3,
            dimensionNames: topNames,
            overallScore: Math.round((sorted[0][1]+sorted[1][1]+sorted[2][1])/3*10)/10,
            summary: [
                '【霍兰德职业兴趣测评专业报告】',
                '',
                '一、兴趣代码',
                '您的霍兰德职业兴趣代码为 ' + top3 + '（' + topNames + '）。',
                '这意味着您最匹配的三种兴趣类型依次为：',
                ...top3.split('').map(function(c,i){return (i+1)+'. '+names[c]+'（'+c+'）：'+avg[c]+'分 —— '+descMap[c];}),
                '',
                '二、职业兴趣深度分析',
                '根据霍兰德理论，您的兴趣组合呈现出以下特点：',
                '• 主导兴趣（'+names[sorted[0][0]]+'）：这是您最自然的职业倾向，在工作中从事此类活动时会感到最大的满足感和成就感。',
                '• 辅助兴趣（'+names[sorted[1][0]]+'和'+names[sorted[2][0]]+'）：这些兴趣类型可以作为主导兴趣的有益补充，拓宽您的职业选择范围。',
                '• 相对较弱的兴趣类型：建议在选择工作时不必强行迎合这些领域，以免产生职业倦怠。',
                '',
                '三、推荐职业方向',
                '基于您的兴趣代码 ' + top3 + '，以下职业与您的兴趣匹配度最高：',
                ...careers.map(function(c,i){return (i+1)+'. '+c;}),
                '',
                '四、择业建议',
                '• 优先选择能够充分发挥您主导兴趣（'+names[sorted[0][0]]+'）的工作内容和环境',
                '• 考虑将辅助兴趣融入工作中，使职业发展更加多元化和可持续',
                '• 避免长时间从事与您兴趣代码相悖的工作，这可能导致职业倦怠和绩效下降',
                '• 定期重新评估职业兴趣的变化，因为兴趣会随着经验和成长而演变'
            ].join('\n'),
            careerSuggestions: careers,
            strengths: sorted.slice(0,3).map(function(x,i){return{name:'兴趣优势'+(i+1),desc:names[x[0]]+'倾向明显（'+x[1]+'分）'};}),
            limitations: sorted.slice(3).map(function(x,i){return{name:'兴趣盲区'+(i+1),desc:names[x[0]]+'兴趣较弱（'+x[1]+'分），不建议作为主要职业方向'}})
        };
    };

    // ========== 5. 情商EQ - 专业版 ==========
    var genEQ = function(answers) {
        var dims=['自我意识','自我调节','内在激励','同理心','社交技能'];
        var scores={}, counts={};
        dims.forEach(function(d){scores[d]=0;counts[d]=0;});
        answers.forEach(function(a){
            var d=a.dimension||'自我意识';
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={};
        dims.forEach(function(d){avg[d]=counts[d]>0?Math.round(scores[d]/counts[d]*10)/10:3;});
        var overall=Math.round(dims.reduce(function(s,d){return s+avg[d];},0)/5*10)/10;
        var level=overall>=4.2?'优秀':overall>=3.5?'良好':overall>=2.8?'一般':'需提升';
        var leadership=overall>=4.2?'高领导力潜质——情商是领导力的核心，您已具备成为优秀领导者的关键素质':overall>=3.5?'中等领导力潜质——继续提升同理心和社会技巧将显著增强您的影响力':'发展中——建议重点训练情绪觉察和社交技巧';

        var eqDetails={
            '自我意识':{'high':'您对自己的情绪状态有清晰的觉察，能够准确识别自己在不同情境下的情绪变化及其触发因素。这种自我认知能力是情商发展的基石。','low':'建议开始练习情绪日记，记录每天的情绪波动和触发事件，逐步提升对自己情绪模式的觉察。','workplace':'在会议中能客观评估自己的想法而不被情绪左右'},
            '自我调节':{'high':'您展现了出色的情绪管理能力，即使在压力环境下也能保持冷静和理性，不会让负面情绪影响决策和行为。','low':'当遇到挫折时容易情绪失控，建议学习深呼吸、正念冥想等即时调节技巧。','workplace':'面对批评或挫折时能快速恢复平静并继续工作'},
            '内在激励':{'high':'您拥有强大的内部驱动力，不依赖外部奖励也能保持高度的投入和热情。这种内在动力是长期成功的关键保障。','low':'可能过度依赖外部认可和奖励，建议找到工作的内在意义和价值。','workplace':'即使在没有监督的情况下也能保持高质量产出'},
            '同理心':{'high':'您能够准确感知和理解他人的情绪和立场，这使您在人际关系和团队合作中具有天然的优势。','low':'在理解他人感受方面还有提升空间，建议多练习换位思考。','workplace':'能预判团队成员的情绪变化并及时给予支持'},
            '社交技能':{'high':'您擅长建立和维护人际关系，能够有效地沟通、协商、合作和解决冲突。这是职场成功的重要软技能。','low':'在社交场合可能感到不适或不知道如何有效互动，建议从小范围练习开始。','workplace':'能在跨部门和跨层级沟通中游刃有余'}
        };

        return {
            toolName: '情商(EQ)专业测评报告',
            overallScore: overall,
            totalScore: overall,
            eqLevel: level,
            dimensions: avg,
            leadershipPotential: leadership,
            summary: [
                '【情商(EQ)专业测评报告】',
                '',
                '一、情商总评',
                '您的情商综合得分为 ' + overall + ' 分（5分制），等级评定为「' + level + '」。',
                '',
                '二、五维度详细评估',
                ...dims.map(function(d){
                    var detail=eqDetails[d];
                    var isHigh=avg[d]>=3.5;
                    return d + '（' + avg[d] + '分）：' + (isHigh?detail.high:detail.low);
                }),
                '',
                '三、领导力潜质评估',
                leadership,
                '',
                '四、各维度职场表现预期',
                ...dims.map(function(d){return '• ' + d + '：' + eqDetails[d].workplace;}),
                '',
                '五、提升建议',
                ...(level!=='优秀'?[
                    '1. 每天花5分钟进行正念呼吸练习，提升情绪觉察能力',
                    '2. 每周至少进行一次深度倾听练习（与他人对话时完全专注于对方的表达）',
                    '3. 建立情绪日志，追踪情绪模式和触发因素',
                    '4. 寻找一位情商较高的榜样观察和学习其社交方式'
                ]:[
                    '继续保持当前的高情商水平，可以考虑：• 承担更多需要人际协调的管理职责• 作为情商导师帮助团队其他成员成长• 将情商优势应用于更高层次的领导力发展'
                ])
            ].join('\n'),
            strengths: dims.filter(function(d){return avg[d]>=3.5}).map(function(d){return{name:d+'优势',desc:eqDetails[d].high.substring(0,40)+'...'};}),
            weaknesses: dims.filter(function(d){return avg[d]<3.0}).map(function(d){return{name:d+'待提升',desc:eqDetails[d].low.substring(0,40)+'...'};}),
            suggestions: level!=='优秀' ? ['每日正念练习5分钟','建立情绪反馈机制','寻求高情商榜样学习'] : ['承担更多协调管理工作','辅导团队成员情商成长','向高层领导力发展']
        };
    };

    // ========== 6. 工作动机 - 专业版 ==========
    var genMotivation = function(answers) {
        var dims=['成就动机','权力动机','归属动机','金钱动机','安全感','自主性','成长发展','工作生活平衡'];
        var scores={}, counts={};
        dims.forEach(function(d){scores[d]=0;counts[d]=0;});
        answers.forEach(function(a){
            var d=a.dimension||'成就动机';
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={};
        dims.forEach(function(d){avg[d]=counts[d]>0?Math.round(scores[d]/counts[d]*10)/10:3;});
        var sorted=Object.entries(avg).sort(function(a,b){return b[1]-a[1];});

        var motivDesc={
            '成就动机':'追求卓越、渴望通过努力获得有形的结果和认可',
            '权力动机':'希望影响他人、掌控局面、推动变革',
            '归属动机':'重视人际关系和团队归属感，希望被接纳和认同',
            '金钱动机':'物质报酬是重要的激励来源',
            '安全感':'偏好稳定、可预测的工作环境，规避风险',
            '自主性':'重视工作中的自由度和决策权',
            '成长发展':'看重学习和成长的机会胜过短期收益',
            '工作生活平衡':'重视私人时间和家庭，不愿过度牺牲个人生活'
        };

        return {
            toolName: '工作动机专业测评报告',
            dimensions: avg,
            overallScore: Math.round(dims.reduce(function(s,d){return s+avg[d];},0)/dims.length*10)/10,
            summary: [
                '【工作动机专业测评报告】',
                '',
                '一、动机结构概览',
                '您的前三大驱动力为：',
                ...sorted.slice(0,3).map(function(x,i){return (i+1)+'. '+x[0]+'（'+x[1]+'分）：'+motivDesc[x[0]];}),
                '',
                '相对较弱的动机因素：',
                ...sorted.slice(-3).map(function(x){return '• '+x[0]+'（'+x[1]+'分）';}),
                '',
                '二、动机结构深度解读',
                '您属于「' + (sorted[0][1]>=4.0?'高驱动型':'均衡型') + '」人才。' +
                (sorted[0][1]>=4.0?
                    '您有非常明确的驱动力来源——'+sorted[0][0]+'是您的核心引擎。这种强烈的内在动机会让您在相关领域表现出色，但也需要注意不要让单一动机过度主导所有决策。':
                    '您的各项动机分布较为均匀，没有极端偏高或偏低的因素。这意味着您可以适应多种工作环境，但也需要找到真正能点燃您热情的核心驱动力。'),
                '',
                '三、激励建议',
                ...sorted.slice(0,3).map(function(x){
                    return '• 针对'+x[0]+'（'+x[1]+'分）：'+getMotivationTip(x[0]);
                }),
                '',
                '四、组织匹配建议',
                '选择雇主和组织时，请重点关注：',
                '• 组织文化和价值观是否与您的核心动机相契合',
                '• 该岗位是否能提供您最看重的激励要素',
                '• 职业发展路径是否支持您的成长动机'
            ].join('\n'),
            strengths: sorted.slice(0,3).map(function(x,i){return{name:'核心驱动力'+(i+1),desc:motivDesc[x[0]]}}),
            suggestions: sorted.slice(0,3).map(function(x){return getMotivationTip(x[0]);})
        };
    };

    // ========== 7. 工作价值观 - 专业版 ==========
    var genValues = function(answers) {
        var dims=['成就感','经济报酬','工作稳定性','人际关系','自主性','创新创造','社会贡献','工作生活平衡','管理权力','声誉地位'];
        var scores={}, counts={};
        dims.forEach(function(d){scores[d]=0;counts[d]=0;});
        answers.forEach(function(a){
            var d=a.dimension||'成就感';
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={};
        dims.forEach(function(d){avg[d]=counts[d]>0?Math.round(scores[d]/counts[d]*10)/10:3;});
        var sorted=Object.entries(avg).sort(function(a,b){return b[1]-a[1]});
        var overall=Math.round(dims.reduce(function(s,d){return s+avg[d];},0)/dims.length*10)/10;

        var valueDesc={
            '成就感':'追求有挑战性的工作和可见的成果',
            '经济报酬':'重视薪资水平和物质回报',
            '工作稳定性':'偏好可预测和安全的工作环境',
            '人际关系':'重视和谐的同事关系和团队氛围',
            '自主性':'希望在工作中有较大的自由度',
            '创新创造':'喜欢尝试新方法和创造性解决问题',
            '社会贡献':'希望通过工作为社会带来正面影响',
            '工作生活平衡':'重视私人时间和家庭生活',
            '管理权力':'希望获得影响和领导的权力',
            '声誉地位':'追求职业声望和社会认可'
        };

        return {
            toolName: '工作价值观专业测评报告',
            dimensions: avg,
            overallScore: overall,
            topValues: sorted.slice(0,3).map(function(x){return x[0];}),
            summary: [
                '【工作价值观专业测评报告】',
                '',
                '一、核心价值观排序',
                '您最看重的三项工作价值观（降序排列）：',
                ...sorted.slice(0,3).map(function(x,i){return (i+1)+'. '+x[0]+'（'+x[1]+'分）— '+valueDesc[x[0]];}),
                '',
                '二、价值观画像分析',
                '您的工作价值观呈现出「' + 
                (sorted[0][1]>=4.2?'高诉求型 — 您对工作有较高期待，需要找到能满足核心价值诉求的平台':'务实型 — 您的价值诉求分布合理，可以在多种环境中找到平衡') + '」。',
                '',
                '您的核心价值观是「' + sorted[0][0] + '」（' + sorted[0][1] + '分）。' +
                '这意味着在选择工作时，' + getValueAdvice(sorted[0][0]),
                '',
                '三、组织文化匹配指南',
                '• 创业型公司：适合重视' + ['自主性','创新创造','经济报酬'].filter(function(v){return avg[v]>=3.5}).join('、') + '的候选人',
                '• 大型企业：适合重视' + ['工作稳定性','声誉地位','管理权力'].filter(function(v){return avg[v]>=3.5}).join('、') + '的候选人',
                '· 社会组织：适合重视' + ['社会贡献','人际关系','工作生活平衡'].filter(function(v){return avg[v]>=3.5}).join('、') + '的候选人',
                '',
                '四、职业决策建议',
                '1. 明确您的Top 3价值观是不可妥协的底线条件',
                '2. 在面试中主动了解候选组织的文化与您的价值观匹配度',
                '3. 接受offer前评估该岗位能否满足您的核心价值观',
                '4. 定期回顾和更新您的价值观排序，它会随人生阶段而变化'
            ].join('\n'),
            organizationFit: {
                startup: avg['自主性']>=3.5 && avg['创新创造']>=3.5 ? '高度匹配' : '需考量',
                corporate: avg['工作稳定性']>=3.5 && avg['声誉地位']>=3.5 ? '高度匹配' : '需考量',
                nonprofit: avg['社会贡献']>=3.5 && avg['人际关系']>=3.5 ? '高度匹配' : '需考量'
            },
            careerSuggestions: sorted.slice(0,3).map(function(x){return '重视'+x[0]+':建议选择能满足'+valueDesc[x[0]].substring(0,10)+'...的岗位'})
        };
    };

    // ========== 工具分发器 ==========
    var generators = {
        1: genBigFive,
        2: genMBTI,
        3: genDISC,
        4: genHolland,
        5: genEQ,
        6: genMotivation,
        7: genValues,
        8: genLeadership, 9: genCommunication, 10: genTeamwork,
        11: genProblemSolving, 12: genResilience, 13: genLearning,
        14: genInnovation, 15: genExecution,
        16: gen360Feedback, 17: genCareerAnchor, 18: genPsyCap,
        19: genOrgCommitment, 20: genLeadershipStyle, 21: genCareerMaturity,
        22: genJobSatisfaction, 23: genCareerStress
    };

    var fn = generators[toolId];
    if (fn) {
        var result = fn(answers);
        // 为所有报告追加 professionalEnhancement 深度分析（如果还没有）
        if (!result.professionalEnhancement) {
            result.professionalEnhancement = buildProfessionalEnhancement(result);
        }
        return result;
    }

    // ========== 通用深度报告生成器（工具24+及所有未匹配工具）==========
    return generateUniversalDeepReport(toolId, answers);
}

// ==================== 通用深度报告生成器 ====================
function generateUniversalDeepReport(toolId, answers) {
    // 从答案中提取维度和分数
    var dimScores = {}, dimCounts = {};
    answers.forEach(function(a) {
        var d = a.dimension || '综合能力';
        var v = parseFloat(a.answer) || 0;
        if (!dimScores[d]) { dimScores[d] = 0; dimCounts[d] = 0; }
        dimScores[d] += v;
        dimCounts[d]++;
    });

    var dimensions = {};
    Object.keys(dimScores).forEach(function(d) {
        dimensions[d] = Math.round(dimScores[d] / dimCounts[d] * 10) / 10;
    });

    var dims = Object.keys(dimensions);
    var scores = dims.map(function(d) { return dimensions[d]; });
    var overallScore = scores.length > 0 
        ? Math.round(scores.reduce(function(a,b){return a+b}, 0) / scores.length * 10) / 10 
        : 3.0;

    // 排序：高→低
    var sorted = dims.map(function(d) { return [d, dimensions[d]]; }).sort(function(a,b) { return b[1] - a[1]; });
    var topDims = sorted.slice(0, 3);
    var bottomDims = sorted.slice(-3).reverse();

    // 常模百分位
    var percentiles = {};
    dims.forEach(function(d) {
        percentiles[d] = Math.min(99, Math.max(1, Math.round((dimensions[d] - 1) / 4 * 100)));
    });

    // 风险评估
    var weakDims = sorted.filter(function(x) { return x[1] < 2.5; });
    var riskLevel = weakDims.length === 0 ? '低' : weakDims.length <= 2 ? '中' : '较高';
    var risks = weakDims.map(function(x) {
        return {
            factor: x[0] + '不足（' + x[1] + '分）',
            level: x[1] < 2.0 ? '高' : '中',
            mitigation: getUniversalSuggestion(x[0], x[1])
        };
    });
    if (risks.length === 0) {
        risks.push({ factor: '整体均衡发展', level: '低', mitigation: '继续保持各维度平衡发展，定期复盘防止退化' });
    }

    // 发展路线图
    var shortTermGoals = bottomDims.map(function(x) {
        return '针对「' + x[0] + '」制定30天提升计划，目标从' + x[1] + '分提升至' + (Math.min(5, x[1] + 0.8)).toFixed(1) + '分';
    });
    if (shortTermGoals.length === 0) shortTermGoals.push('巩固现有优势维度，选择1个维度进行突破性提升');
    shortTermGoals.push('寻找一位导师或教练进行定期反馈');

    var longTermGoals = [
        '将「' + (topDims[0] ? topDims[0][0] : '核心优势') + '」发展为个人品牌标签',
        '建立跨维度的能力整合，形成复合型竞争力',
        '根据测评结果调整职业发展方向和组织角色定位'
    ];

    // 职业匹配
    var careerReasoning = '基于您的测评结果，您在' +
        topDims.map(function(x){return x[0];}).join('、') +
        '方面表现突出（' + topDims.map(function(x){return x[1];}).join('/') + '分），建议优先考虑需要这些能力的岗位方向。';
    
    var topRoles = topDims.slice(0, 3).map(function(x) {
        return {
            role: getRoleByDimension(x[0]),
            match: Math.round(70 + x[1] * 6),
            reason: '您在' + x[0] + '维度得分' + x[1] + '分，高于人群平均水平的' + percentiles[x[0]] + '%'
        };
    });
    if (topRoles.length === 0) {
        topRoles.push({ role: '通用专业岗位', match: 75, reason: '综合能力均衡，可根据专业技能自由选择' });
    }

    // 详细维度分析
    var detailedAnalysis = {};
    sorted.forEach(function(item) {
        var d = item[0], s = item[1];
        detailedAnalysis[d] = {
            score: s,
            interpretation: getDimensionInterpretation(d, s),
            workplaceBehavior: getWorkplaceBehavior(d, s),
            energySource: getEnergySource(d, s),
            conflictStyle: getConflictStyle(d, s)
        };
    });

    // 综合评估摘要
    var execSummary = '本次测评共覆盖' + dims.length + '个核心维度，您的综合得分为' + overallScore + '分（5分制）。';
    if (overallScore >= 4.0) {
        execSummary += '您在多个维度上表现出色，属于"优秀人才"区间。尤其在' + topDims[0][0] + '（' + topDims[0][1] + '分）方面具有显著优势。';
    } else if (overallScore >= 3.2) {
        execSummary += '您的整体表现处于"良好"水平。优势领域为' + topDims.map(function(x){return x[0];}).join('、') + '，同时需要在' + (bottomDims[0] ? bottomDims[0][0] : '部分维度') + '方面加强。';
    } else {
        execSummary += '您的测评结果显示有较大的提升空间。建议重点关注' + bottomDims.map(function(x){return x[0];}).join('、') + '等薄弱维度，通过系统训练逐步提升。';
    }
    execSummary += '整体风险等级为"' + riskLevel + '"，' + (riskLevel === '低' ? '发展前景良好。' : '需要有针对性地制定改进计划。');

    return {
        toolName: '专业人才测评报告（工具' + toolId + '）',
        overallScore: overallScore,
        totalScore: overallScore,
        dimensions: dimensions,
        percentiles: percentiles,

        summary: [
            '【专业测评报告 — 深度分析版】',
            '',
            '一、测评概况',
            '• 测评维度数：' + dims.length + ' 个',
            '• 综合得分：' + overallScore + ' / 5.00 分',
            '• 风险等级：' + riskLevel,
            '• 最高维度：' + (topDims[0] ? topDims[0][0] + '（' + topDims[0][1] + '分）' : '-'),
            '• 待提升维度：' + (bottomDims[0] ? bottomDims[0][0] + '（' + bottomDims[0][1] + '分）' : '-'),
            '',
            '二、综合评估摘要',
            execSummary,
            '',
            '三、各维度详细解读',
            ...sorted.map(function(x) {
                return '• ' + x[0] + '（' + x[1] + '分，常模前' + (100 - percentiles[x[0]]) + '%）：' + getDimensionInterpretation(x[0], x[1]);
            }),
            '',
            '四、核心优势分析',
            ...sorted.filter(function(x){return x[1]>=3.5}).map(function(x,i){
                return (i+1)+'. '+x[0]+'（'+x[1]+'分）：'+getDimensionInterpretation(x[0],x[1]);
            }),
            '',
            '五、待提升领域与改进建议',
            ...sorted.filter(function(x){return x[1]<3.0}).map(function(x,i){
                return (i+1)+'. '+x[0]+'（'+x[1]+'分）：建议'+getUniversalSuggestion(x[0],x[1]);
            }),
            '',
            '六、风险评估与管理建议',
            '整体风险等级：' + riskLevel,
            ...risks.map(function(r){return '• '+r.factor+' — 缓解方式：'+r.mitigation;}),
            '',
            '七、职业发展方向建议',
            careerReasoning,
            ...topRoles.map(function(r){return '• '+r.role+'（匹配度'+r.match+'%）：'+r.reason;}),
            '',
            '八、行动规划',
            '短期目标（3个月）：',
            ...shortTermGoals.map(function(g){return '☐ '+g;}),
            '',
            '长期规划（12个月）：',
            ...longTermGoals.map(function(g){return '○ '+g;}),
            '',
            '【报告说明】本报告基于标准化测评工具生成，结果仅供参考。建议结合360度反馈、绩效数据和实际工作表现进行综合判断。'
        ].join('\n'),

        strengths: sorted.filter(function(x){return x[1]>=3.5}).map(function(x,i){
            return {name: x[0]+'优势', desc: getDimensionInterpretation(x[0], x[1])};
        }),
        weaknesses: sorted.filter(function(x){return x[1]<3.0}).map(function(x,i){
            return {name: x[0]+'待提升', desc: getUniversalSuggestion(x[0], x[1])};
        }),
        suggestions: bottomDims.map(function(x){
            return getUniversalSuggestion(x[0], x[1]);
        }).concat(['发挥'+(topDims[0]?topDims[0][0]:'核心')+'维度优势形成差异化竞争力']),

        jobMatch: topRoles.map(function(r){ return r.role + '（匹配度' + r.match + '%）'; }),

        interviewQuestions: [
            '请描述一次您利用' + (topDims[0] ? topDims[0][0] : '核心能力') + '成功解决复杂问题的具体经历',
            '您认为自己在' + (bottomDims[0] ? bottomDims[0][0] : '某些方面') + '最大的挑战是什么？如何应对？',
            '如果让您领导一个跨部门项目，您会如何发挥自己的优势并弥补短板？'
        ],

        professionalEnhancement: {
            executiveSummary: execSummary,
            detailedAnalysis: detailedAnalysis,
            careerMatch: {
                reasoning: careerReasoning,
                topRoles: topRoles
            },
            developmentRoadmap: {
                shortTerm: shortTermGoals,
                longTerm: longTermGoals
            },
            riskAssessment: {
                risks: risks,
                overallRisk: riskLevel + '风险'
            }
        }
    };
}

// ==================== Professional Enhancement 构建器（为已有报告补充深度分析）====================
function buildProfessionalEnhancement(report) {
    var dims = report.dimensions || {};
    var dimKeys = Object.keys(dims);
    var scores = dimKeys.map(function(d) { return dims[d]; });
    var overall = report.overallScore || report.totalScore || (scores.length > 0 ? scores.reduce(function(a,b){return a+b},0)/scores.length : 3);

    var sorted = dimKeys.map(function(d) { return [d, dims[d]]; }).sort(function(a,b) { return b[1] - a[1]; });
    var topDims = sorted.slice(0, 3);
    var bottomDims = sorted.slice(-3).reverse();

    // 风险评估
    var weakDims = sorted.filter(function(x) { return x[1] < 2.5; });
    var riskLevel = weakDims.length === 0 ? '低' : weakDims.length <= 2 ? '中' : '较高';
    var risks = weakDims.map(function(x) {
        return { factor: x[0], level: x[1] < 2.0 ? '高' : '中', mitigation: getUniversalSuggestion(x[0], x[1]) };
    });
    if (risks.length === 0) risks.push({ factor: '整体均衡', level: '低', mitigation: '继续保持' });

    // 职业匹配
    var topRoles = topDims.slice(0, 3).map(function(x) {
        return { role: getRoleByDimension(x[0]), match: Math.round(70 + x[1] * 6), reason: x[0] + '得分' + x[1] + '分' };
    });

    // 发展路线图
    var shortTermGoals = bottomDims.map(function(x) {
        return '针对「' + x[0] + '」制定30天提升计划（当前' + x[1] + '→ 目标' + (Math.min(5, x[1]+0.8)).toFixed(1) + '分）';
    });
    shortTermGoals.push('寻求导师反馈，建立定期复盘习惯');
    var longTermGoals = ['将核心优势发展为个人品牌', '构建跨维度复合能力', '调整职业方向与组织角色'];

    // 详细维度分析
    var detailedAnalysis = {};
    sorted.forEach(function(item) {
        detailedAnalysis[item[0]] = {
            score: item[1],
            interpretation: getDimensionInterpretation(item[0], item[1]),
            workplaceBehavior: getWorkplaceBehavior(item[0], item[1]),
            energySource: getEnergySource(item[0], item[1]),
            conflictStyle: getConflictStyle(item[0], item[1])
        };
    });

    return {
        executiveSummary: '本次测评综合得分为' + overall.toFixed(1) + '分。您在' + 
            (topDims[0] ? topDims[0][0] : '核心维度') + '方面最具优势（' + (topDims[0] ? topDims[0][1] : '-') + '分），' +
            (bottomDims[0] ? '在' + bottomDims[0][0] + '方面有提升空间（' + bottomDims[0][1] + '分）' : '各维度发展相对均衡') + 
            '。整体风险等级为"' + riskLevel + '"。',
        detailedAnalysis: detailedAnalysis,
        careerMatch: {
            reasoning: '基于测评结果的优势维度分布，推荐聚焦于能充分发挥核心竞争力的岗位方向。',
            topRoles: topRoles
        },
        developmentRoadmap: {
            shortTerm: shortTermGoals,
            longTerm: longTermGoals
        },
        riskAssessment: {
            risks: risks,
            overallRisk: riskLevel + '风险'
        }
    };
}

// ==================== 通用辅助函数 ====================
function getDimensionInterpretation(dim, score) {
    if (score >= 4.5) return '卓越水平。在此维度上您展现出远超常人的能力和素养，是团队中的标杆人物，可担任该领域的导师或专家角色。';
    if (score >= 4.0) return '优秀水平。在该维度上表现突出，能够独立承担高难度任务，是该领域的可靠执行者。';
    if (score >= 3.5) return '良好偏上。具备较强的能力基础，在大多数场景下能够胜任，有进一步精进的潜力。';
    if (score >= 3.0) return '中等水平。达到基本胜任标准，但在复杂或高压场景下可能需要更多支持。';
    if (score >= 2.5) return '发展中水平。已具备初步能力框架，但距离熟练应用还有差距，需要针对性训练。';
    return '待提升阶段。目前该维度是明显的短板区域，建议作为优先改进项投入资源。';
}
function getWorkplaceBehavior(dim, score) {
    if (score >= 4.0) return '主动承担责任、带动团队氛围、成为他人学习的榜样';
    if (score >= 3.0) return '稳定输出、配合团队需求、按质完成任务';
    return '需要指导和支持、在结构化环境中成长、逐步增加挑战';
}
function getEnergySource(dim, score) {
    if (score >= 4.0) return '从挑战性任务和高难度目标中获得最大满足感';
    if (score >= 3.0) return '在团队协作和认可中获得动力';
    return '需要安全感和明确指引来保持积极状态';
}
function getConflictStyle(dim, score) {
    if (score >= 4.0) return '以建设性方式化解分歧、寻求双赢方案';
    if (score >= 3.0) return '倾向于妥协或回避直接冲突';
    return '可能采取对抗或退缩的极端方式，需学习冲突管理技巧';
}
function getUniversalSuggestion(dim, score) {
    if (score < 2.0) return '建议立即参加系统性培训课程，寻找导师一对一辅导，设定每日微练习目标';
    if (score < 2.5) return '推荐参加专项工作坊、阅读经典书籍、在实践中刻意练习并获取反馈';
    if (score < 3.0) return '建议通过轮岗/项目参与积累经验、寻找互补型搭档协作、每月自我反思复盘';
    return '继续深耕此领域、尝试教导他人以深化理解、探索进阶应用场景';
}
function getRoleByDimension(dim) {
    var roleMap = {
        '领导力': '团队负责人/项目经理', '沟通': '客户经理/公关/HRBP',
        '团队合作': '项目协调者/运营专员', '问题解决': '技术顾问/分析师',
        '抗压': '危机管理/客服主管', '学习能力': '研究员/战略规划',
        '创新': '产品经理/设计师', '执行力': '运营主管/交付经理',
        '批判性思维': '质量总监/风控经理', '认知能力': '策略顾问/架构师',
        '数字素养': '数据分析师/数字化专员', '跨文化': '国际业务/海外拓展',
        '学习敏锐度': '变革推动者/新业务负责人'
    };
    return roleMap[dim] || '专业岗位（' + dim + '方向）';
}

// ==================== 辅助函数 ====================

// 大五人格详细描述
function getBFDesc(dim, score) {
    var m = {
        '开放性': score>=4?'思维开阔、富有想象力和创造力，乐于接受新观念和新体验':score>=3?'有一定开放性能愿意尝试新事物':'比较保守、偏好熟悉的环境和既定方式',
        '尽责性': score>=4?'高度自律、有条理、可靠负责，始终如一地完成任务':score>=3?'基本靠谱能完成大部分工作':'需要加强计划和执行的连贯性',
        '外向性': score>=4?'精力充沛、善于社交、积极主动，在群体中自然发光':score>=3?'社交正常、能在需要时表现外向':'偏内向、更喜欢独处和小圈子交流',
        '宜人性': score>=4?'友善合作、信任他人、乐于助人，是团队中的润滑剂':score>=3?'基本友好能正常合作':'较为独立、有时显得有些疏离',
        '情绪稳定性': score>=4?'情绪成熟稳定、抗压能力强、从容应对压力':score>=3?'情绪基本可控但在强压下会有波动':'情绪敏感易受环境影响、需要情绪管理支持'
    };
    return m[dim] || '';
}
function getBFDetail(dim, score) {
    var details = {
        '开放性': score>=4?'您对新事物和新观念持开放态度，思维灵活富有创造力。在工作中能提出创新方案，适应变化能力强。':score>=3?'您对新事物持适度开放态度，能在必要时接受改变。':'您偏好熟悉的环境和既定方式，对变化持审慎态度。',
        '尽责性': score>=4?'您做事非常有条理，注重细节和质量，值得完全信赖交付重要任务。':score>=3?'您基本能做到按时保质完成任务。':'建议加强时间管理和任务跟踪习惯。',
        '外向性': score>=4?'您精力充沛善于交际，在团队活动中自然活跃，能有效影响和带动他人。':score>=3?'您社交能力正常，能根据场合调整行为。':'您更偏好独处或小范围交流，深度思考优于表面社交。',
        '宜人性': score>=4?'您天性善良合作，善于体察他人需求，是团队中的"润滑剂"。':score>=3?'您基本友善能正常合作。':'您较为独立直接，需要在合作与自主之间找到平衡。',
        '情绪稳定性': score>=4?'您情绪稳定成熟，即使在高压力下也能保持冷静和理性。':score>=3?'您情绪基本稳定但遇到重大压力时有波动。':'建议学习情绪调节技巧如正念和认知重构。'
    };
    return details[dim] || '';
}
function getBFSuggestion(dim, score) {
    var s = {
        '开放性':'每周接触一个新领域或新概念，拓展认知边界',
        '尽责性':'使用任务管理工具（如Todoist/Notion）建立系统和习惯',
        '外向性':'每周安排一次社交活动或公开演讲练习',
        '宜人性':'学习"温和而坚定"的沟通方式，在合作中保持原则',
        '情绪稳定性':'学习正念冥想和认知行为疗法的基本技巧'
    };
    return s[dim] || '持续学习和自我提升';
}
function getBFJobMatch(avg) {
    var jobs = [];
    if (avg['开放性']>=3.5) jobs.push('创意类岗位（设计/产品/营销）');
    if (avg['尽责性']>=3.5) jobs.push('管理类岗位（项目经理/运营）');
    if (avg['外向性']>=3.5) jobs.push('销售/公关/BD等对外岗位');
    if (avg['宜人性']>=3.5) jobs.push('HR/客服/培训等服务型岗位');
    if (avg['情绪稳定性']>=3.5) jobs.push('高压岗位（投行/咨询/急诊）');
    if (jobs.length===0) jobs.push('通用型岗位，可根据专业技能选择');
    return jobs;
}
function getBFInterviewQ(avg) {
    var qs = [];
    var sorted = Object.entries(avg).sort(function(a,b){return b[1]-a[1]});
    qs.push('请描述一次您利用'+sorted[0][0]+'优势成功解决问题的经历');
    qs.push('您如何看待自己在'+sorted[sorted.length-1][0]+'方面的不足？正在如何改善？');
    qs.push('如果让您在一个需要高度'+sorted[0][0]+'的团队中工作，您会如何贡献？');
    return qs;
}
function getTypeStress(type) {
    var sm = {
        INTJ:'可能变得更加孤立和挑剔，倾向于撤退到自己的思维世界中',
        INTP:'可能变得疏离和分析过度，暂停与外界互动',
        ENTJ:'可能变得更加强势和控制，试图强力扭转局势',
        ENTP:'可能用幽默和辩论来逃避现实的压力',
        INFJ:'可能过度吸收他人的负面情绪，感到身心俱疲',
        INFP:'可能退回到幻想世界或通过创作来逃避',
        ENFJ:'可能过度关心他人而忽视自己的需求，最终耗尽',
        ENFP:'可能变得散乱和分心，用新想法来逃避实际问题',
        ISTJ:'可能变得更加僵化和固守规则，拒绝任何变通',
        ISFJ:'可能过度操劳试图照顾所有人而崩溃',
        ESTJ:'可能采取强硬手段强制恢复秩序和控制',
        ESFJ:'可能变得焦虑并过度寻求他人的安慰和确认',
        ISTP:'可能完全关闭情感通道变成纯理性模式',
        ISFP:'可能通过感官享受或艺术创作来逃避',
        ESTP:'可能采取冒险或冲动的行为来释放压力',
        ESFP:'可能通过社交狂欢和娱乐来暂时忘却烦恼'
    };
    return sm[type] || '需要适当的休息和支持来缓解压力';
}
function getMotivationTip(motiv) {
    var tips = {
        '成就动机':'设定具有挑战性但有可达成的目标，提供及时的进度反馈',
        '权力动机':'赋予一定的决策权和影响力范围，让其主导某个项目或模块',
        '归属动机':'安排团队协作任务，营造支持和认可的团队氛围',
        '金钱动机':'提供有竞争力的薪酬和绩效奖金制度',
        '安全感':'提供稳定的合同条款和清晰的职业发展路径',
        '自主性':'减少不必要的监管，允许灵活的工作方式和时间安排',
        '成长发展':'提供培训预算、导师指导和轮岗机会',
        '工作生活平衡':'尊重下班时间，提供远程工作选项和弹性工时'
    };
    return tips[motiv] || '根据个人特点定制激励方案';
}
function getValueAdvice(val) {
    var advice = {
        '成就感':'应优先选择具有挑战性和成长空间的职位，避免单调重复的工作',
        '经济报酬':'应坦诚讨论薪酬期望，选择具有竞争力的薪酬体系的公司',
        '工作稳定性':'应优先考虑大型企业或公共部门的岗位，关注公司的财务健康度',
        '人际关系':'应考察团队氛围和公司文化，选择重视协作和人文关怀的组织',
        '自主性':'应选择结果导向的管理风格，避免微观管理的团队和环境',
        '创新创造':'应寻找鼓励试错和创新文化的公司，避免官僚化的组织',
        '社会贡献':'应考虑加入社会企业、NGO或有社会责任感的公司',
        '工作生活平衡':'应明确工作边界，选择尊重员工个人时间的雇主',
        '管理权力':'应有清晰的晋升通道和管理培训计划',
        '声誉地位':'应选择行业领先者或知名品牌，关注平台的曝光度'
    };
    return advice[val] || '深入了解该价值观在实际工作中的体现';
}

// ========== 大五人格辅助函数 ==========
function getBigFiveDesc(dim, score) {
    const descs = { '开放性': score>=4?'您思维开放，喜欢创新和新鲜事物':'您比较务实，偏好熟悉的环境', '尽责性': score>=4?'您做事有条理，责任心强':'您比较随性，需要注意细节管理', '外向性': score>=4?'您精力充沛，善于社交':'您更喜欢独处和深度思考', '宜人性': score>=4?'您乐于合作，善于建立关系':'您比较独立，需要平衡合作与自主', '情绪稳定性': score>=4?'您情绪稳定，抗压能力强':'您比较敏感，需要情绪管理支持' };
    return descs[dim] || '';
}
function getBigFiveSuggestion(dim, score) {
    const sug = { '开放性': '多尝试新事物，拓展视野', '尽责性': '建立任务清单，提升执行力', '外向性': '适当参与团队活动，提升影响力', '宜人性': '学习冲突管理，平衡合作与原则', '情绪稳定性': '练习正念和情绪调节技巧' };
    return sug[dim] || '';
}
function getBigFiveStrengths(avg) {
    const s = [];
    for (const [k,v] of Object.entries(avg)) { if (v >= 3.5) s.push(`【${k}】${v}分，表现优秀`); }
    return s.length > 0 ? s : ['各维度发展较均衡'];
}
function getBigFiveWeaknesses(avg) {
    const w = [];
    for (const [k,v] of Object.entries(avg)) { if (v < 3) w.push(`【${k}】${v}分，有提升空间`); }
    return w.length > 0 ? w : ['各维度发展均衡，无明显短板'];
}
function getBigFiveSuggestions(avg) {
    const sug = [];
    if (avg['开放性'] < 3) sug.push('建议多参与创新项目，拓展知识边界');
    if (avg['尽责性'] < 3) sug.push('建议使用任务管理工具，提升执行力');
    if (avg['外向性'] < 2.5) sug.push('建议适当参与团队建设，提升影响力');
    if (avg['宜人性'] < 3) sug.push('建议学习积极沟通技巧，提升协作效果');
    if (avg['情绪稳定性'] < 3) sug.push('建议学习压力管理技巧，提升情绪韧性');
    return sug.length > 0 ? sug : ['整体性格均衡，建议保持现有优势'];
}
function getBigFiveJobMatch(avg) {
    const match = [];
    if (avg['外向性'] >= 3.5 && avg['宜人性'] >= 3.5) match.push('适合：销售、市场、HR、客户成功');
    if (avg['尽责性'] >= 3.5 && avg['情绪稳定性'] >= 3.5) match.push('适合：项目管理、运营、质量保证');
    if (avg['开放性'] >= 3.5) match.push('适合：产品、研发、设计、创新岗位');
    return match.length > 0 ? match : ['适合：综合性岗位，需进一步了解具体兴趣'];
}
function getBigFiveInterviewQuestions(avg) {
    const q = [];
    if (avg['情绪稳定性'] < 3) q.push('请举例说明您在高压环境下如何保持冷静？');
    if (avg['尽责性'] < 3) q.push('请描述您如何确保工作质量和按时交付？');
    if (avg['外向性'] < 3) q.push('请描述您在团队协作中的角色和贡献方式？');
    return q;
}

// ========== MBTI辅助函数 ==========
function getTypeStrengths(type) {
    const s = { E: '主动表达，推动讨论', I: '深度思考，独立思考', S: '关注细节，务实执行', N: '宏观视野，创新思维', T: '逻辑分析，客观决策', F: '人文关怀，团队和谐', J: '计划有序，按时交付', P: '灵活应变，适应变化' };
    return [s[type[0]], s[type[1]], s[type[2]], s[type[3]]];
}
function getTypeWeaknesses(type) {
    const w = { E: '可能过于冲动，忽略细节', I: '可能过度内向，沟通不足', S: '可能抗拒变化，创新不足', N: '可能脱离实际，执行不力', T: '可能忽视他人感受', F: '可能决策不够客观', J: '可能过于僵化，缺乏弹性', P: '可能拖延散漫，计划性差' };
    return [w[type[0]], w[type[1]], w[type[2]], w[type[3]]];
}
function getTypeWorkStyle(type) {
    const ws = { E: '喜欢讨论和头脑风暴，快速行动', I: '喜欢独立工作，深度思考后再表达', S: '按步骤执行，关注眼前任务', N: '关注未来可能性，喜欢创新', T: '基于数据和逻辑做决策', F: '基于价值观和团队感受做决策', J: '喜欢有计划，提前安排', P: '喜欢灵活，保留调整空间' };
    return `您的工作风格：${ws[type[0]]}；${ws[type[1]]}；${ws[type[2]]}；${ws[type[3]]}。`;
}
function getTypeCommStyle(type) {
    if (type[0]==='E' && type[2]==='F') return '热情表达，善于激励他人，沟通直接';
    if (type[0]==='I' && type[2]==='T') return '理性表达，喜欢书面沟通，思考后再说';
    return '沟通风格均衡，能适应不同场景';
}
function getTypeStress(type) {
    if (type[1]==='S' && type[3]==='J') return '压力下倾向于按计划执行，需要清晰的结构';
    if (type[1]==='N' && type[3]==='P') return '压力下仍能保持灵活，但可能需要更多自主空间';
    return '压力下表现稳定，能适应变化';
}
function getTypeDevelopment(type) {
    const d = [];
    if (type[0]==='I') d.push('建议在团队会议中主动发言，提升表达力');
    if (type[0]==='E') d.push('建议培养深度思考习惯，适当独处反思');
    if (type[2]==='T') d.push('建议在决策时更多考虑团队成员的感受');
    if (type[2]==='F') d.push('建议在做决策时更多运用数据和逻辑分析');
    return d.length > 0 ? d : ['类型发展均衡，建议持续提升自我认知'];
}

// ========== DISC辅助函数 ==========
function getDISCStrengths(scores) {
    const s = [];
    if (scores['D'] >= 3.5) s.push('结果导向，决策果断');
    if (scores['I'] >= 3.5) s.push('人际影响力强，善于激励');
    if (scores['S'] >= 3.5) s.push('团队合作好，善于支持他人');
    if (scores['C'] >= 3.5) s.push('分析能力强，注重质量');
    return s;
}
function getDISCCommTips(scores) {
    if (scores['D'] >= 3.5) return '沟通直接，关注结果，避免过多细节';
    if (scores['I'] >= 3.5) return '沟通热情，善用故事和案例，建立关系';
    if (scores['S'] >= 3.5) return '沟通温和，善于倾听，需要时间思考';
    if (scores['C'] >= 3.5) return '沟通精准，提供数据支持，避免模糊';
    return '沟通风格均衡';
}
function getDISCStress(scores) {
    if (scores['D'] >= 3.5) return '压力下倾向于加快节奏，可能显得急躁';
    if (scores['S'] >= 3.5) return '压力下倾向于回避冲突，需要支持';
    return '压力下表现稳定';
}
function getDISCMgmt(scores) {
    if (scores['D'] >= 3.5) return '管理风格：授权结果，减少微管理';
    if (scores['I'] >= 3.5) return '管理风格：激励团队，营造积极氛围';
    if (scores['S'] >= 3.5) return '管理风格：支持团队，建立信任关系';
    if (scores['C'] >= 3.5) return '管理风格：标准清晰，质量优先';
    return '管理风格均衡';
}
function getDISCTeamRole(scores) {
    const top = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
    const roles = { D: '推动者/决策者', I: '激励者/协调者', S: '支持者/维护者', C: '分析者/质量把关者' };
    return roles[top] || '综合角色';
}

// ========== 霍兰德辅助函数 ==========
function getHollandDesc(code) {
    const descs = { R: '喜欢动手操作和实际任务', I: '喜欢思考分析和理论研究', A: '喜欢创意表达和艺术活动', S: '喜欢帮助他人和服务社会', E: '喜欢影响和领导他人', C: '喜欢有序和数据的工作' };
    return code.split('').map(x => descs[x]).join('，');
}
function getHollandEnv(code) {
    const envs = { R: '技术/工程环境', I: '研究/实验室环境', A: '创意/艺术环境', S: '教育/服务环境', E: '商业/管理环境', C: '办公室/数据环境' };
    return code.split('').map(x => envs[x]).join(' 或 ');
}
function getHollandStrengths(avg) {
    const s = [];
    for (const [k,v] of Object.entries(avg)) { if (v >= 3.5) s.push(`【${k}型】兴趣强烈，适合相关职业`); }
    return s;
}
function getHollandLimitations(avg) {
    const l = [];
    for (const [k,v] of Object.entries(avg)) { if (v < 2.5) l.push(`【${k}型】兴趣较低，不建议强制选择相关职业`); }
    return l;
}

// ========== 情商辅助函数 ==========
function getEQStrengths(avg) {
    const s = [];
    for (const [k,v] of Object.entries(avg)) { if (v >= 3.5) s.push(`【${k}】${v}分，表现良好`); }
    return s;
}
function getEQImprovements(avg) {
    const im = [];
    if (avg['自我意识'] < 3) im.push('提升自我觉察：定期反思情绪触发点');
    if (avg['自我调节'] < 3) im.push('情绪管理：学习深呼吸、正念等调节技巧');
    if (avg['同理心'] < 3) im.push('同理心训练：主动询问他人感受，练习倾听');
    if (avg['社交技能'] < 3) im.push('社交技巧：主动参与团队活动，练习积极反馈');
    return im;
}
function getEQLeadership(avg) {
    if (avg['同理心'] >= 3.5 && avg['社交技能'] >= 3.5) return '高：善于激励团队，建立信任';
    if (avg['自我意识'] >= 3.5 && avg['自我调节'] >= 3.5) return '中：情绪稳定，适合高压领导角色';
    return '待发展：建议先提升自我认知和情绪管理';
}
function getEQStress(avg) {
    if (avg['自我调节'] >= 3.5) return '抗压能力较强，能在压力下保持冷静';
    return '需要注意压力管理，建议学习压力调节技巧';
}

// ========== 工作动机辅助函数 ==========
function getMotivationDesc(m) {
    const d = { '成就动机': '您有强烈的成就需求，喜欢有挑战性的工作', '权力动机': '您希望影响他人，追求地位和影响力', '亲和动机': '您重视人际关系，喜欢合作性的工作环境', '成长动机': '您重视学习和成长机会，追求长期发展', '经济动机': '您重视物质回报，薪酬是重要激励因素', '认可动机': '您希望获得他人的认可和赞赏', '生活平衡': '您重视工作与生活的平衡', '社会价值': '您希望工作能对社会产生积极影响' };
    return d[m] || m;
}
function getMotivationIncentives(avg) {
    const inc = [];
    for (const [k,v] of Object.entries(avg)) { if (v >= 3.5) inc.push(`激励因素：「${k}」—— 在管理中应重点关注`); }
    return inc;
}
function getMotivationMgmt(avg) {
    const tips = [];
    if (avg['成就动机'] >= 3.5) tips.push('给予挑战性任务，提供成长机会');
    if (avg['权力动机'] >= 3.5) tips.push('给予更多授权和责任');
    if (avg['亲和动机'] >= 3.5) tips.push('营造合作氛围，多给予正面反馈');
    if (avg['成长动机'] >= 3.5) tips.push('提供培训和学习机会');
    return tips;
}
function getMotivationCareerFit(avg) {
    if (avg['成就动机'] >= 3.5 && avg['权力动机'] >= 3.5) return '适合：销售、管理、创业';
    if (avg['成长动机'] >= 3.5 && avg['社会价值'] >= 3.5) return '适合：教育、培训、NGO';
    return '建议综合评估职业兴趣';
}

// ========== 工作价值观辅助函数 ==========
function getValuesDesc(v) {
    const d = { '薪酬福利': '您重视物质回报，选择工作时会优先考虑薪酬待遇', '稳定性': '您重视职业安全，偏好稳定的工作环境', '发展空间': '您重视学习和成长，偏好有培训体系的公司', '工作环境': '您重视团队氛围，偏好和谐的工作环境', '自主创造': '您重视自主权，偏好能发挥创造力的角色', '工作生活平衡': '您重视个人生活，不接受过度加班', '企业文化': '您重视公司价值观，偏好有社会责任感的企业', '成就感': '您重视工作意义，偏好能带来成就感的工作' };
    return d[v] || v;
}
function getValuesOrgFit(avg) {
    const fit = [];
    if (avg['薪酬福利'] >= 4) fit.push('适合：高薪酬的互联网/金融行业');
    if (avg['稳定性'] >= 4) fit.push('适合：国企、大型企业的稳定岗位');
    if (avg['发展空间'] >= 4) fit.push('适合：有培训体系的成长型企业');
    if (avg['工作生活平衡'] >= 4) fit.push('适合：弹性工作制、不加班的企业');
    return fit;
}
function getValuesCareer(avg) {
    if (avg['成就感'] >= 4 && avg['社会价值'] >= 4) return ['教育', 'NGO', '公共服务'];
    if (avg['自主创造'] >= 4) return ['产品', '设计', '研发'];
    return ['综合岗位，需结合兴趣测评'];
}

// ========== 答案维度补充（通过questionId查询题目dimension）==========
function enrichAnswersWithDimensions(answers, toolId, callback) {
    // 检查是否已有dimension信息
    const hasDimension = answers.some(a => a.dimension);
    if (hasDimension) return callback(answers);

    const questionIds = answers.map(a => a.questionId).filter(id => id);
    if (questionIds.length === 0) return callback(answers);

    const placeholders = questionIds.map(() => '?').join(',');
    db.all(`SELECT id, dimension FROM questions WHERE id IN (${placeholders}) AND tool_id = ?`, [...questionIds, parseInt(toolId)], (err, rows) => {
        if (err || !rows) return callback(answers);
        const dimMap = {};
        rows.forEach(r => { dimMap[r.id] = r.dimension; });
        const enriched = answers.map(a => ({
            ...a,
            dimension: a.dimension || dimMap[a.questionId] || ''
        }));
        callback(enriched);
    });
}

// ========== 工具直接测评提交（无需taskId）==========
app.post('/api/assessment/submit', auth, (req, res) => {
    const { answers, toolId, timeSpent } = req.body;

    if (!answers || answers.length === 0) {
        return res.json({ success: false, message: '请完成所有题目后再提交' });
    }
    if (!toolId) {
        return res.json({ success: false, message: '缺少工具ID' });
    }

    // 先补充答案的dimension信息，再计算分数和生成报告
    enrichAnswersWithDimensions(answers, toolId, (enrichedAnswers) => {
        const answerJson = JSON.stringify(enrichedAnswers); // 保存补充了dimension的答案
        const score = calculateScore(parseInt(toolId), enrichedAnswers);
        const reportSummary = generateReportSummary(parseInt(toolId), enrichedAnswers);

        // 直接写入结果（不需要taskId，用0表示独立提交）
        db.run(
            `INSERT INTO assessment_results (task_id, user_id, tool_id, answers, total_score, dimension_scores, report_data, status, created_at)
             VALUES (0, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
            [req.user.userId, parseInt(toolId), answerJson, score.totalScore || score, JSON.stringify(score.dimensions || {}), JSON.stringify(reportSummary)],
            function (err) {
                if (err) {
                    console.error('Direct submit error:', err.message);
                    return res.json({ success: false, message: '保存失败: ' + err.message });
                }

                res.json({
                    success: true,
                    resultId: this.lastID,
                    score: score,
                    summary: reportSummary,
                    message: '测评提交成功！'
                });
            }
        );
    });
});

// ========== 胜任力模型 ==========
app.get('/api/competency-models', auth, (req, res) => {
    const defaultModels = [
        { id: 1, name: '通用胜任力模型', dimensions: ['领导力','执行力','沟通协作','创新思维','学习能力'] },
        { id: 2, name: '管理岗位模型', dimensions: ['战略规划','团队建设','决策能力','目标管理','影响力'] },
        { id: 3, name: '技术岗位模型', dimensions: ['专业技能','问题解决','质量意识','技术学习','文档能力'] }
    ];
    res.json({ success: true, models: defaultModels });
});

// ========== 人才九宫格 ==========
app.get('/api/nine-box', auth, (req, res) => {
    db.all(`SELECT u.real_name, r.total_score, r.answers, r.dimension_scores, t.task_name, at.tool_name
            FROM assessment_results r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN assessment_tasks t ON r.task_id = t.id
            LEFT JOIN assessment_tools at ON r.tool_id = at.id
            ORDER BY r.created_at DESC LIMIT 50`, [], (err, results) => {
        if (err) return res.json({ success: false, message: err.message });
        
        // 将结果映射到九宫格
        const nineBoxData = [];
        (results || []).forEach(r => {
            nineBoxData.push({
                name: r.real_name || '未知用户',
                performance: Math.floor(Math.random() * 30) + 35, // 模拟绩效 35-64
                potential: Math.floor(Math.random() * 30) + 35,   // 模拟潜力 35-64
                toolName: r.tool_name,
                taskName: r.task_name,
                submittedAt: r.created_at
            });
        });

        res.json({
            success: true,
            employees: nineBoxData,
            total: nineBoxData.length
        });
    });
});

// ========== 获取测评结果列表（报告列表）==========
app.get('/api/results', auth, (req, res) => {
    const userId = req.query.user_id;
    const toolId = req.query.tool_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE r.status = 1';
    let params = [];
    
    if (userId) {
        whereClause += ' AND r.user_id = ?';
        params.push(userId);
    }
    
    if (toolId) {
        whereClause += ' AND r.tool_id = ?';
        params.push(toolId);
    }
    
    // 获取总数
    db.get(`SELECT COUNT(*) as total FROM assessment_results r ${whereClause}`, params, (err, countRow) => {
        if (err) return res.json({ success: false, message: err.message });
        
        const total = countRow ? countRow.total : 0;
        
        // 获取数据
        db.all(`SELECT r.*, u.real_name, t.tool_name, t.tool_type
                FROM assessment_results r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN assessment_tools t ON r.tool_id = t.id
                ${whereClause}
                ORDER BY r.created_at DESC
                LIMIT ? OFFSET ?`, [...params, limit, offset], (err, rows) => {
            if (err) return res.json({ success: false, message: err.message });
            
            // 处理数据
            const results = (rows || []).map(row => {
                let reportData = null;
                if (row.report_data) {
                    try { reportData = JSON.parse(row.report_data); } catch(e) { reportData = null; }
                }
                
                return {
                    id: row.id,
                    user_id: row.user_id,
                    tool_id: row.tool_id,
                    tool_name: row.tool_name,
                    tool_type: row.tool_type,
                    user_name: row.real_name,
                    total_score: row.total_score,
                    dimension_scores: row.dimension_scores ? JSON.parse(row.dimension_scores) : null,
                    report_summary: reportData ? (reportData.summary || reportData.overall_impression || '') : '',
                    created_at: row.created_at,
                    status: row.status
                };
            });
            
            res.json({
                success: true,
                results: results,
                pagination: {
                    page: page,
                    limit: limit,
                    total: total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        });
    });
});

// ========== 获取测评结果详情（含专业报告）==========
app.get('/api/results/:id', auth, (req, res) => {
    const resultId = req.params.id;
    db.get(`SELECT r.*, u.real_name, t.tool_name
            FROM assessment_results r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN assessment_tools t ON r.tool_id = t.id
            WHERE r.id = ?`, [resultId], (err, row) => {
        if (err) return res.json({ success: false, message: err.message });
        if (!row) return res.json({ success: false, message: '结果不存在' });

        // 解析报告数据
        let reportData = null;
        if (row.report_data) {
            try { reportData = JSON.parse(row.report_data); } catch(e) { reportData = null; }
        }

        // 检查报告数据是否完整（缺少dimensions或totalScore为0时重新生成）
        //  also check if answers have dimension field - if not, always regenerate
        let needRegen = false;
        if (reportData) {
            const hasDimensions = reportData.dimensions && Object.keys(reportData.dimensions).length > 0;
            const hasValidScore = (reportData.overallScore || reportData.totalScore || row.total_score || 0) > 0;
            if (!hasDimensions || !hasValidScore) {
                needRegen = true;
            }
        } else {
            needRegen = true;
        }

        // 没有报告数据或不完整，实时生成
        // Also regenerate if answers don't have dimension field
        const answers = row.answers ? (() => { try { return JSON.parse(row.answers); } catch(e) { return null; } })() : null;
        const hasDimensionInAnswers = answers && answers.some(a => a.dimension);
        
        if (needRegen || !hasDimensionInAnswers) {
            if (answers) {
                try {
                    enrichAnswersWithDimensions(answers, row.tool_id, (enrichedAnswers) => {
                        reportData = generateReportSummary(row.tool_id, enrichedAnswers);

                        // 更新数据库中的报告数据（异步，不阻塞响应）
                        const newTotalScore = reportData.overallScore || reportData.totalScore || 0;
                        const newDimScores = JSON.stringify(reportData.dimensions || {});
                        db.run('UPDATE assessment_results SET total_score=?, dimension_scores=?, report_data=? WHERE id=?',
                            [newTotalScore, newDimScores, JSON.stringify(reportData), resultId]);

                        sendResultResponse(res, row, reportData);
                    });
                    return; // 异步回调中返回响应
                } catch(e) { console.error('生成报告失败', e); }
            }
        }

        sendResultResponse(res, row, reportData);
    });
});

// 辅助：发送结果响应
function sendResultResponse(res, row, reportData) {
    res.json({
        success: true,
        result: {
            id: row.id,
            tool_id: row.tool_id,
            tool_name: row.tool_name || '人才测评',
            total_score: row.total_score || (reportData ? (reportData.overallScore || reportData.totalScore || 0) : 0),
            dimension_scores: row.dimension_scores ? (() => { try { return JSON.parse(row.dimension_scores); } catch(e) { return null; } })() : null,
            report_data: reportData,
            answers: row.answers ? (() => { try { return JSON.parse(row.answers); } catch(e) { return null; } })() : null,
            created_at: row.created_at,
            user_name: row.real_name || '匿名用户'
        }
    });
}

// ========== PDF报告导出API ==========

// 导出PDF报告
// 打印报告（原PDF导出，改为返回HTML报告供浏览器打印）
app.get('/api/reports/:id/print', auth, async (req, res) => {
    const resultId = req.params.id;
    
    db.get(`SELECT r.*, u.real_name, t.tool_name 
            FROM assessment_results r 
            LEFT JOIN users u ON r.user_id = u.id 
            LEFT JOIN assessment_tools t ON r.tool_id = t.id 
            WHERE r.id = ?`, [resultId], async (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: '报告不存在' });
        }
        
        try {
            // 解析报告数据
            let reportData = null;
            if (row.report_data) {
                try { reportData = JSON.parse(row.report_data); } catch(e) { reportData = null; }
            }
            
            // 如果没有报告数据或数据不完整，重新生成
            if (!reportData || !reportData.dimensions) {
                const answers = row.answers ? JSON.parse(row.answers) : [];
                enrichAnswersWithDimensions(answers, row.tool_id, (enrichedAnswers) => {
                    reportData = generateReportSummary(row.tool_id, enrichedAnswers);
                });
            }
            
            // 生成HTML报告（包含打印样式）
            const htmlContent = generatePrintableHTMLReport(row, reportData);
            
            // 返回HTML文件
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(htmlContent);
            
        } catch (error) {
            console.error('报告生成失败:', error);
            res.status(500).json({ success: false, message: '报告生成失败: ' + error.message });
        }
    });
});

// 生成可打印的HTML报告（优化打印样式）
function generatePrintableHTMLReport(row, reportData) {
    const userName = row.real_name || '匿名用户';
    const toolName = row.tool_name || '人才测评';
    const createdAt = new Date(row.created_at).toLocaleDateString('zh-CN');
    const totalScore = row.total_score || (reportData ? (reportData.overallScore || reportData.totalScore || 0) : 0);
    
    let dimensionsHTML = '';
    if (reportData.dimensions) {
        Object.keys(reportData.dimensions).forEach(dim => {
            const score = reportData.dimensions[dim];
            const percent = (score / 5 * 100).toFixed(0);
            dimensionsHTML += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${dim}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">
                        <div style="background: #f0f2f5; height: 20px; border-radius: 10px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${percent}%;"></div>
                        </div>
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${score}</td>
                </tr>
            `;
        });
    }
    
    return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>测评报告 - ${userName}</title>
            <style>
                body { font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif; padding: 20px; }
                .cover { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px; margin-bottom: 20px; }
                .cover h1 { font-size: 28px; margin-bottom: 10px; }
                .meta { margin-top: 20px; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #667eea; color: white; padding: 10px; text-align: left; }
                .summary { background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
                .print-btn:hover { background: #764ba2; }
                
                /* 打印样式优化 */
                @media print {
                    .print-btn { display: none; }
                    body { padding: 0; }
                    .cover { break-inside: avoid; }
                    table { break-inside: avoid; }
                    @page { size: A4; margin: 15mm; }
                }
            </style>
        </head>
        <body>
            <button class="print-btn" onclick="window.print()">🖨️ 打印报告</button>
            
            <div class="cover">
                <h1>${toolName}报告</h1>
                <div class="meta">
                    <div>👤 测评人：${userName}</div>
                    <div>📅 生成时间：${createdAt}</div>
                    <div>📊 总分：${totalScore}分</div>
                </div>
            </div>
            
            <h2>各维度得分</h2>
            <table>
                <thead>
                    <tr>
                        <th>维度</th>
                        <th>得分可视化</th>
                        <th>分数</th>
                    </tr>
                </thead>
                <tbody>
                    ${dimensionsHTML}
                </tbody>
            </table>
            
            ${reportData.summary ? `
            <div class="summary">
                <h3>综合分析</h3>
                <p>${reportData.summary}</p>
            </div>
            ` : ''}
            
            ${reportData.strengths ? `
            <h3>优势</h3>
            <ul>
                ${reportData.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
            ` : ''}
            
            ${reportData.suggestions ? `
            <h3>发展建议</h3>
            <ul>
                ${reportData.suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
            ` : ''}
            
            <div style="margin-top: 50px; text-align: center; color: #909399; font-size: 12px;">
                <p>本报告由人才测评系统生成</p>
                <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
            </div>
            
            <script>
                // 自动打印提示
                window.onload = function() {
                    // 可以在这里添加自动打印的代码
                    // window.print();
                };
            </script>
        </body>
        </html>
    `;
}

// ========== 九宫格管理API ==========

// 1. 创建九宫格评估
app.post('/api/nine-box/grids', auth, (req, res) => {
    const { grid_name, grid_type, review_period, description } = req.body;
    const created_by = req.user.userId;
    
    if (!grid_name) {
        return res.json({ success: false, message: '请输入九宫格名称' });
    }
    
    db.run(`INSERT INTO nine_box_grids (grid_name, grid_type, review_period, description, created_by) 
            VALUES (?, ?, ?, ?, ?)`, 
            [grid_name, grid_type || 'talent_review', review_period, description, created_by], 
            function(err) {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, gridId: this.lastID, message: '九宫格创建成功' });
    });
});

// 2. 获取九宫格列表
app.get('/api/nine-box/grids', auth, (req, res) => {
    db.all(`SELECT g.*, u.real_name as creator_name,
            (SELECT COUNT(*) FROM nine_box_positions WHERE grid_id = g.id) as employee_count
            FROM nine_box_grids g 
            LEFT JOIN users u ON g.created_by = u.id
            ORDER BY g.created_at DESC`, [], (err, rows) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, grids: rows });
    });
});

// 3. 获取九宫格详情
app.get('/api/nine-box/grids/:id', auth, (req, res) => {
    const gridId = req.params.id;
    
    db.get(`SELECT g.*, u.real_name as creator_name 
            FROM nine_box_grids g 
            LEFT JOIN users u ON g.created_by = u.id
            WHERE g.id = ?`, [gridId], (err, grid) => {
        if (err) return res.json({ success: false, message: err.message });
        if (!grid) return res.json({ success: false, message: '九宫格不存在' });
        
        // 获取所有员工位置
        db.all(`SELECT p.*, u.username, u.real_name
                FROM nine_box_positions p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.grid_id = ?`, [gridId], (err, positions) => {
            if (err) return res.json({ success: false, message: err.message });
            
            grid.positions = positions || [];
            res.json({ success: true, grid });
        });
    });
});

// 4. 添加/更新员工位置
app.post('/api/nine-box/grids/:id/positions', auth, (req, res) => {
    const gridId = req.params.id;
    const { user_id, performance_score, potential_score, notes } = req.body;
    
    if (!user_id) {
        return res.json({ success: false, message: '请选择员工' });
    }
    
    // 计算格子位置
    const perf = performance_score || 3;
    const pot = potential_score || 3;
    
    // 将1-5的分数转换为1-3的格子坐标
    const grid_x = Math.min(3, Math.max(1, Math.round(perf)));
    const grid_y = Math.min(3, Math.max(1, Math.round(pot)));
    
    // 计算象限（1-9）
    const quadrant = (3 - grid_y) * 3 + grid_x;
    
    db.run(`INSERT INTO nine_box_positions (grid_id, user_id, performance_score, potential_score, grid_x, grid_y, quadrant, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(grid_id, user_id) DO UPDATE SET
            performance_score = excluded.performance_score,
            potential_score = excluded.potential_score,
            grid_x = excluded.grid_x,
            grid_y = excluded.grid_y,
            quadrant = excluded.quadrant,
            notes = excluded.notes,
            updated_at = CURRENT_TIMESTAMP`, 
            [gridId, user_id, perf, pot, grid_x, grid_y, quadrant, notes], 
            function(err) {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, positionId: this.lastID, message: '员工位置已更新', grid_position: { grid_x, grid_y, quadrant } });
    });
});

// 5. 获取所有员工位置
app.get('/api/nine-box/grids/:id/positions', auth, (req, res) => {
    const gridId = req.params.id;
    
    db.all(`SELECT p.*, u.username, u.real_name
            FROM nine_box_positions p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.grid_id = ?`, [gridId], (err, rows) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, positions: rows });
    });
});

// 6. 根据测评数据计算潜力分数
app.post('/api/nine-box/calculate-potential', auth, (req, res) => {
    const { user_id } = req.body;
    
    if (!user_id) {
        return res.json({ success: false, message: '请指定员工ID' });
    }
    
    // 获取该员工的所有测评结果
    db.all(`SELECT r.*, t.tool_name, t.tool_type
            FROM assessment_results r
            LEFT JOIN assessment_tools t ON r.tool_id = t.id
            WHERE r.user_id = ? AND r.status = 'completed'
            ORDER BY r.created_at DESC`, [user_id], (err, results) => {
        if (err) return res.json({ success: false, message: err.message });
        
        if (!results || results.length === 0) {
            return res.json({ success: true, potential_score: 3, message: '该员工无测评数据，使用默认潜力分数' });
        }
        
        // 计算潜力分数（基于测评结果）
        let totalScore = 0;
        let scoreCount = 0;
        
        results.forEach(result => {
            if (result.total_score) {
                // 将测评分数（假设是0-100）转换为1-5的潜力分数
                const normalizedScore = (result.total_score / 100) * 5;
                totalScore += normalizedScore;
                scoreCount++;
            }
        });
        
        const potentialScore = scoreCount > 0 ? (totalScore / scoreCount) : 3;
        const finalScore = Math.max(1, Math.min(5, potentialScore));
        
        res.json({ 
            success: true, 
            potential_score: Math.round(finalScore * 10) / 10,
            assessment_count: results.length,
            message: '潜力分数计算成功' 
        });
    });
});

// 7. 批量计算所有员工的潜力分数
app.post('/api/nine-box/batch-calculate-potential', auth, (req, res) => {
    const { grid_id } = req.body;
    
    if (!grid_id) {
        return res.json({ success: false, message: '请指定九宫格ID' });
    }
    
    // 获取所有员工（移除不存在的role列条件）
    db.all('SELECT id, real_name FROM users WHERE status = 1', [], (err, users) => {
        if (err) return res.json({ success: false, message: err.message });
        
        const calculations = [];
        let completed = 0;
        
        users.forEach(user => {
            // 获取该员工的测评结果
            db.all(`SELECT r.*, t.tool_name 
                    FROM assessment_results r
                    LEFT JOIN assessment_tools t ON r.tool_id = t.id
                    WHERE r.user_id = ? AND r.status = 'completed'`, 
                    [user.id], (err, results) => {
                if (err) {
                    calculations.push({ user_id: user.id, potential_score: 3 });
                } else if (!results || results.length === 0) {
                    calculations.push({ user_id: user.id, potential_score: 3 });
                } else {
                    // 计算潜力分数
                    let totalScore = 0;
                    let scoreCount = 0;
                    
                    results.forEach(result => {
                        if (result.total_score) {
                            const normalizedScore = (result.total_score / 100) * 5;
                            totalScore += normalizedScore;
                            scoreCount++;
                        }
                    });
                    
                    const potentialScore = scoreCount > 0 ? (totalScore / scoreCount) : 3;
                    const finalScore = Math.max(1, Math.min(5, potentialScore));
                    
                    calculations.push({ 
                        user_id: user.id, 
                        potential_score: Math.round(finalScore * 10) / 10 
                    });
                }
                
                completed++;
                
                // 所有计算完成后，更新九宫格
                if (completed === users.length) {
                    // 批量更新位置
                    let updateCount = 0;
                    
                    calculations.forEach(calc => {
                        const grid_x = 3; // 默认绩效为3
                        const grid_y = Math.round(calc.potential_score);
                        const quadrant = (3 - grid_y) * 3 + grid_x;
                        
                        db.run(`INSERT INTO nine_box_positions (grid_id, user_id, potential_score, grid_x, grid_y, quadrant)
                                VALUES (?, ?, ?, ?, ?, ?)
                                ON CONFLICT(grid_id, user_id) DO UPDATE SET
                                potential_score = excluded.potential_score,
                                grid_y = excluded.grid_y,
                                quadrant = excluded.quadrant,
                                updated_at = CURRENT_TIMESTAMP`, 
                                [grid_id, calc.user_id, calc.potential_score, grid_x, grid_y, quadrant], 
                                function(err) {
                            updateCount++;
                            
                            if (updateCount === calculations.length) {
                                res.json({ 
                                    success: true, 
                                    message: `已为${users.length}名员工计算潜力分数`,
                                    calculations 
                                });
                            }
                        });
                    });
                }
            });
        });
    });
});

// 8. 录入绩效分数
app.post('/api/performance', auth, (req, res) => {
    const { user_id, review_period, performance_score, performance_level, kpi_score, 
            goals_achievement, competencies_score, notes } = req.body;
    const reviewer_id = req.user.userId;
    
    if (!user_id || !review_period) {
        return res.json({ success: false, message: '请填写完整信息' });
    }
    
    db.run(`INSERT INTO performance_records (user_id, review_period, performance_score, performance_level, 
            kpi_score, goals_achievement, competencies_score, reviewer_id, review_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE('now'), ?)
            ON CONFLICT(user_id, review_period) DO UPDATE SET
            performance_score = excluded.performance_score,
            performance_level = excluded.performance_level,
            kpi_score = excluded.kpi_score,
            goals_achievement = excluded.goals_achievement,
            competencies_score = excluded.competencies_score,
            reviewer_id = excluded.reviewer_id,
            review_date = DATE('now'),
            notes = excluded.notes,
            updated_at = CURRENT_TIMESTAMP`, 
            [user_id, review_period, performance_score, performance_level, kpi_score, 
             goals_achievement, competencies_score, reviewer_id, notes], 
            function(err) {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, recordId: this.lastID, message: '绩效记录已保存' });
    });
});

// 9. 获取员工绩效记录
app.get('/api/performance/:userId', auth, (req, res) => {
    const userId = req.params.userId;
    
    db.all(`SELECT p.*, u.real_name as reviewer_name
            FROM performance_records p
            LEFT JOIN users u ON p.reviewer_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.review_period DESC`, [userId], (err, rows) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, records: rows });
    });
});

// 10. 获取用户的测评结果（用于前端展示）
app.get('/api/nine-box/users/:userId/assessments', auth, (req, res) => {
    const userId = req.params.userId;
    
    db.all(`SELECT r.*, t.tool_name, t.tool_type
            FROM assessment_results r
            LEFT JOIN assessment_tools t ON r.tool_id = t.id
            WHERE r.user_id = ? AND r.status = 'completed'
            ORDER BY r.created_at DESC`, [userId], (err, rows) => {
        if (err) return res.json({ success: false, message: err.message });
        
        // 计算综合潜力分数
        let totalScore = 0;
        let scoreCount = 0;
        
        rows.forEach(row => {
            if (row.total_score) {
                const normalizedScore = (row.total_score / 100) * 5;
                totalScore += normalizedScore;
                scoreCount++;
            }
        });
        
        const potentialScore = scoreCount > 0 ? (totalScore / scoreCount) : 3;
        const finalScore = Math.max(1, Math.min(5, potentialScore));
        
        res.json({ 
            success: true, 
            assessments: rows,
            potential_score: Math.round(finalScore * 10) / 10,
            assessment_count: rows.length
        });
    });
});

// 11. 同步绩效数据到九宫格
app.post('/api/nine-box/sync-performance', auth, (req, res) => {
    const { grid_id } = req.body;
    
    if (!grid_id) {
        return res.json({ success: false, message: '请指定九宫格ID' });
    }
    
    // 获取所有有绩效记录的员工
    db.all(`SELECT DISTINCT p.user_id, p.performance_score
            FROM performance_records p
            WHERE p.review_period = (SELECT MAX(review_period) FROM performance_records)`, 
            [], (err, perfRecords) => {
        if (err) return res.json({ success: false, message: err.message });
        
        let updateCount = 0;
        
        perfRecords.forEach(record => {
            // 更新九宫格中的位置
            db.run(`UPDATE nine_box_positions 
                    SET performance_score = ?,
                    grid_x = ?,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE grid_id = ? AND user_id = ?`, 
                    [record.performance_score, Math.round(record.performance_score), grid_id, record.user_id], 
                    function(err) {
                updateCount++;
                
                if (updateCount === perfRecords.length) {
                    res.json({ 
                        success: true, 
                        message: `已同步${perfRecords.length}名员工的绩效数据`,
                        synced_count: perfRecords.length
                    });
                }
            });
        });
        
        if (perfRecords.length === 0) {
            res.json({ success: true, message: '没有找到绩效记录', synced_count: 0 });
        }
    });
});

// 7. 导出九宫格报告（HTML格式）
app.get('/api/nine-box/grids/:id/export', auth, (req, res) => {
    const gridId = req.params.id;
    
    // 获取九宫格信息
    db.get(`SELECT g.*, u.real_name as creator_name 
            FROM nine_box_grids g 
            LEFT JOIN users u ON g.created_by = u.id 
            WHERE g.id = ?`, [gridId], (err, grid) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!grid) {
            return res.status(404).json({ success: false, message: '九宫格不存在' });
        }
        
        // 获取所有员工位置
        db.all(`SELECT p.*, u.username, u.real_name
                FROM nine_box_positions p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.grid_id = ?`, [gridId], (err2, positions) => {
            if (err2) {
                return res.status(500).json({ success: false, message: err2.message });
            }
            
            // 生成HTML报告
            const htmlContent = generateNineBoxHTMLReport(grid, positions);
            
            // 返回HTML文件
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(htmlContent);
        });
    });
});

// ========== 新增测评工具报告生成函数 (16-23) ==========

// 工具16: 360度反馈测评
function gen360Feedback(answers) {
    const dims = ['领导力', '沟通能力', '团队合作', '专业能力', '创新能力', '执行力'];
    const scores = {};
    dims.forEach(d => { scores[d] = { sum: 0, count: 0 }; });
    
    answers.forEach(a => {
        const dim = a.dimension || '领导力';
        const val = a.answer || 3;
        if (scores[dim]) {
            scores[dim].sum += val;
            scores[dim].count++;
        }
    });
    
    const avg = {};
    dims.forEach(d => {
        avg[d] = scores[d].count > 0 ? Math.round(scores[d].sum / scores[d].count * 10) / 10 : 3;
    });
    
    const overallScore = Object.values(avg).reduce((a, b) => a + b, 0) / dims.length;
    
    return {
        toolName: '360度反馈测评',
        overallScore: Math.round(overallScore * 10) / 10,
        dimensions: avg,
        summary: `根据360度反馈评估结果，您在${Object.entries(avg).sort((a,b) => b[1] - a[1])[0][0]}方面表现最为突出，平均得分${Object.values(avg).sort((a,b) => b[1] - a[1])[0][1]}分。建议继续保持优势，同时关注${Object.entries(avg).sort((a,b) => a[1] - b[1])[0][0]}方面的提升。`,
        strengths: Object.entries(avg).filter(([k, v]) => v >= 4).map(([k]) => `在${k}方面表现优秀`),
        weaknesses: Object.entries(avg).filter(([k, v]) => v < 3).map(([k]) => `在${k}方面需要提升`),
        suggestions: [
            '定期进行自我反思和反馈收集',
            '制定个人发展计划，针对性提升弱项',
            '寻求导师或教练的指导和支持'
        ]
    };
}

// 工具17: 职业锚测评
function genCareerAnchor(answers) {
    const dims = ['技术职能', '管理能力', '自主性', '安全感', '创业精神', '服务奉献', '纯粹挑战', '生活方式'];
    const scores = {};
    dims.forEach(d => { scores[d] = { sum: 0, count: 0 }; });
    
    answers.forEach(a => {
        const dim = a.dimension || '技术职能';
        const val = a.answer || 3;
        if (scores[dim]) {
            scores[dim].sum += val;
            scores[dim].count++;
        }
    });
    
    const avg = {};
    dims.forEach(d => {
        avg[d] = scores[d].count > 0 ? Math.round(scores[d].sum / scores[d].count * 10) / 10 : 3;
    });
    
    const sorted = Object.entries(avg).sort((a,b) => b[1] - a[1]);
    const topAnchor = sorted[0][0];
    
    const anchorDesc = {
        '技术职能': '您更倾向于从事需要专业技术和知识的工作，重视技术挑战性超过管理责任。适合成为某一领域的专家。',
        '管理能力': '您希望影响他人的决策和行为，享受承担管理责任。适合向管理方向发展。',
        '自主性': '您重视工作的灵活性和自主性，不喜欢被严格限制。适合自由职业或弹性工作。',
        '安全感': '您希望有一份稳定的、长期的工作，重视保障性。适合在大型组织或政府机构工作。',
        '创业精神': '您希望创建自己的事业，愿意承担风险。适合创业或加入创业公司。',
        '服务奉献': '您希望工作能够对社会产生积极影响，重视意义超过薪酬。适合非营利组织或社会工作。',
        '纯粹挑战': '您喜欢解决看似不可能的问题，享受战胜困难后的成就感。适合高挑战性的工作。',
        '生活方式': '您希望工作能够与想要的生活方式相匹配，重视工作与生活的平衡。'
    };
    
    return {
        toolName: '职业锚测评',
        overallScore: Math.round(sorted[0][1] * 10) / 10,
        dimensions: avg,
        type: topAnchor,
        typeTitle: '职业锚：' + topAnchor,
        typeDesc: anchorDesc[topAnchor] || '',
        summary: `您的主导职业锚是"${topAnchor}"。${anchorDesc[topAnchor]}`,
        strengths: [`明确的职业定位：${topAnchor}`, '了解自己的职业价值观'],
        suggestions: [
            '根据职业锚制定职业规划',
            '寻找与职业锚匹配的工作机会',
            '在职业决策中优先考虑职业锚因素'
        ]
    };
}

// 工具18: 心理资本测评
function genPsyCap(answers) {
    const dims = ['自我效能', '希望', '韧性', '乐观'];
    const scores = {};
    dims.forEach(d => { scores[d] = { sum: 0, count: 0 }; });
    
    answers.forEach(a => {
        const dim = a.dimension || '自我效能';
        const val = a.answer || 3;
        if (scores[dim]) {
            scores[dim].sum += val;
            scores[dim].count++;
        }
    });
    
    const avg = {};
    dims.forEach(d => {
        avg[d] = scores[d].count > 0 ? Math.round(scores[d].sum / scores[d].count * 10) / 10 : 3;
    });
    
    const overallScore = Object.values(avg).reduce((a, b) => a + b, 0) / dims.length;
    
    let level = '低';
    if (overallScore >= 4) level = '高';
    else if (overallScore >= 3) level = '中';
    
    return {
        toolName: '心理资本测评',
        overallScore: Math.round(overallScore * 10) / 10,
        dimensions: avg,
        level: level,
        summary: `您的心理资本水平为"${level}"（总分${Math.round(overallScore * 10) / 10}分）。心理资本包括自我效能、希望、韧性和乐观四个维度，是预测工作绩效和幸福感的重要指标。`,
        strengths: Object.entries(avg).filter(([k, v]) => v >= 4).map(([k]) => `${k}维度表现优秀`),
        suggestions: [
            '通过小成功积累自我效能感',
            '培养积极归因风格，增强乐观态度',
            '建立社会支持网络，提升韧性',
            '设定清晰目标，保持希望感'
        ]
    };
}

// 工具19: 组织承诺测评
function genOrgCommitment(answers) {
    const dims = ['情感承诺', '持续承诺', '规范承诺'];
    const scores = {};
    dims.forEach(d => { scores[d] = { sum: 0, count: 0 }; });
    
    answers.forEach(a => {
        const dim = a.dimension || '情感承诺';
        const val = a.answer || 3;
        if (scores[dim]) {
            scores[dim].sum += val;
            scores[dim].count++;
        }
    });
    
    const avg = {};
    dims.forEach(d => {
        avg[d] = scores[d].count > 0 ? Math.round(scores[d].sum / scores[d].count * 10) / 10 : 3;
    });
    
    const overallScore = Object.values(avg).reduce((a, b) => a + b, 0) / dims.length;
    
    return {
        toolName: '组织承诺测评',
        overallScore: Math.round(overallScore * 10) / 10,
        dimensions: avg,
        summary: `您的组织承诺水平为${Math.round(overallScore * 10) / 10}分（满分5分）。情感承诺${avg['情感承诺'] >= 3 ? '较高' : '较低'}，说明您对组织的情感依恋${avg['情感承诺'] >= 3 ? '较强' : '较弱'}。`,
        strengths: Object.entries(avg).filter(([k, v]) => v >= 4).map(([k]) => `${k}维度表现好`),
        suggestions: [
            '加强组织文化建设，提升员工情感承诺',
            '提供职业发展机会，增强持续承诺',
            '建立公平的奖惩机制，增强规范承诺'
        ]
    };
}

// 工具20: 领导风格测评
function genLeadershipStyle(answers) {
    const dims = ['变革型领导', '交易型领导', '放任型领导'];
    const scores = {};
    dims.forEach(d => { scores[d] = { sum: 0, count: 0 }; });
    
    answers.forEach(a => {
        const dim = a.dimension || '变革型领导';
        const val = a.answer || 3;
        if (scores[dim]) {
            scores[dim].sum += val;
            scores[dim].count++;
        }
    });
    
    const avg = {};
    dims.forEach(d => {
        avg[d] = scores[d].count > 0 ? Math.round(scores[d].sum / scores[d].count * 10) / 10 : 3;
    });
    
    const sorted = Object.entries(avg).sort((a,b) => b[1] - a[1]);
    const dominantStyle = sorted[0][0];
    
    return {
        toolName: '领导风格测评',
        overallScore: Math.round(avg['变革型领导'] * 10) / 10,
        dimensions: avg,
        type: dominantStyle,
        typeTitle: '主导风格：' + dominantStyle,
        summary: `您的主导领导风格是"${dominantStyle}"。${dominantStyle === '变革型领导' ? '您能够通过激励和感召来领导团队，注重员工的发展和高层次需求。' : dominantStyle === '交易型领导' ? '您通过明确的奖惩机制来管理团队，注重任务完成和目标达成。' : '您给予下属高度的自主权和灵活性，较少直接干预。'}`,
        strengths: Object.entries(avg).filter(([k, v]) => v >= 4).map(([k]) => `${k}风格运用得当`),
        suggestions: [
            '在不同情境下灵活运用多种领导风格',
            '加强变革型领导能力的培养',
            '根据员工成熟度调整领导风格'
        ]
    };
}

// 工具21: 职业成熟度测评
function genCareerMaturity(answers) {
    const dims = ['职业决策', '职业信息', '职业规划', '职业态度'];
    const scores = {};
    dims.forEach(d => { scores[d] = { sum: 0, count: 0 }; });
    
    answers.forEach(a => {
        const dim = a.dimension || '职业决策';
        const val = a.answer || 3;
        if (scores[dim]) {
            scores[dim].sum += val;
            scores[dim].count++;
        }
    });
    
    const avg = {};
    dims.forEach(d => {
        avg[d] = scores[d].count > 0 ? Math.round(scores[d].sum / scores[d].count * 10) / 10 : 3;
    });
    
    const overallScore = Object.values(avg).reduce((a, b) => a + b, 0) / dims.length;
    
    return {
        toolName: '职业成熟度测评',
        overallScore: Math.round(overallScore * 10) / 10,
        dimensions: avg,
        summary: `您的职业成熟度水平为${Math.round(overallScore * 10) / 10}分。在职业规划方面${avg['职业规划'] >= 3 ? '表现较好' : '需要加强'}，建议制定清晰的职业发展路径。`,
        strengths: Object.entries(avg).filter(([k, v]) => v >= 4).map(([k]) => `${k}能力较强`),
        suggestions: [
            '定期进行职业规划反思和调整',
            '主动收集职业信息和行业动态',
            '提升职业决策能力和信心',
            '培养积极的职业态度'
        ]
    };
}

// 工具22: 工作满意度测评
function genJobSatisfaction(answers) {
    const dims = ['工作本身', '薪酬福利', '晋升机会', '同事关系', '上级管理'];
    const scores = {};
    dims.forEach(d => { scores[d] = { sum: 0, count: 0 }; });
    
    answers.forEach(a => {
        const dim = a.dimension || '工作本身';
        const val = a.answer || 3;
        if (scores[dim]) {
            scores[dim].sum += val;
            scores[dim].count++;
        }
    });
    
    const avg = {};
    dims.forEach(d => {
        avg[d] = scores[d].count > 0 ? Math.round(scores[d].sum / scores[d].count * 10) / 10 : 3;
    });
    
    const overallScore = Object.values(avg).reduce((a, b) => a + b, 0) / dims.length;
    
    let satisfactionLevel = '不满意';
    if (overallScore >= 4) satisfactionLevel = '满意';
    else if (overallScore >= 3) satisfactionLevel = '一般';
    
    return {
        toolName: '工作满意度测评',
        overallScore: Math.round(overallScore * 10) / 10,
        dimensions: avg,
        level: satisfactionLevel,
        summary: `您的工作满意度水平为"${satisfactionLevel}"（总分${Math.round(overallScore * 10) / 10}分）。在${Object.entries(avg).sort((a,b) => b[1] - a[1])[0][0]}方面满意度最高，${Object.entries(avg).sort((a,b) => a[1] - b[1])[0][0]}方面需要改善。`,
        strengths: Object.entries(avg).filter(([k, v]) => v >= 4).map(([k]) => `${k}满意度高`),
        weaknesses: Object.entries(avg).filter(([k, v]) => v < 3).map(([k]) => `${k}满意度低`),
        suggestions: [
            '与上级沟通，寻求改善工作条件的机会',
            '设定职业发展目标，提升工作意义感',
            '建立良好的人际关系，改善工作环境'
        ]
    };
}

// 工具23: 职业压力测评
function genCareerStress(answers) {
    const dims = ['工作压力', '家庭压力', '压力应对', '压力症状'];
    const scores = {};
    dims.forEach(d => { scores[d] = { sum: 0, count: 0 }; });
    
    answers.forEach(a => {
        const dim = a.dimension || '工作压力';
        const val = a.answer || 3;
        if (scores[dim]) {
            scores[dim].sum += val;
            scores[dim].count++;
        }
    });
    
    const avg = {};
    dims.forEach(d => {
        avg[d] = scores[d].count > 0 ? Math.round(scores[d].sum / scores[d].count * 10) / 10 : 3;
    });
    
    const stressScore = (avg['工作压力'] + avg['家庭压力']) / 2;
    const copingScore = avg['压力应对'];
    
    let riskLevel = '低';
    if (stressScore >= 4 && copingScore < 3) riskLevel = '高';
    else if (stressScore >= 3 || copingScore < 3) riskLevel = '中';
    
    return {
        toolName: '职业压力测评',
        overallScore: Math.round(stressScore * 10) / 10,
        dimensions: avg,
        riskLevel: riskLevel,
        summary: `您的职业压力风险等级为"${riskLevel}"。工作压力得分${avg['工作压力']}分，压力应对能力得分${copingScore}分。${riskLevel === '高' ? '建议立即采取压力管理措施，必要时寻求专业帮助。' : riskLevel === '中' ? '建议学习压力管理技巧，提升应对能力。' : '您的压力水平在可控范围内，继续保持良好的压力管理习惯。'}`,
        strengths: copingScore >= 3 ? ['具备基本的压力应对能力'] : [],
        suggestions: [
            '学习 relaxation 和冥想技巧',
            '建立工作与生活的边界',
            '寻求社会支持，与亲友分享压力',
            '必要时寻求员工援助计划(EAP)或专业心理咨询'
        ]
    };
}

// 生成九宫格HTML报告（打印优化）
function generateNineBoxHTMLReport(grid, positions) {
    const gridName = grid.grid_name || '九宫格评估';
    const reviewPeriod = grid.review_period || '';
    const createdAt = new Date(grid.created_at).toLocaleDateString('zh-CN');
    
    // 构建九宫格矩阵
    const matrix = [[],[],[]]; // 3x3矩阵
    positions.forEach(pos => {
        const x = (pos.grid_x || 2) - 1; // 转换为0-2索引
        const y = 3 - (pos.grid_y || 2); // 转换为0-2索引（Y轴反转）
        if (x >= 0 && x < 3 && y >= 0 && y < 3) {
            if (!matrix[y][x]) matrix[y][x] = [];
            matrix[y][x].push(pos);
        }
    });
    
    // 生成矩阵HTML
    let matrixHTML = '<table class="nine-box-matrix">';
    for (let y = 0; y < 3; y++) {
        matrixHTML += '<tr>';
        for (let x = 0; x < 3; x++) {
            const cellPositions = matrix[y][x] || [];
            const quadrant = (3 - y) * 3 + (x + 1);
            let cellClass = 'nine-box-cell';
            if (quadrant === 9 || quadrant === 6 || quadrant === 8 || quadrant === 5) cellClass += ' high-potential';
            else if (quadrant === 1 || quadrant === 2 || quadrant === 4 || quadrant === 3) cellClass += ' low-potential';
            
            let cellContent = `<div class="cell-header">象限${quadrant}</div>`;
            if (cellPositions.length > 0) {
                cellContent += '<div class="cell-employees">';
                cellPositions.forEach(pos => {
                    const userName = pos.real_name || pos.username || '未知';
                    cellContent += `<div class="employee-tag">${userName}</div>`;
                });
                cellContent += '</div>';
            }
            
            matrixHTML += `<td class="${cellClass}">${cellContent}</td>`;
        }
        matrixHTML += '</tr>';
    }
    matrixHTML += '</table>';
    
    // 生成员工列表HTML
    let employeesHTML = '';
    if (positions && positions.length > 0) {
        employeesHTML = '<table class="employees-table">';
        employeesHTML += '<thead><tr><th>姓名</th><th>绩效分数</th><th>潜力分数</th><th>象限</th><th>备注</th></tr></thead>';
        employeesHTML += '<tbody>';
        positions.forEach(pos => {
            const userName = pos.real_name || pos.username || '未知';
            const perfScore = pos.performance_score || '-';
            const potScore = pos.potential_score || '-';
            const quadrant = pos.quadrant || '-';
            const notes = pos.notes || '';
            employeesHTML += `<tr>
                <td>${userName}</td>
                <td>${perfScore}</td>
                <td>${potScore}</td>
                <td>${quadrant}</td>
                <td>${notes}</td>
            </tr>`;
        });
        employeesHTML += '</tbody></table>';
    }
    
    return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>九宫格报告 - ${gridName}</title>
            <style>
                body { font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif; padding: 20px; }
                .cover { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px; margin-bottom: 20px; }
                .cover h1 { font-size: 28px; margin-bottom: 10px; }
                .meta { margin-top: 20px; font-size: 14px; }
                .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
                .print-btn:hover { background: #764ba2; }
                
                /* 九宫格矩阵样式 */
                .nine-box-matrix { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .nine-box-cell { width: 33.33%; height: 150px; border: 2px solid #ddd; vertical-align: top; padding: 10px; }
                .nine-box-cell.high-potential { background: #f0f9eb; }
                .nine-box-cell.low-potential { background: #fef0f0; }
                .cell-header { font-weight: bold; margin-bottom: 10px; color: #667eea; }
                .cell-employees { display: flex; flex-wrap: wrap; gap: 5px; }
                .employee-tag { background: #667eea; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
                
                /* 员工列表样式 */
                .employees-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .employees-table th { background: #667eea; color: white; padding: 10px; text-align: left; }
                .employees-table td { padding: 8px; border: 1px solid #ddd; }
                
                /* 打印样式优化 */
                @media print {
                    .print-btn { display: none; }
                    body { padding: 0; }
                    .nine-box-matrix { break-inside: avoid; }
                    .employees-table { break-inside: avoid; }
                    @page { size: A4; margin: 15mm; }
                }
            </style>
        </head>
        <body>
            <button class="print-btn" onclick="window.print()">🖨️ 打印报告</button>
            
            <div class="cover">
                <h1>人才九宫格报告</h1>
                <div class="meta">
                    <div>📊 评估名称：${gridName}</div>
                    ${reviewPeriod ? `<div>📅 评估周期：${reviewPeriod}</div>` : ''}
                    <div>👤 创建人：${grid.creator_name || '未知'}</div>
                    <div>📅 创建时间：${createdAt}</div>
                    <div>👥 参与人数：${positions ? positions.length : 0}人</div>
                </div>
            </div>
            
            <h2>九宫格矩阵</h2>
            ${matrixHTML}
            
            <h2>员工详情</h2>
            ${employeesHTML || '<p>暂无员工数据</p>'}
            
            <div style="margin-top: 50px; text-align: center; color: #909399; font-size: 12px;">
                <p>本报告由人才测评系统生成</p>
                <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
            </div>
            
            <script>
                // 自动打印提示
                window.onload = function() {
                    // 可以在这里添加自动打印的代码
                    // window.print();
                };
            </script>
        </body>
        </html>
    `;
}

// ========== 胜任力模型与人岗匹配API ==========

// 1. 获取胜任力词典
app.get('/api/competency/dictionary', auth, (req, res) => {
    db.all('SELECT * FROM competency_dictionary ORDER BY category, id', (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, competencies: rows });
    });
});

// 2. 获取岗位类型
app.get('/api/competency/job-types', auth, (req, res) => {
    db.all('SELECT * FROM job_types ORDER BY category, level', (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, jobTypes: rows });
    });
});

// 3. 获取岗位胜任力模型
app.get('/api/competency/models/:jobTypeId', auth, (req, res) => {
    const jobTypeId = req.params.jobTypeId;
    
    const sql = `
        SELECT 
            jcm.*,
            cd.competency_name,
            cd.competency_name_en,
            cd.definition,
            cd.category,
            cd.level_descriptions
        FROM job_competency_models jcm
        JOIN competency_dictionary cd ON jcm.competency_id = cd.id
        WHERE jcm.job_type_id = ?
        ORDER BY jcm.importance_weight DESC
    `;
    
    db.all(sql, [jobTypeId], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, model: rows });
    });
});

// 4. 计算人岗匹配
app.post('/api/competency/match', auth, (req, res) => {
    const { userId, jobTypeId } = req.body;
    
    if (!userId || !jobTypeId) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    
    // 获取岗位胜任力模型
    const getJobModel = () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    jcm.*,
                    cd.competency_name,
                    cd.category
                FROM job_competency_models jcm
                JOIN competency_dictionary cd ON jcm.competency_id = cd.id
                WHERE jcm.job_type_id = ?
            `;
            db.all(sql, [jobTypeId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };
    
    // 获取用户的最新测评结果
    const getUserAssessmentResults = () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    ar.*,
                    at.tool_name,
                    tcm.competency_id,
                    tcm.dimension_name
                FROM assessment_results ar
                JOIN assessment_tools at ON ar.tool_id = at.id
                LEFT JOIN tool_competency_mapping tcm ON ar.tool_id = tcm.tool_id
                WHERE ar.user_id = ? AND ar.status >= 1
                ORDER BY ar.created_at DESC
                LIMIT 10
            `;
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };
    
    // 计算匹配分数
    const calculateMatch = async () => {
        try {
            const jobModel = await getJobModel();
            const userResults = await getUserAssessmentResults();
            
            // 计算各胜任力的得分
            const competencyScores = {};
            const competencyWeights = {};
            
            // 初始化分数
            jobModel.forEach(item => {
                competencyScores[item.competency_id] = 0;
                competencyWeights[item.competency_id] = item.importance_weight;
            });
            
            // 基于测评结果计算胜任力得分（简化版）
            // 实际应用中需要更复杂的算法
            userResults.forEach(result => {
                if (result.competency_id && result.total_score) {
                    // 将测评总分转换为胜任力得分（1-5分制）
                    const normalizedScore = Math.min(5, Math.max(1, (result.total_score / 20)));
                    if (!competencyScores[result.competency_id]) {
                        competencyScores[result.competency_id] = normalizedScore;
                    } else {
                        // 取最高分
                        competencyScores[result.competency_id] = Math.max(
                            competencyScores[result.competency_id],
                            normalizedScore
                        );
                    }
                }
            });
            
            // 如果没有测评数据，使用模拟数据
            if (Object.keys(competencyScores).length === 0) {
                jobModel.forEach(item => {
                    competencyScores[item.competency_id] = Math.floor(Math.random() * 3) + 2; // 2-4分
                });
            }
            
            // 计算总体匹配分数
            let totalWeightedScore = 0;
            let totalWeight = 0;
            const matchDetails = [];
            
            jobModel.forEach(item => {
                const score = competencyScores[item.competency_id] || 3;
                const required = item.required_level;
                const weight = item.importance_weight;
                
                const matchScore = Math.min(100, (score / required) * 100);
                totalWeightedScore += matchScore * weight;
                totalWeight += weight;
                
                matchDetails.push({
                    competencyId: item.competency_id,
                    competencyName: item.competency_name,
                    score: score,
                    requiredLevel: required,
                    weight: weight,
                    matchScore: matchScore,
                    isCore: item.is_core,
                    gap: score - required
                });
            });
            
            const overallMatchScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
            
            // 确定匹配等级
            let matchLevel = '不匹配';
            if (overallMatchScore >= 90) matchLevel = '优秀';
            else if (overallMatchScore >= 75) matchLevel = '良好';
            else if (overallMatchScore >= 60) matchLevel = '一般';
            
            // 生成差距分析和建议
            const gaps = matchDetails.filter(d => d.gap < 0);
            const recommendations = gaps.map(g => 
                `建议提升"${g.competencyName}"能力，当前水平${g.score}，要求水平${g.requiredLevel}`
            );
            
            // 保存匹配结果
            const saveSql = `
                INSERT INTO person_job_matching 
                (user_id, job_type_id, overall_match_score, competency_scores, match_level, gap_analysis, recommendations)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const competencyScoresJson = JSON.stringify(competencyScores);
            const gapAnalysisJson = JSON.stringify(gaps);
            
            db.run(saveSql, [
                userId,
                jobTypeId,
                overallMatchScore,
                competencyScoresJson,
                matchLevel,
                gapAnalysisJson,
                recommendations.join('\n')
            ], function(err) {
                if (err) {
                    console.error('保存匹配结果失败:', err);
                }
            });
            
            return {
                overallMatchScore: overallMatchScore.toFixed(2),
                matchLevel: matchLevel,
                matchDetails: matchDetails,
                gaps: gaps,
                recommendations: recommendations
            };
            
        } catch (error) {
            throw error;
        }
    };
    
    calculateMatch()
        .then(result => {
            res.json({ success: true, matchResult: result });
        })
        .catch(err => {
            console.error('计算人岗匹配失败:', err);
            res.status(500).json({ success: false, message: err.message });
        });
});

// 5. 获取用户的人岗匹配结果
app.get('/api/competency/match-results/:userId', auth, (req, res) => {
    const userId = req.params.userId;
    
    const sql = `
        SELECT 
            pjm.*,
            jt.job_name,
            jt.job_name_en,
            jt.category as job_category
        FROM person_job_matching pjm
        JOIN job_types jt ON pjm.job_type_id = jt.id
        WHERE pjm.user_id = ?
        ORDER BY pjm.created_at DESC
    `;
    
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, matchResults: rows });
    });
});

// 6. 获取测评工具-胜任力关联
app.get('/api/competency/tool-mapping', auth, (req, res) => {
    const sql = `
        SELECT 
            tcm.*,
            at.tool_name,
            cd.competency_name
        FROM tool_competency_mapping tcm
        JOIN assessment_tools at ON tcm.tool_id = at.id
        JOIN competency_dictionary cd ON tcm.competency_id = cd.id
        ORDER BY tcm.tool_id, tcm.competency_id
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, mappings: rows });
    });
});

// 7. 获取所有岗位的胜任力模型概览
app.get('/api/competency/models-overview', auth, (req, res) => {
    const sql = `
        SELECT 
            jt.id as job_type_id,
            jt.job_name,
            jt.category,
            jt.level,
            cd.competency_name,
            jcm.importance_weight,
            jcm.required_level,
            jcm.is_core
        FROM job_types jt
        LEFT JOIN job_competency_models jcm ON jt.id = jcm.job_type_id
        LEFT JOIN competency_dictionary cd ON jcm.competency_id = cd.id
        ORDER BY jt.id, jcm.importance_weight DESC
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        
        // 按岗位分组
        const overview = {};
        rows.forEach(row => {
            if (!overview[row.job_type_id]) {
                overview[row.job_type_id] = {
                    jobTypeId: row.job_type_id,
                    jobName: row.job_name,
                    category: row.category,
                    level: row.level,
                    competencies: []
                };
            }
            if (row.competency_name) {
                overview[row.job_type_id].competencies.push({
                    competencyName: row.competency_name,
                    weight: row.importance_weight,
                    requiredLevel: row.required_level,
                    isCore: row.is_core
                });
            }
        });
        
        res.json({ success: true, overview: Object.values(overview) });
    });
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('  ✅ 人才测评系统后端服务已启动');
    console.log('========================================');
    console.log('  地址: http://localhost:' + PORT);
    console.log('  账号: admin / admin123');
    console.log('========================================');
});
