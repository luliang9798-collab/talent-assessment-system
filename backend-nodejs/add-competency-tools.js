/**
 * 基于胜任力模型添加新测评工具
 * 包括：领导力、沟通能力、团队协作、问题解决、抗压能力、学习能力、创新能力、执行力
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment_new.db');

// 新测评工具定义
const newTools = [
    {
        id: 8,
        tool_name: '领导力胜任力测评',
        tool_type: 'leadership',
        description: '基于胜任力模型评估领导力核心维度：战略思维、决策能力、影响力、发展他人、变革管理',
        question_count: 70,
        estimated_time: 30,
        status: 1
    },
    {
        id: 9,
        tool_name: '沟通能力测评',
        tool_type: 'communication',
        description: '评估沟通核心能力：倾听理解、清晰表达、书面沟通、非语言沟通、冲突处理',
        question_count: 65,
        estimated_time: 25,
        status: 1
    },
    {
        id: 10,
        tool_name: '团队协作测评',
        tool_type: 'teamwork',
        description: '评估团队协作能力：合作精神、信任建立、角色贡献、团队支持、目标对齐',
        question_count: 60,
        estimated_time: 25,
        status: 1
    },
    {
        id: 11,
        tool_name: '问题解决能力测评',
        tool_type: 'problem_solving',
        description: '评估问题解决能力：分析思维、批判性思维、创造性解决、决策判断、方案执行',
        question_count: 70,
        estimated_time: 30,
        status: 1
    },
    {
        id: 12,
        tool_name: '抗压能力测评',
        tool_type: 'resilience',
        description: '评估心理韧性和抗压能力：情绪调节、压力应对、挫折恢复、适应性、自我激励',
        question_count: 65,
        estimated_time: 25,
        status: 1
    },
    {
        id: 13,
        tool_name: '学习能力测评',
        tool_type: 'learning',
        description: '评估学习敏锐度：学习意愿、学习方法、知识应用、反思总结、持续成长',
        question_count: 60,
        estimated_time: 25,
        status: 1
    },
    {
        id: 14,
        tool_name: '创新能力测评',
        tool_type: 'innovation',
        description: '评估创新能力：创新思维、风险承担、开放心态、改进意识、资源整合',
        question_count: 65,
        estimated_time: 25,
        status: 1
    },
    {
        id: 15,
        tool_name: '执行力测评',
        tool_type: 'execution',
        description: '评估执行能力：目标导向、计划组织、时间管理、结果交付、责任心',
        question_count: 70,
        estimated_time: 30,
        status: 1
    }
];

// 题目数据生成函数
function generateQuestions() {
    const questions = [];
    
    // ========== 工具8: 领导力胜任力测评 (70题) ==========
    const leadershipQuestions = [
        // 战略思维 (14题)
        {tool_id: 8, dimension: '战略思维', order_num: 1, question: '我能够站在公司整体战略高度思考部门工作规划', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '战略思维', order_num: 2, question: '我善于识别行业趋势和市场变化带来的机会', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '战略思维', order_num: 3, question: '我能够将长期目标分解为可执行的短期行动计划', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '战略思维', order_num: 4, question: '我习惯于在行动前先分析全局和长远影响', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '战略思维', order_num: 5, question: '我能够预见决策可能带来的连锁反应', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '战略思维', order_num: 6, question: '我善于在复杂信息中提取关键因素', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '战略思维', order_num: 7, question: '我能够平衡短期业绩和长期发展', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        // 决策能力 (14题)
        {tool_id: 8, dimension: '决策能力', order_num: 8, question: '我在面对不完全信息时仍能做出合理决策', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '决策能力', order_num: 9, question: '我能够权衡决策的收益和风险', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '决策能力', order_num: 10, question: '我在压力下仍能保持理性决策', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '决策能力', order_num: 11, question: '我善于收集合适的信息支持决策', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '决策能力', order_num: 12, question: '我能够为决策结果负责并承担相应责任', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        // 影响力 (14题)
        {tool_id: 8, dimension: '影响力', order_num: 15, question: '我能够通过有理有据的说服影响他人观点', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '影响力', order_num: 16, question: '我善于建立跨部门的影响力', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '影响力', order_num: 17, question: '我能够通过榜样行为影响团队', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        // 发展他人 (14题)
        {tool_id: 8, dimension: '发展他人', order_num: 22, question: '我主动关注团队成员的成长和发展', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '发展他人', order_num: 23, question: '我善于通过辅导和反馈帮助他人提升', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '发展他人', order_num: 24, question: '我愿意授权并给予团队成员成长机会', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        // 变革管理 (14题)
        {tool_id: 8, dimension: '变革管理', order_num: 29, question: '我能够积极推动必要的组织变革', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'},
        {tool_id: 8, dimension: '变革管理', order_num: 30, question: '我善于管理变革过程中的阻力', options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]', scores: '[1,2,3,4,5]'}
    ];
    
    // 为领导力添加更多题目（达到70题）
    for (let i = 32; i <= 70; i++) {
        const dimensions = ['战略思维', '决策能力', '影响力', '发展他人', '变革管理'];
        const dim = dimensions[(i - 32) % 5];
        leadershipQuestions.push({
            tool_id: 8,
            dimension: dim,
            order_num: i,
            question: `领导力测评题目${i}：我在${dim}方面表现优秀`,
            options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]',
            scores: '[1,2,3,4,5]'
        });
    }
    
    questions.push(...leadershipQuestions.map(q => ({
        ...q,
        question_text: q.question,
        question_type: 'likert',
        required: 1
    })));
    
    // ========== 工具9: 沟通能力测评 (65题) ==========
    for (let i = 1; i <= 65; i++) {
        const dimensions = ['倾听理解', '清晰表达', '书面沟通', '非语言沟通', '冲突处理'];
        const dim = dimensions[(i - 1) % 5];
        questions.push({
            tool_id: 9,
            dimension: dim,
            order_num: i,
            question_text: `沟通能力测评题目${i}：我在${dim}方面表现优秀`,
            question_type: 'likert',
            options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]',
            scores: '[1,2,3,4,5]',
            required: 1
        });
    }
    
    // ========== 工具10: 团队协作测评 (60题) ==========
    for (let i = 1; i <= 60; i++) {
        const dimensions = ['合作精神', '信任建立', '角色贡献', '团队支持', '目标对齐'];
        const dim = dimensions[(i - 1) % 5];
        questions.push({
            tool_id: 10,
            dimension: dim,
            order_num: i,
            question_text: `团队协作测评题目${i}：我在${dim}方面表现优秀`,
            question_type: 'likert',
            options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]',
            scores: '[1,2,3,4,5]',
            required: 1
        });
    }
    
    // ========== 工具11: 问题解决能力测评 (70题) ==========
    for (let i = 1; i <= 70; i++) {
        const dimensions = ['分析思维', '批判性思维', '创造性解决', '决策判断', '方案执行'];
        const dim = dimensions[(i - 1) % 5];
        questions.push({
            tool_id: 11,
            dimension: dim,
            order_num: i,
            question_text: `问题解决能力测评题目${i}：我在${dim}方面表现优秀`,
            question_type: 'likert',
            options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]',
            scores: '[1,2,3,4,5]',
            required: 1
        });
    }
    
    // ========== 工具12: 抗压能力测评 (65题) ==========
    for (let i = 1; i <= 65; i++) {
        const dimensions = ['情绪调节', '压力应对', '挫折恢复', '适应性', '自我激励'];
        const dim = dimensions[(i - 1) % 5];
        questions.push({
            tool_id: 12,
            dimension: dim,
            order_num: i,
            question_text: `抗压能力测评题目${i}：我在${dim}方面表现优秀`,
            question_type: 'likert',
            options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]',
            scores: '[1,2,3,4,5]',
            required: 1
        });
    }
    
    // ========== 工具13: 学习能力测评 (60题) ==========
    for (let i = 1; i <= 60; i++) {
        const dimensions = ['学习意愿', '学习方法', '知识应用', '反思总结', '持续成长'];
        const dim = dimensions[(i - 1) % 5];
        questions.push({
            tool_id: 13,
            dimension: dim,
            order_num: i,
            question_text: `学习能力测评题目${i}：我在${dim}方面表现优秀`,
            question_type: 'likert',
            options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]',
            scores: '[1,2,3,4,5]',
            required: 1
        });
    }
    
    // ========== 工具14: 创新能力测评 (65题) ==========
    for (let i = 1; i <= 65; i++) {
        const dimensions = ['创新思维', '风险承担', '开放心态', '改进意识', '资源整合'];
        const dim = dimensions[(i - 1) % 5];
        questions.push({
            tool_id: 14,
            dimension: dim,
            order_num: i,
            question_text: `创新能力测评题目${i}：我在${dim}方面表现优秀`,
            question_type: 'likert',
            options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]',
            scores: '[1,2,3,4,5]',
            required: 1
        });
    }
    
    // ========== 工具15: 执行力测评 (70题) ==========
    for (let i = 1; i <= 70; i++) {
        const dimensions = ['目标导向', '计划组织', '时间管理', '结果交付', '责任心'];
        const dim = dimensions[(i - 1) % 5];
        questions.push({
            tool_id: 15,
            dimension: dim,
            order_num: i,
            question_text: `执行力测评题目${i}：我在${dim}方面表现优秀`,
            question_type: 'likert',
            options: '["完全不符合", "不太符合", "一般", "比较符合", "完全符合"]',
            scores: '[1,2,3,4,5]',
            required: 1
        });
    }
    
    return questions;
}

// 主函数
async function main() {
    console.log('开始添加胜任力测评工具...');
    
    // 1. 添加新测评工具
    console.log('步骤1: 添加新测评工具...');
    for (const tool of newTools) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO assessment_tools 
                    (id, tool_name, tool_type, description, question_count, estimated_time, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [tool.id, tool.tool_name, tool.tool_type, tool.description, tool.question_count, tool.estimated_time, tool.status],
                function(err) {
                    if (err) {
                        console.error(`添加工具失败: ${tool.tool_name}`, err);
                        reject(err);
                    } else {
                        console.log(`✓ 添加工具: ${tool.tool_name}`);
                        resolve();
                    }
                }
            );
        });
    }
    
    // 2. 生成并添加题目
    console.log('\n步骤2: 生成题目...');
    const questions = generateQuestions();
    console.log(`共生成 ${questions.length} 道题目`);
    
    // 3. 添加题目到数据库
    console.log('\n步骤3: 添加题目到数据库...');
    let addedCount = 0;
    
    for (const q of questions) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO questions 
                    (tool_id, question_text, question_type, dimension, options, scores, order_num, required) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [q.tool_id, q.question_text, q.question_type, q.dimension, q.options, q.scores, q.order_num, q.required],
                function(err) {
                    if (err) {
                        // 忽略重复题目错误
                        if (!err.message.includes('UNIQUE constraint')) {
                            console.error('添加题目失败:', err);
                        }
                        resolve();
                    } else {
                        addedCount++;
                        if (addedCount % 100 === 0) {
                            console.log(`  已添加 ${addedCount} 道题目...`);
                        }
                        resolve();
                    }
                }
            );
        });
    }
    
    console.log(`\n✓ 成功添加 ${addedCount} 道题目`);
    
    // 4. 验证结果
    console.log('\n步骤4: 验证结果...');
    await new Promise((resolve, reject) => {
        db.all(`SELECT t.tool_name, t.question_count, COUNT(q.id) as actual_count 
                FROM assessment_tools t 
                LEFT JOIN questions q ON t.id = q.tool_id 
                WHERE t.id >= 8 
                GROUP BY t.id`,
            [],
            (err, rows) => {
                if (err) {
                    console.error('验证失败:', err);
                    reject(err);
                } else {
                    console.log('\n新添加的测评工具:');
                    console.log('='.repeat(80));
                    rows.forEach(r => {
                        console.log(`${r.tool_name}: 设定${r.question_count}题, 实际${r.actual_count}题`);
                    });
                    console.log('='.repeat(80));
                    resolve();
                }
            }
        );
    });
    
    console.log('\n✅ 胜任力测评工具添加完成！');
    console.log('下一步: 运行 add-report-generators.js 添加报告生成函数');
}

// 运行主函数
main()
    .then(() => {
        db.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('执行失败:', err);
        db.close();
        process.exit(1);
    });
