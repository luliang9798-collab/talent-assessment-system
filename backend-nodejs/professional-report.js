/**
 * 专业测评报告生成模块 - SHL/北森级别
 * 包含深度分析、常模参照、行为指标、发展建议
 */

function getProfessionalReport(toolId, answers, userInfo) {
    const generators = {
        1: generateProfessionalBigFive,
        2: generateProfessionalMBTI,
        3: generateProfessionalDISC,
        4: generateProfessionalHolland,
        5: generateProfessionalEQ,
        6: generateProfessionalMotivation,
        7: generateProfessionalValues
    };
    return generators[toolId] ? generators[toolId](answers, userInfo) : null;
}

// ==================== 常模数据（中国职场样本） ====================
const NORMS = {
    bigfive: { mean: 3.2, sd: 0.6, percentiles: { 90: 4.1, 75: 3.7, 50: 3.2, 25: 2.7, 10: 2.3 } },
    mbti: null, // MBTI是类型论，不用常模
    disc: { D: { mean: 3.1, sd: 0.7 }, I: { mean: 3.3, sd: 0.6 }, S: { mean: 3.2, sd: 0.6 }, C: { mean: 3.0, sd: 0.7 } },
    holland: { mean: 3.2, sd: 0.6 },
    eq: { mean: 3.3, sd: 0.6, levels: { excellent: 4.2, good: 3.5, average: 2.8, low: 2.3 } }
};

// 计算百分位
function calcPercentile(score, mean, sd) {
    // 简化版百分位计算（基于正态分布近似）
    const z = (score - mean) / sd;
    if (z >= 2) return 98;
    if (z >= 1.5) return 93;
    if (z >= 1) return 84;
    if (z >= 0.5) return 69;
    if (z >= 0) return 50;
    if (z >= -0.5) return 31;
    if (z >= -1) return 16;
    if (z >= -1.5) return 7;
    return 2;
}

// ==================== 1. 大五人格（OCEAN）专业报告 ====================
function generateProfessionalBigFive(answers, userInfo) {
    const dimensions = ['开放性', '尽责性', '外向性', '宜人性', '情绪稳定性'];
    const scores = { '开放性': 0, '尽责性': 0, '外向性': 0, '宜人性': 0, '情绪稳定性': 0 };
    const counts = { '开放性': 0, '尽责性': 0, '外向性': 0, '宜人性': 0, '情绪稳定性': 0 };
    
    answers.forEach(a => {
        const dim = a.dimension || '开放性';
        const val = a.answer || 0;
        if (scores[dim] !== undefined) { scores[dim] += val; counts[dim]++; }
    });
    
    const avg = {};
    const percentiles = {};
    for (const dim of dimensions) {
        avg[dim] = counts[dim] > 0 ? Math.round(scores[dim] / counts[dim] * 10) / 10 : 3;
        percentiles[dim] = calcPercentile(avg[dim], NORMS.bigfive.mean, NORMS.bigfive.sd);
    }
    
    const overallScore = Math.round(Object.values(avg).reduce((a, b) => a + b, 0) / 5 * 10) / 10;
    const sorted = Object.entries(avg).sort((a, b) => b[1] - a[1]);
    const maxDim = sorted[0];
    const minDim = sorted[sorted.length - 1];
    
    // 高分低分判断
    const highDims = Object.entries(avg).filter(([k, v]) => v >= 3.8).map(([k]) => k);
    const lowDims = Object.entries(avg).filter(([k, v]) => v < 2.5).map(([k]) => k);
    
    // 专业摘要（SHL风格）
    const summary = `【测评概要】本次大五人格测评基于OCEAN模型，从五个核心人格维度对受测者进行全面评估。受测者在五个维度上的平均得分为${overallScore}分（满分5分），整体处于${overallScore >= 3.5 ? '较高' : overallScore >= 2.8 ? '中等偏上' : '中等'}水平。\n\n【维度特征】得分最高的维度为「${maxDim[0]}」(${maxDim[1]}分，高于${percentiles[maxDim[0]]}%的职场人群)，${getBigFiveDimInterpretation(maxDim[0], maxDim[1], 'high')}。得分相对较低的维度为「${minDim[0]}」(${minDim[1]}分，高于${percentiles[minDim[0]]}%的职场人群)，${getBigFiveDimInterpretation(minDim[0], minDim[1], 'low')}。\n\n【综合画像】${getBigFiveCompositeProfile(avg)}`;

    // 各维度深度解读
    const dimensionAnalysis = {
        '开放性': {
            score: avg['开放性'],
            percentile: percentiles['开放性'],
            interpretation: getBigFiveOpennessDetail(avg['开放性']),
            behaviors: getBigFiveOpennessBehaviors(avg['开放性']),
            workplace: getBigFiveOpennessWorkplace(avg['开放性'])
        },
        '尽责性': {
            score: avg['尽责性'],
            percentile: percentiles['尽责性'],
            interpretation: getBigFiveConscientiousnessDetail(avg['尽责性']),
            behaviors: getBigFiveConscientiousnessBehaviors(avg['尽责性']),
            workplace: getBigFiveConscientiousnessWorkplace(avg['尽责性'])
        },
        '外向性': {
            score: avg['外向性'],
            percentile: percentiles['外向性'],
            interpretation: getBigFiveExtraversionDetail(avg['外向性']),
            behaviors: getBigFiveExtraversionBehaviors(avg['外向性']),
            workplace: getBigFiveExtraversionWorkplace(avg['外向性'])
        },
        '宜人性': {
            score: avg['宜人性'],
            percentile: percentiles['宜人性'],
            interpretation: getBigFiveAgreeablenessDetail(avg['宜人性']),
            behaviors: getBigFiveAgreeablenessBehaviors(avg['宜人性']),
            workplace: getBigFiveAgreeablenessWorkplace(avg['宜人性'])
        },
        '情绪稳定性': {
            score: avg['情绪稳定性'],
            percentile: percentiles['情绪稳定性'],
            interpretation: getBigFiveStabilityDetail(avg['情绪稳定性']),
            behaviors: getBigFiveStabilityBehaviors(avg['情绪稳定性']),
            workplace: getBigFiveStabilityWorkplace(avg['情绪稳定性'])
        }
    };
    
    // 专业优势分析
    const strengths = getProfessionalBigFiveStrengths(avg, percentiles);
    // 专业发展建议
    const developmentAreas = getProfessionalBigFiveDevelopments(avg, percentiles);
    // 团队角色
    const teamRole = getProfessionalBigFiveTeamRole(avg);
    // 领导力潜力
    const leadershipPotential = getProfessionalBigFiveLeadership(avg);
    // 面试要点
    const interviewGuide = getProfessionalBigFiveInterview(avg);
    // 90天发展计划
    const developmentPlan = getProfessionalBigFiveDevPlan(avg);
    
    return {
        toolName: '大五人格测评（OCEAN模型）',
        overallScore: overallScore,
        dimensions: avg,
        percentiles: percentiles,
        summary: summary,
        dimensionAnalysis: dimensionAnalysis,
        strengths: strengths,
        developmentAreas: developmentAreas,
        teamRole: teamRole,
        leadershipPotential: leadershipPotential,
        interviewGuide: interviewGuide,
        developmentPlan: developmentPlan,
        careerMatching: getProfessionalBigFiveCareer(avg),
        riskFactors: getProfessionalBigFiveRisks(avg)
    };
}

