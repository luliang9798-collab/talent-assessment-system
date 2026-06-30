-- 人才测评系统数据库重构脚本（对标SHL/北森）
-- 版本: 2.0
-- 日期: 2026-06-27

-- ============================================
-- 1. 胜任力模型相关表
-- ============================================

-- 胜任力模型表
CREATE TABLE IF NOT EXISTS competency_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    model_code TEXT UNIQUE NOT NULL,
    description TEXT,
    model_type TEXT,  -- 'UCF' (SHL), 'BEISEN', 'CUSTOM'
    version TEXT,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 胜任力维度表
CREATE TABLE IF NOT EXISTS competency_dimensions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    dimension_name TEXT NOT NULL,
    dimension_code TEXT NOT NULL,
    parent_id INTEGER DEFAULT 0,
    description TEXT,
    behavior_indicators TEXT,  -- JSON格式的行为指标
    sort_order INTEGER DEFAULT 0,
    UNIQUE(model_id, dimension_code)
);

-- 岗位-胜任力映射表
CREATE TABLE IF NOT EXISTS job_competency_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_title TEXT NOT NULL,
    department TEXT,
    dimension_id INTEGER,
    importance_level INTEGER,  -- 1-5，重要性等级
    benchmark_score REAL,  -- 基准分数
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. 测评量表相关表
-- ============================================

-- 测评量表表
CREATE TABLE IF NOT EXISTS assessment_scales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scale_name TEXT NOT NULL,
    scale_code TEXT UNIQUE NOT NULL,
    scale_type TEXT,  -- 'PERSONALITY', 'ABILITY', 'MOTIVATION', 'INTEREST', 'VALUES'
    description TEXT,
    question_count INTEGER,
    estimated_time INTEGER,
    scoring_method TEXT,  -- 'LIKERT', 'FORCED_CHOICE', 'IPSATIVE'
    reliability REAL,  -- 信度系数
    validity REAL,  -- 效度系数
    norm_data TEXT,  -- JSON格式的常模数据
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 量表题目表
CREATE TABLE IF NOT EXISTS scale_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scale_id INTEGER,
    question_text TEXT NOT NULL,
    question_type TEXT,  -- 'SINGLE', 'MULTIPLE', 'LIKERT', 'FORCED'
    dimension_id INTEGER,  -- 关联的胜任力维度
    reverse_scoring INTEGER DEFAULT 0,  -- 是否反向计分
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1
);

-- 题目选项表
CREATE TABLE IF NOT EXISTS question_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    option_text TEXT NOT NULL,
    option_value INTEGER,  -- 选项分值
    sort_order INTEGER DEFAULT 0
);

-- 量表维度得分表（用于计算子维度得分）
CREATE TABLE IF NOT EXISTS scale_dimension_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    response_id INTEGER,
    scale_id INTEGER,
    dimension_id INTEGER,
    raw_score REAL,
    t_score REAL,  -- T分数（均值50，标准差10）
    percentile INTEGER,  -- 百分等级
    level TEXT  -- 'LOW', 'MEDIUM', 'HIGH'
);

-- ============================================
-- 3. 360评估相关表
-- ============================================

-- 360评估项目表
CREATE TABLE IF NOT EXISTS assessment_360 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    description TEXT,
    target_user_id INTEGER,
    questionnaire_template TEXT,  -- JSON格式的问卷模板
    start_date DATE,
    end_date DATE,
    status INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评估人表
CREATE TABLE IF NOT EXISTS evaluators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_360_id INTEGER,
    evaluator_user_id INTEGER,
    evaluator_type TEXT,  -- 'SELF', 'SUPERVISOR', 'PEER', 'SUBORDINATE', 'OTHER'
    evaluation_link TEXT,
    completed INTEGER DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评估结果表
CREATE TABLE IF NOT EXISTS evaluation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_360_id INTEGER,
    evaluator_id INTEGER,
    dimension_id INTEGER,
    score REAL,
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. 人才盘点相关表
-- ============================================

-- 人才盘点项目表
CREATE TABLE IF NOT EXISTS talent_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_name TEXT NOT NULL,
    review_type TEXT,  -- 'ANNUAL', 'PROMOTION', 'SUCCESSION'
    department TEXT,
    review_date DATE,
    status INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 九宫格数据表
CREATE TABLE IF NOT EXISTS talent_grid_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER,
    user_id INTEGER,
    performance_score REAL,  -- 绩效得分
    potential_score REAL,  -- 潜力得分
    grid_position TEXT,  -- '1-1', '1-2', ... '3-3'
    category TEXT,  -- 'STAR', 'HIGH_POTENTIAL', 'CORE', 'NEEDS_IMPROVEMENT'
    recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 个人发展计划表
CREATE TABLE IF NOT EXISTS development_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    plan_name TEXT NOT NULL,
    development_goals TEXT,  -- JSON格式的发展目标
    action_items TEXT,  -- JSON格式的行动项
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0,
    status INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. 报告模板相关表
-- ============================================

