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
app.use(express.static(path.join(__dirname, '../frontend')));

// 数据库
const db = new sqlite3.Database('./talent_assessment.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('数据库连接成功');
    }
});

// ============================================
// 认证中间件
// ============================================
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

// ============================================
// 认证API
// ============================================

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

        if (!user.password_hash) {
            console.error('用户密码hash为空:', user.username);
            return res.json({ success: false, message: '用户密码配置错误，请联系管理员' });
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

// ============================================
// 胜任力模型API
// ============================================

// 获取所有胜任力模型
app.get('/api/competency-models', authenticateToken, (req, res) => {
    db.all("SELECT * FROM competency_models WHERE status = 1", [], (err, models) => {
        if (err) {
            return res.json({ success: false, message: '查询失败: ' + err.message });
        }
        res.json({ success: true, models: models });
    });
});

// 获取模型的维度
app.get('/api/competency-models/:modelId/dimensions', authenticateToken, (req, res) => {
    const modelId = req.params.modelId;
    
    db.all("SELECT * FROM competency_dimensions WHERE model_id = ? ORDER BY sort_order", 
        [modelId], 
        (err, dimensions) => {
            if (err) {
                return res.json({ success: false, message: '查询失败: ' + err.message });
            }
            res.json({ success: true, dimensions: dimensions });
        }
    );
});

// ============================================
// 测评量表API
// ============================================

// 获取所有测评量表
app.get('/api/scales', authenticateToken, (req, res) => {
    db.all("SELECT * FROM assessment_scales WHERE status = 1", [], (err, scales) => {
        if (err) {
            return res.json({ success: false, message: '查询失败: ' + err.message });
        }
        res.json({ success: true, scales: scales });
    });
});

// 获取量表的题目
app.get('/api/scales/:scaleId/questions', authenticateToken, (req, res) => {
    const scaleId = req.params.scaleId;
    
    db.all(`SELECT q.*, GROUP_CONCAT(json_object('id', o.id, 'text', o.option_text, 'value', o.option_value)) as options
            FROM scale_questions q
            LEFT JOIN question_options o ON q.id = o.question_id
            WHERE q.scale_id = ? AND q.status = 1
            GROUP BY q.id
            ORDER BY q.sort_order`,
            [scaleId],
            (err, questions) => {
                if (err) {
                    return res.json({ success: false, message: '查询失败: ' + err.message });
                }
                
                // 解析options
                const parsedQuestions = questions.map(q => {
                    if (q.options) {
                        try {
                            // 这里需要正确解析，实际应该分开查询
                            q.optionsList = [];  // 简化，实际应该从question_options表查询
                        } catch (e) {
                            q.optionsList = [];
                        }
                    }
                    return q;
                });
                
                res.json({ success: true, questions: questions });
            }
    );
});

// 获取题目的选项
app.get('/api/questions/:questionId/options', authenticateToken, (req, res) => {
    const questionId = req.params.questionId;
    
    db.all("SELECT * FROM question_options WHERE question_id = ? ORDER BY sort_order", 
        [questionId], 
        (err, options) => {
            if (err) {
                return res.json({ success: false, message: '查询失败: ' + err.message });
            }
            res.json({ success: true, options: options });
        }
    );
});

// ============================================
// 测评任务API（增强版）
// ============================================

// 创建测评任务（支持量表）
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { userId, scaleId, projectId } = req.body;
    
    if (!userId || !scaleId) {
        return res.json({ success: false, message: '用户ID和量表ID不能为空' });
    }
    
    db.run("INSERT INTO assessment_tasks (user_id, tool_id, project_id, status) VALUES (?, ?, ?, 0)",
        [userId, scaleId, projectId],
        function(err) {
            if (err) {
                console.error('创建任务失败:', err);
                return res.json({ success: false, message: '创建任务失败: ' + err.message });
            }
            res.json({ success: true, taskId: this.lastID });
        }
    );
});