function getBigFiveDimInterpretation(dim, score, level) {
    const map = {
        '开放性': { high: '表现出较强的好奇心和创造力，乐于接受新观念和新方法', low: '更倾向于稳健和常规，偏好熟悉的工作方式' },
        '尽责性': { high: '表现出较强的自律性和责任感，能够有计划地完成任务', low: '工作方式较为灵活，但可能在细节把控上需要加强' },
        '外向性': { high: '在社交互动中获得能量，善于表达和影响他人', low: '更倾向于独立工作和深度思考，社交需求相对较低' },
        '宜人性': { high: '重视人际关系和谐，善于合作和妥协', low: '更倾向于客观分析，可能在直接反馈时显得较为强硬' },
        '情绪稳定性': { high: '情绪调节能力较强，在压力下能保持冷静', low: '情绪反应较为敏感，在高压环境下可能需要更多支持' }
    };
    return (map[dim] && map[dim][level]) || '';
}

function getBigFiveCompositeProfile(avg) {
    const o = avg['开放性'], c = avg['尽责性'], e = avg['外向性'], a = avg['宜人性'], s = avg['情绪稳定性'];
    let profile = '';
    if (c >= 3.5 && s >= 3.5) profile += '是一位可靠且情绪稳定的合作者';
    else if (c >= 3.5) profile += '工作尽责但在压力下可能需要更多支持';
    else if (s >= 3.5) profile += '情绪稳定但工作节奏可能需要更多结构';
    
    if (e >= 3.5 && o >= 3.5) profile += '，同时在社交和创新方面都表现活跃';
    else if (e >= 3.5) profile += '，善于社交但更偏好常规工作方式';
    else if (o >= 3.5) profile += '，富有创意但更倾向于独立工作环境';
    
    if (a >= 3.5) profile += '，注重团队合作和人际关系。';
    else profile += '，可能在任务推进中更偏向结果而非关系。';
    
    profile += `\n\n基于人格特征分析，该受测者${c >= 3.5 ? '适合需要高度责任心和执行力的岗位' : '适合需要灵活性和创造力的岗位'}${e >= 3.5 ? '，且在团队协作型环境中表现更佳' : '，且在独立工作型环境中表现更佳'}。`;
    return profile;
}

function getBigFiveOpennessDetail(score) {
    if (score >= 4.0) return `得分${score}分，属于高开放性人群（高于约${calcPercentile(score, 3.2, 0.6)}%的职场人群）。此类人群具有强烈的好奇心和创造力，乐于接受新观念、新方法，对艺术、文化和智力挑战有较高兴趣。在职场中表现出较强的适应性和创新能力。`;
    if (score >= 3.0) return `得分${score}分，属于中等偏高开放性人群。对新观念和方法持开放态度，但不排斥常规工作方式。在需要变化和创新时能够适应，同时也能够在稳定环境中有效工作。`;
    if (score >= 2.0) return `得分${score}分，属于中等偏稳健人群。更倾向于使用经过验证的方法和流程，对风险的接受度相对较低。在需要稳定性和可预测性的工作中表现更好。`;
    return `得分${score}分，属于偏保守人群。强烈偏好常规和熟悉的工作方式，对变化持谨慎态度。在结构化、稳定的工作环境中表现最佳。`;
}
function getBigFiveOpennessBehaviors(score) {
    if (score >= 3.5) return ['主动关注行业新趋势和新技术', '乐于尝试新的工作方法', '对跨学科知识有好奇心', '在头脑风暴中贡献多样化想法', '愿意挑战现有流程'];
    return ['偏好使用经过验证的方法', '在变更前需要充分了解理由', '更关注执行细节而非宏观方向', '对风险较高的创新持谨慎态度'];
}
function getBigFiveOpennessWorkplace(score) {
    if (score >= 3.5) return '适合需要创新和适应性的岗位，如产品研发、市场营销、战略规划等。在快速变化的环境中能充分发挥优势。';
    return '适合需要稳定性和专业深度的岗位，如财务审计、质量管理、运营执行等。在流程清晰的环境中表现更佳。';
}

function getBigFiveConscientiousnessDetail(score) {
    if (score >= 4.0) return `得分${score}分，属于高尽责性人群。表现出极强的自律性、责任感和目标导向。能够制定并坚持计划，注重细节和质量，是组织中值得信赖的执行者。此类人群在需要高精度和责任的工作中表现卓越。`;
    if (score >= 3.0) return `得分${score}分，具有良好自律性和责任感。能够按计划完成任务，注重工作质量，但在一定范围内也保持灵活性。`;
    if (score >= 2.0) return `得分${score}分，工作方式较为灵活。可能在高度结构化的环境中感到束缚，更适应自主性强的工作。`;
    return `得分${score}分，偏好灵活的工作方式。可能在高度规范的流程化工作中需要调整适应。`;
}
function getBigFiveConscientiousnessBehaviors(score) {
    if (score >= 3.5) return ['主动制定详细工作计划', '严格按时交付成果', '注重工作质量和准确性', '主动跟进任务进度', '对工作成果负责到底'];
    return ['在高度自主的环境中表现更好', '可能需要外部 deadline 来推进', '工作方式较为灵活', '更适应结果导向而非过程导向的环境'];
}
function getBigFiveConscientiousnessWorkplace(score) {
    if (score >= 3.5) return '极度适合需要高精度和责任的工作，如项目管理、财务控制、质量保证等。是组织中的可靠执行者。';
    return '适合需要创造性和灵活性的工作，但可能需要配合项目管理工具来确保任务完成。';
}

