const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, 'talent_assessment.db'));

// 获取所有测评工具
router.get('/tools', (req, res) => {
    db.all('SELECT * FROM assessment_tools ORDER BY id', [], (err, tools) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }
        res.json({ success: true, tools: tools });
    });
});

// 获取单个测评工具详情
router.get('/tools/:id', (req, res) => {
    const toolId = req.params.id;
    db.get('SELECT * FROM assessment_tools WHERE id = ?', [toolId], (err, tool) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }
        if (!tool) {
            return res.status(404).json({ success: false, message: '工具不存在' });
        }
        
        // 获取该工具的题目
        db.all('SELECT * FROM assessment_questions WHERE tool_id = ? ORDER BY dimension, id', [toolId], (err, questions) => {
            if (err) {
                return res.status(500).json({ success: false, message: '数据库错误' });
            }
            tool.questions = questions || [];
            res.json({ success: true, tool: tool });
        });
    });
});

// 创建测评工具
router.post('/tools', (req, res) => {
    const { toolName, toolType, description, dimensions } = req.body;
    
    db.run(`
        INSERT INTO assessment_tools (tool_name, tool_type, description, dimensions, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, datetime('now'))
    `, [toolName, toolType, description, JSON.stringify(dimensions)], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: '创建失败' });
        }
        res.json({ success: true, message: '创建成功', toolId: this.lastID });
    });
});

// 更新测评工具
router.put('/tools/:id', (req, res) => {
    const toolId = req.params.id;
    const { toolName, toolType, description, dimensions, isActive } = req.body;
    
    db.run(`
        UPDATE assessment_tools 
        SET tool_name = ?, tool_type = ?, description = ?, dimensions = ?, is_active = ?
        WHERE id = ?
    `, [toolName, toolType, description, JSON.stringify(dimensions), isActive, toolId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: '更新失败' });
        }
        res.json({ success: true, message: '更新成功' });
    });
});

// 删除测评工具
router.delete('/tools/:id', (req, res) => {
    const toolId = req.params.id;
    
    db.run('DELETE FROM assessment_tools WHERE id = ?', [toolId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: '删除失败' });
        }
        res.json({ success: true, message: '删除成功' });
    });
});

// 添加题目
router.post('/tools/:id/questions', (req, res) => {
    const toolId = req.params.id;
    const { question, dimension, options } = req.body;
    
    db.run(`
        INSERT INTO assessment_questions (tool_id, question, dimension, options, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
    `, [toolId, question, dimension, JSON.stringify(options)], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: '添加题目失败' });
        }
        res.json({ success: true, message: '添加成功', questionId: this.lastID });
    });
});

// 获取题目列表
router.get('/questions', (req, res) => {
    const toolId = req.query.toolId;
    let sql = 'SELECT q.*, t.tool_name FROM assessment_questions q JOIN assessment_tools t ON q.tool_id = t.id';
    let params = [];
    
    if (toolId) {
        sql += ' WHERE q.tool_id = ?';
        params.push(toolId);
    }
    
    db.all(sql, params, (err, questions) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }
        res.json({ success: true, questions: questions });
    });
});

// 获取维度列表
router.get('/dimensions', (req, res) => {
    const toolType = req.query.toolType;
    
    const dimensionMap = {
        'PERSONALITY': [
            { code: 'O', name: '开放性', description: '对新想法的开放程度' },
            { code: 'C', name: '尽责性', description: '组织性和可靠性' },
            { code: 'E', name: '外向性', description: '社交性和活力' },
            { code: 'A', name: '宜人性', description: '合作性和同情心' },
            { code: 'N', name: '神经质', description: '情绪稳定性' }
        ],
        'INTEREST': [
            { code: 'R', name: '现实型', description: '喜欢实际操作' },
            { code: 'I', name: '研究型', description: '喜欢思考和分析' },
            { code: 'A', name: '艺术型', description: '喜欢创作和表达' },
            { code: 'S', name: '社会型', description: '喜欢帮助他人' },
            { code: 'E', name: '企业型', description: '喜欢领导和影响' },
            { code: 'C', name: '常规型', description: '喜欢规则和秩序' }
        ],
        'MOTIVATION': [
            { code: 'PAY', name: '薪酬回报', description: '对薪酬的关注' },
            { code: 'CAREER', name: '职业发展', description: '对晋升的关注' },
            { code: 'MEANING', name: '工作意义', description: '对工作的意义感' },
            { code: 'AUTONOMY', name: '工作自主', description: '对自主性的需求' },
            { code: 'ENVIRONMENT', name: '工作环境', description: '对工作环境的关注' }
        ],
        'LEADERSHIP': [
            { code: 'VISION', name: '愿景塑造', description: '制定愿景的能力' },
            { code: 'INFLUENCE', name: '影响力', description: '影响他人的能力' },
            { code: 'DECISION', name: '决策力', description: '做决策的能力' },
            { code: 'EMPOWER', name: '授权赋能', description: '授权他人的能力' },
            { code: 'INSPIRE', name: '激励他人', description: '激励团队的能力' }
        ]
    };
    
    res.json({ success: true, dimensions: dimensionMap[toolType] || [] });
});

console.log('测评工具配置API已加载');
module.exports = router;
