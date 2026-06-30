// 为工具26-28添加题目
const betterSqlite3 = require('better-sqlite3');
const db = betterSqlite3('talent_assessment_new.db');

// 工具26: 组织文化测评（Korn Ferry对标）- 40题
const tool26Questions = [
  // 基于Korn Ferry的组织文化模型
  { tool_id: 26, question_text: "公司鼓励员工创新和尝试新方法", dimension: "INNOVATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 1 },
  { tool_id: 26, question_text: "公司注重团队合作和协作", dimension: "COLLABORATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 2 },
  { tool_id: 26, question_text: "公司重视结果和绩效", dimension: "RESULTS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 3 },
  { tool_id: 26, question_text: "公司鼓励员工表达不同意见", dimension: "VOICE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 4 },
  { tool_id: 26, question_text: "公司提供学习和成长的机会", dimension: "DEVELOPMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 5 },
  { tool_id: 26, question_text: "公司重视工作与生活的平衡", dimension: "WORK_LIFE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 6 },
  { tool_id: 26, question_text: "公司鼓励承担合理的风险", dimension: "RISK_TAKING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 7 },
  { tool_id: 26, question_text: "公司注重质量和卓越", dimension: "QUALITY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 8 },
  { tool_id: 26, question_text: "公司重视客户的反馈和需求", dimension: "CUSTOMER_FOCUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 9 },
  { tool_id: 26, question_text: "公司鼓励跨部门合作", dimension: "COLLABORATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 10 },
  { tool_id: 26, question_text: "公司设定清晰的目标和期望", dimension: "CLARITY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 11 },
  { tool_id: 26, question_text: "公司奖励高绩效者", dimension: "RESULTS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 12 },
  { tool_id: 26, question_text: "公司鼓励员工参与决策", dimension: "VOICE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 13 },
  { tool_id: 26, question_text: "公司提供培训和发展资源", dimension: "DEVELOPMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 14 },
  { tool_id: 26, question_text: "公司理解员工的个人需求", dimension: "WORK_LIFE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 15 },
  { tool_id: 26, question_text: "公司容忍失败并从中学习", dimension: "RISK_TAKING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 16 },
  { tool_id: 26, question_text: "公司持续改进流程和产品", dimension: "QUALITY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 17 },
  { tool_id: 26, question_text: "公司快速响应市场变化", dimension: "INNOVATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 18 },
  { tool_id: 26, question_text: "公司关注客户满意度", dimension: "CUSTOMER_FOCUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 19 },
  { tool_id: 26, question_text: "公司信息共享透明", dimension: "CLARITY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 20 },
  { tool_id: 26, question_text: "公司鼓励员工提出改进建议", dimension: "VOICE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 21 },
  { tool_id: 26, question_text: "公司为员工制定职业发展计划", dimension: "DEVELOPMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 22 },
  { tool_id: 26, question_text: "公司提供灵活的工作安排", dimension: "WORK_LIFE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 23 },
  { tool_id: 26, question_text: "公司支持员工尝试新想法", dimension: "RISK_TAKING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 24 },
  { tool_id: 26, question_text: "公司追求卓越的标准", dimension: "QUALITY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 25 },
  { tool_id: 26, question_text: "公司不断推出创新产品/服务", dimension: "INNOVATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 26 },
  { tool_id: 26, question_text: "公司各部门之间协作顺畅", dimension: "COLLABORATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 27 },
  { tool_id: 26, question_text: "公司设定具有挑战性的目标", dimension: "RESULTS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 28 },
  { tool_id: 26, question_text: "公司重视客户反馈", dimension: "CUSTOMER_FOCUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 29 },
  { tool_id: 26, question_text: "公司沟通渠道畅通", dimension: "CLARITY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 30 },
  { tool_id: 26, question_text: "公司鼓励员工发声", dimension: "VOICE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 31 },
  { tool_id: 26, question_text: "公司投资于员工成长", dimension: "DEVELOPMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 32 },
  { tool_id: 26, question_text: "公司尊重员工的工作生活平衡", dimension: "WORK_LIFE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 33 },
  { tool_id: 26, question_text: "公司将失败视为学习机会", dimension: "RISK_TAKING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 34 },
  { tool_id: 26, question_text: "公司注重细节和精度", dimension: "QUALITY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 35 },
  { tool_id: 26, question_text: "公司鼓励创造性思维", dimension: "INNOVATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 36 },
  { tool_id: 26, question_text: "公司团队合作氛围浓厚", dimension: "COLLABORATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 37 },
  { tool_id: 26, question_text: "公司以成果为导向", dimension: "RESULTS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 38 },
  { tool_id: 26, question_text: "公司始终以客户为中心", dimension: "CUSTOMER_FOCUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 39 },
  { tool_id: 26, question_text: "公司对未来有清晰的愿景", dimension: "CLARITY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 40 }
];

console.log(`准备插入工具26的${tool26Questions.length}道题目...`);

// 获取当前最大的question id
const maxIdResult = db.prepare('SELECT MAX(id) as maxId FROM questions').get();
let startId = (maxIdResult.maxId || 0) + 1;

// 插入工具26的题目
const insertQuestion = db.prepare(`
  INSERT INTO questions (id, tool_id, question_text, dimension, question_type, option_a, option_b, option_c, option_d, option_e, answer, order_num)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((questions) => {
  for (const q of questions) {
    insertQuestion.run(startId, q.tool_id, q.question_text, q.dimension, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.option_e, q.answer, q.order_num);
    startId++;
  }
});

insertMany(tool26Questions);
console.log(`成功插入工具26的${tool26Questions.length}道题目`);

// 更新工具26的题目数量
db.prepare('UPDATE assessment_tools SET question_count = ? WHERE id = ?').run(tool26Questions.length, 26);
console.log(`已更新工具26的题目数量为${tool26Questions.length}`);

// 工具27: 领导力行为测评（DDI对标）- 50题
const tool27Questions = [
  // 基于DDI的领导力行为模型
  { tool_id: 27, question_text: "我为团队设定清晰的方向和目标", dimension: "DIRECTION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 1 },
  { tool_id: 27, question_text: "我激励团队成员发挥最佳表现", dimension: "INSPIRATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 2 },
  { tool_id: 27, question_text: "我以身作则，践行公司价值观", dimension: "ROLE_MODELING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 3 },
  { tool_id: 27, question_text: "我授权团队成员自主决策", dimension: "EMPOWERMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 4 },
  { tool_id: 27, question_text: "我提供具体的反馈帮助他人改进", dimension: "FEEDBACK", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 5 },
  { tool_id: 27, question_text: "我培养团队成员的能力", dimension: "DEVELOPMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 6 },
  { tool_id: 27, question_text: "我建立高效的团队", dimension: "TEAM_BUILDING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 7 },
  { tool_id: 27, question_text: "我做出及时和有效的决策", dimension: "DECISION_MAKING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 8 },
  { tool_id: 27, question_text: "我管理变革并获得支持", dimension: "CHANGE_MANAGEMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 9 },
  { tool_id: 27, question_text: "我建立和维护人际关系", dimension: "RELATIONSHIPS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 10 },
  { tool_id: 27, question_text: "我沟通组织的愿景和目标", dimension: "DIRECTION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 11 },
  { tool_id: 27, question_text: "我认可和欣赏他人的贡献", dimension: "INSPIRATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 12 },
  { tool_id: 27, question_text: "我展示诚信和道德行为", dimension: "ROLE_MODELING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 13 },
  { tool_id: 27, question_text: "我给予团队成员自主空间", dimension: "EMPOWERMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 14 },
  { tool_id: 27, question_text: "我定期进行绩效反馈", dimension: "FEEDBACK", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 15 },
  { tool_id: 27, question_text: "我为团队成员提供成长机会", dimension: "DEVELOPMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 16 },
  { tool_id: 27, question_text: "我促进团队凝聚力和合作", dimension: "TEAM_BUILDING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 17 },
  { tool_id: 27, question_text: "我分析信息并做出明智选择", dimension: "DECISION_MAKING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 18 },
  { tool_id: 27, question_text: "我帮助他人理解变革的必要性", dimension: "CHANGE_MANAGEMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 19 },
  { tool_id: 27, question_text: "我建立内外部的合作网络", dimension: "RELATIONSHIPS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 20 },
  { tool_id: 27, question_text: "我确保团队理解组织目标", dimension: "DIRECTION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 21 },
  { tool_id: 27, question_text: "我激发团队的热情和承诺", dimension: "INSPIRATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 22 },
  { tool_id: 27, question_text: "我言行一致", dimension: "ROLE_MODELING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 23 },
  { tool_id: 27, question_text: "我鼓励团队成员承担责任", dimension: "EMPOWERMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 24 },
  { tool_id: 27, question_text: "我提供建设性的批评", dimension: "FEEDBACK", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 25 },
  { tool_id: 27, question_text: "我指导团队成员提升技能", dimension: "DEVELOPMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 26 },
  { tool_id: 27, question_text: "我处理团队冲突", dimension: "TEAM_BUILDING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 27 },
  { tool_id: 27, question_text: "我考虑多种方案后做决定", dimension: "DECISION_MAKING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 28 },
  { tool_id: 27, question_text: "我管理变革阻力", dimension: "CHANGE_MANAGEMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 29 },
  { tool_id: 27, question_text: "我维护良好的人际关系", dimension: "RELATIONSHIPS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 30 },
  { tool_id: 27, question_text: "我调整领导风格适应不同情况", dimension: "DIRECTION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 31 },
  { tool_id: 27, question_text: "我庆祝团队成功", dimension: "INSPIRATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 32 },
  { tool_id: 27, question_text: "我承认自己的错误", dimension: "ROLE_MODELING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 33 },
  { tool_id: 27, question_text: "我信任团队成员", dimension: "EMPOWERMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 34 },
  { tool_id: 27, question_text: "我及时给予反馈", dimension: "FEEDBACK", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 35 },
  { tool_id: 27, question_text: "我为团队成员规划职业路径", dimension: "DEVELOPMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 36 },
  { tool_id: 27, question_text: "我建立团队身份认同", dimension: "TEAM_BUILDING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 37 },
  { tool_id: 27, question_text: "我在不确定性下做决策", dimension: "DECISION_MAKING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 38 },
  { tool_id: 27, question_text: "我沟通变革的好处", dimension: "CHANGE_MANAGEMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 39 },
  { tool_id: 27, question_text: "我建立信任关系", dimension: "RELATIONSHIPS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 40 },
  { tool_id: 27, question_text: "我确保团队资源到位", dimension: "DIRECTION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 41 },
  { tool_id: 27, question_text: "我展现对团队的信心", dimension: "INSPIRATION", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 42 },
  { tool_id: 27, question_text: "我展示专业精神", dimension: "ROLE_MODELING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 43 },
  { tool_id: 27, question_text: "我鼓励创新和改进", dimension: "EMPOWERMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 44 },
  { tool_id: 27, question_text: "我关注他人发展需求", dimension: "FEEDBACK", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 45 },
  { tool_id: 27, question_text: "我提供挑战性任务", dimension: "DEVELOPMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 46 },
  { tool_id: 27, question_text: "我促进知识共享", dimension: "TEAM_BUILDING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 47 },
  { tool_id: 27, question_text: "我平衡分析和直觉", dimension: "DECISION_MAKING", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 48 },
  { tool_id: 27, question_text: "我以身作则推动变革", dimension: "CHANGE_MANAGEMENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 49 },
  { tool_id: 27, question_text: "我建立双赢关系", dimension: "RELATIONSHIPS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 50 }
];

console.log(`准备插入工具27的${tool27Questions.length}道题目...`);

// 更新startId
const maxIdResult2 = db.prepare('SELECT MAX(id) as maxId FROM questions').get();
startId = (maxIdResult2.maxId || 0) + 1;

const insertMany2 = db.transaction((questions) => {
  for (const q of questions) {
    insertQuestion.run(startId, q.tool_id, q.question_text, q.dimension, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.option_e, q.answer, q.order_num);
    startId++;
  }
});

insertMany2(tool27Questions);
console.log(`成功插入工具27的${tool27Questions.length}道题目`);

// 更新工具27的题目数量
db.prepare('UPDATE assessment_tools SET question_count = ? WHERE id = ?').run(tool27Questions.length, 27);
console.log(`已更新工具27的题目数量为${tool27Questions.length}`);

console.log('工具26和27题目插入完成！');
