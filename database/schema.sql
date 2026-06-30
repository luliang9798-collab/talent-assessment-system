-- 人才测评系统数据库设计
-- 创建数据库
CREATE DATABASE IF NOT EXISTS talent_assessment 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE talent_assessment;

-- ============================================
-- 1. 用户与权限管理
-- ============================================

-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    real_name VARCHAR(100) COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    department_id BIGINT COMMENT '部门ID',
    position_id BIGINT COMMENT '职位ID',
    employee_id VARCHAR(50) COMMENT '员工编号',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    last_login_time DATETIME COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_department (department_id),
    INDEX idx_position (position_id),
    INDEX idx_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    role_name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(255) COMMENT '角色描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 用户角色关联表
CREATE TABLE user_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- ============================================
-- 2. 组织架构
-- ============================================

-- 部门表
CREATE TABLE departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '部门ID',
    dept_name VARCHAR(100) NOT NULL COMMENT '部门名称',
    dept_code VARCHAR(50) NOT NULL UNIQUE COMMENT '部门编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父部门ID',
    manager_id BIGINT COMMENT '部门负责人ID',
    description VARCHAR(255) COMMENT '部门描述',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 职位表
CREATE TABLE positions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '职位ID',
    position_name VARCHAR(100) NOT NULL COMMENT '职位名称',
    position_code VARCHAR(50) NOT NULL UNIQUE COMMENT '职位编码',
    department_id BIGINT COMMENT '所属部门ID',
    level TINYINT COMMENT '职级',
    description VARCHAR(255) COMMENT '职位描述',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='职位表';

-- ============================================
-- 3. 测评项目管理
-- ============================================

-- 测评项目表
CREATE TABLE assessment_projects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '项目ID',
    project_name VARCHAR(200) NOT NULL COMMENT '项目名称',
    project_code VARCHAR(50) NOT NULL UNIQUE COMMENT '项目编码',
    description TEXT COMMENT '项目描述',
    project_type VARCHAR(50) COMMENT '项目类型：RECRUITMENT-招聘，PROMOTION-晋升，DEVELOPMENT-发展',
    target_department_ids VARCHAR(500) COMMENT '目标部门ID列表（逗号分隔）',
    target_position_ids VARCHAR(500) COMMENT '目标职位ID列表（逗号分隔）',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    status TINYINT DEFAULT 0 COMMENT '状态：0-草稿，1-进行中，2-已完成，3-已取消',
    created_by BIGINT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测评项目表';