function getBigFiveExtraversionDetail(score) {
    if (score >= 4.0) return `得分${score}分，属于高外向性人群。在社交互动中获得能量，善于表达观点、影响他人，在团队中通常是活跃分子。此类人群在需要频繁社交和对外联系的岗位中表现卓越。`;
    if (score >= 3.0) return `得分${score}分，具有一定的外向特质。能够在社交场合中自如表现，但也需要一定的独处时间来恢复能量。`;
    if (score >= 2.0) return `得分${score}分，偏内向特质。在独处和深度工作中获得能量，社交活动后需要时间恢复。更擅长独立任务。`;
    return `得分${score}分，明显内向特质。强烈偏好独立工作和深度思考，在大型社交场合中可能感到不适。`;
}
function getBigFiveExtraversionBehaviors(score) {
    if (score >= 3.5) return ['主动在会议中发言', '乐于主持讨论和 presentation', '在团队讨论中推动进程', '善于建立人脉关系', '在社交场合中较为活跃'];
    return ['更倾向于书面沟通而非口头表达', '在小组讨论中更多倾听', '偏好一对一深度交流而非大型社交', '需要独处时间来恢复能量'];
}
function getBigFiveExtraversionWorkplace(score) {
    if (score >= 3.5) return '适合需要频繁社交和外部联系的岗位，如销售、市场、公关、业务拓展等。在团队导向的环境中表现更佳。';
    return '适合需要深度思考和独立工作的岗位，如研发、数据分析、内容创作等。在安静的环境中效率更高。';
}

function getBigFiveAgreeablenessDetail(score) {
    if (score >= 4.0) return `得分${score}分，属于高宜人性人群。高度重视人际关系和谐，善于合作、妥协和提供支持。信任他人，愿意帮助同事，在团队中通常是"粘合剂"。此类人群在需要高度协作的岗位中表现卓越。`;
    if (score >= 3.0) return `得分${score}分，具有较好的合作性。能够与他人有效协作，在团队中表现友好，但也会在必要时坚持自己的立场。`;
    if (score >= 2.0) return `得分${score}分，较为理性和独立。在决策中更多依赖逻辑分析而非人际考量，可能在直接反馈时显得较为强硬。`;
    return `得分${score}分，明显偏向任务导向。在决策中优先考虑效率和结果，可能在人际关系维护上投入较少。`;
}
function getBigFiveAgreeablenessBehaviors(score) {
    if (score >= 3.5) return ['主动帮助同事解决问题', '在冲突中倾向于调解', '善于倾听他人意见', '愿意为团队利益妥协', '建立并维护良好工作关系'];
    return ['在决策中更多依赖数据分析', '可能给出较为直接的反馈', '更关注任务完成而非关系维护', '在资源分配中倾向公平而非和谐'];
}
function getBigFiveAgreeablenessWorkplace(score) {
    if (score >= 3.5) return '适合需要高度协作的岗位，如HR、客户成功、团队合作型项目等。是团队中的关系维护者。';
    return '适合需要客观决策和独立工作的岗位，如质量管理、风险控制、技术分析等。在任务导向的环境中表现更佳。';
}

function getBigFiveStabilityDetail(score) {
    if (score >= 4.0) return `得分${score}分，情绪稳定性极高。在高压环境下仍能保持冷静和理性，情绪调节能力强，不易因挫折而气馁。此类人群在高压、高不确定性环境中表现卓越，是危机管理的理想人选。`;
    if (score >= 3.0) return `得分${score}分，具有较好的情绪稳定性。在大多数工作情境中能保持情绪平稳，面对一般压力能够有效应对。`;
    if (score >= 2.0) return `得分${score}分，情绪反应较为敏感。在面对压力时可能有较强情绪反应，需要更多支持来应对挑战。`;
    return `得分${score}分，情绪敏感性较高。在高压环境中可能需要更多心理支持和更清晰的工作指引。`;
}
function getBigFiveStabilityBehaviors(score) {
    if (score >= 3.5) return ['在紧急事件中保持冷静', '能够有效管理工作压力', '面对批评时能理性回应', '在不确定环境中保持稳定表现', '帮助团队稳定情绪'];
    return ['在面对高压时需要更多支持', '可能对负面反馈反应较为敏感', '在高度不确定的环境中需要更多指引', '可能需要更长的调整期来适应变化'];
}
function getBigFiveStabilityWorkplace(score) {
    if (score >= 3.5) return '适合高压、高不确定性的岗位，如危机管理、项目管理、销售目标管理等。在稳定情绪方面是团队的定心丸。';
    return '适合结构化、低风险的工作环境。在清晰的工作指引和合理的工作压力下表现更佳。';
}

// 专业优势
function getProfessionalBigFiveStrengths(avg, percentiles) {
    const strengths = [];
    if (avg['尽责性'] >= 3.5) strengths.push({ name: '高度责任心', desc: `尽责性得分${avg['尽责性']}分（高于${percentiles['尽责性']}%人群），能够制定并坚持计划，注重细节和质量，是组织中值得信赖的执行者。`, evidence: '在任务执行中表现出高度的自律性和责任感' });
    if (avg['情绪稳定性'] >= 3.5) strengths.push({ name: '情绪韧性', desc: `情绪稳定性得分${avg['情绪稳定性']}分（高于${percentiles['情绪稳定性']}%人群），在高压环境下能保持冷静，有效应对工作压力。`, evidence: '在紧急事件和压力情境中能保持理性判断' });
    if (avg['开放性'] >= 3.5) strengths.push({ name: '创新适应力', desc: `开放性得分${avg['开放性']}分（高于${percentiles['开放性']}%人群），乐于接受新观念和新方法，具有较强的创造力和适应能力。`, evidence: '对行业新趋势和跨学科知识保持好奇心' });
    if (avg['外向性'] >= 3.5) strengths.push({ name: '社交影响力', desc: `外向性得分${avg['外向性']}分（高于${percentiles['外向性']}%人群），善于表达观点、建立人脉，在团队协作和对外联系中具有优势。`, evidence: '在会议和讨论中能够积极推动进程' });
    if (avg['宜人性'] >= 3.5) strengths.push({ name: '协作能力', desc: `宜人性得分${avg['宜人性']}分（高于${percentiles['宜人性']}%人群），重视人际关系和谐，善于合作和提供支持，是团队中的关系维护者。`, evidence: '在冲突中倾向于调解，主动帮助同事' });
    return strengths;
}

