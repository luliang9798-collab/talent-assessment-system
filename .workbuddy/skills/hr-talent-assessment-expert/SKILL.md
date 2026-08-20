---
name: hr-talent-assessment-expert
description: 人才测评系统专家。当用户需要操作 talent-assessment-system（Node.js + SQLite 本地/内网部署的网页测评系统）、为员工或候选人选择测评工具、解读测评报告、构建人才九宫格（绩效×潜力）、或部署/运维该系统时使用。覆盖 28 个测评工具的选型与解读、报告深度分析（执行摘要/维度详解/职业匹配/发展路线图/风险评估）、九宫格方法论、API 驱动与运维手册。
version: 1.0.0
---

# HR 人才测评系统专家（talent-assessment-system）

本 skill 让 AI 具备"人才测评顾问 + 系统操作员"的双重能力，帮助 HR/HRBP 在 WorkBuddy 中直接驱动 `talent-assessment-system` 完成选型、施测、解读、九宫格与部署。

## 何时使用

- 需要为某人/某岗位**选择测评工具**（28 个工具怎么选）
- 需要**解读测评报告**：分数含义、维度强弱、职业匹配、发展建议、风险
- 需要**生成或分析人才九宫格**（绩效 × 潜力）
- 需要**启动 / 部署 / 排查** talent-assessment-system
- 需要**批量建账号、派发测评任务、导出/打印报告**

## 系统概览

- **架构**：Node.js (Express) + SQLite (`better-sqlite3`) + 纯静态前端 HTML，无需外部数据库服务
- **入口**：`backend-nodejs/server-minimal.js`
- **前端页面**（`frontend/`）：
  - `index.html` 登录/首页
  - `assessment.html` 作答页
  - `report.html` 报告页（含深度分析）
  - `nine-box-optimized.html` 人才九宫格
  - `competency-model.html` 胜任力模型
- **数据自包含**：首次启动自动建库（`db-init/schema.sql` + `db-init/seed.sql`），默认管理员 `admin / admin123`，预置 **28 个工具、1401 道题**
- **环境变量**：`PORT`（默认 3000）、`JWT_SECRET`（令牌密钥，部署务必修改）、`DB_PATH`（数据库文件路径）
- **认证**：登录后所有受保护接口须带 `Authorization: Bearer <token>` 请求头

> 完整工具清单见 `references/tools-catalog.md`；报告解读框架见 `references/report-interpretation.md`；九宫格方法论见 `references/nine-box-methodology.md`；部署运维见 `references/operations-runbook.md`。

## 28 个测评工具（速览，详见 tools-catalog.md）

- **性格/职业 (1-7)**：大五人格、MBTI、DISC、霍兰德兴趣、情商 EQ、工作动机、工作价值观
- **胜任力 (8-15)**：领导力、沟通、团队协作、问题解决、抗压、学习、创新、执行力
- **专业测评 (16-23)**：360反馈、职业锚、心理资本、组织承诺、领导风格、职业成熟度、工作满意度、职业压力
- **对标工具 (24-28)**：能力(SHL对标)、团队角色(北森对标)、组织文化(Korn Ferry对标)、领导力行为(DDI对标)、人格盲区(Hogan对标)

## 报告深度分析框架（详见 report-interpretation.md）

每份报告在 `report_data.professionalEnhancement` 中包含 5 个模块，向员工反馈时务必覆盖：

1. `executiveSummary` — 一句话综合判断（优势+待发展+定位）
2. `detailedAnalysis` — 按维度的详细解读（分数 / 解读 / 职场行为 / 能量来源 / 冲突风格）
3. `careerMatch` — 推荐岗位 + 匹配度（%） + 匹配理由
4. `developmentRoadmap` — 短期（3-6月）/ 长期（1-2年）发展目标与动作
5. `riskAssessment` — 潜在风险 + 缓解措施

## 人才九宫格方法论（详见 nine-box-methodology.md）

- **横轴=绩效(Performance)**，**纵轴=潜力(Potential)**
- 9 个格子对应不同人才策略：超级明星 / 核心骨干 / 高潜人才 / 中坚力量 / 稳定贡献 / 待提升 / 潜力待挖 / 绩效不佳 / 风险
- 关键 API：`POST /api/nine-box/grids` 建网格 → `POST /api/nine-box/calculate-potential` 算潜力 → `GET /api/nine-box/grids/:id/export` 导出/打印

## 如何驱动系统（HR 实操流程）

1. **登录取 token**：
   `POST /api/auth/login`  body `{ "username":"admin", "password":"admin123" }` → 取 `token`
2. **所有受保护接口**加请求头 `Authorization: Bearer <token>`
3. **选工具**：`GET /api/tools`
4. **取题目**：`GET /api/tools/:toolId/questions` 或 `GET /api/questions/:toolId`
5. **提交作答**：`POST /api/submit-assessment/:taskId` 或 `POST /api/assessment/submit`
6. **取报告**：`GET /api/results/:id` → `result.report_data` 含 `professionalEnhancement`
7. **建九宫格**：`POST /api/nine-box/grids` → 写入人员与绩效/潜力 → `GET /api/nine-box/grids/:id/export` 打印
8. **用户管理**：`GET/POST/PUT/DELETE /api/users`（批量建账号用 POST 循环）

> 调用 API 时优先用本地已运行实例 `http://localhost:3000`；如服务未启动，先按 operations-runbook 启动。

## 标准工作流建议

- **招聘甄选**：岗位 JD → 选胜任力工具(8-15) + 性格工具(1-3) → 生成报告 → 职业匹配判断适配度
- **人才盘点**：全员九宫格 → 高潜标识 → 发展路线图落地
- **培训规划**：报告 `developmentRoadmap` + `riskAssessment` → 导出个人发展计划(IDP)
- **晋升/调岗**：结合绩效 + 潜力九宫格 + 领导力工具(8/20/27)

## 注意事项 / 常见坑

- **九宫格打印 401**：必须用 `Authorization` 请求头调用导出接口，不能把 token 放 URL `?token=` 查询参数
- **深度分析缺失**：`professionalEnhancement` 在"提交测评时"写入数据库；查看**旧报告**（修复前生成）不会显示深度分析，需重新提交一次
- **前端硬编码 localhost**：`dashboard.html` / `test-*.html` 含 `localhost:3000`，内网部署前需替换为相对路径或域名（见 runbook）
- **部署安全**：务必修改 `JWT_SECRET` 和默认管理员密码 `admin123`
