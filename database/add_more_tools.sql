-- 插入更多测评工具
-- 执行此脚本向系统中添加更多国际先进的测评工具

-- 6. MBTI职业性格测试
INSERT OR IGNORE INTO assessment_tools (tool_id, tool_name, tool_type, description, estimated_time, question_count, is_active, created_at)
VALUES ('MBTI', 'MBTI职业性格测试', 'PERSONALITY', '基于卡尔·荣格的心理类型理论，评估个人的性格类型偏好，包括外向/内向、感觉/直觉、思考/情感、判断/知觉四个维度', 25, 16, 1, datetime('now'));

-- 7. DISC行为风格测评
INSERT OR IGNORE INTO assessment_tools (tool_id, tool_name, tool_type, description, estimated_time, question_count, is_active, created_at)
VALUES ('DISC', 'DISC行为风格测评', 'BEHAVIOR', '评估个人的行为风格类型，包括支配型(D)、影响型(I)、稳健型(S)、服从型(C)四个维度，广泛应用于企业人才选拔', 15, 12, 1, datetime('now'));

-- 8. 情商测试EQ
INSERT OR IGNORE INTO assessment_tools (tool_id, tool_name, tool_type, description, estimated_time, question_count, is_active, created_at)
VALUES ('EQ', '情商测试(EQ)', 'EMOTIONAL', '评估个人的情绪智力水平，包括自我意识、自我管理、社交意识、关系管理四个维度', 20, 10, 1, datetime('now'));

-- 9. 职业锚测试
INSERT OR IGNORE INTO assessment_tools (tool_id, tool_name, tool_type, description, estimated_time, question_count, is_active, created_at)
VALUES ('CAREER_ANCHOR', '职业锚测试', 'CAREER', '基于Edgar Schein的职业锚理论，评估个人的职业价值观和职业定位偏好', 20, 8, 1, datetime('now'));

-- 10. 组织文化测评
INSERT OR IGNORE INTO assessment_tools (tool_id, tool_name, tool_type, description, estimated_time, question_count, is_active, created_at)
VALUES ('ORG_CULTURE', '组织文化测评', 'ORGANIZATION', '评估个人与组织文化的匹配度，包括创新、稳定性、尊重员工、结果导向、团队导向五个维度', 15, 9, 1, datetime('now'));

-- 插入对应的测评维度
-- MBTI维度
INSERT OR IGNORE INTO assessment_dimensions (dimension_id, tool_id, dimension_name, description, weight, created_at)
VALUES 
('MBTI_EI', 'MBTI', '外向-内向', '评估个人能量来源倾向', 1.0, datetime('now')),
('MBTI_SN', 'MBTI', '感觉-直觉', '评估个人信息获取倾向', 1.0, datetime('now')),
('MBTI_TF', 'MBTI', '思考-情感', '评估个人决策判断倾向', 1.0, datetime('now')),
('MBTI_JP', 'MBTI', '判断-知觉', '评估个人生活方式倾向', 1.0, datetime('now'));

-- DISC维度
INSERT OR IGNORE INTO assessment_dimensions (dimension_id, tool_id, dimension_name, description, weight, created_at)
VALUES 
('DISC_D', 'DISC', '支配型(D)', '评估个人的支配和控制倾向', 1.0, datetime('now')),
('DISC_I', 'DISC', '影响型(I)', '评估个人的社交和影响倾向', 1.0, datetime('now')),
('DISC_S', 'DISC', '稳健型(S)', '评估个人的稳定和合作倾向', 1.0, datetime('now')),
('DISC_C', 'DISC', '服从型(C)', '评估个人的服从和完美倾向', 1.0, datetime('now'));

-- EQ维度
INSERT OR IGNORE INTO assessment_dimensions (dimension_id, tool_id, dimension_name, description, weight, created_at)
VALUES 
('EQ_SELF_AWARE', 'EQ', '自我意识', '识别和理解自己情绪的能力', 1.0, datetime('now')),
('EQ_SELF_MANAGE', 'EQ', '自我管理', '管理和调节自己情绪的能力', 1.0, datetime('now')),
('EQ_SOCIAL_AWARE', 'EQ', '社交意识', '识别和理解他人情绪的能力', 1.0, datetime('now')),
('EQ_RELATION_MGMT', 'EQ', '关系管理', '建立和维护良好关系的能力', 1.0, datetime('now'));

-- 职业锚维度
INSERT OR IGNORE INTO assessment_dimensions (dimension_id, tool_id, dimension_name, description, weight, created_at)
VALUES 
('CAREER_TECH', 'CAREER_ANCHOR', '技术/职能型', '偏好在特定技术领域深耕', 1.0, datetime('now')),
('CAREER_MANAGE', 'CAREER_ANCHOR', '管理型', '偏好管理和领导他人', 1.0, datetime('now')),
('CAREER_AUTO', 'CAREER_ANCHOR', '自主/独立型', '偏好自主工作和独立决策', 1.0, datetime('now')),
('CAREER_SECURITY', 'CAREER_ANCHOR', '安全/稳定型', '偏好稳定和安全的工作环境', 1.0, datetime('now'));