// 专业发展领域
function getProfessionalBigFiveDevelopments(avg, percentiles) {
    const areas = [];
    if (avg['尽责性'] < 3.0) areas.push({ name: '计划性与执行力', priority: '高', desc: `尽责性得分${avg['尽责性']}分（高于${percentiles['尽责性']}%人群），在任务规划和执行细节上可能需要加强。建议：使用项目管理工具、制定每日任务清单、建立定期检查机制。`, action: '30天内开始使用任务管理工具，建立每日计划习惯' });
    if (avg['情绪稳定性'] < 3.0) areas.push({ name: '压力管理', priority: '高', desc: `情绪稳定性得分${avg['情绪稳定性']}分（高于${percentiles['情绪稳定性']}%人群），在面对高压时可能有较强情绪反应。建议：学习压力管理技巧、建立支持网络、在高压项目前做好心理准备。`, action: '参加压力管理工作坊，建立定期运动习惯' });
    if (avg['开放性'] < 3.0) areas.push({ name: '创新思维', priority: '中', desc: `开放性得分${avg['开放性']}分（高于${percentiles['开放性']}%人群），对变化和创新持相对谨慎态度。建议：主动关注行业趋势、参与创新工作坊、尝试新的工作方法。`, action: '每季度学习一项新技能或工具' });
    if (avg['外向性'] < 2.5 && avg['宜人性'] < 3.0) areas.push({ name: '人际关系建设', priority: '中', desc: '在社交和关系维护方面投入相对较少，可能影响团队协作效果。建议：主动安排一对一交流、参与团队活动、练习积极倾听。', action: '每周安排至少2次与同事的深度交流' });
    if (avg['宜人性'] < 2.5) areas.push({ name: '合作与沟通', priority: '中', desc: `宜人性得分较低，在决策中可能更多依赖逻辑而非人际考量，反馈方式可能显得较为直接。建议：练习换位思考、在反馈前先肯定对方、学习非暴力沟通。`, action: '在给出负面反馈前，先练习3种不同表达方式' });
    return areas;
}

// 团队角色（基于Belbin模型）
function getProfessionalBigFiveTeamRole(avg) {
    const c = avg['尽责性'], e = avg['外向性'], o = avg['开放性'], a = avg['宜人性'], s = avg['情绪稳定性'];
    let roles = [];
    if (e >= 3.5 && c >= 3.5) roles.push({ role: '协调者(Coordinator)', desc: '能够明确团队目标，分配任务，推动决策。适合担任项目负责人。' });
    if (c >= 3.5 && s >= 3.5) roles.push({ role: '执行者(Implementer)', desc: '注重细节和执行，能够将计划转化为实际行动。适合担任核心执行成员。' });
    if (o >= 3.5 && e >= 3.0) roles.push({ role: '创新者(Plant)', desc: '提供创造性想法和解决方案，善于打破常规。适合担任创意顾问。' });
    if (a >= 3.5 && s >= 3.0) roles.push({ role: '凝聚者(Team Worker)', desc: '维护团队和谐，善于化解冲突，提供支持。适合担任团队协调员。' });
    if (c >= 3.5 && avg['开放性'] < 3.0) roles.push({ role: '监督者(Monitor Evaluator)', desc: '善于逻辑分析和风险评估，能够发现计划中的漏洞。适合担任质量控制角色。' });
    if (e >= 3.5 && avg['宜人性'] < 3.0) roles.push({ role: '推进者(Shaper)', desc: '推动团队前进，挑战现状，驱动结果。适合担任变革推动者。' });
    return roles.length > 0 ? roles : [{ role: '专家(Specialist)', desc: '在特定领域具有深度专业知识，为团队提供专业支持。' }];
}

// 领导力潜力
function getProfessionalBigFiveLeadership(avg) {
    const c = avg['尽责性'], e = avg['外向性'], s = avg['情绪稳定性'], a = avg['宜人性'], o = avg['开放性'];
    let score = 0;
    let factors = [];
    if (c >= 3.5) { score += 25; factors.push('高度责任心为团队提供可靠执行保障'); }
    if (e >= 3.5) { score += 25; factors.push('外向特质有助于团队激励和外部协调'); }
    if (s >= 3.5) { score += 20; factors.push('情绪稳定性有助于在危机中保持团队信心'); }
    if (a >= 3.0) { score += 15; factors.push('宜人性有助于建立信任和团队凝聚力'); }
    if (o >= 3.5) { score += 15; factors.push('开放性有助于推动创新和变革'); }
    
    let level = '低';
    if (score >= 80) level = '高';
    else if (score >= 60) level = '中高';
    else if (score >= 40) level = '中等';
    
    return {
        score: score,
        level: level,
        factors: factors,
        recommendation: score >= 60 ? '建议纳入领导力发展项目，具有成为有效管理者的潜力。' : '当前更适合专业岗位发展，可在项目管理能力上持续提升。',
        suitableRoles: score >= 70 ? ['项目经理', '团队负责人', '部门主管'] : ['核心专家', '项目骨干', '专业顾问']
    };
}

// 面试要点
function getProfessionalBigFiveInterview(avg) {
    const questions = [];
    if (avg['尽责性'] < 3.0) questions.push({ q: '请描述一次你未能按时完成任务的经历，当时发生了什么？你从中学习了什么？', purpose: '评估责任感和改进能力', redFlag: '将责任完全推给他人或外部环境' });
    if (avg['情绪稳定性'] < 3.0) questions.push({ q: '请描述一个工作压力极大的情境，你是如何应对的？', purpose: '评估压力管理能力', redFlag: '描述中出现情绪崩溃或逃避行为' });
    if (avg['宜人性'] < 3.0) questions.push({ q: '请描述一次你与同事发生重大分歧的经历，你是如何处理的？', purpose: '评估冲突处理和合作能力', redFlag: '完全不考虑对方立场，只坚持自己观点' });
    if (avg['开放性'] < 3.0) questions.push({ q: '如果你的团队需要采用一种你不熟悉的新技术，你会怎么做？', purpose: '评估学习能力和适应性', redFlag: '表现出强烈抗拒或"这不可能"的态度' });
    if (avg['外向性'] >= 3.5) questions.push({ q: '请描述一次你成功说服他人接受你观点的经历。', purpose: '评估影响和说服能力', redFlag: '无法提供具体案例' });
    // 通用问题
    questions.push({ q: '请用具体例子说明你在团队中最常扮演什么角色，为什么？', purpose: '验证团队角色自我认知', redFlag: '无法清晰描述自己的团队贡献' });
    return questions;
}

// 90天发展计划
function getProfessionalBigFiveDevPlan(avg) {
    const plan = { phase1: [], phase2: [], phase3: [] };
    if (avg['尽责性'] < 3.0) {
        plan.phase1.push('第1-2周：开始使用任务管理工具（如Todoist/Notion），每天制定3个优先级任务');
        plan.phase2.push('第3-4周：建立每周回顾习惯，检查任务完成情况和质量');
        plan.phase3.push('第5-12周：承担一个小项目的完整负责人角色，实践端到端执行');
    }
    if (avg['情绪稳定性'] < 3.0) {
        plan.phase1.push('第1-2周：开始每天10分钟冥想或深呼吸练习，建立压力缓冲机制');
        plan.phase2.push('第3-4周：识别个人压力触发因素，制定应对策略清单');
        plan.phase3.push('第5-12周：主动承担一个有时间压力的任务，在实践中提升抗压能力');
    }
    if (avg['开放性'] < 3.0) {
        plan.phase1.push('第1-2周：订阅2个行业资讯源，每周阅读1篇相关文章');
        plan.phase2.push('第3-4周：参加1次跨部门交流活动，了解其他团队的工作方法');
        plan.phase3.push('第5-12周：提出1个流程改进建议，并推动小范围试点');
    }
    if (plan.phase1.length === 0) {
        plan.phase1.push('第1-4周：选择1个感兴趣的新领域进行深度学习，提升专业广度');
        plan.phase2.push('第5-8周：主动承担1个跨团队协作项目，拓展影响力');
        plan.phase3.push('第9-12周：总结个人工作方法论，形成可分享的经验文档');
    }
    return plan;
}

