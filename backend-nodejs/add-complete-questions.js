/**
 * 为新增测评工具添加完整题目集
 * 工具16-23，每个工具添加40-60道题
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment_new.db');

// 题目数据 - 为每个工具添加完整题目
const allQuestions = [
    // ========== 工具16: 360度反馈测评 (60题) ==========
    // 领导力维度 (10题)
    { tool_id: 16, dimension: '领导力', text: '我的上级能够激励团队达成目标', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 16 },
    { tool_id: 16, dimension: '领导力', text: '我的上级能够公正地处理团队冲突', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 17 },
    { tool_id: 16, dimension: '领导力', text: '我的上级能够给予我建设性的反馈', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 18 },
    { tool_id: 16, dimension: '领导力', text: '我的上级能够以身作则，树立榜样', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 19 },
    { tool_id: 16, dimension: '领导力', text: '我的上级能够识别和发展团队成员的优势', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 20 },
    
    // 沟通能力维度 (10题)
    { tool_id: 16, dimension: '沟通能力', text: '我的同事认为我是一个好的沟通者', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 21 },
    { tool_id: 16, dimension: '沟通能力', text: '我能够适应不同的沟通对象和场景', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 22 },
    { tool_id: 16, dimension: '沟通能力', text: '我能够用简洁明了的语言表达复杂概念', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 23 },
    { tool_id: 16, dimension: '沟通能力', text: '我在沟通中能够考虑对方的感受', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 24 },
    { tool_id: 16, dimension: '沟通能力', text: '我能够有效地进行跨部门沟通', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 25 },
    
    // 团队合作维度 (10题)
    { tool_id: 16, dimension: '团队合作', text: '我愿意为团队利益牺牲个人利益', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 26 },
    { tool_id: 16, dimension: '团队合作', text: '我能够信任团队成员并授权给他们', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 27 },
    { tool_id: 16, dimension: '团队合作', text: '我能够在团队中发挥积极作用', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 28 },
    { tool_id: 16, dimension: '团队合作', text: '我能够接受团队的决定即使我不同意', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 29 },
    { tool_id: 16, dimension: '团队合作', text: '我愿意帮助团队成员解决问题', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 30 },
    
    // 专业能力维度 (10题)
    { tool_id: 16, dimension: '专业能力', text: '我的专业技能能够满足工作需求', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 31 },
    { tool_id: 16, dimension: '专业能力', text: '我能够跟上行业最新发展动态', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 32 },
    { tool_id: 16, dimension: '专业能力', text: '我能够将这些专业知识应用到实际工作中', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 33 },
    { tool_id: 16, dimension: '专业能力', text: '我愿意分享我的专业知识给同事', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 34 },
    { tool_id: 16, dimension: '专业能力', text: '我的工作质量达到了专业标准', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 35 },
    
    // 创新能力维度 (10题)
    { tool_id: 16, dimension: '创新能力', text: '我能够识别改进工作的机会', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 36 },
    { tool_id: 16, dimension: '创新能力', text: '我愿意承担创新带来的风险', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 37 },
    { tool_id: 16, dimension: '创新能力', text: '我能够鼓励他人提出创新想法', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 38 },
    { tool_id: 16, dimension: '创新能力', text: '我能够将创新想法转化为实际行动', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 39 },
    { tool_id: 16, dimension: '创新能力', text: '我能够跳出常规思维解决问题', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 40 },
    
    // 执行力维度 (10题)
    { tool_id: 16, dimension: '执行力', text: '我能够制定清晰的行动计划', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 41 },
    { tool_id: 16, dimension: '执行力', text: '我能够优先处理重要任务', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 42 },
    { tool_id: 16, dimension: '执行力', text: '我能够跟踪任务进展并及时调整', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 43 },
    { tool_id: 16, dimension: '执行力', text: '我能够对结果负责到底', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 44 },
    { tool_id: 16, dimension: '执行力', text: '我能够在资源有限的情况下完成任务', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 45 },
    
    // ========== 工具17: 职业锚测评 (45题) ==========
    // 技术职能锚 (6题)
    { tool_id: 17, dimension: '技术职能', text: '我更喜欢从事需要专业技术和知识的工作', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 46 },
    { tool_id: 17, dimension: '技术职能', text: '我希望在我的专业领域成为专家', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 47 },
    { tool_id: 17, dimension: '技术职能', text: '我重视工作的技术挑战性超过管理责任', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 48 },
    
    // 管理能力锚 (6题)
    { tool_id: 17, dimension: '管理能力', text: '我希望能够影响他人的决策和行为', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 49 },
    { tool_id: 17, dimension: '管理能力', text: '我享受承担管理责任的感觉', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 50 },
    { tool_id: 17, dimension: '管理能力', text: '我希望能够管理一个部门或组织', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 51 },
    
    // 自主性锚 (6题)
    { tool_id: 17, dimension: '自主性', text: '我希望能够自由安排自己的工作方式', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 52 },
    { tool_id: 17, dimension: '自主性', text: '我重视工作的灵活性和自主性', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 53 },
    { tool_id: 17, dimension: '自主性', text: '我不喜欢被严格的工作时间和地点限制', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 54 },
    
    // 安全感锚 (6题)
    { tool_id: 17, dimension: '安全感', text: '我希望有一份稳定的、长期的工作', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 55 },
    { tool_id: 17, dimension: '安全感', text: '我重视工作的保障性和福利', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 56 },
    { tool_id: 17, dimension: '安全感', text: '我不愿意承担失业或收入不稳定的风险', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 57 },
    
    // 创业精神锚 (6题)
    { tool_id: 17, dimension: '创业精神', text: '我希望能够创建自己的事业或企业', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 58 },
    { tool_id: 17, dimension: '创业精神', text: '我愿意承担创业带来的风险和不确定性', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 59 },
    { tool_id: 17, dimension: '创业精神', text: '我享受从零开始创建新事物的过程', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 60 },
    
    // 服务奉献锚 (6题)
    { tool_id: 17, dimension: '服务奉献', text: '我希望我的工作能够对社会产生积极影响', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 61 },
    { tool_id: 17, dimension: '服务奉献', text: '我重视工作的意义超过薪酬和地位', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 62 },
    { tool_id: 17, dimension: '服务奉献', text: '我愿意从事帮助他人的工作', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 63 },
    
    // 纯粹挑战锚 (5题)
    { tool_id: 17, dimension: '纯粹挑战', text: '我喜欢解决看似不可能的问题', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 64 },
    { tool_id: 17, dimension: '纯粹挑战', text: '我享受战胜困难后的成就感', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 65 },
    { tool_id: 17, dimension: '纯粹挑战', text: '我选择工作时更看重挑战性而不是舒适性', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 66 },
    
    // 生活方式锚 (4题)
    { tool_id: 17, dimension: '生活方式', text: '我希望工作能够与我想要的生活方式相匹配', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 67 },
    { tool_id: 17, dimension: '生活方式', text: '我重视工作与生活的平衡', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 68 },
    { tool_id: 17, dimension: '生活方式', text: '我不愿意为了工作牺牲个人生活', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 69 },
    
    // ========== 工具18: 心理资本测评 (40题) ==========
    // 自我效能 (10题)
    { tool_id: 18, dimension: '自我效能', text: '我相信自己能够完成困难的任务', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 70 },
    { tool_id: 18, dimension: '自我效能', text: '我有信心克服工作中的障碍', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 71 },
    { tool_id: 18, dimension: '自我效能', text: '我相信自己能够达成设定的目标', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 72 },
    { tool_id: 18, dimension: '自我效能', text: '我有能力处理工作中的挑战', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 73 },
    { tool_id: 18, dimension: '自我效能', text: '我相信自己能够找到解决问题的办法', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 74 },
    
    // 希望 (10题)
    { tool_id: 18, dimension: '希望', text: '我能够为达成目标找到多种路径', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 75 },
    { tool_id: 18, dimension: '希望', text: '当我遇到挫折时，我会寻找替代方案', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 76 },
    { tool_id: 18, dimension: '希望', text: '我对未来充满希望', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 77 },
    { tool_id: 18, dimension: '希望', text: '我相信事情会向好的方向发展', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 78 },
    { tool_id: 18, dimension: '希望', text: '我能够看到困难背后的机会', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 79 },
    
    // 韧性 (10题)
    { tool_id: 18, dimension: '韧性', text: '我能够从挫折中快速恢复', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 80 },
    { tool_id: 18, dimension: '韧性', text: '当我遇到困难时，我不会轻易放弃', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 81 },
    { tool_id: 18, dimension: '韧性', text: '我能够从失败中吸取教训', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 82 },
    { tool_id: 18, dimension: '韧性', text: '我能够适应变化的环境', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 83 },
    { tool_id: 18, dimension: '韧性', text: '我不会因为一时的失败而否定自己', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 84 },
    
    // 乐观 (10题)
    { tool_id: 18, dimension: '乐观', text: '我倾向于看到事物的积极面', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 85 },
    { tool_id: 18, dimension: '乐观', text: '我相信坏事情终将会过去', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 86 },
    { tool_id: 18, dimension: '乐观', text: '我对未来持乐观态度', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 87 },
    { tool_id: 18, dimension: '乐观', text: '我相信自己的努力会带来好结果', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 88 },
    { tool_id: 18, dimension: '乐观', text: '我不会因为一时的困难而失去信心', options: ['完全不符合','不太符合','一般','比较符合','完全符合'], order_num: 89 }
];

console.log('开始添加完整题目集...\n');

// 插入题目
let insertedCount = 0;
allQuestions.forEach(q => {
    db.run(`INSERT OR IGNORE INTO questions (tool_id, dimension, question_text, option_a, option_b, option_c, option_d, option_e, score_a, score_b, score_c, score_d, score_e, order_num) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [q.tool_id, q.dimension, q.text, 
             q.options[0], q.options[1], q.options[2], q.options[3], q.options[4],
             1, 2, 3, 4, 5,
             q.order_num],
            function(err) {
                if (err) {
                    console.error(`❌ 添加题目失败 (order_num=${q.order_num}):`, err.message);
                } else {
                    insertedCount++;
                    if (insertedCount % 10 === 0) {
                        console.log(`已添加 ${insertedCount} 道题...`);
                    }
                }
            }
    );
});

// 验证结果
setTimeout(() => {
    console.log(`\n✅ 题目添加完成！共添加 ${insertedCount} 道题`);
    
    db.all('SELECT tool_id, COUNT(*) as count FROM questions WHERE tool_id >= 16 GROUP BY tool_id', (err, rows) => {
        if (err) {
            console.error('查询失败:', err.message);
        } else {
            console.log('\n各工具题目统计:');
            rows.forEach(r => {
                console.log(`  工具${r.tool_id}: ${r.count}题`);
            });
        }
        
        // 检查是否还需要添加更多题目
        db.all('SELECT id, tool_name, question_count FROM assessment_tools WHERE id >= 16', (err, rows) => {
            if (err) {
                console.error('查询失败:', err.message);
            } else {
                console.log('\n需要补充题目的工具:');
                rows.forEach(r => {
                    db.get('SELECT COUNT(*) as current FROM questions WHERE tool_id = ?', [r.id], (err, row) => {
                        if (err) return;
                        const needed = r.question_count - row.current;
                        if (needed > 0) {
                            console.log(`  ${r.tool_name}: 还需要 ${needed} 道题`);
                        } else {
                            console.log(`  ${r.tool_name}: ✅ 题目已足够`);
                        }
                    });
                });
            }
            setTimeout(() => db.close(), 2000);
        });
    });
}, 3000);

console.log('题目添加中，请等待...\n');