-- 组织文化维度
INSERT OR IGNORE INTO assessment_dimensions (dimension_id, tool_id, dimension_name, description, weight, created_at)
VALUES 
('CULTURE_INNOVATE', 'ORG_CULTURE', '创新', '组织鼓励创新和变革的程度', 1.0, datetime('now')),
('CULTURE_STABILITY', 'ORG_CULTURE', '稳定性', '组织注重稳定和秩序的程度', 1.0, datetime('now')),
('CULTURE_RESPECT', 'ORG_CULTURE', '尊重员工', '组织尊重员工和人文关怀的程度', 1.0, datetime('now')),
('CULTURE_RESULT', 'ORG_CULTURE', '结果导向', '组织注重结果和绩效的程度', 1.0, datetime('now')),
('CULTURE_TEAM', 'ORG_CULTURE', '团队导向', '组织注重团队合作的程度', 1.0, datetime('now'));

-- ============================================
-- 插入题目数据
-- ============================================

-- MBTI题目（16题）
INSERT OR IGNORE INTO assessment_questions (question_id, tool_id, dimension_id, question_text, question_type, option_a, option_b, score_a, score_b, order_num, created_at)
VALUES 
-- 外向-内向维度
('MBTI_001', 'MBTI', 'MBTI_EI', '在社交场合中，您通常：', 'A_B', '主动与陌生人交谈', '等待别人主动交谈', 1, 0, 1, datetime('now')),
('MBTI_002', 'MBTI', 'MBTI_EI', '周末您更喜欢：', 'A_B', '参加聚会或外出活动', '在家休息或做自己喜欢的事', 1, 0, 2, datetime('now')),
('MBTI_003', 'MBTI', 'MBTI_EI', '您更倾向于：', 'A_B', '通过与人交流来充电', '通过独处来恢复精力', 1, 0, 3, datetime('now')),
('MBTI_004', 'MBTI', 'MBTI_EI', '在团队工作中，您通常：', 'A_B', '主动表达自己的想法', '先倾听他人的意见', 1, 0, 4, datetime('now')),

-- 感觉-直觉维度
('MBTI_005', 'MBTI', 'MBTI_SN', '您更注重：', 'A_B', '具体的事实和细节', '整体的模式和可能性', 1, 0, 5, datetime('now')),
('MBTI_006', 'MBTI', 'MBTI_SN', '在解决问题时，您通常：', 'A_B', '依靠经验和已知方法', '寻找新的和创新的方法', 1, 0, 6, datetime('now')),
('MBTI_007', 'MBTI', 'MBTI_SN', '您更喜欢：', 'A_B', '按部就班地执行计划', '保持灵活，随时调整', 1, 0, 7, datetime('now')),
('MBTI_008', 'MBTI', 'MBTI_SN', '您更倾向于相信：', 'A_B', '实际经验和观察', '直觉和灵感', 1, 0, 8, datetime('now')),

-- 思考-情感维度
('MBTI_009', 'MBTI', 'MBTI_TF', '在做决策时，您通常：', 'A_B', '依据逻辑和客观分析', '考虑人际关系和情感因素', 1, 0, 9, datetime('now')),
('MBTI_010', 'MBTI', 'MBTI_TF', '当朋友遇到问题时，您通常：', 'A_B', '提供理性的建议和解决方案', '提供情感支持和理解', 1, 0, 10, datetime('now')),
('MBTI_011', 'MBTI', 'MBTI_TF', '您更注重：', 'A_B', '公平和公正', '和谐和体谅', 1, 0, 11, datetime('now')),
('MBTI_012', 'MBTI', 'MBTI_TF', '在批评他人时，您通常：', 'A_B', '直接指出问题', '委婉地表达建议', 1, 0, 12, datetime('now')),

-- 判断-知觉维度
('MBTI_013', 'MBTI', 'MBTI_JP', '您更喜欢：', 'A_B', '提前制定详细的计划', '保持开放，顺其自然', 1, 0, 13, datetime('now')),
('MBTI_014', 'MBTI', 'MBTI_JP', '关于截止日期，您通常：', 'A_B', '提前完成，避免拖延', '在截止日期前冲刺完成', 1, 0, 14, datetime('now')),
('MBTI_015', 'MBTI', 'MBTI_JP', '您的工作环境通常：', 'A_B', '整洁有序，一切有固定位置', '相对随意，创意十足', 1, 0, 15, datetime('now')),
('MBTI_016', 'MBTI', 'MBTI_JP', '您更倾向于：', 'A_B', '尽快做出决定', '保持选项开放，延迟决定', 1, 0, 16, datetime('now'));