// 职业匹配
function getProfessionalBigFiveCareer(avg) {
    const c = avg['尽责性'], e = avg['外向性'], o = avg['开放性'], a = avg['宜人性'], s = avg['情绪稳定性'];
    const matches = [];
    
    // 管理类
    if (c >= 3.5 && e >= 3.0 && s >= 3.0) matches.push({ career: '项目经理', match: 90, reason: '高度责任心确保执行质量，外向特质有助于团队协调，情绪稳定有助于应对项目压力' });
    // 技术类
    if (c >= 3.5 && o >= 3.0 && e < 3.5) matches.push({ career: '系统架构师/高级工程师', match: 85, reason: '尽责性确保代码质量，开放性支持技术创新，内向特质适合深度技术工作' });
    // 分析类
    if (c >= 3.5 && avg['宜人性'] < 3.5) matches.push({ career: '数据分析师/风险控制', match: 80, reason: '高度尽责确保分析准确性，理性决策风格适合客观分析工作' });
    // 人际类
    if (a >= 3.5 && e >= 3.0) matches.push({ career: 'HRBP/客户成功', match: 85, reason: '宜人性支持关系建立，外向特质有助于沟通协调' });
    // 创新类
    if (o >= 3.5 && c >= 3.0) matches.push({ career: '产品经理/创新顾问', match: 80, reason: '开放性支持创新思维，尽责性确保想法落地执行' });
    
    if (matches.length === 0) matches.push({ career: '运营专员/行政助理', match: 70, reason: '结构化工作环境，职责清晰，适合稳步发展' });
    return matches;
}

// 风险因子
function getProfessionalBigFiveRisks(avg) {
    const risks = [];
    if (avg['尽责性'] < 2.5) risks.push({ factor: '执行风险', desc: '任务执行可能缺乏持续性，需要外部跟进机制', mitigation: '配合使用项目管理工具，建立定期检查点' });
    if (avg['情绪稳定性'] < 2.5) risks.push({ factor: '压力风险', desc: '在高压或危机情境中可能出现情绪波动，影响判断', mitigation: '避免安排在高压一线岗位，提供充分支持' });
    if (avg['宜人性'] < 2.5 && avg['外向性'] >= 3.5) risks.push({ factor: '人际风险', desc: '可能过于强势，在团队协作中引发冲突', mitigation: '在角色中明确沟通方式要求，提供冲突管理培训' });
    return risks;
}

// ==================== 2. MBTI 专业报告 ====================
function generateProfessionalMBTI(answers, userInfo) {
    // 计分
    let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
    let eCount = 0, iCount = 0, sCount = 0, nCount = 0, tCount = 0, fCount = 0, jCount = 0, pCount = 0;
    
    answers.forEach(a => {
        const val = typeof a.answer === 'number' ? a.answer : (parseInt(a.answer) || 0);
        const dim = (a.dimension || '').toUpperCase();
        if (dim === 'E/I' || dim === 'EI') { if (val >= 3) { E += val; eCount++; } else { I += (6 - val); iCount++; } }
        if (dim === 'S/N' || dim === 'SN') { if (val >= 3) { S += val; sCount++; } else { N += (6 - val); nCount++; } }
        if (dim === 'T/F' || dim === 'TF') { if (val >= 3) { T += val; tCount++; } else { F += (6 - val); fCount++; } }
        if (dim === 'J/P' || dim === 'JP') { if (val >= 3) { J += val; jCount++; } else { P += (6 - val); pCount++; } }
    });
    
    const type = (E >= I ? 'E' : 'I') + (S >= N ? 'S' : 'N') + (T >= F ? 'T' : 'F') + (J >= P ? 'J' : 'P');
    
    // 各维度倾向强度
    const eStrength = E + I > 0 ? Math.round(Math.abs(E - I) / (E + I) * 100) : 0;
    const sStrength = S + N > 0 ? Math.round(Math.abs(S - N) / (S + N) * 100) : 0;
    const tStrength = T + F > 0 ? Math.round(Math.abs(T - F) / (T + F) * 100) : 0;
    const jStrength = J + P > 0 ? Math.round(Math.abs(J - P) / (J + P) * 100) : 0;
    
    // 认知功能分析（专业MBTI核心）
    const cognitiveFunctions = getCognitiveFunctions(type);
    
    // 专业类型描述
    const typeProfile = getProfessionalMBTIProfile(type);
    
    const dimensions = {
        '外向(E)': eCount > 0 ? Math.round(E / eCount * 10) / 10 : 3,
        '内向(I)': iCount > 0 ? Math.round(I / iCount * 10) / 10 : 3,
        '感觉(S)': sCount > 0 ? Math.round(S / sCount * 10) / 10 : 3,
        '直觉(N)': nCount > 0 ? Math.round(N / nCount * 10) / 10 : 3,
        '思考(T)': tCount > 0 ? Math.round(T / tCount * 10) / 10 : 3,
        '情感(F)': fCount > 0 ? Math.round(F / fCount * 10) / 10 : 3,
        '判断(J)': jCount > 0 ? Math.round(J / jCount * 10) / 10 : 3,
        '感知(P)': pCount > 0 ? Math.round(P / pCount * 10) / 10 : 3
    };
    
    const overallScore = Math.round((dimensions['外向(E)'] + dimensions['内向(I)'] + dimensions['感觉(S)'] + dimensions['直觉(N)'] + dimensions['思考(T)'] + dimensions['情感(F)'] + dimensions['判断(J)'] + dimensions['感知(P)']) / 8 * 10) / 10;
    
    const summary = `【MBTI类型】${typeProfile.title}（${type}）\n\n【类型描述】${typeProfile.coreDesc}\n\n【认知功能栈】${cognitiveFunctions.stack}。${cognitiveFunctions.desc}\n\n【维度倾向】${type[0] === 'E' ? '外向(E)' : '内向(I)'}倾向强度${eStrength}%，${type[1] === 'S' ? '感觉(S)' : '直觉(N)'}倾向强度${sStrength}%，${type[2] === 'T' ? '思考(T)' : '情感(F)'}倾向强度${tStrength}%，${type[3] === 'J' ? '判断(J)' : '感知(P)'}倾向强度${jStrength}%。\n\n【职场表现】${typeProfile.workplacePerformance}\n\n【发展建议】${typeProfile.developmentSummary}`;

    return {
        toolName: 'MBTI职业性格测评',
        type: type,
        typeTitle: typeProfile.title,
        overallScore: overallScore,
        dimensions: dimensions,
        typeScores: {
            E: Math.round(E / (E + I || 1) * 100),
            I: Math.round(I / (E + I || 1) * 100),
            S: Math.round(S / (S + N || 1) * 100),
            N: Math.round(N / (S + N || 1) * 100),
            T: Math.round(T / (T + F || 1) * 100),
            F: Math.round(F / (T + F || 1) * 100),
            J: Math.round(J / (J + P || 1) * 100),
            P: Math.round(P / (J + P || 1) * 100)
        },
        summary: summary,
        cognitiveFunctions: cognitiveFunctions,
        typeProfile: typeProfile,
        strengths: typeProfile.strengths,
        weaknesses: typeProfile.weaknesses,
        workStyle: typeProfile.workStyle,
        communicationStyle: typeProfile.communicationStyle,
        stressReaction: typeProfile.stressReaction,
        leadershipStyle: typeProfile.leadershipStyle,
        teamRole: typeProfile.teamRole,
        careerRecommendations: typeProfile.careers,
        developmentPlan: typeProfile.devPlan,
        interviewTips: typeProfile.interviewTips,
        partnerCompatibility: typeProfile.partnerCompatibility
    };
}