-- 测评工具表
CREATE TABLE assessment_tools (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '工具ID',
    tool_name VARCHAR(100) NOT NULL COMMENT '工具名称',
    tool_code VARCHAR(50) NOT NULL UNIQUE COMMENT '工具编码',
    tool_type VARCHAR(50) COMMENT '工具类型：PERSONALITY-人格，ABILITY-能力，MOTIVATION-动机，VALUE-价值观，SKILL-技能',
    description TEXT COMMENT '工具描述',
    estimated_time INT COMMENT '预计完成时间（分钟）',
    question_count INT COMMENT '题目数量',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测评工具表';

-- 项目工具关联表
CREATE TABLE project_tools (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    tool_id BIGINT NOT NULL COMMENT '工具ID',
    weight DECIMAL(5,2) DEFAULT 1.00 COMMENT '权重',
    order_num INT DEFAULT 0 COMMENT '排序号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_project_tool (project_id, tool_id),
    INDEX idx_project (project_id),
    INDEX idx_tool (tool_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目工具关联表';

-- ============================================
-- 4. 题目与维度管理
-- ============================================

-- 测评维度表
CREATE TABLE assessment_dimensions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '维度ID',
    dimension_name VARCHAR(100) NOT NULL COMMENT '维度名称',
    dimension_code VARCHAR(50) NOT NULL UNIQUE COMMENT '维度编码',
    tool_id BIGINT NOT NULL COMMENT '所属工具ID',
    description VARCHAR(255) COMMENT '维度描述',
    weight DECIMAL(5,2) DEFAULT 1.00 COMMENT '权重',
    order_num INT DEFAULT 0 COMMENT '排序号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_tool (tool_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测评维度表';

-- 题目表
CREATE TABLE questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '题目ID',
    question_text TEXT NOT NULL COMMENT '题目内容',
    tool_id BIGINT NOT NULL COMMENT '所属工具ID',
    dimension_id BIGINT COMMENT '所属维度ID',
    question_type VARCHAR(20) COMMENT '题目类型：SINGLE_CHOICE-单选，MULTI_CHOICE-多选，LIKERT-量表，OPEN-开放',
    options JSON COMMENT '选项（JSON格式）',
    scoring_rule JSON COMMENT '计分规则（JSON格式）',
    order_num INT DEFAULT 0 COMMENT '排序号',
    status TINYINT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_tool (tool_id),
    INDEX idx_dimension (dimension_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目表';

-- ============================================
-- 5. 测评执行与数据采集
-- ============================================

-- 测评任务表
CREATE TABLE assessment_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '任务ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '被测人ID',
    tool_id BIGINT NOT NULL COMMENT '工具ID',
    status TINYINT DEFAULT 0 COMMENT '状态：0-未开始，1-进行中，2-已完成，3-已过期',
    start_time DATETIME COMMENT '开始时间',
    submit_time DATETIME COMMENT '提交时间',
    score DECIMAL(5,2) COMMENT '得分',
    report_id BIGINT COMMENT '报告ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_project_user_tool (project_id, user_id, tool_id),
    INDEX idx_project (project_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测评任务表';

-- 答题记录表
CREATE TABLE assessment_responses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    question_id BIGINT NOT NULL COMMENT '题目ID',
    response_data JSON NOT NULL COMMENT '答题数据（JSON格式）',
    response_time INT COMMENT '答题用时（秒）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_task (task_id),
    INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='答题记录表';

-- 上传数据表
CREATE TABLE uploaded_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '数据ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_type VARCHAR(50) COMMENT '文件类型',
    data_type VARCHAR(50) COMMENT '数据类型：PERFORMANCE-绩效，TRAINING-培训，ASSESSMENT-测评',
    record_count INT DEFAULT 0 COMMENT '记录数',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待处理，1-处理中，2-已完成，3-处理失败',
    error_message TEXT COMMENT '错误信息',
    uploaded_by BIGINT COMMENT '上传人ID',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    processed_at DATETIME COMMENT '处理时间',
    INDEX idx_project (project_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='上传数据表';

-- ============================================
-- 6. 分析报告管理
-- ============================================

-- 测评报告表
CREATE TABLE assessment_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '报告ID',
    report_code VARCHAR(50) NOT NULL UNIQUE COMMENT '报告编码',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '被测人ID',
    report_type VARCHAR(50) COMMENT '报告类型：INDIVIDUAL-个人，TEAM-团队，COMPARISON-对比',
    overall_score DECIMAL(5,2) COMMENT '总体得分',
    dimension_scores JSON COMMENT '维度得分（JSON格式）',
    strengths TEXT COMMENT '优势',
    weaknesses TEXT COMMENT '不足',
    recommendations TEXT COMMENT '建议',
    report_url VARCHAR(500) COMMENT '报告文件URL',
    status TINYINT DEFAULT 0 COMMENT '状态：0-生成中，1-已完成，2-生成失败',
    generated_by BIGINT COMMENT '生成人ID',
    generated_at DATETIME COMMENT '生成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_project (project_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测评报告表';

-- 人才画像表
CREATE TABLE talent_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '画像ID',
    user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    personality_traits JSON COMMENT '人格特质',
    ability_scores JSON COMMENT '能力得分',
    motivation_factors JSON COMMENT '动机因素',
    value_orientation JSON COMMENT '价值观取向',
    skill_competencies JSON COMMENT '技能胜任力',
    career_interests JSON COMMENT '职业兴趣',
    development_areas TEXT COMMENT '发展领域',
    potential_score DECIMAL(5,2) COMMENT '潜力得分',
    risk_factors JSON COMMENT '风险因素',
    last_assessment_date DATE COMMENT '最后测评日期',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人才画像表';

-- ============================================
-- 7. 系统配置
-- ============================================

-- 系统配置表
CREATE TABLE system_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(20) COMMENT '配置类型：STRING,NUMBER,BOOLEAN,JSON',
    description VARCHAR(255) COMMENT '描述',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 操作日志表
CREATE TABLE operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id BIGINT COMMENT '用户ID',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_desc VARCHAR(255) COMMENT '操作描述',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    request_url VARCHAR(500) COMMENT '请求URL',
    request_method VARCHAR(10) COMMENT '请求方法',
    response_time INT COMMENT '响应时间（毫秒）',
    status TINYINT DEFAULT 1 COMMENT '状态：0-失败，1-成功',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认角色
INSERT INTO roles (role_name, role_code, description) VALUES
('系统管理员', 'ROLE_ADMIN', '系统管理员，拥有所有权限'),
('HR管理员', 'ROLE_HR_ADMIN', 'HR管理员，负责人力资源管理'),
('部门经理', 'ROLE_DEPT_MANAGER', '部门经理，负责本部门人员管理'),
('普通用户', 'ROLE_USER', '普通用户，可以参与测评');

-- 插入默认管理员用户（密码：admin123，实际应使用BCrypt加密）
-- 密码：使用BCrypt加密后的 "admin123"
INSERT INTO users (username, password, real_name, email, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 'admin@talent.com', 1);

-- 关联管理员角色
INSERT INTO user_roles (user_id, role_id) 
SELECT 1, id FROM roles WHERE role_code = 'ROLE_ADMIN';

-- 插入默认部门
INSERT INTO departments (dept_name, dept_code, description) VALUES
('总部', 'HQ', '公司总部'),
('研发中心', 'RDC', '研发中心'),
('生产中心', 'PC', '生产中心'),
('销售中心', 'SC', '销售中心'),
('人力资源部', 'HR', '人力资源部');

-- 插入默认职位
INSERT INTO positions (position_name, position_code, department_id, level, description) VALUES
('总经理', 'GM', 1, 10, '公司总经理'),
('部门经理', 'DM', NULL, 8, '部门经理'),
('高级工程师', 'SE', 2, 7, '高级工程师'),
('工程师', 'ENG', 2, 6, '工程师'),
('销售总监', 'SD', 4, 8, '销售总监'),
('销售经理', 'SM', 4, 7, '销售经理'),
('生产主管', 'PM', 3, 7, '生产主管');

-- 插入测评工具
INSERT INTO assessment_tools (tool_name, tool_code, tool_type, description, estimated_time, question_count) VALUES
('大五人格测评', 'BIG_FIVE', 'PERSONALITY', '基于大五人格理论的人格测评工具', 20, 50),
('霍兰德职业兴趣测评', 'HOLLAND', 'INTEREST', '基于霍兰德职业兴趣理论', 15, 42),
('MBTI职业性格测评', 'MBTI', 'PERSONALITY', 'MBTI职业性格类型测评', 20, 93),
('工作动机测评', 'MOTIVATION', 'MOTIVATION', '工作动机与激励因素测评', 15, 30),
('价值观测评', 'VALUES', 'VALUE', '个人价值观与组织价值观匹配度测评', 15, 25),
('领导力测评', 'LEADERSHIP', 'SKILL', '领导力胜任力测评', 25, 40),
('情商测评', 'EQ', 'ABILITY', '情商（情绪智力）测评', 20, 33),
('团队角色测评', 'TEAM_ROLE', 'PERSONALITY', '贝尔宾团队角色测评', 15, 28);

-- 插入系统配置
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('system.name', '人才测评系统', 'STRING', '系统名称'),
('system.version', '1.0.0', 'STRING', '系统版本'),
('report.storage.path', '/data/reports', 'STRING', '报告存储路径'),
('upload.max.file.size', '10485760', 'NUMBER', '上传文件大小限制（字节）'),
('assessment.default.language', 'zh_CN', 'STRING', '默认测评语言');

-- 创建视图：用户完整信息
CREATE VIEW v_user_info AS
SELECT 
    u.id,
    u.username,
    u.real_name,
    u.email,
    u.phone,
    u.employee_id,
    d.dept_name,
    p.position_name,
    u.status,
    u.last_login_time,
    u.created_at
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN positions p ON u.position_id = p.id;

-- 创建视图：测评项目统计
CREATE VIEW v_project_statistics AS
SELECT 
    p.id AS project_id,
    p.project_name,
    p.status AS project_status,
    COUNT(DISTINCT t.user_id) AS total_participants,
    COUNT(DISTINCT CASE WHEN t.status = 2 THEN t.user_id END) AS completed_participants,
    COUNT(DISTINCT CASE WHEN t.status = 0 THEN t.user_id END) AS pending_participants,
    CASE 
        WHEN COUNT(DISTINCT t.user_id) > 0 
        THEN ROUND(COUNT(DISTINCT CASE WHEN t.status = 2 THEN t.user_id END) * 100.0 / COUNT(DISTINCT t.user_id), 2)
        ELSE 0 
    END AS completion_rate
FROM assessment_projects p
LEFT JOIN assessment_tasks t ON p.id = t.project_id
GROUP BY p.id, p.project_name, p.status;

COMMIT;