-- DISC题目（12题）
INSERT OR IGNORE INTO assessment_questions (question_id, tool_id, dimension_id, question_text, question_type, option_a, option_b, score_a, score_b, order_num, created_at)
VALUES 
-- 支配型(D)
('DISC_001', 'DISC', 'DISC_D', '在工作中，您通常：', 'A_B', '主动承担责任和挑战', '等待被分配任务', 1, 0, 1, datetime('now')),
('DISC_002', 'DISC', 'DISC_D', '面对竞争时，您通常：', 'A_B', '积极争取胜利', '保持合作，避免过度竞争', 1, 0, 2, datetime('now')),
('DISC_003', 'DISC', 'DISC_D', '您做决策的速度通常：', 'A_B', '快速果断', '谨慎慢速', 1, 0, 3, datetime('now')),

-- 影响型(I)
('DISC_004', 'DISC', 'DISC_I', '在团队中，您通常：', 'A_B', '活跃气氛，带动大家', '安静观察，适时发言', 1, 0, 4, datetime('now')),
('DISC_005', 'DISC', 'DISC_I', '您更喜欢的工作环境：', 'A_B', '开放、社交、充满活力', '安静、独立、有序', 1, 0, 5, datetime('now')),
('DISC_006', 'DISC', 'DISC_I', '与人沟通时，您通常：', 'A_B', '热情开朗，表达丰富', '稳重克制，言简意赅', 1, 0, 6, datetime('now')),

-- 稳健型(S)
('DISC_007', 'DISC', 'DISC_S', '面对变化时，您通常：', 'A_B', '适应变化，灵活调整', '偏好稳定，慢慢适应', 1, 0, 7, datetime('now')),
('DISC_008', 'DISC', 'DISC_S', '您更注重：', 'A_B', '维护和谐的人际关系', '完成任务和达成目标', 1, 0, 8, datetime('now')),
('DISC_009', 'DISC', 'DISC_S', '在工作中，您通常：', 'A_B', '团队合作，互相支持', '独立工作，自主完成', 1, 0, 9, datetime('now')),

-- 服从型(C)
('DISC_010', 'DISC', 'DISC_C', '您对待工作的态度：', 'A_B', '注重细节，追求完美', '关注大局，快速推进', 1, 0, 10, datetime('now')),
('DISC_011', 'DISC', 'DISC_C', '在做决定前，您通常：', 'A_B', '收集所有信息和数据', '凭借直觉和经验', 1, 0, 11, datetime('now')),
('DISC_012', 'DISC', 'DISC_C', '您更喜欢的工作方式：', 'A_B', '遵循规则和流程', '灵活应变，创新突破', 1, 0, 12, datetime('now'));

-- 情商测试EQ题目（10题）
INSERT OR IGNORE INTO assessment_questions (question_id, tool_id, dimension_id, question_text, question_type, option_a, option_b, score_a, score_b, order_num, created_at)
VALUES 
-- 自我意识
('EQ_001', 'EQ', 'EQ_SELF_AWARE', '您能准确识别自己当前的情绪状态吗？', 'A_B', '总是能', '偶尔能', 2, 0, 1, datetime('now')),
('EQ_002', 'EQ', 'EQ_SELF_AWARE', '您了解自己的情绪触发点吗？', 'A_B', '非常了解', '不太了解', 2, 0, 2, datetime('now')),

-- 自我管理
('EQ_003', 'EQ', 'EQ_SELF_MANAGE', '当感到愤怒时，您通常：', 'A_B', '能很快冷静下来', '需要很长时间才能平复', 2, 0, 3, datetime('now')),
('EQ_004', 'EQ', 'EQ_SELF_MANAGE', '面对压力时，您通常：', 'A_B', '能有效管理压力', '容易被压力压垮', 2, 0, 4, datetime('now')),

-- 社交意识
('EQ_005', 'EQ', 'EQ_SOCIAL_AWARE', '您能敏锐察觉他人的情绪变化吗？', 'A_B', '总是能', '偶尔能', 2, 0, 5, datetime('now')),
('EQ_006', 'EQ', 'EQ_SOCIAL_AWARE', '在谈话中，您通常：', 'A_B', '能理解对方的言外之意', '只关注对方说的内容', 2, 0, 6, datetime('now')),

-- 关系管理
('EQ_007', 'EQ', 'EQ_RELATION_MGMT', '您擅长处理人际冲突吗？', 'A_B', '非常擅长', '不太擅长', 2, 0, 7, datetime('now')),
('EQ_008', 'EQ', 'EQ_RELATION_MGMT', '您能有效地激励和影响他人吗？', 'A_B', '能', '不能', 2, 0, 8, datetime('now')),
('EQ_009', 'EQ', 'EQ_RELATION_MGMT', '在团队合作中，您通常：', 'A_B', '能促进团队和谐', '专注于完成任务', 2, 0, 9, datetime('now')),
('EQ_010', 'EQ', 'EQ_RELATION_MGMT', '您建立和维护人际关系的能力：', 'A_B', '非常强', '一般', 2, 0, 10, datetime('now'));

