// 为工具28添加题目（人格盲区测评 - Hogan对标）
const betterSqlite3 = require('better-sqlite3');
const db = betterSqlite3('talent_assessment_new.db');

// 工具28: 人格盲区测评（Hogan对标）- 55题
// 基于Hogan Development Survey (HDS)的11个脱轨因素
const tool28Questions = [
  // 1. 激动（Excitable）- 5题
  { tool_id: 28, question_text: "我容易对他人的行为感到沮丧", dimension: "EXCITABLE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 1 },
  { tool_id: 28, question_text: "我的情绪容易波动", dimension: "EXCITABLE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 2 },
  { tool_id: 28, question_text: "我有时会对团队失去兴趣", dimension: "EXCITABLE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 3 },
  { tool_id: 28, question_text: "我容易变得烦躁", dimension: "EXCITABLE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 4 },
  { tool_id: 28, question_text: "我的承诺会随时间减弱", dimension: "EXCITABLE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 5 },
  
  // 2. 谨慎（Cautious）- 5题
  { tool_id: 28, question_text: "我难以做出决策", dimension: "CAUTIOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 6 },
  { tool_id: 28, question_text: "我过度担心失败", dimension: "CAUTIOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 7 },
  { tool_id: 28, question_text: "我拖延重要决策", dimension: "CAUTIOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 8 },
  { tool_id: 28, question_text: "我需要大量信息才能做决定", dimension: "CAUTIOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 9 },
  { tool_id: 28, question_text: "我害怕承担风险", dimension: "CAUTIOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 10 },
  
  // 3. 任性（Erratic）- 5题
  { tool_id: 28, question_text: "我的行为难以预测", dimension: "ERRATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 11 },
  { tool_id: 28, question_text: "我情绪化地做决策", dimension: "ERRATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 12 },
  { tool_id: 28, question_text: "我难以管理自己的情绪", dimension: "ERRATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 13 },
  { tool_id: 28, question_text: "我的优先级经常变化", dimension: "ERRATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 14 },
  { tool_id: 28, question_text: "我做事缺乏一致性", dimension: "ERRATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 15 },
  
  // 4. 多疑（Sceptical）- 5题
  { tool_id: 28, question_text: "我难以信任他人", dimension: "SCEPTICAL", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 16 },
  { tool_id: 28, question_text: "我怀疑他人的动机", dimension: "SCEPTICAL", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 17 },
  { tool_id: 28, question_text: "我认为他人想利用我", dimension: "SCEPTICAL", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 18 },
  { tool_id: 28, question_text: "我预期最坏的情况", dimension: "SCEPTICAL", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 19 },
  { tool_id: 28, question_text: "我警惕他人的行为", dimension: "SCEPTICAL", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 20 },
  
  // 5. 逃避（Reserved）- 5题
  { tool_id: 28, question_text: "我难以与他人建立亲密关系", dimension: "RESERVED", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 21 },
  { tool_id: 28, question_text: "我偏好独立工作", dimension: "RESERVED", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 22 },
  { tool_id: 28, question_text: "我在社交场合感到不自在", dimension: "RESERVED", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 23 },
  { tool_id: 28, question_text: "我难以表达自己的感受", dimension: "RESERVED", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 24 },
  { tool_id: 28, question_text: "我与他人保持情感距离", dimension: "RESERVED", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 25 },
  
  // 6. 懒惰（Leisurely）- 5题
  { tool_id: 28, question_text: "我倾向于做最少的工作", dimension: "LEISURELY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 26 },
  { tool_id: 28, question_text: "我认为他人对我要求过多", dimension: "LEISURELY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 27 },
  { tool_id: 28, question_text: "我拖延不喜欢的任务", dimension: "LEISURELY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 28 },
  { tool_id: 28, question_text: "我期望特殊待遇", dimension: "LEISURELY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 29 },
  { tool_id: 28, question_text: "我对工作缺乏热情", dimension: "LEISURELY", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 30 },
  
  // 7. 傲慢（Arrogant）- 5题
  { tool_id: 28, question_text: "我认为自己比他人优秀", dimension: "ARROGANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 31 },
  { tool_id: 28, question_text: "我难以承认错误", dimension: "ARROGANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 32 },
  { tool_id: 28, question_text: "我期望他人认可我的优越", dimension: "ARROGANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 33 },
  { tool_id: 28, question_text: "我忽视他人的建议", dimension: "ARROGANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 34 },
  { tool_id: 28, question_text: "我认为自己总是对的", dimension: "ARROGANT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 35 },
  
  // 8. 微妙攻击（Mischievous）- 5题
  { tool_id: 28, question_text: "我喜欢挑战规则", dimension: "MISCHIEVOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 36 },
  { tool_id: 28, question_text: "我有时会说谎以达到目的", dimension: "MISCHIEVOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 37 },
  { tool_id: 28, question_text: "我享受冒险", dimension: "MISCHIEVOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 38 },
  { tool_id: 28, question_text: "我倾向于冲动行事", dimension: "MISCHIEVOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 39 },
  { tool_id: 28, question_text: "我寻求刺激和兴奋", dimension: "MISCHIEVOUS", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 40 },
  
  // 9. 戏剧化（Dramatic）- 5题
  { tool_id: 28, question_text: "我寻求他人的关注", dimension: "DRAMATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 41 },
  { tool_id: 28, question_text: "我夸大自己的成就", dimension: "DRAMATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 42 },
  { tool_id: 28, question_text: "我情绪表达夸张", dimension: "DRAMATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 43 },
  { tool_id: 28, question_text: "我需要成为焦点", dimension: "DRAMATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 44 },
  { tool_id: 28, question_text: "我善于吸引他人注意力", dimension: "DRAMATIC", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 45 },
  
  // 10. 幻想（Imaginative）- 5题
  { tool_id: 28, question_text: "我有不切实际的想法", dimension: "IMAGINATIVE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 46 },
  { tool_id: 28, question_text: "我沉浸在自己的想法中", dimension: "IMAGINATIVE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 47 },
  { tool_id: 28, question_text: "我忽视现实限制", dimension: "IMAGINATIVE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 48 },
  { tool_id: 28, question_text: "我相信自己的独特见解", dimension: "IMAGINATIVE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 49 },
  { tool_id: 28, question_text: "我难以区分现实和幻想", dimension: "IMAGINATIVE", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 50 },
  
  // 11. 勤勉（Diligent）- 5题
  { tool_id: 28, question_text: "我过度关注细节", dimension: "DILIGENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 51 },
  { tool_id: 28, question_text: "我难以委托任务", dimension: "DILIGENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 52 },
  { tool_id: 28, question_text: "我设定不切实际的高标准", dimension: "DILIGENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 53 },
  { tool_id: 28, question_text: "我过度检查工作", dimension: "DILIGENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 54 },
  { tool_id: 28, question_text: "我难以灵活性地应对变化", dimension: "DILIGENT", question_type: "likert", option_a: "完全不符合", option_b: "不太符合", option_c: "一般", option_d: "比较符合", option_e: "完全符合", answer: null, order_num: 55 }
];

console.log(`准备插入工具28的${tool28Questions.length}道题目...`);

// 获取当前最大的question id
const maxIdResult = db.prepare('SELECT MAX(id) as maxId FROM questions').get();
let startId = (maxIdResult.maxId || 0) + 1;

// 插入工具28的题目
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

insertMany(tool28Questions);
console.log(`成功插入工具28的${tool28Questions.length}道题目`);

// 更新工具28的题目数量
db.prepare('UPDATE assessment_tools SET question_count = ? WHERE id = ?').run(tool28Questions.length, 28);
console.log(`已更新工具28的题目数量为${tool28Questions.length}`);

console.log('工具28题目插入完成！');
console.log('所有工具（24-28）的题目都已添加完成！');