-- 报告模板表
CREATE TABLE IF NOT EXISTS report_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    template_type TEXT,  -- 'INDIVIDUAL', 'TEAM', 'COMPARISON', 'MATCH'
    description TEXT,
    template_structure TEXT,  -- JSON格式的模板结构
    chart_config TEXT,  -- JSON格式的图表配置
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 报告章节表
CREATE TABLE IF NOT EXISTS report_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER,
    section_name TEXT NOT NULL,
    section_type TEXT,  -- 'SUMMARY', 'DIMENSION', 'CHART', 'TABLE', 'TEXT'
    content_template TEXT,
    sort_order INTEGER DEFAULT 0
);

-- ============================================
-- 6. 增强现有表
-- ============================================

-- 在用户表添加更多字段
ALTER TABLE users ADD COLUMN department_id INTEGER;
ALTER TABLE users ADD COLUMN position TEXT;
ALTER TABLE users ADD COLUMN performance_score REAL;
ALTER TABLE users ADD COLUMN potential_score REAL;

-- 在测评任务表添加更多字段
ALTER TABLE assessment_tasks ADD COLUMN response_id INTEGER;
ALTER TABLE assessment_tasks ADD COLUMN started_at DATETIME;
ALTER TABLE assessment_tasks ADD COLUMN completed_at DATETIME;

-- 在测评报告表添加更多字段
ALTER TABLE assessment_reports ADD COLUMN report_template_id INTEGER;
ALTER TABLE assessment_reports ADD COLUMN dimension_scores TEXT;  -- JSON格式的各维度得分
ALTER TABLE assessment_reports ADD COLUMN chart_data TEXT;  -- JSON格式的图表数据
ALTER TABLE assessment_reports ADD COLUMN pdf_path TEXT;

-- ============================================
-- 7. 索引优化
-- ============================================

CREATE INDEX IF NOT EXISTS idx_competency_dimensions_model ON competency_dimensions(model_id);
CREATE INDEX IF NOT EXISTS idx_scale_questions_scale ON scale_questions(scale_id);
CREATE INDEX IF NOT EXISTS idx_assessment_tasks_user ON assessment_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_tasks_project ON assessment_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_assessment_reports_user ON assessment_reports(user_id);

-- ============================================
-- 8. 初始化数据
-- ============================================

-- 插入SHL UCF胜任力模型
INSERT OR IGNORE INTO competency_models (model_name, model_code, description, model_type, version) VALUES
('SHL全方位胜任力模型', 'UCF', 'SHL Universal Competency Framework', 'UCF', '3.0');

-- 插入北森胜任力模型
INSERT OR IGNORE INTO competency_models (model_name, model_code, description, model_type, version) VALUES
('北森综合胜任力模型', 'BEISEN', '北森3大类53维度胜任力模型', 'BEISEN', '2.0');

-- 插入大五人格量表
INSERT OR IGNORE INTO assessment_scales (scale_name, scale_code, scale_type, description, question_count, estimated_time, scoring_method) VALUES
('大五人格测评', 'BIG_FIVE', 'PERSONALITY', '基于大五人格理论的性格测评', 60, 20, 'LIKERT');

-- 插入MBTI量表
INSERT OR IGNORE INTO assessment_scales (scale_name, scale_code, scale_type, description, question_count, estimated_time, scoring_method) VALUES
('MBTI职业性格测评', 'MBTI', 'PERSONALITY', 'MBTI职业性格类型测评', 93, 25, 'FORCED_CHOICE');

-- 插入DISC量表
INSERT OR IGNORE INTO assessment_scales (scale_name, scale_code, scale_type, description, question_count, estimated_time, scoring_method) VALUES
('DISC行为风格测评', 'DISC', 'PERSONALITY', 'DISC行为风格测评', 24, 15, 'LIKERT');

-- 插入霍兰德职业兴趣量表
INSERT OR IGNORE INTO assessment_scales (scale_name, scale_code, scale_type, description, question_count, estimated_time, scoring_method) VALUES
('霍兰德职业兴趣测评', 'HOLLAND', 'INTEREST', '霍兰德职业兴趣测评', 60, 20, 'LIKERT');

-- 插入情商量表
INSERT OR IGNORE INTO assessment_scales (scale_name, scale_code, scale_type, description, question_count, estimated_time, scoring_method) VALUES
('情商（EQ）测评', 'EQ', 'ABILITY', '情商测评', 33, 15, 'LIKERT');

-- 插入工作动机量表
INSERT OR IGNORE INTO assessment_scales (scale_name, scale_code, scale_type, description, question_count, estimated_time, scoring_method) VALUES
('工作动机测评', 'MOTIVATION', 'MOTIVATION', '工作动机与激励因素测评', 20, 10, 'LIKERT');

-- 插入工作价值观量表
INSERT OR IGNORE INTO assessment_scales (scale_name, scale_code, scale_type, description, question_count, estimated_time, scoring_method) VALUES
('工作价值观测评', 'VALUES', 'VALUES', '工作价值观测评', 21, 10, 'LIKERT');

COMMIT;
