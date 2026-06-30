const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, 'talent_assessment.db'));

// 获取测评答题页面数据
router.get('/assessment-form/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    
    // 获取任务信息
    db.get(`
        SELECT t.*, p.project_name, p.project_type, tt.tool_name, tt.tool_type, tt.description as tool_description
        FROM assessment_tasks t
        JOIN assessment_projects p ON t.project_id = p.id
        JOIN assessment_tools tt ON t.tool_id = tt.id
        WHERE t.id = ?
    `, [taskId], (err, task) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }
        
        if (!task) {
            return res.status(404).json({ success: false, message: '任务不存在' });
        }
        
        // 获取测评工具的题目
        // 这里根据tool_type返回不同的题目
        const questions = generateQuestions(task.tool_type, task.tool_name);
        
        res.json({
            success: true,
            task: task,
            questions: questions
        });
    });
});

// 提交测评答案
router.post('/submit-assessment/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const { answers, timeSpent } = req.body;
    
    // 获取任务信息
    db.get('SELECT * FROM assessment_tasks WHERE id = ?', [taskId], (err, task) => {
        if (err || !task) {
            return res.status(404).json({ success: false, message: '任务不存在' });
        }
        
        // 计算得分
        const scores = calculateScores(task.tool_id, answers);
        
        // 更新任务状态
        db.run(`
            UPDATE assessment_tasks 
            SET status = 2, completed_at = datetime('now'), answers = ?, scores = ?, time_spent = ?
            WHERE id = ?
        `, [JSON.stringify(answers), JSON.stringify(scores), timeSpent, taskId], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: '提交失败' });
            }
            
            // 生成报告
            generateReport(taskId, task, scores);
            
            res.json({
                success: true,
                message: '测评提交成功',
                scores: scores
            });
        });
    });
});

// 获取我的测评任务（员工端）
router.get('/my-tasks/:userId', (req, res) => {
    const userId = req.params.userId;
    
    db.all(`
        SELECT t.*, p.project_name, tt.tool_name, tt.tool_type
        FROM assessment_tasks t
        JOIN assessment_projects p ON t.project_id = p.id
        JOIN assessment_tools tt ON t.tool_id = tt.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
    `, [userId], (err, tasks) => {
        if (err) {
            return res.status(500).json({ success: false, message: '数据库错误' });
        }
        
        res.json({ success: true, tasks: tasks });
    });
});