// 提交测评答案
app.post('/api/tasks/:taskId/responses', authenticateToken, (req, res) => {
    const taskId = req.params.taskId;
    const { responses } = req.body;  // responses: [{questionId, optionId, value}]
    
    if (!responses || !Array.isArray(responses)) {
        return res.json({ success: false, message: '答案数据格式错误' });
    }
    
    // 开始事务
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        let hasError = false;
        
        responses.forEach(response => {
            db.run(`INSERT INTO assessment_answers (task_id, question_id, option_id, score) 
                    VALUES (?, ?, ?, ?)`,
                [taskId, response.questionId, response.optionId, response.value],
                (err) => {
                    if (err) {
                        hasError = true;
                        console.error('插入答案失败:', err);
                    }
                }
            );
        });
        
        if (hasError) {
            db.run("ROLLBACK");
            return res.json({ success: false, message: '提交答案失败' });
        }
        
        // 更新任务状态
        db.run("UPDATE assessment_tasks SET status = 1, started_at = CURRENT_TIMESTAMP WHERE id = ?", 
            [taskId],
            (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    return res.json({ success: false, message: '更新任务状态失败' });
                }
                
                db.run("COMMIT");
                res.json({ success: true, message: '答案提交成功' });
            }
        );
    });
});

// 完成测评并生成报告
app.post('/api/tasks/:taskId/complete', authenticateToken, (req, res) => {
    const taskId = req.params.taskId;
    
    // 计算得分（简化版，实际应该根据量表类型使用不同的算法）
    db.all(`SELECT a.*, q.dimension_id, q.reverse_scoring
            FROM assessment_answers a
            LEFT JOIN scale_questions q ON a.question_id = q.id
            WHERE a.task_id = ?`,
            [taskId],
            (err, answers) => {
                if (err) {
                    return res.json({ success: false, message: '查询答案失败' });
                }
                
                // 计算各维度得分（简化算法）
                const dimensionScores = {};
                answers.forEach(answer => {
                    if (answer.dimension_id) {
                        if (!dimensionScores[answer.dimension_id]) {
                            dimensionScores[answer.dimension_id] = { total: 0, count: 0 };
                        }
                        
                        let score = answer.score;
                        if (answer.reverse_scoring) {
                            score = 6 - score;  // 反向计分
                        }
                        
                        dimensionScores[answer.dimension_id].total += score;
                        dimensionScores[answer.dimension_id].count++;
                    }
                });
                
                // 生成报告
                const reportData = {
                    taskId: taskId,
                    dimensionScores: dimensionScores,
                    generatedAt: new Date().toISOString()
                };
                
                // 保存报告
                db.run(`INSERT INTO assessment_reports (task_id, report_data, status, generated_at)
                        VALUES (?, ?, 1, CURRENT_TIMESTAMP)`,
                    [taskId, JSON.stringify(reportData)],
                    function(err) {
                        if (err) {
                            return res.json({ success: false, message: '生成报告失败' });
                        }
                        
                        // 更新任务状态
                        db.run("UPDATE assessment_tasks SET status = 2, completed_at = CURRENT_TIMESTAMP WHERE id = ?",
                            [taskId]
                        );
                        
                        res.json({ success: true, reportId: this.lastID });
                    }
                );
            }
        );
});

// ============================================
// 360评估API
// ============================================

// 创建360评估项目
app.post('/api/assessment-360', authenticateToken, (req, res) => {
    const { projectName, targetUserId, startDate, endDate } = req.body;
    
    db.run(`INSERT INTO assessment_360 (project_name, target_user_id, start_date, end_date, created_by)
            VALUES (?, ?, ?, ?, ?)`,
        [projectName, targetUserId, startDate, endDate, req.user.userId],
        function(err) {
            if (err) {
                return res.json({ success: false, message: '创建失败: ' + err.message });
            }
            res.json({ success: true, projectId: this.lastID });
        }
    );
});

// 添加评估人
app.post('/api/assessment-360/:projectId/evaluators', authenticateToken, (req, res) => {
    const projectId = req.params.projectId;
    const { evaluators } = req.body;  // [{userId, type}]
    
    evaluators.forEach(evaluator => {
        db.run(`INSERT INTO evaluators (assessment_360_id, evaluator_user_id, evaluator_type)
                VALUES (?, ?, ?)`,
            [projectId, evaluator.userId, evaluator.type]
        );
    });
    
    res.json({ success: true });
});

// ============================================
// 人才盘点API
// ============================================

