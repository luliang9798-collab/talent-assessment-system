/**
 * 添加更多专业测评工具
 * 包括：360度反馈、职业锚、心理资本、组织承诺、领导风格、职业成熟度、工作满意度、职业压力
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment_new.db');

// 新测评工具定义
const newTools = [
    {
        id: 16,
        name: '360度反馈测评',
        description: '通过上级、同事、下属、自我等多维度反馈，全面评估个人绩效和行为表现',
        category: 'performance',
        question_count: 60,
        duration: 20,
        dimensions: ['领导力', '沟通能力', '团队合作', '专业能力', '创新能力', '执行力']
    },
    {
        id: 17,
        name: '职业锚测评',
        description: '基于Edgar Schein的职业锚理论，识别个人的职业价值观和职业定位',
        category: 'career',
        question_count: 45,
        duration: 15,
        dimensions: ['技术职能', '管理能力', '自主性', '安全感', '创业精神', '服务奉献', '纯粹挑战', '生活方式']
    },
    {
        id: 18,
        name: '心理资本测评',
        description: '测量个体的心理资本（自我效能、希望、韧性、乐观），预测工作绩效和幸福感',
        category: 'psychology',
        question_count: 40,
        duration: 15,
        dimensions: ['自我效能', '希望', '韧性', '乐观']
    },
    {
        id: 19,
        name: '组织承诺测评',
        description: '测量员工对组织的忠诚度、认同感和投入程度',
        category: 'organization',
        question_count: 35,
        duration: 12,
        dimensions: ['情感承诺', '持续承诺', '规范承诺']
    },
    {
        id: 20,
        name: '领导风格测评',
        description: '基于Bass的全范围领导理论，评估变革型、交易型、放任型领导风格',
        category: 'leadership',
        question_count: 50,
        duration: 18,
        dimensions: ['变革型领导', '交易型领导', '放任型领导']
    },
    {
        id: 21,
        name: '职业成熟度测评',
        description: '测量个人在职业发展上的准备程度和决策能力',
        category: 'career',
        question_count: 40,
        duration: 15,
        dimensions: ['职业决策', '职业信息', '职业规划', '职业态度']
    },
    {
        id: 22,
        name: '工作满意度测评',
        description: '全面评估员工对工作的满意程度，包括工作本身、薪酬、晋升、同事、上级等维度',
        category: 'satisfaction',
        question_count: 35,
        duration: 12,
        dimensions: ['工作本身', '薪酬福利', '晋升机会', '同事关系', '上级管理']
    },
    {
        id: 23,
        name: '职业压力测评',
        description: '评估工作压力来源和应对能力，帮助识别压力管理需求',
        category: 'stress',
        question_count: 45,
        duration: 15,
        dimensions: ['工作压力', '家庭压力', '压力应对', '压力症状']
    }
];

// 添加工具到数据库
console.log('开始添加新测评工具...\n');

newTools.forEach(tool => {
    db.run(`INSERT OR REPLACE INTO assessment_tools (id, name, description, category, question_count, duration) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [tool.id, tool.name, tool.description, tool.category, tool.question_count, tool.duration],
            function(err) {
                if (err) {
                    console.error(`添加工具 ${tool.name} 失败:`, err.message);
                } else {
                    console.log(`✅ 添加工具: ${tool.name} (ID=${tool.id})`);
                }
            }
    );
});

// 添加题目
setTimeout(() => {
    console.log('\n开始添加题目...\n');
    
    // 工具16: 360度反馈测评
    const tool16Questions = [
        { dimension: '领导力', text: '我认为我的上级能够清晰地传达团队目标', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
        { dimension: '领导力', text: '我的上级能够给予我足够的授权和支持', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
        { dimension: '沟通能力', text: '我能够清晰地向同事表达我的想法', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
        { dimension: '沟通能力', text: '我善于倾听他人的意见和建议', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
        { dimension: '团队合作', text: '我愿意与团队成员分享知识和资源', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 }
    ];
    
    // 这里只添加部分题目作为示例，完整版本需要添加所有60题
    let qOrder = 1;
    tool16Questions.forEach(q => {
        db.run(`INSERT OR IGNORE INTO questions (tool_id, question_order, dimension, question_text, option_a, option_b, option_c, option_d, option_e, score_a, score_b, score_c, score_d, score_e) 
                VALUES (16, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [qOrder++, q.dimension, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.option_e, q.score_a, q.score_b, q.score_c, q.score_d, q.score_e],
                function(err) {
                    if (err) {
                        console.error('添加题目失败:', err.message);
                    }
                }
        );
    });
    
    console.log(`✅ 工具16题目添加中... (${tool16Questions.length}题)`);
    
    // 工具17: 职业锚测评（示例题目）
    const tool17Questions = [
        { dimension: '技术职能', text: '我希望从事能够发挥我专业技能的工作', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
        { dimension: '管理能力', text: '我希望能够管理一个团队或部门', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
        { dimension: '自主性', text: '我希望能够自由安排自己的工作方式和时间', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
        { dimension: '安全感', text: '我希望有一份稳定的、有保障的工作', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
        { dimension: '创业精神', text: '我希望能够创建自己的事业或企业', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 }
    ];
    
    qOrder = 1;
    tool17Questions.forEach(q => {
        db.run(`INSERT OR IGNORE INTO questions (tool_id, question_order, dimension, question_text, option_a, option_b, option_c, option_d, option_e, score_a, score_b, score_c, score_d, score_e) 
                VALUES (17, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [qOrder++, q.dimension, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.option_e, q.score_a, q.score_b, q.score_c, q.score_d, q.score_e],
                function(err) {
                    if (err) {
                        console.error('添加题目失败:', err.message);
                    }
                }
        );
    });
    
    console.log(`✅ 工具17题目添加中... (${tool17Questions.length}题)`);
    
    console.log('\n⚠️ 注意：以上只添加了部分示例题目，完整版本需要添加所有题目（每个工具40-60题）');
    console.log('建议使用完整的题目脚本来添加所有题目。\n');
    
    // 验证添加结果
    setTimeout(() => {
        db.all('SELECT id, name, question_count FROM assessment_tools WHERE id >= 16', (err, rows) => {
            if (err) {
                console.error('查询失败:', err.message);
            } else {
                console.log('新增测评工具列表:');
                rows.forEach(r => {
                    console.log(`  ID=${r.id}: ${r.name} (设定题目数:${r.question_count})`);
                });
            }
            
            db.all('SELECT tool_id, COUNT(*) as count FROM questions WHERE tool_id >= 16 GROUP BY tool_id', (err, rows) => {
                if (err) {
                    console.error('查询失败:', err.message);
                } else {
                    console.log('\n新增题目统计:');
                    rows.forEach(r => {
                        console.log(`  工具${r.tool_id}: ${r.count}题`);
                    });
                }
                db.close();
            });
        });
    }, 1000);
    
}, 2000);

console.log('脚本执行中，请等待...\n');
