CREATE TABLE assessment_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT NOT NULL,
            project_type TEXT,
            description TEXT,
            status INTEGER DEFAULT 1,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

CREATE TABLE assessment_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_code TEXT UNIQUE NOT NULL,
            project_id INTEGER,
            user_id INTEGER,
            report_type TEXT,
            overall_score REAL,
            strengths TEXT,
            weaknesses TEXT,
            recommendations TEXT,
            status INTEGER DEFAULT 0,
            generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

CREATE TABLE assessment_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                user_id INTEGER NOT NULL,
                tool_id INTEGER NOT NULL,
                dimension_scores TEXT,
                total_score REAL,
                report_data TEXT,
                answers TEXT,
                status INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

CREATE TABLE assessment_tasks (id INTEGER PRIMARY KEY AUTOINCREMENT,task_name TEXT NOT NULL,project_id INTEGER NOT NULL,tool_id INTEGER NOT NULL,assignee_id INTEGER NOT NULL,status TEXT DEFAULT "pending",deadline DATETIME,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,started_at DATETIME,completed_at DATETIME);

CREATE TABLE assessment_tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool_name TEXT NOT NULL,
            tool_type TEXT,
            description TEXT,
            question_count INTEGER DEFAULT 0,
            estimated_time INTEGER,
            status INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

CREATE TABLE competency_dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competency_code TEXT UNIQUE NOT NULL,
    competency_name TEXT NOT NULL,
    competency_name_en TEXT,
    definition TEXT,
    key_behaviors TEXT, -- JSON格式存储关键行为指标
    category TEXT, -- 分类：领导力/业务能力/人际能力/思维能力等
    level_descriptions TEXT, -- JSON格式存储不同层级的行为描述
    source TEXT, -- 来源：DDI/KornFerry/Custom
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE competency_models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_name TEXT NOT NULL,
            dimension_name TEXT NOT NULL,
            dimension_code TEXT,
            description TEXT,
            source TEXT
        );

CREATE TABLE departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dept_name TEXT NOT NULL,
            parent_id INTEGER,
            description TEXT
        );

CREATE TABLE job_competency_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type_id INTEGER NOT NULL,
    competency_id INTEGER NOT NULL,
    importance_weight INTEGER DEFAULT 5, -- 重要性权重 1-10
    required_level INTEGER DEFAULT 3, -- 要求的胜任力水平 1-5
    is_core INTEGER DEFAULT 1, -- 是否核心胜任力 0/1
    benchmark_score INTEGER DEFAULT 60, -- 基准分数
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_type_id) REFERENCES job_types(id),
    FOREIGN KEY (competency_id) REFERENCES competency_dictionary(id),
    UNIQUE(job_type_id, competency_id)
  );

CREATE TABLE job_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_code TEXT UNIQUE NOT NULL,
    job_name TEXT NOT NULL,
    job_name_en TEXT,
    category TEXT, -- 类别：管理类/技术类/销售类/职能类等
    level TEXT, -- 层级：初级/中级/高级/专家/管理者
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE nine_box_grids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid_name TEXT NOT NULL,
    grid_type TEXT DEFAULT 'talent_review',
    review_period TEXT,
    description TEXT,
    status TEXT DEFAULT 'draft',
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE nine_box_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    performance_score REAL,
    potential_score REAL,
    grid_x INTEGER,
    grid_y INTEGER,
    quadrant INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grid_id) REFERENCES nine_box_grids(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(grid_id, user_id)
);

CREATE TABLE performance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    review_period TEXT,
    performance_score REAL,
    performance_level TEXT,
    kpi_score REAL,
    goals_achievement REAL,
    competencies_score REAL,
    reviewer_id INTEGER,
    review_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    UNIQUE(user_id, review_period)
);

CREATE TABLE person_job_matching (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_type_id INTEGER NOT NULL,
    overall_match_score REAL, -- 总体匹配分数
    competency_scores TEXT, -- JSON格式存储各胜任力得分
    match_level TEXT, -- 匹配等级：优秀/良好/一般/不匹配
    gap_analysis TEXT, -- JSON格式存储差距分析
    recommendations TEXT, -- 改进建议
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_type_id) REFERENCES job_types(id)
  );

CREATE TABLE questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool_id INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            question_type TEXT DEFAULT 'likert',
            dimension TEXT,
            option_a TEXT,
            option_b TEXT,
            option_c TEXT,
            option_d TEXT,
            score_a INTEGER DEFAULT 1,
            score_b INTEGER DEFAULT 2,
            score_c INTEGER DEFAULT 3,
            score_d INTEGER DEFAULT 4,
            order_num INTEGER DEFAULT 0, option_e TEXT, score_e INTEGER DEFAULT 5, answer TEXT DEFAULT NULL,
            FOREIGN KEY (tool_id) REFERENCES assessment_tools(id)
        );

CREATE TABLE roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_name TEXT NOT NULL,
            role_code TEXT UNIQUE NOT NULL
        );

CREATE TABLE tool_competency_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    competency_id INTEGER NOT NULL,
    dimension_name TEXT, -- 测评工具中的对应维度名
    correlation_coefficient REAL DEFAULT 0.7, -- 相关系数
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES assessment_tools(id),
    FOREIGN KEY (competency_id) REFERENCES competency_dictionary(id),
    UNIQUE(tool_id, competency_id, dimension_name)
  );

CREATE TABLE user_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            role_id INTEGER,
            UNIQUE(user_id, role_id)
        );

CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            real_name TEXT,
            email TEXT,
            phone TEXT,
            department_id INTEGER,
            position TEXT,
            status INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        , role TEXT DEFAULT 'user');