function getCognitiveFunctions(type) {
    const functions = {
        'INTJ': { stack: 'Ni-Te-Fi-Se', desc: '主导功能为内向直觉(Ni)，善于洞察未来趋势和深层模式；辅助功能为外向思考(Te)，善于将想法转化为高效的执行方案。', dominant: '内向直觉(Ni)', auxiliary: '外向思考(Te)' },
        'INTP': { stack: 'Ti-Ne-Si-Fe', desc: '主导功能为内向思考(Ti)，善于建立精确的逻辑框架；辅助功能为外向直觉(Ne)，善于探索多种可能性和理论。', dominant: '内向思考(Ti)', auxiliary: '外向直觉(Ne)' },
        'ENTJ': { stack: 'Te-Ni-Se-Fi', desc: '主导功能为外向思考(Te)，善于高效决策和执行；辅助功能为内向直觉(Ni)，善于制定长期战略。', dominant: '外向思考(Te)', auxiliary: '内向直觉(Ni)' },
        'ENTP': { stack: 'Ne-Ti-Fe-Si', desc: '主导功能为外向直觉(Ne)，善于发现新机会和可能性；辅助功能为内向思考(Ti)，善于分析论证。', dominant: '外向直觉(Ne)', auxiliary: '内向思考(Ti)' },
        'INFJ': { stack: 'Ni-Fe-Ti-Se', desc: '主导功能为内向直觉(Ni)，善于理解复杂模式和未来趋势；辅助功能为外向情感(Fe)，善于理解和回应他人需求。', dominant: '内向直觉(Ni)', auxiliary: '外向情感(Fe)' },
        'INFP': { stack: 'Fi-Ne-Si-Te', desc: '主导功能为内向情感(Fi)，具有强烈的内在价值观；辅助功能为外向直觉(Ne)，善于探索可能性和意义。', dominant: '内向情感(Fi)', auxiliary: '外向直觉(Ne)' },
        'ENFJ': { stack: 'Fe-Ni-Se-Ti', desc: '主导功能为外向情感(Fe)，善于理解和协调他人情绪；辅助功能为内向直觉(Ni)，善于洞察未来可能性。', dominant: '外向情感(Fe)', auxiliary: '内向直觉(Ni)' },
        'ENFP': { stack: 'Ne-Fi-Te-Si', desc: '主导功能为外向直觉(Ne)，充满创意和可能性；辅助功能为内向情感(Fi)，具有强烈个人价值观。', dominant: '外向直觉(Ne)', auxiliary: '内向情感(Fi)' },
        'ISTJ': { stack: 'Si-Te-Fi-Ne', desc: '主导功能为内向感觉(Si)，善于记忆细节和维护传统；辅助功能为外向思考(Te)，善于高效执行。', dominant: '内向感觉(Si)', auxiliary: '外向思考(Te)' },
        'ISFJ': { stack: 'Si-Fe-Ti-Ne', desc: '主导功能为内向感觉(Si)，善于关注细节和他人需求；辅助功能为外向情感(Fe)，善于维护和谐。', dominant: '内向感觉(Si)', auxiliary: '外向情感(Fe)' },
        'ESTJ': { stack: 'Te-Si-Ne-Fi', desc: '主导功能为外向思考(Te)，善于组织和决策；辅助功能为内向感觉(Si)，善于利用经验和传统。', dominant: '外向思考(Te)', auxiliary: '内向感觉(Si)' },
        'ESFJ': { stack: 'Fe-Si-Ne-Ti', desc: '主导功能为外向情感(Fe)，善于关心他人和维护和谐；辅助功能为内向感觉(Si)，善于记住重要细节。', dominant: '外向情感(Fe)', auxiliary: '内向感觉(Si)' },
        'ISTP': { stack: 'Ti-Se-Ni-Fe', desc: '主导功能为内向思考(Ti)，善于理解系统运作原理；辅助功能为外向感觉(Se)，善于观察当下细节。', dominant: '内向思考(Ti)', auxiliary: '外向感觉(Se)' },
        'ISFP': { stack: 'Fi-Se-Ni-Te', desc: '主导功能为内向情感(Fi)，具有强烈个人价值观；辅助功能为外向感觉(Se)，善于欣赏当下美感。', dominant: '内向情感(Fi)', auxiliary: '外向感觉(Se)' },
        'ESTP': { stack: 'Se-Ti-Fe-Ni', desc: '主导功能为外向感觉(Se)，善于捕捉当下机会；辅助功能为内向思考(Ti)，善于快速分析。', dominant: '外向感觉(Se)', auxiliary: '内向思考(Ti)' },
        'ESFP': { stack: 'Se-Fi-Te-Ni', desc: '主导功能为外向感觉(Se)，善于享受当下和带动气氛；辅助功能为内向情感(Fi)，具有个人价值观。', dominant: '外向感觉(Se)', auxiliary: '内向情感(Fi)' }
    };
    return functions[type] || functions['INTJ'];
}

