// 为工具25-28添加题目
const betterSqlite3 = require('better-sqlite3');
const db = betterSqlite3('talent_assessment_new.db');

// 工具25: 团队角色测评（北森对标）- 45题
const tool25Questions = [
  // 基于Belbin团队角色理论
  { tool_id: 25, question_text: "在团队中，我善于提出新的想法和创意", dimension: "PLANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 1 },
  { tool_id: 25, question_text: "我注重细节和准确性，确保工作质量", dimension: "IMPLEMENTER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 2 },
  { tool_id: 25, question_text: "我善于协调团队成员之间的关系", dimension: "TEAMWORKER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 3 },
  { tool_id: 25, question_text: "我善于评估方案的风险和可行性", dimension: "MONITOR_EVALUATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 4 },
  { tool_id: 25, question_text: "我善于推动团队达成共识和决策", dimension: "COORDINATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 5 },
  { tool_id: 25, question_text: "我善于激发团队成员的潜力", dimension: "RESOURCE_INVESTIGATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 6 },
  { tool_id: 25, question_text: "我善于制定详细的执行计划", dimension: "IMPLEMENTER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 7 },
  { tool_id: 25, question_text: "我善于应对突发情况和变化", dimension: "SHAPER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 8 },
  { tool_id: 25, question_text: "我善于寻找外部资源和支持", dimension: "RESOURCE_INVESTIGATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 9 },
  { tool_id: 25, question_text: "我注重团队目标和使命", dimension: "COORDINATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 10 },
  { tool_id: 25, question_text: "我善于发现问题的根本原因", dimension: "MONITOR_EVALUATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 11 },
  { tool_id: 25, question_text: "我善于营造轻松的团队氛围", dimension: "TEAMWORKER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 12 },
  { tool_id: 25, question_text: "我善于挑战现状和传统做法", dimension: "SHAPER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 13 },
  { tool_id: 25, question_text: "我善于将创意转化为可行的方案", dimension: "PLANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 14 },
  { tool_id: 25, question_text: "我善于倾听他人的意见", dimension: "TEAMWORKER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 15 },
  { tool_id: 25, question_text: "我善于分析复杂的信息", dimension: "MONITOR_EVALUATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 16 },
  { tool_id: 25, question_text: "我善于推动团队执行决策", dimension: "SHAPER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 17 },
  { tool_id: 25, question_text: "我善于建立外部联系和网络", dimension: "RESOURCE_INVESTIGATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 18 },
  { tool_id: 25, question_text: "我善于分配任务和职责", dimension: "COORDINATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 19 },
  { tool_id: 25, question_text: "我善于将计划付诸实施", dimension: "IMPLEMENTER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 20 },
  { tool_id: 25, question_text: "我善于提出创新的解决方案", dimension: "PLANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 21 },
  { tool_id: 25, question_text: "我善于处理团队冲突", dimension: "TEAMWORKER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 22 },
  { tool_id: 25, question_text: "我善于做出客观的判断", dimension: "MONITOR_EVALUATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 23 },
  { tool_id: 25, question_text: "我善于激励团队达成目标", dimension: "SHAPER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 24 },
  { tool_id: 25, question_text: "我善于探索新的机会", dimension: "RESOURCE_INVESTIGATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 25 },
  { tool_id: 25, question_text: "我善于澄清团队目标", dimension: "COORDINATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 26 },
  { tool_id: 25, question_text: "我注重流程和秩序", dimension: "IMPLEMENTER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 27 },
  { tool_id: 25, question_text: "我善于产生突破性的想法", dimension: "PLANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 28 },
  { tool_id: 25, question_text: "我善于支持团队成员", dimension: "TEAMWORKER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 29 },
  { tool_id: 25, question_text: "我善于权衡利弊", dimension: "MONITOR_EVALUATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 30 },
  { tool_id: 25, question_text: "我善于克服障碍", dimension: "SHAPER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 31 },
  { tool_id: 25, question_text: "我善于引入新的想法", dimension: "RESOURCE_INVESTIGATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 32 },
  { tool_id: 25, question_text: "我善于引导团队讨论", dimension: "COORDINATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 33 },
  { tool_id: 25, question_text: "我善于按时完成任务", dimension: "IMPLEMENTER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 34 },
  { tool_id: 25, question_text: "我善于用新颖的方式解决问题", dimension: "PLANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 35 },
  { tool_id: 25, question_text: "我善于维护团队和谐", dimension: "TEAMWORKER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 36 },
  { tool_id: 25, question_text: "我善于识别潜在问题", dimension: "MONITOR_EVALUATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 37 },
  { tool_id: 25, question_text: "我善于推动变革", dimension: "SHAPER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 38 },
  { tool_id: 25, question_text: "我善于建立合作伙伴关系", dimension: "RESOURCE_INVESTIGATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 39 },
  { tool_id: 25, question_text: "我善于总结团队讨论", dimension: "COORDINATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 40 },
  { tool_id: 25, question_text: "我善于将想法转化为行动", dimension: "IMPLEMENTER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 41 },
  { tool_id: 25, question_text: "我善于思考未来的可能性", dimension: "PLANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 42 },
  { tool_id: 25, question_text: "我善于理解他人的感受", dimension: "TEAMWORKER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 43 },
  { tool_id: 25, question_text: "我善于保持客观中立", dimension: "MONITOR_EVALUATOR", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 44 },
  { tool_id: 25, question_text: "我善于应对压力", dimension: "SHAPER", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 45 }
];

console.log(`准备插入工具25的${tool25Questions.length}道题目...`);

// 获取当前最大的question id
const maxIdResult = db.prepare('SELECT MAX(id) as maxId FROM questions').get();
let startId = (maxIdResult.maxId || 0) + 1;

// 插入工具25的题目
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

insertMany(tool25Questions);
console.log(`成功插入工具25的${tool25Questions.length}道题目`);

// 更新工具的题目数量
db.prepare('UPDATE assessment_tools SET question_count = ? WHERE id = ?').run(tool25Questions.length, 25);
console.log(`已更新工具25的题目数量为${tool25Questions.length}`);

console.log('工具25题目插入完成！');
