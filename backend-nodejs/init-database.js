const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment.db');

console.log('=== 重建数据库 ===\n');

// 读取并执行SQL文件
const fs = require('fs');
const sql = fs.readFileSync('../database/schema-complete.sql', 'utf8');

// 分割SQL语句并执行
const statements = sql.split(';').filter(s => s.trim().length > 0);

let completed = 0;
statements.forEach(stmt => {
    db.run(stmt, (err) => {
        if (err && !err.message.includes('already exists')) {
            console.error('SQL错误:', err.message);
            console.error('SQL:', stmt.substring(0, 100));
        }
        completed++;
        if (completed === statements.length) {
            console.log('✅ 数据库重建完成');
            insertInitialData();
        }
    });
});

function insertInitialData() {
    console.log('\n=== 插入初始数据 ===\n');
    
    // 插入测评工具
    const tools = [
        {name: '大五人格测评', type: 'personality', desc: '基于大五人格理论，评估开放性、尽责性、外向性、宜人性、神经质五个维度', time: 20, questions: 60},
        {name: 'MBTI职业性格测试', type: 'personality', desc: '基于荣格心理类型理论，评估16种人格类型', time: 25, questions: 93},
        {name: 'DISC行为风格测评', type: 'behavior', desc: '评估支配型、影响型、稳健型、服从型四种行为风格', time: 15, questions: 24},
        {name: '霍兰德职业兴趣测评', type: 'interest', desc: '评估现实型、研究型、艺术型、社会型、企业型、常规型六种职业兴趣', time: 20, questions: 60},
        {name: '情商（EQ）测评', type: 'emotion', desc: '评估情绪感知、情绪理解、情绪表达、情绪调节、情绪运用五个维度', time: 15, questions: 33},
        {name: '工作动机测评', type: 'motivation', desc: '评估成就动机、权力动机、亲和动机三种工作动机', time: 10, questions: 20},
        {name: '工作价值观测评', type: 'values', desc: '评估内在价值观、外在价值观、社会价值观三种工作价值观', time: 10, questions: 21}
    ];
    
    const stmt = db.prepare("INSERT OR REPLACE INTO assessment_tools (tool_name, tool_type, description, estimated_time, total_questions, status) VALUES (?, ?, ?, ?, ?, 1)");
    
    tools.forEach(tool => {
        stmt.run(tool.name, tool.type, tool.desc, tool.time, tool.questions);
    });
    
    stmt.finalize(() => {
        console.log('✅ 测评工具已插入');
        
        // 插入题目数据
        insertQuestions();
    });
}

function insertQuestions() {
    console.log('插入题目数据...');
    
    // 大五人格测评题目（示例）
    const questions = [
        {tool: '大五人格测评', dimension: '开放性', text: '我喜欢尝试新的事物和体验', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        {tool: '大五人格测评', dimension: '开放性', text: '我对艺术和文化活动感兴趣', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        {tool: '大五人格测评', dimension: '尽责性', text: '我总是按时完成任务', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        {tool: '大五人格测评', dimension: '尽责性', text: '我做事很有条理', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        {tool: '大五人格测评', dimension: '外向性', text: '我喜欢与人交往', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        {tool: '大五人格测评', dimension: '宜人性', text: '我乐于帮助他人', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        {tool: '大五人格测评', dimension: '神经质', text: '我容易感到焦虑', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        
        {tool: 'MBTI职业性格测试', dimension: 'E-I', text: '在社交场合，您通常：', options: '[{"label":"主动与陌生人交谈","value":"E"},{"label":"等待别人主动交谈","value":"I"}]'},
        {tool: 'MBTI职业性格测试', dimension: 'S-N', text: '您更倾向于：', options: '[{"label":"关注具体的事实和细节","value":"S"},{"label":"关注整体的模式和可能性","value":"N"}]'},
        {tool: 'MBTI职业性格测试', dimension: 'T-F', text: '在做决定时，您更注重：', options: '[{"label":"逻辑和客观分析","value":"T"},{"label":"人情和价值观","value":"F"}]'},
        {tool: 'MBTI职业性格测试', dimension: 'J-P', text: '您更喜欢：', options: '[{"label":"提前计划和安排","value":"J"},{"label":"保持灵活和随性","value":"P"}]'},
        
        {tool: 'DISC行为风格测评', dimension: 'D', text: '我倾向于直接表达我的意见', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        {tool: 'DISC行为风格测评', dimension: 'I', text: '我很擅长说服他人', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        {tool: 'DISC行为风格测评', dimension: 'S', text: '我偏好稳定和可预测的环境', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'},
        {tool: 'DISC行为风格测评', dimension: 'C', text: '我注重细节和准确性', options: '[{"label":"非常不同意","value":1},{"label":"不同意","value":2},{"label":"中性","value":3},{"label":"同意","value":4},{"label":"非常同意","value":5}]'}
    ];
    
    const qStmt = db.prepare("INSERT OR IGNORE INTO assessment_questions (tool_id, dimension, question_text, question_order, options) VALUES ((SELECT id FROM assessment_tools WHERE tool_name = ?), ?, ?, (SELECT COALESCE(MAX(question_order), 0) + 1 FROM assessment_questions WHERE tool_id = (SELECT id FROM assessment_tools WHERE tool_name = ?)), ?)");
    
    let qCompleted = 0;
    questions.forEach((q, idx) => {
        qStmt.run(q.tool, q.dimension, q.text, q.tool, q.options, () => {
            qCompleted++;
            if (qCompleted === questions.length) {
                qStmt.finalize(() => {
                    console.log('✅ 题目数据已插入');
                    console.log('\n=== 数据库初始化完成 ===\n');
                    db.close();
                });
            }
        });
    });
}
