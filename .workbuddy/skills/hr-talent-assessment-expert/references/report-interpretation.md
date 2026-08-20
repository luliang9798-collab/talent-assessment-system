# 测评报告深度解读框架

每份测评提交后，系统在 `report_data.professionalEnhancement` 中生成 5 个标准模块。本文档说明每个模块的含义，以及如何把它们"翻译"成员工能听懂的发展反馈。

## 数据结构
```
report_data = {
  toolName, overallScore, dimensions{...}, percentiles{...},
  summary, strengths[], weaknesses[], suggestions[],
  professionalEnhancement: {
    executiveSummary,            // 执行摘要
    detailedAnalysis: { <维度>: {score, interpretation, workplaceBehavior, energySource, conflictStyle} },
    careerMatch: { topRoles: [{role, matchRate, reason}] },
    developmentRoadmap: { shortTerm: [...], longTerm: [...] },
    riskAssessment: { risks: [{risk, mitigation}] }
  }
}
```

## 1. executiveSummary（执行摘要）
- **用途**：管理者/本人一眼看懂"这人是谁、强在哪、补什么"
- **写法**：1-2 句话 = 综合定位 + 最大优势 + 最关键待发展项
- **示例话术**："该候选人在尽责性与宜人性上明显优于常模，适合需要可靠交付与客户信任的岗位；情绪稳定性偏弱，高压环境下需配套压力管理支持。"

## 2. detailedAnalysis（维度详解）
每个维度包含 4 个字段：
- `score`：实测分（1-5）
- `interpretation`：该分数的人才含义
- `workplaceBehavior`：在团队/任务中的典型行为表现
- `energySource`：什么情境下状态最好（能量来源）
- `conflictStyle`：面对冲突时的典型反应

**反馈建议**：挑 2-3 个最相关维度重点讲，不要逐字念全部维度。

## 3. careerMatch（职业匹配）
- `topRoles[]`：推荐岗位 + `matchRate`(匹配度%) + `reason`(为什么匹配)
- **用法**：招聘筛选时看匹配度是否 ≥ 70%；发展谈话时看"下一个可能角色"
- **注意**：匹配度是基于维度画像的推断，非保证录用结论

## 4. developmentRoadmap（发展路线图）
- `shortTerm`（3-6 个月）：可速赢的小目标/培训
- `longTerm`（1-2 年）：能力跃迁与角色准备
- **用法**：直接转化为个人发展计划(IDP)的两条时间线

## 5. riskAssessment（风险评估）
- `risks[]`：`risk`(潜在风险描述) + `mitigation`(缓解措施)
- **典型风险**：情绪稳定性低→高压离职；外向性过高+宜人性低→团队协作摩擦；动机外在化→激励依赖外部
- **用法**：1对1反馈时温和提出，重在"如何预防"而非"贴标签"

## 向员工反馈的 5 步法
1. **先肯定**：从 `strengths` 与高百分位维度切入，建立信任
2. **摆事实**：用数据（分数/百分位）而非主观评价
3. **给意义**：用 `detailedAnalysis.workplaceBehavior` 说明"这对工作意味着什么"
4. **指方向**：用 `developmentRoadmap` 给出具体可行动作
5. **防风险**：用 `riskAssessment.mitigation` 共同制定预防计划

## 常见误用（避免）
- ❌ 把测评当"终审判决"——它只是多源信息之一
- ❌ 只念分数不解释行为含义
- ❌ 用性格类型给人贴永久标签（如"他是I人所以不爱沟通"）
- ❌ 在本人未参与的情况下用报告做晋升/淘汰决定
