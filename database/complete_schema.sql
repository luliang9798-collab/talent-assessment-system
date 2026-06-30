-- 人才测评系统完整数据库 schema
-- 创建时间: 2026-06-27

PRAGMA foreign_keys = OFF;

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS assessment_answers;
DROP TABLE IF EXISTS assessment_questions;
DROP TABLE IF EXISTS assessment_reports;
DROP TABLE IF EXISTS assessment_tasks;
DROP TABLE IF EXISTS assessment_tools;
DROP TABLE IF EXISTS assessment_projects;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- 1. 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    real_name TEXT,
    email TEXT,
    phone TEXT,
    department_id INTEGER,
    position TEXT,
    role_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 角色表
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT UNIQUE NOT NULL,
    role_code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 部门表
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_name TEXT NOT NULL,
    parent_id INTEGER,
    dept_head_id INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 测评项目表
CREATE TABLE assessment_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    project_type TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 5. 测评工具表
CREATE TABLE assessment_tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT NOT NULL,
    tool_code TEXT UNIQUE NOT NULL,
    description TEXT,
    tool_type TEXT,
    estimated_time INTEGER,
    question_count INTEGER DEFAULT 0,
    dimensions TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 测评题目表（新增）
CREATE TABLE assessment_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_order INTEGER,
    question_type TEXT DEFAULT 'scale',
    options TEXT,
    dimension TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES assessment_tools(id)
);

-- 7. 测评任务表
CREATE TABLE assessment_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    user_id INTEGER,
    tool_id INTEGER,
    task_type TEXT DEFAULT 'self',
    status INTEGER DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES assessment_projects(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tool_id) REFERENCES assessment_tools(id)
);

-- 8. 测评答案表
CREATE TABLE assessment_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    question_id INTEGER,
    answer_value INTEGER,
    answer_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES assessment_tasks(id),
    FOREIGN KEY (question_id) REFERENCES assessment_questions(id)
);

-- 9. 测评报告表
CREATE TABLE assessment_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    user_id INTEGER,
    project_id INTEGER,
    report_type TEXT DEFAULT 'individual',
    title TEXT,
    content TEXT,
    scores TEXT,
    pdf_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES assessment_tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES assessment_projects(id)
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_projects_status ON assessment_projects(status);
CREATE INDEX idx_tasks_user ON assessment_tasks(user_id);
CREATE INDEX idx_tasks_project ON assessment_tasks(project_id);
CREATE INDEX idx_tasks_status ON assessment_tasks(status);
CREATE INDEX idx_questions_tool ON assessment_questions(tool_id);
CREATE INDEX idx_answers_task ON assessment_answers(task_id);

PRAGMA foreign_keys = ON;

-- 插入基础数据

-- 1. 插入角色
INSERT INTO roles (role_name, role_code, description) VALUES
('系统管理员', 'ADMIN', '系统管理员，拥有全部权限'),
('HR管理员', 'HR_MANAGER', 'HR管理员，负责人力资源测评管理'),
('普通用户', 'USER', '普通用户，可以参与测评');

-- 2. 插入管理员账号 (密码: admin123)
INSERT INTO users (username, password_hash, real_name, email, role_id) VALUES
('admin', '$2a$10$8K1p/a0dL3LzWx5Y5Y5Y5e5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5', '系统管理员', 'admin@talent.com', 1);

-- 3. 插入部门
INSERT INTO departments (dept_name, description) VALUES
('总部', '公司总部'),
('研发中心', '负责产品研发'),
('生产中心', '负责生产制造'),
('销售中心', '负责市场销售'),
('人力资源部', '负责人力资源管理');

-- 4. 插入测评工具
INSERT INTO assessment_tools (tool_name, tool_code, description, tool_type, estimated_time, dimensions) VALUES
('大五人格测试', 'PERSONALITY', '基于大五人格模型的人格测评工具', 'personality', 15, '["开放性","尽责性","外向性","宜人性","神经质"]'),
('职业兴趣测试', 'HOLLAND', '基于霍兰德职业兴趣理论', 'interest', 10, '["R型","I型","A型","S型","E型","C型"]'),
('工作动机测试', 'MOTIVATION', '评估工作动机和驱动力', 'motivation', 8, '["薪酬回报","职业发展","工作意义","工作自主","工作环境"]'),
('领导力测评', 'LEADERSHIP', '评估领导力能力和风格', 'leadership', 12, '["愿景传达","创新鼓励","决策参与","反馈指导","榜样作用"]'),
('工作价值观测试', 'VALUES', '评估工作价值观和伦理取向', 'values', 10, '["诚实","公平","尊重","责任","团队合作"]'),
('MBTI职业性格测试', 'MBTI', '基于MBTI理论的职业性格测评', 'personality', 20, '["E_I","S_N","T_F","J_P"]'),
('DISC行为风格测评', 'DISC', '基于DISC理论的行为风格测评', 'behavior', 15, '["D型","I型","S型","C型"]'),
('情商测试', 'EQ', '评估情商能力和水平', 'emotion', 12, '["自我意识","自我调节","动机","同理心","社交技能"]'),
('职业锚测试', 'CAREER_ANCHOR', '评估职业锚和发展定位', 'career', 10, '["技术/职能","管理","自主性","安全感","创业","服务","纯粹挑战","生活方式"]'),
('组织文化测评', 'ORG_CULTURE', '评估组织文化匹配度', 'culture', 10, '["价值观匹配","文化适应","重视感","留任意愿","推荐意愿"]');

COMMIT;