-- 职业锚测试题目（8题）
INSERT OR IGNORE INTO assessment_questions (question_id, tool_id, dimension_id, question_text, question_type, option_a, option_b, score_a, score_b, order_num, created_at)
VALUES 
('CAREER_001', 'CAREER_ANCHOR', 'CAREER_TECH', '您更喜欢：', 'A_B', '在特定专业领域深耕', '从事管理岗位', 2, 0, 1, datetime('now')),
('CAREER_002', 'CAREER_ANCHOR', 'CAREER_MANAGE', '您更喜欢：', 'A_B', '管理和领导团队', '独立完成任务', 2, 0, 2, datetime('now')),
('CAREER_003', 'CAREER_ANCHOR', 'CAREER_AUTO', '您更看重：', 'A_B', '工作的自主性和灵活性', '工作的稳定性和保障', 2, 0, 3, datetime('now')),
('CAREER_004', 'CAREER_ANCHOR', 'CAREER_SECURITY', '您更偏好：', 'A_B', '稳定安全的工作环境', '充满挑战和变化的工作', 2, 0, 4, datetime('now')),
('CAREER_005', 'CAREER_ANCHOR', 'CAREER_TECH', '当选择工作时，您最看重：', 'A_B', '专业成长和技术提升', '薪资和福利', 2, 0, 5, datetime('now')),
('CAREER_006', 'CAREER_ANCHOR', 'CAREER_MANAGE', '您认为自己的优势在于：', 'A_B', '专业知识和技术能力', '领导力和影响力', 2, 0, 6, datetime('now')),
('CAREER_007', 'CAREER_ANCHOR', 'CAREER_AUTO', '您希望的工作方式是：', 'A_B', '自主安排工作时间和方式', '遵循公司的规定和流程', 2, 0, 7, datetime('now')),
('CAREER_008', 'CAREER_ANCHOR', 'CAREER_SECURITY', '您选择雇主时最看重：', 'A_B', '长期稳定的雇佣关系', '快速的职业发展和晋升', 2, 0, 8, datetime('now'));

-- 组织文化测评题目（9题）
INSERT OR IGNORE INTO assessment_questions (question_id, tool_id, dimension_id, question_text, question_type, option_a, option_b, score_a, score_b, order_num, created_at)
VALUES 
('CULTURE_001', 'ORG_CULTURE', 'CULTURE_INNOVATE', '您所在的公司鼓励创新和新想法吗？', 'A_B', '非常鼓励', '不太鼓励', 2, 0, 1, datetime('now')),
('CULTURE_002', 'ORG_CULTURE', 'CULTURE_STABILITY', '您所在的公司注重流程和秩序吗？', 'A_B', '非常注重', '相对灵活', 2, 0, 2, datetime('now')),
('CULTURE_003', 'ORG_CULTURE', 'CULTURE_RESPECT', '您所在的公司尊重员工和人文关怀吗？', 'A_B', '非常尊重', '不太关注', 2, 0, 3, datetime('now')),
('CULTURE_004', 'ORG_CULTURE', 'CULTURE_RESULT', '您所在的公司注重结果和绩效吗？', 'A_B', '非常注重', '更注重过程', 2, 0, 4, datetime('now')),
('CULTURE_005', 'ORG_CULTURE', 'CULTURE_TEAM', '您所在的公司注重团队合作吗？', 'A_B', '非常注重', '更注重个人表现', 2, 0, 5, datetime('now')),
('CULTURE_006', 'ORG_CULTURE', 'CULTURE_INNOVATE', '在公司中，尝试新方法或犯错会被宽容吗？', 'A_B', '会被宽容', '会被严厉批评', 2, 0, 6, datetime('now')),
('CULTURE_007', 'ORG_CULTURE', 'CULTURE_STABILITY', '公司的政策和制度经常变化吗？', 'A_B', '很少变化，非常稳定', '经常变化，不太稳定', 2, 0, 7, datetime('now')),
('CULTURE_008', 'ORG_CULTURE', 'CULTURE_RESPECT', '公司领导关心员工的工作和生活平衡吗？', 'A_B', '非常关心', '不太关心', 2, 0, 8, datetime('now')),
('CULTURE_009', 'ORG_CULTURE', 'CULTURE_TEAM', '在公司中，团队合作还是内部竞争更常见？', 'A_B', '团队合作更常见', '内部竞争更常见', 2, 0, 9, datetime('now'));

-- 提交更改
COMMIT;
