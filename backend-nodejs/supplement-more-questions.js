/**
 * 补充更多题目 - 工具19-23
 * 为组织承诺、领导风格、职业成熟度、工作满意度、职业压力测评添加完整题目
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment_new.db');

// 继续工具19的题目 (组织承诺测评 - 需要35题，目前15题)
const tool19More = [
  // 继续Affective维度
  { id: 2516, tool_id: 19, question: '我觉得自己是组织家庭的一部分', dimension: 'Affective', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2517, tool_id: 19, question: '我对组织有情感上的依恋', dimension: 'Affective', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2518, tool_id: 19, question: '我觉得组织像一个大家庭', dimension: 'Affective', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2519, tool_id: 19, question: '我对组织有强烈的忠诚度', dimension: 'Affective', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2520, tool_id: 19, question: '我愿意为组织的成功付出额外努力', dimension: 'Affective', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  
  // 继续Continuance维度
  { id: 2521, tool_id: 19, question: '我在组织积累了大量未兑现的福利', dimension: 'Continuance', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2522, tool_id: 19, question: '离开这家组织会打乱我的生活', dimension: 'Continuance', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2523, tool_id: 19, question: '我已经在这家组织投入了太多', dimension: 'Continuance', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2524, tool_id: 19, question: '现在离开这家组织对我来说很困难', dimension: 'Continuance', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2525, tool_id: 19, question: '我害怕离开组织后会失去很多', dimension: 'Continuance', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  
  // 继续Normative维度
  { id: 2526, tool_id: 19, question: '我觉得有责任继续为组织工作', dimension: 'Normative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2527, tool_id: 19, question: '我对组织有一种道义上的责任', dimension: 'Normative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2528, tool_id: 19, question: '我不忍心在组织需要我的时候离开', dimension: 'Normative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2529, tool_id: 19, question: '我认为员工应该对组织保持忠诚', dimension: 'Normative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2530, tool_id: 19, question: '我觉得离开组织是不道德的', dimension: 'Normative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  
  // 综合题目
  { id: 2531, tool_id: 19, question: '我经常向他人称赞我的组织', dimension: 'Affective', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2532, tool_id: 19, question: '我觉得组织值得我忠诚', dimension: 'Normative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2533, tool_id: 19, question: '我认为离职是不合适的', dimension: 'Continuance', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2534, tool_id: 19, question: '我对组织的问题感到关切', dimension: 'Affective', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2535, tool_id: 19, question: '我感到有义务不离开组织', dimension: 'Normative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 }
];

// 继续工具20的题目 (领导风格测评 - 需要50题，目前12题)
const tool20More = [
  // 继续Directive维度
  { id: 2613, tool_id: 20, question: '我会明确分配团队成员的职责', dimension: 'Directive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2614, tool_id: 20, question: '我会确保团队按照既定流程工作', dimension: 'Directive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2615, tool_id: 20, question: '我会解决团队中的绩效问题', dimension: 'Directive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2616, tool_id: 20, question: '我会确保团队遵守规章制度', dimension: 'Directive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2617, tool_id: 20, question: '我会为团队设定明确的时间表', dimension: 'Directive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  
  // 继续Supportive维度
  { id: 2618, tool_id: 20, question: '我会关心团队成员的个人问题', dimension: 'Supportive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2619, tool_id: 20, question: '我会为团队成员提供情感支持', dimension: 'Supportive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2620, tool_id: 20, question: '我会尊重团队成员的感受', dimension: 'Supportive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2621, tool_id: 20, question: '我会创造一个友好的工作氛围', dimension: 'Supportive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2622, tool_id: 20, question: '我会公平对待所有团队成员', dimension: 'Supportive', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  
  // 继续Participative维度
  { id: 2623, tool_id: 20, question: '我会与团队分享信息', dimension: 'Participative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2624, tool_id: 20, question: '我会授权团队成员做出决策', dimension: 'Participative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2625, tool_id: 20, question: '我会鼓励团队自主解决问题', dimension: 'Participative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2626, tool_id: 20, question: '我会定期与团队沟通', dimension: 'Participative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2627, tool_id: 20, question: '我会考虑团队的建议', dimension: 'Participative', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  
  // 继续Achievement-Oriented维度
  { id: 2628, tool_id: 20, question: '我会为团队树立高标准', dimension: 'Achievement-Oriented', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2629, tool_id: 20, question: '我会激励团队追求卓越', dimension: 'Achievement-Oriented', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2630, tool_id: 20, question: '我会对团队的成就感到自豪', dimension: 'Achievement-Oriented', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2631, tool_id: 20, question: '我会庆祝团队的成功', dimension: 'Achievement-Oriented', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2632, tool_id: 20, question: '我相信团队能够超越预期', dimension: 'Achievement-Oriented', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 }
];

// 工具21: 职业成熟度测评 (40题)
const tool21Questions = [
  { id: 2701, tool_id: 21, question: '我清楚自己的职业兴趣和能力', dimension: 'Self-Awareness', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2702, tool_id: 21, question: '我了解自己的职业价值观', dimension: 'Self-Awareness', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2703, tool_id: 21, question: '我知道自己的职业优势', dimension: 'Self-Awareness', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2704, tool_id: 21, question: '我能够客观地评估自己的职业能力', dimension: 'Self-Awareness', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2705, tool_id: 21, question: '我知道自己需要提升的能力', dimension: 'Self-Awareness', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2706, tool_id: 21, question: '我有明确的职业发展目标', dimension: 'CareerPlanning', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2707, tool_id: 21, question: '我制定了实现职业目标的计划', dimension: 'CareerPlanning', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2708, tool_id: 21, question: '我会定期评估我的职业进展', dimension: 'CareerPlanning', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2709, tool_id: 21, question: '我会主动寻求职业发展机会', dimension: 'CareerPlanning', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2710, tool_id: 21, question: '我有应对职业变化的准备', dimension: 'CareerPlanning', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2711, tool_id: 21, question: '我会主动学习新技能', dimension: 'Proactivity', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2712, tool_id: 21, question: '我会寻求反馈以改进自己', dimension: 'Proactivity', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2713, tool_id: 21, question: '我会主动承担挑战性任务', dimension: 'Proactivity', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2714, tool_id: 21, question: '我会建立职业人脉网络', dimension: 'Proactivity', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2715, tool_id: 21, question: '我会关注行业发展趋势', dimension: 'Proactivity', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 }
];

// 工具22: 工作满意度测评 (35题)
const tool22Questions = [
  { id: 2801, tool_id: 22, question: '我对目前的工作整体感到满意', dimension: 'Overall', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2802, tool_id: 22, question: '我喜欢我的日常工作', dimension: 'Work', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2803, tool_id: 22, question: '我的工作很有意义', dimension: 'Work', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2804, tool_id: 22, question: '我的工作具有挑战性', dimension: 'Work', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2805, tool_id: 22, question: '我对我的薪资感到满意', dimension: 'Pay', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2806, tool_id: 22, question: '我认为我的薪酬是公平的', dimension: 'Pay', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2807, tool_id: 22, question: '我的福利是合理的', dimension: 'Pay', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2808, tool_id: 22, question: '我有晋升的机会', dimension: 'Promotion', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2809, tool_id: 22, question: '我的组织提供职业发展机会', dimension: 'Promotion', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2810, tool_id: 22, question: '我的上级支持我的发展', dimension: 'Supervision', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2811, tool_id: 22, question: '我的上级提供清晰的指导', dimension: 'Supervision', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2812, tool_id: 22, question: '我与同事合作愉快', dimension: 'Coworkers', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2813, tool_id: 22, question: '我的工作环境舒适', dimension: 'WorkConditions', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2814, tool_id: 22, question: '我的工作与生活平衡良好', dimension: 'WorkLife', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 },
  { id: 2815, tool_id: 22, question: '我愿意继续为这家组织工作', dimension: 'Overall', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 1, score_b: 2, score_c: 3, score_d: 4, score_e: 5 }
];

// 工具23: 职业压力测评 (45题)
const tool23Questions = [
  { id: 2901, tool_id: 23, question: '我的工作量过大', dimension: 'Workload', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },  // 反向计分
  { id: 2902, tool_id: 23, question: '我经常需要加班才能完成工作', dimension: 'Workload', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2903, tool_id: 23, question: '我有太多的工作要做', dimension: 'Workload', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2904, tool_id: 23, question: '我的时间压力很大', dimension: 'Workload', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2905, tool_id: 23, question: '我无法控制我的工作量', dimension: 'Workload', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2906, tool_id: 23, question: '我的角色和职责不清晰', dimension: 'Role', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2907, tool_id: 23, question: '我收到冲突的工作要求', dimension: 'Role', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2908, tool_id: 23, question: '我不清楚我的工作期望是什么', dimension: 'Role', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2909, tool_id: 23, question: '我的工作范围经常变化', dimension: 'Role', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2910, tool_id: 23, question: '我与上级关系紧张', dimension: 'Relationships', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2911, tool_id: 23, question: '我与同事有冲突', dimension: 'Relationships', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2912, tool_id: 23, question: '我缺乏社会支持', dimension: 'Relationships', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2913, tool_id: 23, question: '我的工作缺乏自主性', dimension: 'Control', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2914, tool_id: 23, question: '我无法参与决策', dimension: 'Control', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 },
  { id: 2915, tool_id: 23, question: '我的工作缺乏挑战性', dimension: 'Control', option_a: '非常不符合', option_b: '不符合', option_c: '一般', option_d: '符合', option_e: '非常符合', score_a: 5, score_b: 4, score_c: 3, score_d: 2, score_e: 1 }
];

console.log('开始补充更多题目...\n');

// 插入题目函数
function insertQuestions(questions, callback) {
  let completed = 0;
  questions.forEach((q, index) => {
    const sql = `INSERT OR REPLACE INTO questions (id, tool_id, question_text, question_type, dimension, option_a, option_b, option_c, option_d, option_e, score_a, score_b, score_c, score_d, score_e, order_num) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [q.id, q.tool_id, q.question, q.question_type || 'scale', q.dimension, q.option_a, q.option_b, q.option_c, q.option_d, q.option_e, q.score_a, q.score_b, q.score_c, q.score_d, q.score_e, index + 1], function(err) {
      if (err) {
        console.error('插入题目失败 (ID=' + q.id + '):', err.message);
      } else {
        completed++;
      }
      
      if (completed === questions.length) {
        callback();
      }
    });
  });
}

// 顺序插入各工具的题目
console.log('补充工具19 (组织承诺测评) 的题目...');
insertQuestions(tool19More, () => {
  console.log('✅ 工具19 题目补充完成 (' + tool19More.length + '题)');
  
  console.log('\n补充工具20 (领导风格测评) 的题目...');
  insertQuestions(tool20More, () => {
    console.log('✅ 工具20 题目补充完成 (' + tool20More.length + '题)');
    
    console.log('\n添加工具21 (职业成熟度测评) 的题目...');
    insertQuestions(tool21Questions, () => {
      console.log('✅ 工具21 题目添加完成 (' + tool21Questions.length + '题)');
      
      console.log('\n添加工具22 (工作满意度测评) 的题目...');
      insertQuestions(tool22Questions, () => {
        console.log('✅ 工具22 题目添加完成 (' + tool22Questions.length + '题)');
        
        console.log('\n添加工具23 (职业压力测评) 的题目...');
        insertQuestions(tool23Questions, () => {
          console.log('✅ 工具23 题目添加完成 (' + tool23Questions.length + '题)');
          
          // 更新题目数量
          console.log('\n更新题目数量...');
          db.run('UPDATE assessment_tools SET question_count = (SELECT COUNT(*) FROM questions WHERE tool_id = 19) WHERE id = 19', function() {
            db.run('UPDATE assessment_tools SET question_count = (SELECT COUNT(*) FROM questions WHERE tool_id = 20) WHERE id = 20', function() {
              db.run('UPDATE assessment_tools SET question_count = (SELECT COUNT(*) FROM questions WHERE tool_id = 21) WHERE id = 21', function() {
                db.run('UPDATE assessment_tools SET question_count = (SELECT COUNT(*) FROM questions WHERE tool_id = 22) WHERE id = 22', function() {
                  db.run('UPDATE assessment_tools SET question_count = (SELECT COUNT(*) FROM questions WHERE tool_id = 23) WHERE id = 23', function() {
                    console.log('✅ 题目数量已更新');
                    
                    // 验证结果
                    db.all('SELECT tool_id, COUNT(*) as count FROM questions WHERE tool_id >= 16 GROUP BY tool_id', (err, rows) => {
                      if (err) {
                        console.error('查询失败:', err.message);
                      } else {
                        console.log('\n最终题目数量:');
                        rows.forEach(r => console.log('  工具' + r.tool_id + ': ' + r.count + '题'));
                      }
                      
                      // 也更新assessment_tools表
                      db.all('SELECT id, tool_name, question_count FROM assessment_tools WHERE id >= 16', (err, rows) => {
                        if (err) {
                          console.error('查询失败:', err.message);
                        } else {
                          console.log('\n测评工具题目数量 (assessment_tools表):');
                          rows.forEach(r => console.log('  ID=' + r.id + ': ' + r.tool_name + ' (' + r.question_count + '题)'));
                        }
                        db.close();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