function getProfessionalMBTIProfile(type) {
    const profiles = {
        'INTJ': {
            title: '建筑师（Architect）',
            coreDesc: 'INTJ是战略思想家，具有极强的独立性和高标准。善于看到未来的可能性，并制定周密的计划来实现目标。在职场中表现为冷静、理性、有远见，有时可能显得过于挑剔或难以接近。',
            workplacePerformance: '在需要战略规划、系统设计、复杂问题解决的岗位中表现卓越。善于独立工作，在清晰的目标指引下能够高效产出。可能对低效的流程和缺乏能力的人缺乏耐心。',
            strengths: [
                { name: '战略思维', desc: '能够看到长远趋势和深层模式，善于制定系统性解决方案', evidence: '在复杂项目中表现出色，能够预见潜在问题' },
                { name: '高标准执行', desc: '对自己和他人都有高标准，追求质量和效率', evidence: '交付成果通常具有高质量和完整性' },
                { name: '独立工作能力', desc: '不需要频繁监督，能够自主推动任务', evidence: '在远程或自主工作环境中表现良好' },
                { name: '理性决策', desc: '基于逻辑和数据做决策，不受情绪干扰', evidence: '在危机中能保持冷静和客观' }
            ],
            weaknesses: [
                { name: '人际交往', desc: '可能在社交场合显得疏离，不善于表达情感', improvement: '练习积极倾听，在反馈中加入肯定' },
                { name: '完美主义', desc: '可能因过度追求完美而导致拖延或苛责他人', improvement: '设定"足够好"的标准，学会授权' },
                { name: '固执', desc: '一旦形成观点很难被说服，可能忽视他人意见', improvement: '主动寻求反向意见，练习"是的，而且..."思维' }
            ],
            workStyle: '偏好独立工作，需要自主空间。善于制定长期计划，注重效率和质量。在工作中需要清晰的目标和合理的自由度。不适合高度结构化或需要频繁社交的岗位。',
            communicationStyle: '沟通简洁直接，注重逻辑和事实。在书面沟通中表现更佳。可能需要练习在反馈前先建立关系。',
            stressReaction: '压力下来可能变得更加挑剔和孤立。应对方式：给自己独处时间，将大问题分解为小步骤，寻求有能力的同事支持。',
            leadershipStyle: '愿景型领导，善于制定战略方向。可能需要加强人际关怀和沟通频率。适合的团队：需要方向清晰、成员能力强的团队。',
            teamRole: '战略顾问/系统架构师。在团队中提供长远视角和深度分析，但不适合需要高度人际协调的角色。',
            careers: [
                { career: '系统架构师', match: 95, reason: '需要战略规划能力和独立工作能力' },
                { career: '战略顾问', match: 90, reason: '需要分析复杂问题和提供系统性建议' },
                { career: '产品经理（技术方向）', match: 85, reason: '需要统筹规划和跨团队协调' },
                { career: '数据分析师/科学家', match: 85, reason: '需要深度分析和独立研究能力' }
            ],
            devPlan: {
                phase1: ['练习主动寻求他人意见，每月至少2次', '在给出负面反馈前，先表达1个肯定', '参加1次沟通技巧工作坊'],
                phase2: ['承担1个需要跨团队协作的项目', '练习授权，将执行细节交给他人', '建立定期1对1沟通机制'],
                phase3: [' mentor 1-2名 junior 同事', '主导1次跨部门知识分享', '制定个人影响力提升计划']
            },
            interviewTips: [
                '准备具体案例展示战略思维和问题解决能力',
                '强调独立工作和自主驱动的经历',
                '准备说明如何在团队中处理不同意见',
                '展示对岗位的长期规划和思考'
            ],
            partnerCompatibility: '与ENTP、ENFP搭配较好（互补的N和P带来活力和创意）；与ESTJ可能需要磨合（J/S差异）'
        },
        'INFP': {
            title: '调停者（Mediator）',
            coreDesc: 'INFP是理想主义者和调停者，具有深刻的内在价值观和强烈的同理心。善于理解他人，追求意义和真实性。在职场中表现为温和、有创造力、重视和谐，有时可能过于敏感或逃避冲突。',
            workplacePerformance: '在需要创造力、人际关怀和价值观匹配的工作中表现最佳。善于一对一深度交流，在支持性环境中能够充分发挥创造力。可能在高度竞争或缺乏意义的工作中感到倦怠。',
            strengths: [
                { name: '同理心', desc: '能够深刻理解他人感受和动机', evidence: '在团队冲突中能够调解，帮助他人表达需求' },
                { name: '创造力', desc: '能够产生有意义的创意和解决方案', evidence: '在内容创作、产品设计等方面有独特视角' },
                { name: '价值观驱动', desc: '对工作意义和影响力有高要求', evidence: '在使命驱动的组织中表现更佳' },
                { name: '写作能力', desc: '通常善于书面表达复杂情感和思想', evidence: '在需要文案、内容策略的岗位中有优势' }
            ],
            weaknesses: [
                { name: '冲突回避', desc: '倾向于避免冲突，可能导致问题积累', improvement: '练习"非暴力沟通"，从小冲突开始练习直面' },
                { name: '过度敏感', desc: '可能对批评反应强烈，影响工作关系', improvement: '将反馈与自我价值分离，寻求具体改进建议' },
                { name: '执行力', desc: '可能因追求完美或缺乏结构而导致拖延', improvement: '使用时间盒方法，设定"完成优于完美"原则' }
            ],
            workStyle: '需要有意义和对他人有积极影响的工作。偏好灵活的工作方式，需要自主空间来发挥创造力。不适合高度政治化或纯数字导向的工作环境。',
            communicationStyle: '沟通温和、真诚，善于倾听。书面沟通通常优于口头沟通。在表达不同意见时需要更多安全感。',
            stressReaction: '压力下可能过度内省，陷入负面情绪。应对方式：寻求信任的同事倾诉，回到基本价值观，进行创造性活动来调节。',
            leadershipStyle: '服务型领导，善于激励和赋能他人。可能需要加强决策果断性和任务推进能力。适合的团队：创意型或使命驱动的团队。',
            teamRole: '文化塑造者/用户代言人。在团队中提供人文视角和价值观指引，适合需要深度理解用户的角色。',
            careers: [
                { career: '用户体验研究员', match: 90, reason: '需要深度理解用户需求和同理心' },
                { career: '内容策略/文案', match: 85, reason: '需要创造力和价值观表达' },
                { career: 'HRBP（文化方向）', match: 80, reason: '需要人际关系敏感度和组织关怀' },
                { career: '培训师（软技能方向）', match: 80, reason: '需要同理心和内容创造力' }
            ],
            devPlan: {
                phase1: ['练习在会议中主动表达1个不同意见', '使用时间盒方法完成1个项目', '寻求1位导师帮助提升执行力'],
                phase2: ['主导1个需要跨部门协调的项目', '练习给予和接受直接反馈', '建立个人工作结构和习惯'],
                phase3: ['在团队中推动1项文化改进', '提升公开演讲能力', '平衡理想主义与现实执行']
            },
            interviewTips: [
                '准备具体案例展示如何解决人际冲突',
                '强调对组织使命和价值观的认同',
                '准备说明如何在压力下保持工作效率',
                '展示创造力和人文关怀的结合能力'
            ],
            partnerCompatibility: '与ENTJ、ESTJ搭配较好（互补的J和T带来执行力）；与INTP可能需要磨合（两者都偏P，可能缺乏执行推进）'
        }
        // 其他14种类型省略，按同样结构补充
    };
    
    // 对于未详细定义的对象，返回通用专业描述
    if (!profiles[type]) {
        const genericTypeDesc = {
            'INTP': { title: '逻辑学家（Logician）', desc: '善于理论分析和逻辑思维，好奇心强，适合研发和创新工作。' },
            'ENTJ': { title: '指挥官（Commander）', desc: '天生的领导者，果断有远见，适合管理和战略角色。' },
            'ENTP': { title: '辩论家（Debater）', desc: '聪明思维敏捷，喜欢智力挑战，适合创新和创业。' },
            'INFJ': { title: '提倡者（Advocate）', desc: '有理想主义倾向，关心他人，有洞察力，适合帮助他人实现潜力的工作。' },
            'ENFJ': { title: '主人公（Protagonist）', desc: '天生的领导者，有魅力，善于激励他人，适合管理和培训工作。' },
            'ENFP': { title: '竞选者（Campaigner）', desc: '热情创造力强，善于与人交往，适合需要创新和社交的工作。' },
            'ISTJ': { title: '物流师（Logistician）', desc: '务实负责，喜欢有序和结构化，适合需要准确性和细节的工作。' },
            'ISFJ': { title: '守护者（Defender）', desc: '温暖负责，善于照顾他人，适合服务和支持性工作。' },
            'ESTJ': { title: '总经理（Executive）', desc: '有组织能力，务实，喜欢传统和秩序，适合管理和运营工作。' },
            'ESFJ': { title: '执政官（Consul）', desc: '关心他人，合作性强，喜欢和谐，适合服务和教育工作。' },
            'ISTP': { title: '鉴赏家（Virtuoso）', desc: '冷静分析力强，喜欢技术和机械，适合技术操作工作。' },
            'ISFP': { title: '探险家（Adventurer）', desc: '温和敏感，喜欢美学和和谐，适合创意和辅助工作。' },
            'ESTP': { title: '企业家（Entrepreneur）', desc: '观察力强行动派，喜欢风险和刺激，适合销售和创业。' },
            'ESFP': { title: '表演者（Entertainer）', desc: '热情爱社交，喜欢成为关注焦点，适合展示和娱乐工作。' }
        };
        const td = genericTypeDesc[type] || { title: '专业型', desc: '' };
        profiles[type] = {
            title: td.title,
            coreDesc: td.desc + '该类型受测者在工作中表现出与该类型典型特征相符的行为模式，具体表现需要结合各维度得分进一步分析。',
            workplacePerformance: '根据具体得分情况，在匹配的工作环境中能够充分发挥优势。建议结合具体岗位要求进行进一步评估。',
            strengths: getTypeStrengths(type).map(s => ({ name: s, desc: s, evidence: '' })),
            weaknesses: [{ name: '待进一步评估', desc: '建议结合具体工作情境进行更深入的评估', improvement: '进行结构化面试获取更多行为案例' }],
            workStyle: getTypeWorkStyle(type),
            communicationStyle: getTypeCommStyle(type),
            stressReaction: getTypeStress(type),
            leadershipStyle: '需结合具体管理经验进一步评估',
            teamRole: '需结合团队构成进一步分析',
            careers: (type === 'INTJ' ? [{ career: '系统架构师', match: 85, reason: '' }] : [{ career: '综合评估后确定', match: 70, reason: '' }]),
            devPlan: { phase1: ['进行更深入的测评', '获取360度反馈'], phase2: [], phase3: [] },
            interviewTips: ['结合岗位要求进行结构化行为面试'],
            partnerCompatibility: '需结合团队类型分析'
        };
    }
    
    return profiles[type];
}

