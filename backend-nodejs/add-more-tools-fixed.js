/**
 * 添加更多专业测评工具（修正版）
 * 使用正确的数据库表结构
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment_new.db');

// 新测评工具定义（使用正确的列名）
const newTools = [
    {
        id: 16,
        tool_name: '360度反馈测评',
        tool_type: 'performance',
        description: '通过上级、同事、下属、自我等多维度反馈，全面评估个人绩效和行为表现',
        question_count: 60,
        estimated_time: 20
    },
    {
        id: 17,
        name: '职业锚测评',
        tool_type: 'career',
        description: '基于Edgar Schein的职业锚理论，识别个人的职业价值观和职业定位',
        question_count: 45,
        estimated_time: 15
    },
    {
        id: 18,
        tool_name: '心理资本测评',
        tool_type: 'psychology',
        description: '测量个体的心理资本（自我效能、希望、韧性、乐观），预测工作绩效和幸福感',
        question_count: 40,
        estimated_time: 15
    },
    {
        id: 19,
        tool_name: '组织承诺测评',
        tool_type: 'organization',
        description: '测量员工对组织的忠诚度、认同感和投入程度',
        question_count: 35,
        estimated_time: 12
    },
    {
        id: 20,
        tool_name: '领导风格测评',
        tool_type: 'leadership',
        description: '基于Bass的全范围领导理论，评估变革型、交易型、放任型领导风格',
        question_count: 50,
        estimated_time: 18
    },
    {
        id: 21,
        tool_name: '职业成熟度测评',
        tool_type: 'career',
        description: '测量个人在职业发展上的准备程度和决策能力',
        question_count: 40,
        estimated_time: 15
    },
    {
        id: 22,
        tool_name: '工作满意度测评',
        tool_type: 'satisfaction',
        description: '全面评估员工对工作的满意程度，包括工作本身、薪酬、晋升、同事、上级等维度',
        question_count: 35,
        estimated_time: 12
    },
    {
        id: 23,
        tool_name: '职业压力测评',
        tool_type: 'stress',
        description: '评估工作压力来源和应对能力，帮助识别压力管理需求',
        question_count: 45,
        estimated_time: 15
    }
];

console.log('开始添加新测评工具...\n');

// 添加工具到数据库
newTools.forEach(tool => {
    db.run(`INSERT OR REPLACE INTO assessment_tools (id, tool_name, tool_type, description, question_count, estimated_time) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [tool.id, tool.tool_name, tool.tool_type, tool.description, tool.question_count, tool.estimated_time],
            function(err) {
                if (err) {
                    console.error(`❌ 添加工具失败 (ID=${tool.id}):`, err.message);
                } else {
                    console.log(`✅ 添加工具: ${tool.tool_name} (ID=${tool.id})`);
                }
            }
    );
});

// 添加题目（使用正确的列名）
setTimeout(() => {
    console.log('\n开始添加题目...\n');
    
    // 工具16: 360度反馈测评（示例题目）
    const questions = [
        // 领导力维度
        { tool_id: 16, dimension: '领导力', text: '我认为我的上级能够清晰地传达团队目标', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 1 },
        { tool_id: 16, dimension: '领导力', text: '我的上级能够给予我足够的授权和支持', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 2 },
        { tool_id: 16, dimension: '领导力', text: '我的上级能够公正地评价我的工作表现', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 3 },
        
        // 沟通能力维度
        { tool_id: 16, dimension: '沟通能力', text: '我能够清晰地向同事表达我的想法', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 4 },
        { tool_id: 16, dimension: '沟通能力', text: '我善于倾听他人的意见和建议', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 5 },
        { tool_id: 16, dimension: '沟通能力', text: '我能够及时有效地传达工作信息', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 6 },
        
        // 团队合作维度
        { tool_id: 16, dimension: '团队合作', text: '我愿意与团队成员分享知识和资源', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 7 },
        { tool_id: 16, dimension: '团队合作', text: '我能够积极支持团队目标的实现', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 8 },
        { tool_id: 16, dimension: '团队合作', text: '我善于处理团队中的冲突', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 9 },
        
        // 专业能力维度
        { tool_id: 16, dimension: '专业能力', text: '我具备完成工作所需的专业知识和技能', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 10 },
        { tool_id: 16, dimension: '专业能力', text: '我能够不断学习和提升专业能力', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 11 },
        
        // 创新能力维度
        { tool_id: 16, dimension: '创新能力', text: '我能够提出改进工作的新想法', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 12 },
        { tool_id: 16, dimension: '创新能力', text: '我愿意尝试新的工作方法', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 13 },
        
        // 执行力维度
        { tool_id: 16, dimension: '执行力', text: '我能够按时完成工作任务', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 14 },
        { tool_id: 16, dimension: '执行力', text: '我能够克服困难和障碍完成任务', option_a: '完全不符合', option_b: '不太符合', option_c: '一般', option_d: '比较符合', option_e: '完全符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5, order_num: 15 }
    ];
    
    // 插入题目
    let insertedCount = 0;
    questions.forEach(q => {
        db.run(`INSERT OR IGNORE INTO questions (tool_id, dimension, question_text, option_a, option_b, option_c, option_d, option_e, score_a, score_b, score_c, score_d, score_e, order_num) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [q.tool_id, q.dimension, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.option_e, q.score_a, q.score_b, q.score_c, q.score_d, q.score_e, q.order_num],
                function(err) {
                    if (err) {
                        console.error(`❌ 添加题目失败:`, err.message);
                    } else {
                        insertedCount++;
                    }
                }
        );
    });
    
    console.log(`✅ 添加了 ${questions.length} 道示例题目到工具16（360度反馈测评）`);
    console.log('⚠️ 注意：每个工具需要40-60道题，当前只添加了示例题目');
    console.log('建议使用完整的题目脚本来添加所有题目。\n');
    
    // 验证添加结果
    setTimeout(() => {
        db.all('SELECT id, tool_name, question_count FROM assessment_tools WHERE id >= 16', (err, rows) => {
            if (err) {
                console.error('查询失败:', err.message);
            } else {
                console.log('新增测评工具列表:');
                rows.forEach(r => {
                    console.log(`  ID=${r.id}: ${r.tool_name} (设定题目数:${r.question_count})`);
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
                console.log('\n✅ 测评工具添加完成！');
                console.log('📝 下一步：添加完整的题目（每个工具40-60题）');
                db.close();
            });
        });
    }, 1000);
    
}, 2000);

console.log('脚本执行中，请等待...\n');
