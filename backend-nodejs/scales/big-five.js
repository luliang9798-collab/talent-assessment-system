// 大五人格测评（Big Five Personality Test）
// 对标SHL OPQ32，包含32个细分维度
// 题目数量：60题（实际SHL OPQ32有104题，这里简化版60题）

const bigFiveQuestions = [
    // 神经质维度（Neuroticism）
    {
        id: 1,
        text: "我经常感到担忧或焦虑",
        dimension: "NEUROTICISM",
        subDimension: "ANXIETY",
        reverse: false
    },
    {
        id: 2,
        text: "我很容易感到愤怒或烦躁",
        dimension: "NEUROTICISM",
        subDimension: "ANGER",
        reverse: false
    },
    {
        id: 3,
        text: "我经常感到情绪低落或沮丧",
        dimension: "NEUROTICISM",
        subDimension: "DEPRESSION",
        reverse: false
    },
    {
        id: 4,
        text: "我对自己很有信心",
        dimension: "NEUROTICISM",
        subDimension: "SELF_CONSCIOUSNESS",
        reverse: true
    },
    {
        id: 5,
        text: "我很容易感到压力",
        dimension: "NEUROTICISM",
        subDimension: "VULNERABILITY",
        reverse: false
    },
    
    // 外向性维度（Extraversion）
    {
        id: 6,
        text: "我喜欢与人交往，乐于参加社交活动",
        dimension: "EXTRAVERSION",
        subDimension: "WARMTH",
        reverse: false
    },
    {
        id: 7,
        text: "我在社交场合中表现活跃",
        dimension: "EXTRAVERSION",
        subDimension: "GREGARIOUSNESS",
        reverse: false
    },
    {
        id: 8,
        text: "我喜欢成为关注的中心",
        dimension: "EXTRAVERSION",
        subDimension: "ASSERTIVENESS",
        reverse: false
    },
    {
        id: 9,
        text: "我的精力充沛，活动量大",
        dimension: "EXTRAVERSION",
        subDimension: "ACTIVITY",
        reverse: false
    },
    {
        id: 10,
        text: "我喜欢寻找刺激和兴奋",
        dimension: "EXTRAVERSION",
        subDimension: "EXCITEMENT_SEEKING",
        reverse: false
    },
    
    // 开放性维度（Openness）
    {
        id: 11,
        text: "我对新事物和新想法持开放态度",
        dimension: "OPENNESS",
        subDimension: "FANTASY",
        reverse: false
    },
    {
        id: 12,
        text: "我喜欢艺术和美学体验",
        dimension: "OPENNESS",
        subDimension: "AESTHETICS",
        reverse: false
    },
    {
        id: 13,
        text: "我经常产生新的想法和创意",
        dimension: "OPENNESS",
        subDimension: "IDEAS",
        reverse: false
    },
    {
        id: 14,
        text: "我喜欢思考抽象的概念",
        dimension: "OPENNESS",
        subDimension: "INTELLECT",
        reverse: false
    },
    {
        id: 15,
        text: "我喜欢打破常规，尝试不同的方式",
        dimension: "OPENNESS",
        subDimension: "LIBERTY",
        reverse: false
    },
    
    // 宜人性维度（Agreeableness）
    {
        id: 16,
        text: "我乐于助人，关心他人的感受",
        dimension: "AGREEABLENESS",
        subDimension: "TRUST",
        reverse: false
    },
    {
        id: 17,
        text: "我倾向于相信他人是善良的",
        dimension: "AGREEABLENESS",
        subDimension: "STRAIGHTFORWARDNESS",
        reverse: false
    },
    {
        id: 18,
        text: "我愿意为他人做出牺牲",
        dimension: "AGREEABLENESS",
        subDimension: "ALTRUISM",
        reverse: false
    },
    {
        id: 19,
        text: "我很容易与他人合作",
        dimension: "AGREEABLENESS",
        subDimension: "COMPLIANCE",
        reverse: false
    },
    {
        id: 20,
        text: "我对他人很温和，不喜欢冲突",
        dimension: "AGREEABLENESS",
        subDimension: "MODESTY",
        reverse: false
    },
    
    // 尽责性维度（Conscientiousness）
    {
        id: 21,
        text: "我做事有条理，善于规划",
        dimension: "CONSCIENTIOUSNESS",
        subDimension: "COMPETENCE",
        reverse: false
    },
    {
        id: 22,
        text: "我很有自律能力，能坚持完成任务",
        dimension: "CONSCIENTIOUSNESS",
        subDimension: "ORDER",
        reverse: false
    },
    {
        id: 23,
        text: "我很注重细节，追求完美",
        dimension: "CONSCIENTIOUSNESS",
        subDimension: "DUTIFULNESS",
        reverse: false
    },
    {
        id: 24,
        text: "我能很好地管理时间和任务",
        dimension: "CONSCIENTIOUSNESS",
        subDimension: "ACHIEVEMENT_STRIVING",
        reverse: false
    },
    {
        id: 25,
        text: "我很谨慎，会仔细考虑后果",
        dimension: "CONSCIENTIOUSNESS",
        subDimension: "SELF_DISCIPLINE",
        reverse: false
    },
    
    // 继续添加其他题目...
    // 实际应该有60题，这里先列出25题作为示例
];

// 计分算法
function calculateBigFiveScore(responses) {
    const dimensions = {
        NEUROTICISM: { score: 0, count: 0 },
        EXTRAVERSION: { score: 0, count: 0 },
        OPENNESS: { score: 0, count: 0 },
        AGREEABLENESS: { score: 0, count: 0 },
        CONSCIENTIOUSNESS: { score: 0, count: 0 }
    };
    
    // 计算各维度得分
    responses.forEach(response => {
        const question = bigFiveQuestions.find(q => q.id === response.questionId);
        if (question) {
            let score = response.answerValue;
            if (question.reverse) {
                score = 6 - score;  // 反向计分（假设是5点量表）
            }
            dimensions[question.dimension].score += score;
            dimensions[question.dimension].count++;
        }
    });
    
    // 计算平均分并转换为T分数
    const result = {};
    Object.keys(dimensions).forEach(dim => {
        const avgScore = dimensions[dim].score / dimensions[dim].count;
        // 转换为T分数（均值50，标准差10）
        // 这里假设平均分范围是1-5，转换为T分数
        result[dim] = Math.round(50 + (avgScore - 3) * 10);
    });
    
    return result;
}

module.exports = { bigFiveQuestions, calculateBigFiveScore };
