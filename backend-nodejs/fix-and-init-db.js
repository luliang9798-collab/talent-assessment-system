const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment.db');

console.log('=== 修复数据库 ===\n');

// 添加status列到assessment_tools表
db.run("ALTER TABLE assessment_tools ADD COLUMN status INTEGER DEFAULT 1", [], function(err) {
    if (err && !err.message.includes('duplicate column name')) {
        console.log('添加status列失败(可能已存在):', err.message);
    } else {
        console.log('✅ status列已添加或已存在');
    }
    
    // 更新所有工具状态为1
    db.run("UPDATE assessment_tools SET status = 1 WHERE status IS NULL OR status != 1", [], function(err) {
        if (err) {
            console.error('更新状态失败:', err);
        } else {
            console.log('✅ 已更新', this.changes, '个测评工具状态');
        }
        
        // 检查题目表结构
        db.all("PRAGMA table_info(assessment_questions)", [], (err, columns) => {
            if (err) {
                console.error('查询表结构失败:', err);
            } else {
                console.log('\n题目表字段:', columns.map(c => c.name).join(', '));
                
                // 检查是否有题目
                db.get("SELECT COUNT(*) as count FROM assessment_questions", [], (err, row) => {
                    console.log('题目数量:', row.count);
                    
                    if (row.count < 50) {
                        console.log('插入题目数据...');
                        insertQuestions();
                    } else {
                        console.log('✅ 题目数据充足');
                        db.close();
                    }
                });
            }
        });
    );
});

function insertQuestions() {
    // 先获取工具ID
    db.all("SELECT id, tool_name FROM assessment_tools", [], (err, tools) => {
        if (err) {
            console.error('查询工具失败:', err);
            db.close();
            return;
        }
        
        console.log('找到', tools.length, '个测评工具');
        
        // 插入大五人格题目
        const bigFiveTool = tools.find(t => t.tool_name.includes('大五'));
        if (bigFiveTool) {
            insertBigFiveQuestions(bigFiveTool.id);
        }
        
        // 插入MBTI题目
        const mbtiTool = tools.find(t => t.tool_name.includes('MBTI'));
        if (mbtiTool) {
            insertMBTIQuestions(mbtiTool.id);
        }
        
        setTimeout(() => {
            console.log('✅ 题目数据插入完成');
            db.close();
        }, 2000);
    });
}

function insertBigFiveQuestions(toolId) {
    const questions = [
        {dimension: '开放性', text: '我喜欢尝试新的事物和体验', order: 1},
        {dimension: '开放性', text: '我对艺术和文化活动感兴趣', order: 2},
        {dimension: '开放性', text: '我喜欢思考抽象的概念', order: 3},
        {dimension: '尽责性', text: '我总是按时完成任务', order: 4},
        {dimension: '尽责性', text: '我做事很有条理', order: 5},
        {dimension: '尽责性', text: '我是一个自律的人', order: 6},
        {dimension: '外向性', text: '我喜欢与人交往', order: 7},
        {dimension: '外向性', text: '我在社交场合感到自在', order: 8},
        {dimension: '外向性', text: '我喜欢成为关注的中心', order: 9},
        {dimension: '宜人性', text: '我乐于帮助他人', order: 10},
        {dimension: '宜人性', text: '我容易信任他人', order: 11},
        {dimension: '宜人性', text: '我是一个宽容的人', order: 12},
        {dimension: '神经质', text: '我容易感到焦虑', order: 13},
        {dimension: '神经质', text: '我经常感到情绪低落', order: 14},
        {dimension: '神经质', text: '我容易情绪波动', order: 15}
    ];
    
    const options = JSON.stringify([
        {label: "非常不同意", value: 1},
        {label: "不同意", value: 2},
        {label: "中性", value: 3},
        {label: "同意", value: 4},
        {label: "非常同意", value: 5}
    ]);
    
    const stmt = db.prepare("INSERT OR IGNORE INTO assessment_questions (tool_id, dimension, question_text, question_order, options) VALUES (?, ?, ?, ?, ?)");
    
    questions.forEach(q => {
        stmt.run(toolId, q.dimension, q.text, q.order, options);
    });
    
    stmt.finalize();
    console.log('✅ 大五人格题目已插入');
}

function insertMBTIQuestions(toolId) {
    const questions = [
        {dimension: 'E-I', text: '在社交场合，您通常：', order: 1},
        {dimension: 'E-I', text: '您更倾向于：', order: 2},
        {dimension: 'S-N', text: '您更注重：', order: 3},
        {dimension: 'S-N', text: '您更倾向于：', order: 4},
        {dimension: 'T-F', text: '在做决定时，您更注重：', order: 5},
        {dimension: 'T-F', text: '当朋友遇到问题时，您通常：', order: 6},
        {dimension: 'J-P', text: '您更喜欢：', order: 7},
        {dimension: 'J-P', text: '关于计划，您倾向于：', order: 8}
    ];
    
    const options = JSON.stringify([
        {label: "A. 选项A", value: "A"},
        {label: "B. 选项B", value: "B"}
    ]);
    
    const stmt = db.prepare("INSERT OR IGNORE INTO assessment_questions (tool_id, dimension, question_text, question_order, options) VALUES (?, ?, ?, ?, ?)");
    
    questions.forEach(q => {
        stmt.run(toolId, q.dimension, q.text, q.order, options);
    });
    
    stmt.finalize();
    console.log('✅ MBTI题目已插入');
}