// 保留原有的简单函数作为fallback
function getTypeStrengths(type) {
    const s = { E: '主动表达，推动讨论', I: '深度思考，独立思考', S: '关注细节，务实执行', N: '宏观视野，创新思维', T: '逻辑分析，客观决策', F: '人文关怀，团队和谐', J: '计划有序，按时交付', P: '灵活应变，适应变化' };
    return [s[type[0]], s[type[1]], s[type[2]], s[type[3]]];
}
function getTypeWorkStyle(type) {
    const ws = { E: '偏好讨论和头脑风暴', I: '偏好独立工作和深度思考', S: '关注细节和执行步骤', N: '关注未来可能性和创新', T: '基于逻辑和数据分析', F: '基于价值观和人际考量', J: '偏好计划和组织', P: '偏好灵活和适应' };
    return `工作风格：${ws[type[0]]} + ${ws[type[1]]} + ${ws[type[2]]} + ${ws[type[3]]}。`;
}
function getTypeCommStyle(type) {
    if (type[0] === 'E') return '沟通风格外向，善于表达，在讨论中较为活跃。需要注意给予他人表达空间。';
    return '沟通风格偏内向，善于倾听，在表达前会深思熟虑。可以练习更主动的表达。';
}
function getTypeStress(type) {
    if (type[2] === 'T') return '压力下倾向于过度分析，可能需要练习接受不完美和表达情感。';
    return '压力下可能过度关注人际关系和谐，需要练习直接表达需求和设定边界。';
}
function getTypeDevelopment(type) {
    const devs = {
        E: '练习深度倾听，在表达前先提问',
        I: '练习主动表达观点，在会议中至少发言1次',
        S: '练习关注未来可能性，不只停留在当下',
        N: '练习关注执行细节，将想法落地',
        T: '练习在决策前考虑人的感受',
        F: '练习在反馈中给出具体改进建议',
        J: '练习在计划中留有余地，适应变化',
        P: '练习提前规划，避免最后一分钟赶工'
    };
    return [devs[type[0]], devs[type[1]], devs[type[2]], devs[type[3]]];
}

// ==================== 导出 ====================
module.exports = {
    getProfessionalReport,
    generateProfessionalBigFive,
    generateProfessionalMBTI,
    calcPercentile,
    NORMS
};
