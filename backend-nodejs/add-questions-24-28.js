// 为工具24-28添加题目
const betterSqlite3 = require('better-sqlite3');
const db = betterSqlite3('talent_assessment_new.db');

// 工具24: 能力测评（SHL对标）- 60题
const tool24Questions = [
  // 言语推理部分（20题）
  { tool_id: 24, question_text: "阅读以下段落：'人工智能的发展正在改变各行各业。从医疗诊断到金融分析，AI系统能够处理大量数据并做出准确预测。然而，这也引发了关于就业和隐私的担忧。' 根据段落，以下哪项是正确的？", dimension: "VERBAL", question_type: "single_choice", option_a: "AI只会带来好处", option_b: "AI引发了就业和隐私担忧", option_c: "AI只用于医疗和金融", option_d: "AI无法处理大量数据", answer: "B", order_num: 1 },
  { tool_id: 24, question_text: "词语关系：'医生'对'医院'，相当于'教师'对？", dimension: "VERBAL", question_type: "single_choice", option_a: "学生", option_b: "教室", option_c: "课本", option_d: "教育", answer: "B", order_num: 2 },
  { tool_id: 24, question_text: "以下哪项是段落的主要观点？'数字化转型不仅仅是技术的升级，更是思维方式的转变。企业需要培养数字化思维，重新设计业务流程，提升客户体验。'", dimension: "VERBAL", question_type: "single_choice", option_a: "技术升级很重要", option_b: "数字化转型是思维和业务的全面转变", option_c: "客户体验不重要", option_d: "企业不需要培养思维", answer: "B", order_num: 3 },
  { tool_id: 24, question_text: "逻辑推理：所有的鸟都会飞。企鹅是鸟。因此？", dimension: "VERBAL", question_type: "single_choice", option_a: "企鹅会飞", option_b: "企鹅不会飞", option_c: "有些鸟不会飞", option_d: "无法确定", answer: "A", order_num: 4 },
  { tool_id: 24, question_text: "'创新是企业发展的动力。没有创新，企业就会停滞不前。' 以下哪项最符合这段话的意思？", dimension: "VERBAL", question_type: "single_choice", option_a: "创新不重要", option_b: "企业可以没有创新", option_c: "创新对企业发展至关重要", option_d: "停滞不前是好事", answer: "C", order_num: 5 },
  { tool_id: 24, question_text: "请选出与'快乐'意思最接近的词：", dimension: "VERBAL", question_type: "single_choice", option_a: "悲伤", option_b: "喜悦", option_c: "愤怒", option_d: "恐惧", answer: "B", order_num: 6 },
  { tool_id: 24, question_text: "段落理解：'团队合作能够汇聚不同的技能和视角，产生协同效应。有效的团队合作需要明确的目标、开放的沟通和相互信任。' 团队合作的关键要素不包括：", dimension: "VERBAL", question_type: "single_choice", option_a: "明确的目标", option_b: "开放的沟通", option_c: "相互信任", option_d: "个人英雄主义", answer: "D", order_num: 7 },
  { tool_id: 24, question_text: "以下哪个选项与'书籍：知识'的关系最相似？", dimension: "VERBAL", question_type: "single_choice", option_a: "食物：饥饿", option_b: "运动：健康", option_c: "工具：技能", option_d: "水：干渴", answer: "B", order_num: 8 },
  { tool_id: 24, question_text: "请找出以下句子中的逻辑错误：'这个决定是错误的，因为大多数人都不支持。大多数人都不支持，因为这个决定是错误的。'", dimension: "VERBAL", question_type: "single_choice", option_a: "没有错误", option_b: "循环论证", option_c: "偷换概念", option_d: "以偏概全", answer: "B", order_num: 9 },
  { tool_id: 24, question_text: "'数据驱动决策能够提高组织的适应性和竞争力。' 以下哪项是对这句话的最佳解释？", dimension: "VERBAL", question_type: "single_choice", option_a: "数据没用", option_b: "决策不需要数据", option_c: "基于数据的决策有助于组织适应和发展", option_d: "竞争力不重要", answer: "C", order_num: 10 },
  { tool_id: 24, question_text: "请选出与其他三个不同的选项：", dimension: "VERBAL", question_type: "single_choice", option_a: "苹果", option_b: "香蕉", option_c: "胡萝卜", option_d: "橙子", answer: "C", order_num: 11 },
  { tool_id: 24, question_text: "段落推理：'研究表明，定期锻炼能够改善心理健康。心理健康的人工作表现更好。因此，定期锻炼的员工工作表现更好。' 这个推理的前提是：", dimension: "VERBAL", question_type: "single_choice", option_a: "所有员工都定期锻炼", option_b: "锻炼改善心理健康，心理健康改善工作表现", option_c: "工作表现与健康无关", option_d: "心理健康不重要", answer: "B", order_num: 12 },
  { tool_id: 24, question_text: "请选出最合适的结尾：'成功不是终点，失败也不是终结，最重要的是...'", dimension: "VERBAL", question_type: "single_choice", option_a: "放弃的勇气", option_b: "继续前进的勇气", option_c: "逃避困难", option_d: "指责他人", answer: "B", order_num: 13 },
  { tool_id: 24, question_text: "以下哪个选项与'教师：教育'的关系最相似？", dimension: "VERBAL", question_type: "single_choice", option_a: "医生：治疗", option_b: "司机：乘客", option_c: "厨师：服务员", option_d: "学生：学习", answer: "A", order_num: 14 },
  { tool_id: 24, question_text: "请判断以下论证是否有效：'所有的成功人士都很努力。李明很努力。因此，李明一定会成功。'", dimension: "VERBAL", question_type: "single_choice", option_a: "有效", option_b: "无效，肯定后件错误", option_c: "无效，否定前件错误", option_d: "无法判断", answer: "B", order_num: 15 },
  { tool_id: 24, question_text: "段落理解：'创新不仅仅是技术创新，还包括商业模式创新、管理创新和文化创新。真正的创新能够为客户创造价值，为组织带来竞争优势。' 根据段落，创新的类型不包括：", dimension: "VERBAL", question_type: "single_choice", option_a: "技术创新", option_b: "商业模式创新", option_c: "模仿抄袭", option_d: "管理创新", answer: "C", order_num: 16 },
  { tool_id: 24, question_text: "请选出与'高'意思相反的词：", dimension: "VERBAL", question_type: "single_choice", option_a: "大", option_b: "低", option_c: "长", option_d: "宽", answer: "B", order_num: 17 },
  { tool_id: 24, question_text: "以下哪个选项最能完成类比？'笔：写字'，相当于'刀：？'", dimension: "VERBAL", question_type: "single_choice", option_a: "切菜", option_b: "吃饭", option_c: "说话", option_d: "走路", answer: "A", order_num: 18 },
  { tool_id: 24, question_text: "请找出段落中的假设：'公司应该投资员工培训，因为培训能够提高员工技能，技能提高能够提升绩效。'", dimension: "VERBAL", question_type: "single_choice", option_a: "培训没有用", option_b: "技能提升能够转化为绩效提升", option_c: "公司不需要绩效", option_d: "员工不需要技能", answer: "B", order_num: 19 },
  { tool_id: 24, question_text: "请选出最符合逻辑的排列：1. 种子 2. 发芽 3. 开花 4. 结果", dimension: "VERBAL", question_type: "single_choice", option_a: "1-2-3-4", option_b: "4-3-2-1", option_c: "2-1-3-4", option_d: "3-4-1-2", answer: "A", order_num: 20 },
  
  // 数字推理部分（20题）
  { tool_id: 24, question_text: "如果一家公司2023年的营收是500万元，2024年增长到600万元，增长率是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "10%", option_b: "20%", option_c: "25%", option_d: "30%", answer: "B", order_num: 21 },
  { tool_id: 24, question_text: "一个项目需要30天完成，如果增加5个人，只需要20天。原来有多少人在工作？（假设每个人的工作效率相同）", dimension: "NUMERICAL", question_type: "single_choice", option_a: "5人", option_b: "10人", option_c: "15人", option_d: "20人", answer: "B", order_num: 22 },
  { tool_id: 24, question_text: "某公司有员工120人，其中60%是男性，男性中有75%拥有本科以上学历。请问拥有本科以上学历的男性员工有多少人？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "45人", option_b: "54人", option_c: "60人", option_d: "72人", answer: "B", order_num: 23 },
  { tool_id: 24, question_text: "一个产品的成本是80元，标价是120元。如果打8折销售，利润率是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "20%", option_b: "25%", option_c: "30%", option_d: "40%", answer: "A", order_num: 24 },
  { tool_id: 24, question_text: "如果x + 2y = 10，且2x - y = 5，那么x的值是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "2", option_b: "3", option_c: "4", option_d: "5", answer: "C", order_num: 25 },
  { tool_id: 24, question_text: "一个团队有8个人，需要选出3个人组成小组，有多少种不同的选法？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "24种", option_b: "48种", option_c: "56种", option_d: "336种", answer: "C", order_num: 26 },
  { tool_id: 24, question_text: "某公司2024年第一季度的销售额分别是：1月100万，2月120万，3月150万。平均月销售额是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "110万", option_b: "120万", option_c: "123.3万", option_d: "130万", answer: "B", order_num: 27 },
  { tool_id: 24, question_text: "如果投资10万元，年收益率是8%，按复利计算，3年后的本息总额是多少？（约等于）", dimension: "NUMERICAL", question_type: "single_choice", option_a: "12.4万", option_b: "12.6万", option_c: "12.8万", option_d: "13.0万", answer: "B", order_num: 28 },
  { tool_id: 24, question_text: "一个项目预算是50万元，已经花费了35万元，完成了60%的进度。如果按照这个效率，完成整个项目还需要多少钱？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "15万", option_b: "18.3万", option_c: "20万", option_d: "23.3万", answer: "D", order_num: 29 },
  { tool_id: 24, question_text: "某公司有A、B两个产品线。A产品贡献60%的营收，B产品贡献40%。A产品的利润率是20%，B产品的利润率是30%。公司整体利润率是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "22%", option_b: "24%", option_c: "25%", option_d: "26%", answer: "B", order_num: 30 },
  { tool_id: 24, question_text: "如果一个数是另一个数的3倍，且两数之和是48，那么较小的数是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "12", option_b: "16", option_c: "24", option_d: "36", answer: "A", order_num: 31 },
  { tool_id: 24, question_text: "某公司2023年的利润是200万元，2024年增长了15%，2025年增长了20%。2025年的利润是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "230万", option_b: "245万", option_c: "276万", option_d: "300万", answer: "C", order_num: 32 },
  { tool_id: 24, question_text: "一个班级有50名学生，数学考试的平均分是75分。如果去掉一个最高分98分和一个最低分52分，新的平均分是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "74.6分", option_b: "75分", option_c: "75.4分", option_d: "76分", answer: "A", order_num: 33 },
  { tool_id: 24, question_text: "如果5台机器5分钟生产5个零件，那么100台机器生产100个零件需要多少分钟？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "5分钟", option_b: "20分钟", option_c: "100分钟", option_d: "500分钟", answer: "A", order_num: 34 },
  { tool_id: 24, question_text: "某公司招聘，初试通过率是60%，复试通过率是50%，最终录用率是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "10%", option_b: "20%", option_c: "30%", option_d: "50%", answer: "C", order_num: 35 },
  { tool_id: 24, question_text: "一个项目投资100万元，每年回报20万元，不考虑货币时间价值，投资回收期是多少年？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "3年", option_b: "4年", option_c: "5年", option_d: "6年", answer: "C", order_num: 36 },
  { tool_id: 24, question_text: "如果a:b = 2:3，b:c = 4:5，那么a:b:c等于多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "2:3:5", option_b: "8:12:15", option_c: "2:4:5", option_d: "4:6:5", answer: "B", order_num: 37 },
  { tool_id: 24, question_text: "某公司有3个部门，A部门有20人，B部门有30人，C部门有50人。要从公司随机选一个人，选到B部门员工的概率是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "20%", option_b: "30%", option_c: "40%", option_d: "50%", answer: "B", order_num: 38 },
  { tool_id: 24, question_text: "一个产品原价200元，先涨价10%，再降价10%，最终价格是多少？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "198元", option_b: "200元", option_c: "202元", option_d: "220元", answer: "A", order_num: 39 },
  { tool_id: 24, question_text: "如果完成一项工作需要6小时，两个人一起做需要4小时，那么第二个人单独做需要多少小时？", dimension: "NUMERICAL", question_type: "single_choice", option_a: "10小时", option_b: "12小时", option_c: "15小时", option_d: "18小时", answer: "B", order_num: 40 },
  
  // 归纳推理部分（20题）
  { tool_id: 24, question_text: "找出下一个数字：2, 4, 8, 16, ?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "20", option_b: "24", option_c: "32", option_d: "64", answer: "C", order_num: 41 },
  { tool_id: 24, question_text: "找出不同的选项：", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "三角形", option_b: "正方形", option_c: "圆形", option_d: "立方体", answer: "D", order_num: 42 },
  { tool_id: 24, question_text: "找出规律并填写下一个：A, C, E, G, ?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "H", option_b: "I", option_c: "J", option_d: "K", answer: "B", order_num: 43 },
  { tool_id: 24, question_text: "如果所有的猫都是哺乳动物，所有的哺乳动物都是动物，那么所有的猫都是动物。这个推理属于：", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "归纳推理", option_b: "演绎推理", option_c: "类比推理", option_d: "概率推理", answer: "B", order_num: 44 },
  { tool_id: 24, question_text: "找出下一个图形应该是什么：○, ○○, ○○○, ?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "○", option_b: "○○", option_c: "○○○○", option_d: "○○○○○", answer: "C", order_num: 45 },
  { tool_id: 24, question_text: "找出序列中的规律：1, 1, 2, 3, 5, 8, ?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "11", option_b: "12", option_c: "13", option_d: "15", answer: "C", order_num: 46 },
  { tool_id: 24, question_text: "如果Monday（周一）对应Moon（月亮），那么Saturday（周六）对应什么？", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "Sun（太阳）", option_b: "Saturn（土星）", option_c: "Earth（地球）", option_d: "Mars（火星）", answer: "B", order_num: 47 },
  { tool_id: 24, question_text: "找出最不适合的选项：", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "汽车", option_b: "自行车", option_c: "飞机", option_d: "房子", answer: "D", order_num: 48 },
  { tool_id: 24, question_text: "找出规律：3, 6, 11, 18, 27, ?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "35", option_b: "36", option_c: "38", option_d: "40", answer: "C", order_num: 49 },
  { tool_id: 24, question_text: "如果'hand'对应'glove'，那么'foot'对应什么？", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "shoe", option_b: "sock", option_c: "boot", option_d: "sandal", answer: "A", order_num: 50 },
  { tool_id: 24, question_text: "找出下一个字母：Z, X, V, T, ?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "S", option_b: "R", option_c: "Q", option_d: "P", answer: "B", order_num: 51 },
  { tool_id: 24, question_text: "找出不同的选项：", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "医生", option_b: "护士", option_c: "教师", option_d: "医院", answer: "D", order_num: 52 },
  { tool_id: 24, question_text: "找出规律：2, 3, 5, 7, 11, ?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "12", option_b: "13", option_c: "14", option_d: "15", answer: "B", order_num: 53 },
  { tool_id: 24, question_text: "如果'眼睛'对应'看'，那么'耳朵'对应什么？", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "听", option_b: "说", option_c: "闻", option_d: "尝", answer: "A", order_num: 54 },
  { tool_id: 24, question_text: "找出下一个数字：1, 4, 9, 16, 25, ?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "30", option_b: "33", option_c: "36", option_d: "49", answer: "C", order_num: 55 },
  { tool_id: 24, question_text: "找出序列中的错误：10, 20, 30, 40, 50, 60, 70", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "没有错误", option_b: "30", option_c: "50", option_d: "70", answer: "A", order_num: 56 },
  { tool_id: 24, question_text: "如果'热'对应'冷'，那么'快'对应什么？", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "慢", option_b: "迅速", option_c: "加速", option_d: "高速", answer: "A", order_num: 57 },
  { tool_id: 24, question_text: "找出规律：AB, BC, CD, DE, ?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "EF", option_b: "FG", option_c: "ED", option_d: "GH", answer: "A", order_num: 58 },
  { tool_id: 24, question_text: "找出不同的选项：", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "春天", option_b: "夏天", option_c: "晴天", option_d: "冬天", answer: "C", order_num: 59 },
  { tool_id: 24, question_text: "如果1=5, 2=10, 3=15, 4=20, 那么5=?", dimension: "INDUCTIVE", question_type: "single_choice", option_a: "25", option_b: "5", option_c: "30", option_d: "100", answer: "B", order_num: 60 }
];

console.log(`准备插入工具24的${tool24Questions.length}道题目...`);

// 获取当前最大的question id
const maxIdResult = db.prepare('SELECT MAX(id) as maxId FROM questions').get();
let startId = (maxIdResult.maxId || 0) + 1;

// 插入工具24的题目
const insertQuestion = db.prepare(`
  INSERT INTO questions (id, tool_id, question_text, dimension, question_type, option_a, option_b, option_c, option_d, answer, order_num)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((questions) => {
  for (const q of questions) {
    insertQuestion.run(startId, q.tool_id, q.question_text, q.dimension, q.question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.answer, q.order_num);
    startId++;
  }
});

insertMany(tool24Questions);
console.log(`成功插入工具24的${tool24Questions.length}道题目`);

// 更新工具的题目数量
db.prepare('UPDATE assessment_tools SET question_count = ? WHERE id = ?').run(tool24Questions.length, 24);
console.log(`已更新工具24的题目数量为${tool24Questions.length}`);

console.log('工具24题目插入完成！');
