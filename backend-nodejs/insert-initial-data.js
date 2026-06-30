const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment.db');

console.log('开始插入初始数据...');

db.serialize(() => {
    // 1. 插入SHL UCF胜任力模型
    db.run(`INSERT OR IGNORE INTO competency_models (model_name, model_code, description, model_type, version) 
            VALUES (?, ?, ?, ?, ?)`,
            ['SHL全方位胜任力模型', 'UCF', 'SHL Universal Competency Framework - 全球领先的胜任力模型', 'UCF', '3.0'],
            function(err) {
                if (err) console.error('插入模型失败:', err);
                else console.log('✅ SHL UCF模型已插入, ID:', this.lastID);
            });
    
    // 2. 插入北森胜任力模型
    db.run(`INSERT OR IGNORE INTO competency_models (model_name, model_code, description, model_type, version) 
            VALUES (?, ?, ?, ?, ?)`,
            ['北森综合胜任力模型', 'BEISEN', '北森3大类53维度胜任力模型 - 适合中国企业', 'BEISEN', '2.0'],
            function(err) {
                if (err) console.error('插入模型失败:', err);
                else console.log('✅ 北森模型已插入, ID:', this.lastID);
            });
    
    // 3. 插入SHL UCF维度（部分示例）
    const ucfDimensions = [
        // 领导力维度
        [1, '领导力', 'LEADERSHIP', 0, '引领团队实现目标的能力', 1],
        [1, '战略思维', 'STRATEGIC_THINKING', 0, '思考和规划长期战略的能力', 2],
        [1, '决策能力', 'DECISION_MAKING', 0, '在复杂情况下做出决策的能力', 3],
        [1, '激励他人', 'INSPIRING_OTHERS', 0, '激发团队积极性和创造力的能力', 4],
        
        // 人际关系维度
        [1, '沟通能力', 'COMMUNICATION', 0, '有效传递信息和想法的能力', 5],
        [1, '团队合作', 'TEAMWORK', 0, '与他人协作实现共同目标的能力', 6],
        [1, '影响力', 'INFLUENCING', 0, '说服和影响他人的能力', 7],
        [1, '冲突管理', 'CONFLICT_MANAGEMENT', 0, '有效处理人际冲突的能力', 8],
        
        // 个人效能维度
        [1, '成就导向', 'ACHIEVEMENT_ORIENTATION', 0, '追求卓越和达成目标的内在动力', 9],
        [1, '抗压能力', 'RESILIENCE', 0, '在压力下保持高效工作的能力', 10],
        [1, '学习能力', 'LEARNING_AGILITY', 0, '快速学习和应用新知识的能力', 11],
        [1, '创新思维', 'INNOVATIVE_THINKING', 0, '产生新想法和解决方案的能力', 12],
        
        // 业务思维维度
        [1, '客户导向', 'CUSTOMER_FOCUS', 0, '关注客户需求和满意度的能力', 13],
        [1, '商业敏锐度', 'BUSINESS_ACUMEN', 0, '理解和把握商业机会的能力', 14],
        [1, '变革管理', 'CHANGE_MANAGEMENT', 0, '推动和实施组织变革的能力', 15]
    ];
    
    ucfDimensions.forEach(dim => {
        db.run(`INSERT OR IGNORE INTO competency_dimensions 
                (model_id, dimension_name, dimension_code, parent_id, description, sort_order) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                dim, (err) => {
                    if (err && !err.message.includes('UNIQUE constraint failed')) {
                        console.error('插入维度失败:', err);
                    }
                });
    });
    
    // 4. 插入北森维度（部分示例）
    const beisenDimensions = [
        // 管理自我
        [2, '成就动机', 'ACHIEVEMENT_MOTIVATION', 0, '追求卓越的内在驱动力', 1],
        [2, '学习能力', 'LEARNING_ABILITY', 0, '快速掌握新知识和技能的能力', 2],
        [2, '创新能力', 'INNOVATION', 0, '提出创新性想法和解决方案的能力', 3],
        [2, '抗压能力', 'STRESS_TOLERANCE', 0, '在压力下保持高效的能力', 4],
        
        // 管理他人
        [2, '沟通能力', 'COMMUNICATION_SKILL', 0, '有效传递信息的能力', 5],
        [2, '团队合作', 'TEAM_COLLABORATION', 0, '促进团队协作的能力', 6],
        [2, '领导力', 'LEADERSHIP_SKILL', 0, '引领团队达成目标的能力', 7],
        [2, '人才培养', 'TALENT_DEVELOPMENT', 0, '培养和发掘人才的能力', 8],
        
        // 管理业务
        [2, '战略思维', 'STRATEGIC_THINKING', 0, '思考和规划战略的能力', 9],
        [2, '决策能力', 'DECISION_MAKING', 0, '做出明智决策的能力', 10],
        [2, '执行力', 'EXECUTION', 0, '推动工作落地的能力', 11],
        [2, '客户导向', 'CUSTOMER_ORIENTATION', 0, '以客户需求为中心的能力', 12]
    ];
    
    beisenDimensions.forEach(dim => {
        db.run(`INSERT OR IGNORE INTO competency_dimensions 
                (model_id, dimension_name, dimension_code, parent_id, description, sort_order) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                dim, (err) => {
                    if (err && !err.message.includes('UNIQUE constraint failed')) {
                        console.error('插入维度失败:', err);
                    }
                });
    });
    
    // 5. 插入专业测评量表
    const scales = [
        ['大五人格测评', 'BIG_FIVE', 'PERSONALITY', '基于大五人格理论的性格测评，评估32个细分维度', 60, 20, 'LIKERT', 0.85, 0.80],
        ['MBTI职业性格测评', 'MBTI', 'PERSONALITY', 'MBTI职业性格类型测评，评估4个维度8个偏好', 93, 25, 'FORCED_CHOICE', 0.80, 0.75],
        ['DISC行为风格测评', 'DISC', 'PERSONALITY', 'DISC行为风格测评，评估4种行为风格', 24, 15, 'LIKERT', 0.82, 0.78],
        ['霍兰德职业兴趣测评', 'HOLLAND', 'INTEREST', '霍兰德职业兴趣测评，评估6种职业兴趣类型', 60, 20, 'LIKERT', 0.83, 0.77],
        ['情商（EQ）测评', 'EQ', 'ABILITY', '情商测评，评估情绪感知、理解、调节和运用能力', 33, 15, 'LIKERT', 0.81, 0.76],
        ['工作动机测评', 'MOTIVATION', 'MOTIVATION', '工作动机与激励因素测评', 20, 10, 'LIKERT', 0.79, 0.74],
        ['工作价值观测评', 'VALUES', 'VALUES', '工作价值观测评，评估职业价值观匹配度', 21, 10, 'LIKERT', 0.78, 0.73],
        ['认知能力测评', 'COGNITIVE', 'ABILITY', '数字推理、言语推理、逻辑推理综合能力测评', 45, 30, 'MULTIPLE', 0.87, 0.82],
        ['组织氛围测评', 'CLIMATE', 'ORGANIZATION', '评估组织氛围和文化的测评', 30, 15, 'LIKERT', 0.84, 0.79],
        ['管理风格测评', 'MANAGEMENT_STYLE', 'PERSONALITY', '评估管理风格和领导类型的测评', 40, 20, 'LIKERT', 0.81, 0.76]
    ];
    
    scales.forEach(scale => {
        db.run(`INSERT OR IGNORE INTO assessment_scales 
                (scale_name, scale_code, scale_type, description, question_count, estimated_time, scoring_method, reliability, validity) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                scale, (err) => {
                    if (err && !err.message.includes('UNIQUE constraint failed')) {
                        console.error('插入量表失败:', err);
                    }
                });
    });
    
    // 6. 为大五人格量表插入题目（示例10题）
    const bigFiveQuestions = [
        [1, '我经常会感到担忧或焦虑', 'SINGLE', 1, 0, 1],
        [1, '我喜欢与人交往，乐于参加社交活动', 'SINGLE', 2, 0, 2],
        [1, '我对新事物和新想法持开放态度', 'SINGLE', 3, 0, 3],
        [1, '我乐于助人，关心他人的感受', 'SINGLE', 4, 0, 4],
        [1, '我做事有条理，善于规划', 'SINGLE', 5, 0, 5],
        [1, '我情绪稳定，不容易感到压力', 'SINGLE', 1, 1, 6],  // 反向计分
        [1, '我喜欢独处，不太喜欢社交', 'SINGLE', 2, 1, 7],  // 反向计分
        [1, '我不太喜欢尝试新鲜事物', 'SINGLE', 3, 1, 8],  // 反向计分
        [1, '我有时会怀疑他人的动机', 'SINGLE', 4, 1, 9],  // 反向计分
        [1, '我有时会拖延或缺乏自律', 'SINGLE', 5, 1, 10]  // 反向计分
    ];
    
    bigFiveQuestions.forEach(q => {
        db.run(`INSERT OR IGNORE INTO scale_questions 
                (scale_id, question_text, question_type, dimension_id, reverse_scoring, sort_order) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                q, (err) => {
                    if (err && !err.message.includes('UNIQUE constraint failed')) {
                        console.error('插入题目失败:', err);
                    }
                });
    });
    
    // 7. 为题目插入选项（Likert 5点量表）
    db.all("SELECT id FROM scale_questions WHERE scale_id = 1", (err, questions) => {
        if (err) {
            console.error('查询题目失败:', err);
            return;
        }
        
        const options = [
            [1, '完全不符合', 1],
            [2, '不太符合', 2],
            [3, '不确定', 3],
            [4, '比较符合', 4],
            [5, '完全符合', 5]
        ];
        
        questions.forEach(q => {
            options.forEach(opt => {
                db.run(`INSERT OR IGNORE INTO question_options 
                        (question_id, option_text, option_value, sort_order) 
                        VALUES (?, ?, ?, ?)`,
                        [q.id, opt[1], opt[2], opt[0]], (err) => {
                            if (err && !err.message.includes('UNIQUE constraint failed')) {
                                // 忽略错误
                            }
                        });
            });
        });
        
        console.log('✅ 大五人格题目和选项已插入');
    });
    
    // 8. 插入报告模板
    const reportTemplates = [
        ['个人测评报告', 'INDIVIDUAL', '个人测评综合报告，包含各维度得分、分析和建议', '{"sections": ["summary", "dimensions", "charts", "recommendations"]}'],
        ['团队对比报告', 'TEAM', '团队人才测评对比报告', '{"sections": ["overview", "comparison", "charts"]}'],
        ['岗位匹配报告', 'MATCH', '个人-岗位匹配度分析报告', '{"sections": ["match_score", "gap_analysis", "recommendations"]}'],
        ['360评估反馈报告', '360', '360度评估反馈报告', '{"sections": ["self_assessment", "others_feedback", "comparison", "development_areas"]}']
    ];
    
    reportTemplates.forEach(template => {
        db.run(`INSERT OR IGNORE INTO report_templates 
                (template_name, template_type, description, template_structure) 
                VALUES (?, ?, ?, ?)`,
                template, (err) => {
                    if (err && !err.message.includes('UNIQUE constraint failed')) {
                        console.error('插入报告模板失败:', err);
                    }
                });
    });
    
    console.log('✅ 初始数据插入完成');
});

// 延迟关闭数据库，确保所有插入完成
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('关闭数据库失败:', err);
        } else {
            console.log('✅ 数据库已关闭');
            console.log('\n===== 数据初始化完成 =====');
        }
    });
}, 2000);