// 生成题目（根据测评工具类型）
function generateQuestions(toolType, toolName) {
    const questionBank = {
        'PERSONALITY': [
            { id: 1, question: '我善于与他人建立良好关系', dimension: '外向性', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 2, question: '我喜欢与他人合作完成任务', dimension: '宜人性', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 3, question: '我做事有条理，有计划', dimension: '尽责性', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 4, question: '我容易感到焦虑或担心', dimension: '神经质', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 5, question: '我对新事物充满好奇心', dimension: '开放性', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 6, question: '我在社交场合感到自在', dimension: '外向性', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 7, question: '我愿意帮助有困难的同事', dimension: '宜人性', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 8, question: '我能够按时完成工作任务', dimension: '尽责性', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 9, question: '我情绪稳定，不易波动', dimension: '神经质', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 10, question: '我喜欢思考抽象问题', dimension: '开放性', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]}
        ],
        'INTEREST': [
            { id: 1, question: '我喜欢实际操作机器或工具', dimension: '现实型', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 2, question: '我喜欢研究科学问题', dimension: '研究型', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 3, question: '我喜欢创作艺术作品', dimension: '艺术型', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 4, question: '我喜欢帮助他人解决问题', dimension: '社会型', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 5, question: '我喜欢影响或领导他人', dimension: '企业型', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]},
            { id: 6, question: '我喜欢按照规则和程序工作', dimension: '常规型', options: [
                { value: 1, label: '非常不符合' },
                { value: 2, label: '不太符合' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较符合' },
                { value: 5, label: '非常符合' }
            ]}
        ],
        'MOTIVATION': [
            { id: 1, question: '我希望我的工作能够带来高收入', dimension: '薪酬回报', options: [
                { value: 1, label: '非常不重要' },
                { value: 2, label: '不太重要' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较重要' },
                { value: 5, label: '非常重要' }
            ]},
            { id: 2, question: '我希望我的工作有晋升机会', dimension: '职业发展', options: [
                { value: 1, label: '非常不重要' },
                { value: 2, label: '不太重要' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较重要' },
                { value: 5, label: '非常重要' }
            ]},
            { id: 3, question: '我希望我的工作有意义和价值', dimension: '工作意义', options: [
                { value: 1, label: '非常不重要' },
                { value: 2, label: '不太重要' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较重要' },
                { value: 5, label: '非常重要' }
            ]},
            { id: 4, question: '我希望我的工作有自主性', dimension: '工作自主', options: [
                { value: 1, label: '非常不重要' },
                { value: 2, label: '不太重要' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较重要' },
                { value: 5, label: '非常重要' }
            ]},
            { id: 5, question: '我希望我的工作环境舒适', dimension: '工作环境', options: [
                { value: 1, label: '非常不重要' },
                { value: 2, label: '不太重要' },
                { value: 3, label: '一般' },
                { value: 4, label: '比较重要' },
                { value: 5, label: '非常重要' }
            ]}
        ],
        // MBTI职业性格测试
        'MBTI': [
            { id: 1, question: '在社交场合中，您通常：', dimension: '外向-内向', options: [
                { value: 1, label: '主动与陌生人交谈' },
                { value: 2, label: '等待别人主动交谈' }
            ]},
            { id: 2, question: '周末您更喜欢：', dimension: '外向-内向', options: [
                { value: 1, label: '参加聚会或外出活动' },
                { value: 2, label: '在家休息或做自己喜欢的事' }
            ]},
            { id: 3, question: '您更注重：', dimension: '感觉-直觉', options: [
                { value: 1, label: '具体的事实和细节' },
                { value: 2, label: '整体的模式和可能性' }
            ]},
            { id: 4, question: '在做决策时，您通常：', dimension: '思考-情感', options: [
                { value: 1, label: '依据逻辑和客观分析' },
                { value: 2, label: '考虑人际关系和情感因素' }
            ]},
            { id: 5, question: '您更喜欢：', dimension: '判断-知觉', options: [
                { value: 1, label: '提前制定详细的计划' },
                { value: 2, label: '保持开放，顺其自然' }
            ]},
            { id: 6, question: '您更倾向于：', dimension: '外向-内向', options: [
                { value: 1, label: '通过与人交流来充电' },
                { value: 2, label: '通过独处来恢复精力' }
            ]},
            { id: 7, question: '在解决问题时，您通常：', dimension: '感觉-直觉', options: [
                { value: 1, label: '依靠经验和已知方法' },
                { value: 2, label: '寻找新的和创新的方法' }
            ]},
            { id: 8, question: '当朋友遇到问题时，您通常：', dimension: '思考-情感', options: [
                { value: 1, label: '提供理性的建议和解决方案' },
                { value: 2, label: '提供情感支持和理解' }
            ]}
        ],
        // DISC行为风格测评
        'BEHAVIOR': [
            { id: 1, question: '在工作中，您通常：', dimension: '支配型', options: [
                { value: 1, label: '主动承担责任和挑战' },
                { value: 2, label: '等待被分配任务' }
            ]},
            { id: 2, question: '在团队中，您通常：', dimension: '影响型', options: [
                { value: 1, label: '活跃气氛，带动大家' },
                { value: 2, label: '安静观察，适时发言' }
            ]},
            { id: 3, question: '面对变化时，您通常：', dimension: '稳健型', options: [
                { value: 1, label: '适应变化，灵活调整' },
                { value: 2, label: '偏好稳定，慢慢适应' }
            ]},
            { id: 4, question: '您对待工作的态度：', dimension: '服从型', options: [
                { value: 1, label: '注重细节，追求完美' },
                { value: 2, label: '关注大局，快速推进' }
            ]},
            { id: 5, question: '面对竞争时，您通常：', dimension: '支配型', options: [
                { value: 1, label: '积极争取胜利' },
                { value: 2, label: '保持合作，避免过度竞争' }
            ]},
            { id: 6, question: '您更喜欢的工作环境：', dimension: '影响型', options: [
                { value: 1, label: '开放、社交、充满活力' },
                { value: 2, label: '安静、独立、有序' }
            ]}
        ],
        // 情商测试
        'EMOTIONAL': [
            { id: 1, question: '您能准确识别自己当前的情绪状态吗？', dimension: '自我意识', options: [
                { value: 1, label: '总是能' },
                { value: 2, label: '偶尔能' },
                { value: 3, label: '很少能' },
                { value: 4, label: '不能' }
            ]},
            { id: 2, question: '当感到愤怒时，您通常：', dimension: '自我管理', options: [
                { value: 1, label: '能很快冷静下来' },
                { value: 2, label: '需要很长时间才能平复' },
                { value: 3, label: '容易发泄出来' }
            ]},
            { id: 3, question: '您能敏锐察觉他人的情绪变化吗？', dimension: '社交意识', options: [
                { value: 1, label: '总是能' },
                { value: 2, label: '偶尔能' },
                { value: 3, label: '很少能' }
            ]},
            { id: 4, question: '您擅长处理人际冲突吗？', dimension: '关系管理', options: [
                { value: 1, label: '非常擅长' },
                { value: 2, label: '比较擅长' },
                { value: 3, label: '不太擅长' }
            ]},
            { id: 5, question: '面对压力时，您通常：', dimension: '自我管理', options: [
                { value: 1, label: '能有效管理压力' },
                { value: 2, label: '容易被压力压垮' },
                { value: 3, label: '寻求他人帮助' }
            ]}
        ],
        // 职业锚测试
        'CAREER': [
            { id: 1, question: '您更喜欢：', dimension: '技术/职能型', options: [
                { value: 1, label: '在特定专业领域深耕' },
                { value: 2, label: '从事管理岗位' }
            ]},
            { id: 2, question: '您更看重：', dimension: '自主/独立型', options: [
                { value: 1, label: '工作的自主性和灵活性' },
                { value: 2, label: '工作的稳定性和保障' }
            ]},
            { id: 3, question: '当选择工作时，您最看重：', dimension: '技术/职能型', options: [
                { value: 1, label: '专业成长和技术提升' },
                { value: 2, label: '薪资和福利' }
            ]},
            { id: 4, question: '您认为自己的优势在于：', dimension: '管理型', options: [
                { value: 1, label: '专业知识和技术能力' },
                { value: 2, label: '领导力和影响力' }
            ]}
        ],
        // 组织文化测评
        'ORGANIZATION': [
            { id: 1, question: '您所在的公司鼓励创新和新想法吗？', dimension: '创新', options: [
                { value: 1, label: '非常鼓励' },
                { value: 2, label: '不太鼓励' },
                { value: 3, label: '不鼓励' }
            ]},
            { id: 2, question: '您所在的公司注重流程和秩序吗？', dimension: '稳定性', options: [
                { value: 1, label: '非常注重' },
                { value: 2, label: '相对灵活' },
                { value: 3, label: '不注重' }
            ]},
            { id: 3, question: '您所在的公司尊重员工和人文关怀吗？', dimension: '尊重员工', options: [
                { value: 1, label: '非常尊重' },
                { value: 2, label: '不太关注' },
                { value: 3, label: '不尊重' }
            ]},
            { id: 4, question: '您所在的公司注重结果和绩效吗？', dimension: '结果导向', options: [
                { value: 1, label: '非常注重' },
                { value: 2, label: '更注重过程' },
                { value: 3, label: '不注重' }
            ]},
            { id: 5, question: '您所在的公司注重团队合作吗？', dimension: '团队导向', options: [
                { value: 1, label: '非常注重' },
                { value: 2, label: '更注重个人表现' },
                { value: 3, label: '不注重' }
            ]}
        ]
    };
    
    return questionBank[toolType] || questionBank['PERSONALITY'];
}

// 计算得分
function calculateScores(toolId, answers) {
    const scores = {};
    const dimensionScores = {};
    
    // 统计各维度的得分
    answers.forEach(answer => {
        const dimension = answer.dimension;
        if (!dimensionScores[dimension]) {
            dimensionScores[dimension] = { total: 0, count: 0 };
        }
        dimensionScores[dimension].total += answer.value;
        dimensionScores[dimension].count += 1;
    });
    
    // 计算平均分
    for (const dimension in dimensionScores) {
        scores[dimension] = dimensionScores[dimension].total / dimensionScores[dimension].count;
    }
    
    return scores;
}

// 生成报告
function generateReport(taskId, task, scores) {
    const db = new sqlite3.Database(path.join(__dirname, 'talent_assessment.db'));
    
    // 根据测评工具类型生成不同的报告
    let reportContent = {};
    
    if (task.tool_type === 'MBTI') {
        reportContent = generateMbtiReport(scores);
    } else if (task.tool_type === 'BEHAVIOR') {
        reportContent = generateDiscReport(scores);
    } else if (task.tool_type === 'EMOTIONAL') {
        reportContent = generateEqReport(scores);
    } else if (task.tool_type === 'CAREER') {
        reportContent = generateCareerReport(scores);
    } else if (task.tool_type === 'ORGANIZATION') {
        reportContent = generateCultureReport(scores);
    } else {
        reportContent = generateGenericReport(scores);
    }
    
    // 保存报告到数据库
    db.run(`
        INSERT INTO assessment_reports (task_id, user_id, project_id, report_type, title, content, scores, created_at)
        VALUES (?, ?, ?, 'individual', ?, ?, ?, datetime('now'))
    `, [taskId, task.user_id, task.project_id, 
        `${task.tool_name}测评报告 - ${new Date().toLocaleDateString()}`,
        JSON.stringify(reportContent),
        JSON.stringify(scores)
    ], (err) => {
        if (err) {
            console.error('生成报告失败:', err);
        }
    });
    
    db.close();
}

// 生成MBTI报告
function generateMbtiReport(scores) {
    const dimensions = {
        '外向-内向': scores['外向-内向'] || 1,
        '感觉-直觉': scores['感觉-直觉'] || 1,
        '思考-情感': scores['思考-情感'] || 1,
        '判断-知觉': scores['判断-知觉'] || 1
    };
    
    // 确定MBTI类型
    const type = 
        (dimensions['外向-内向'] >= 1.5 ? 'E' : 'I') +
        (dimensions['感觉-直觉'] >= 1.5 ? 'S' : 'N') +
        (dimensions['思考-情感'] >= 1.5 ? 'T' : 'F') +
        (dimensions['判断-知觉'] >= 1.5 ? 'J' : 'P');
    
    const typeDescriptions = {
        'ISTJ': '检查员型 - 务实、负责、有序',
        'ISFJ': '保护者型 - 温暖、负责、关怀',
        'INFJ': '倡导者型 - 理想主义、有洞察力',
        'INTJ': '战略家型 - 独立、有远见、理性',
        'ISTP': '工匠型 - 冷静、分析、灵活',
        'ISFP': '艺术家型 - 敏感、温和、体贴',
        'INFP': '调停者型 - 理想主义、忠诚、好奇',
        'INTP': '逻辑学家型 - 灵活、创新、聪明',
        'ESTP': '企业家型 - 聪明、精力充沛、感知力强',
        'ESFP': '表演者型 - 自发、精力充沛、热情',
        'ENFP': '竞选者型 - 热情、创意、善于社交',
        'ENTP': '辩论家型 - 聪明、好奇、思维敏捷',
        'ESTJ': '总经理型 - 有条理、务实、传统',
        'ESFJ': '执政官型 - 关心他人、社交、受欢迎',
        'ENFJ': '主人公型 - 有魅力、富有同情心、有责任感',
        'ENTJ': '指挥官型 - 天生领导者、战略思维、果断'
    };
    
    return {
        summary: `您的MBTI性格类型是: ${type}`,
        type: type,
        typeDescription: typeDescriptions[type] || '未知类型',
        dimensions: dimensions,
        strengths: generateMbtiStrengths(type),
        suggestions: generateMbtiSuggestions(type),
        careerSuggestions: generateMbtiCareerSuggestions(type)
    };
}

function generateMbtiStrengths(type) {
    const strengthsMap = {
        'ISTJ': ['务实可靠', '有条理', '负责任'],
        'ENFP': ['热情创意', '善于社交', '乐观积极'],
        // 其他类型...
    };
    return strengthsMap[type] || ['需要更多数据'];
}

function generateMbtiSuggestions(type) {
    return ['建议在团队中发挥性格优势', '注意性格盲点，寻求互补的合作伙伴'];
}

function generateMbtiCareerSuggestions(type) {
    const careerMap = {
        'ISTJ': ['会计师', '律师', '管理员'],
        'ENFP': ['记者', '咨询师', '创意总监'],
        // 其他类型...
    };
    return careerMap[type] || ['多种职业选择'];
}

// 生成DISC报告
function generateDiscReport(scores) {
    const dimensions = {
        '支配型': scores['支配型'] || 1,
        '影响型': scores['影响型'] || 1,
        '稳健型': scores['稳健型'] || 1,
        '服从型': scores['服从型'] || 1
    };
    
    // 确定主导风格
    let dominantStyle = '支配型';
    let maxScore = 0;
    for (const dim in dimensions) {
        if (dimensions[dim] > maxScore) {
            maxScore = dimensions[dim];
            dominantStyle = dim;
        }
    }
    
    return {
        summary: `您的主导行为风格是: ${dominantStyle}`,
        dominantStyle: dominantStyle,
        dimensions: dimensions,
        characteristics: getDiscCharacteristics(dominantStyle),
        strengths: getDiscStrengths(dominantStyle),
        suggestions: getDiscSuggestions(dominantStyle)
    };
}

function getDiscCharacteristics(style) {
    const charMap = {
        '支配型': ['结果导向', '直接果断', '喜欢挑战'],
        '影响型': ['热情开朗', '善于社交', '乐观积极'],
        '稳健型': ['耐心稳重', '团队合作', '善于倾听'],
        '服从型': ['注重细节', '追求完美', '遵守规则']
    };
    return charMap[style] || [];
}

function getDiscStrengths(style) {
    const strengthMap = {
        '支配型': ['领导力', '决策力', '执行力'],
        '影响型': ['沟通力', '影响力', '感染力'],
        '稳健型': ['协作力', '耐心', '可靠性'],
        '服从型': ['分析力', '准确性', '系统性']
    };
    return strengthMap[style] || [];
}

function getDiscSuggestions(style) {
    return [`在团队中发挥${style}优势`, '学习其他风格的长处，提升行为灵活性'];
}

// 生成情商报告
function generateEqReport(scores) {
    const dimensions = {
        '自我意识': scores['自我意识'] || 1,
        '自我管理': scores['自我管理'] || 1,
        '社交意识': scores['社交意识'] || 1,
        '关系管理': scores['关系管理'] || 1
    };
    
    const avgScore = Object.values(dimensions).reduce((a, b) => a + b, 0) / 4;
    
    return {
        summary: `您的情商得分: ${avgScore.toFixed(1)}/4`,
        overallScore: avgScore,
        dimensions: dimensions,
        level: avgScore >= 3 ? '高情商' : avgScore >= 2 ? '中等情商' : '需要提升',
        strengths: Object.keys(dimensions).filter(d => dimensions[d] >= 2.5),
        suggestions: Object.keys(dimensions).filter(d => dimensions[d] < 2).map(d => `提升${d}能力`)
    };
}

// 生成职业锚报告
function generateCareerReport(scores) {
    const dimensions = scores;
    let dominantAnchor = '技术/职能型';
    let maxScore = 0;
    for (const dim in dimensions) {
        if (dimensions[dim] > maxScore) {
            maxScore = dimensions[dim];
            dominantAnchor = dim;
        }
    }
    
    return {
        summary: `您的主导职业锚是: ${dominantAnchor}`,
        dominantAnchor: dominantAnchor,
        dimensions: dimensions,
        description: getCareerAnchorDescription(dominantAnchor),
        suggestions: ['在职业发展中发挥职业锚优势', '寻求与职业锚匹配的工作机会']
    };
}

function getCareerAnchorDescription(anchor) {
    const descMap = {
        '技术/职能型': '您偏好在特定专业领域深耕，追求专业技能的提升',
        '管理型': '您偏好管理和领导他人，追求更大的责任和影响力',
        '自主/独立型': '您偏好自主工作和独立决策，追求工作的灵活性和自主性',
        '安全/稳定型': '您偏好稳定和安全的工作环境，追求长期的职业保障'
    };
    return descMap[anchor] || '';
}

// 生成组织文化报告
function generateCultureReport(scores) {
    const dimensions = scores;
    const avgScore = Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length;
    
    return {
        summary: `您对组织文化的评价得分: ${avgScore.toFixed(1)}/3`,
        overallScore: avgScore,
        dimensions: dimensions,
        cultureType: avgScore >= 2.5 ? '创新型文化' : avgScore >= 1.5 ? '平衡型文化' : '传统型文化',
        suggestions: ['与组织文化匹配度高的员工绩效更好', '如不匹配，考虑调整或寻求文化变革']
    };
}

// 生成通用报告
function generateGenericReport(scores) {
    const dimensions = scores;
    const avgScore = Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length;
    
    return {
        summary: `测评得分: ${avgScore.toFixed(1)}`,
        overallScore: avgScore,
        dimensions: dimensions,
        strengths: Object.keys(dimensions).filter(d => dimensions[d] >= 4),
        weaknesses: Object.keys(dimensions).filter(d => dimensions[d] <= 2.5),
        suggestions: ['基于测评结果制定个人发展计划', '定期重新测评，跟踪发展进度']
    };
}

module.exports = router;