// 创建人才盘点项目
app.post('/api/talent-reviews', authenticateToken, (req, res) => {
    const { reviewName, reviewType, department } = req.body;
    
    db.run(`INSERT INTO talent_reviews (review_name, review_type, department, created_by)
            VALUES (?, ?, ?, ?)`,
        [reviewName, reviewType, department, req.user.userId],
        function(err) {
            if (err) {
                return res.json({ success: false, message: '创建失败: ' + err.message });
            }
            res.json({ success: true, reviewId: this.lastID });
        }
    );
});

// 添加人才九宫格数据
app.post('/api/talent-reviews/:reviewId/grid', authenticateToken, (req, res) => {
    const reviewId = req.params.reviewId;
    const { userId, performanceScore, potentialScore, category } = req.body;
    
    // 计算九宫格位置
    const perfLevel = performanceScore >= 4 ? 3 : (performanceScore >= 3 ? 2 : 1);
    const potLevel = potentialScore >= 4 ? 3 : (potentialScore >= 3 ? 2 : 1);
    const gridPosition = `${perfLevel}-${potLevel}`;
    
    db.run(`INSERT INTO talent_grid_data (review_id, user_id, performance_score, potential_score, grid_position, category)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [reviewId, userId, performanceScore, potentialScore, gridPosition, category],
        function(err) {
            if (err) {
                return res.json({ success: false, message: '添加失败: ' + err.message });
            }
            res.json({ success: true, dataId: this.lastID });
        }
    );
});

// 获取九宫格数据
app.get('/api/talent-reviews/:reviewId/grid', authenticateToken, (req, res) => {
    const reviewId = req.params.reviewId;
    
    db.all(`SELECT g.*, u.real_name, u.position
            FROM talent_grid_data g
            LEFT JOIN users u ON g.user_id = u.id
            WHERE g.review_id = ?`,
            [reviewId],
            (err, gridData) => {
                if (err) {
                    return res.json({ success: false, message: '查询失败: ' + err.message });
                }
                res.json({ success: true, gridData: gridData });
            }
        );
});

// ============================================
// 个人发展计划API
// ============================================

// 创建个人发展计划
app.post('/api/development-plans', authenticateToken, (req, res) => {
    const { userId, planName, developmentGoals, actionItems, startDate, endDate } = req.body;
    
    db.run(`INSERT INTO development_plans (user_id, plan_name, development_goals, action_items, start_date, end_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, planName, JSON.stringify(developmentGoals), JSON.stringify(actionItems), startDate, endDate, req.user.userId],
        function(err) {
            if (err) {
                return res.json({ success: false, message: '创建失败: ' + err.message });
            }
            res.json({ success: true, planId: this.lastID });
        }
    );
});

// 获取个人发展计划
app.get('/api/development-plans/:userId', authenticateToken, (req, res) => {
    const userId = req.params.userId;
    
    db.all("SELECT * FROM development_plans WHERE user_id = ? ORDER BY created_at DESC", 
        [userId], 
        (err, plans) => {
            if (err) {
                return res.json({ success: false, message: '查询失败: ' + err.message });
            }
            res.json({ success: true, plans: plans });
        }
    );
});

// ============================================
// 报告API
// ============================================

// 获取报告
app.get('/api/reports/:reportId', authenticateToken, (req, res) => {
    const reportId = req.params.reportId;
    
    db.get("SELECT * FROM assessment_reports WHERE id = ?", [reportId], (err, report) => {
        if (err) {
            return res.json({ success: false, message: '查询失败: ' + err.message });
        }
        
        if (!report) {
            return res.json({ success: false, message: '报告不存在' });
        }
        
        // 解析报告数据
        if (report.report_data) {
            try {
                report.reportData = JSON.parse(report.report_data);
            } catch (e) {
                report.reportData = {};
            }
        }
        
        res.json({ success: true, report: report });
    });
});

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================');
    console.log('人才测评系统 V2.0 启动成功！');
    console.log('对标SHL & 北森');
    console.log('====================================');
    console.log('后端API: http://localhost:' + PORT + '/api');
    console.log('前端页面: http://localhost:' + PORT);
    console.log('====================================');
});

module.exports = app;
