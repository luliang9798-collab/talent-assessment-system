const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database('./talent_assessment_new.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        process.exit(1);
    }
    console.log('✅ 数据库连接成功');
});

// 初始化数据库
function initDatabase() {
    db.serialize(() => {
        console.log('开始初始化数据库...');
        
        // 1. 用户表
        db.run(`CREATE TABLE IF NOT EXISTS users (
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
        )`, (err) => {
            if (err) console.error('创建用户表失败:', err);
            else console.log('✅ 用户表就绪');
        });

        // 2. 部门表
        db.run(`CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dept_name TEXT NOT NULL,
            parent_id INTEGER,
            description TEXT
        )`, (err) => {
            if (err) console.error('创建部门表失败:', err);
            else console.log('✅ 部门表就绪');
        });

        // 3. 测评工具表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool_name TEXT NOT NULL,
            tool_type TEXT,
            description TEXT,
            question_count INTEGER DEFAULT 0,
            estimated_time INTEGER,
            status INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('创建测评工具表失败:', err);
            else console.log('✅ 测评工具表就绪');
        });

        // 4. 题目表
        db.run(`CREATE TABLE IF NOT EXISTS questions (
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
            order_num INTEGER DEFAULT 0,
            FOREIGN KEY (tool_id) REFERENCES assessment_tools(id)
        )`, (err) => {
            if (err) console.error('创建题目表失败:', err);
            else console.log('✅ 题目表就绪');
        });

        // 5. 测评项目表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT NOT NULL,
            project_type TEXT,
            description TEXT,
            status INTEGER DEFAULT 1,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('创建测评项目表失败:', err);
            else console.log('✅ 测评项目表就绪');
        });

        // 6. 测评任务表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            user_id INTEGER NOT NULL,
            tool_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            started_at DATETIME,
            completed_at DATETIME,
            FOREIGN KEY (project_id) REFERENCES assessment_projects(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (tool_id) REFERENCES assessment_tools(id)
        )`, (err) => {
            if (err) console.error('创建测评任务表失败:', err);
            else console.log('✅ 测评任务表就绪');
        });

        // 7. 测评结果表
        db.run(`CREATE TABLE IF NOT EXISTS assessment_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            tool_id INTEGER NOT NULL,
            dimension_scores TEXT,
            total_score REAL,
            report_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES assessment_tasks(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (tool_id) REFERENCES assessment_tools(id)
        )`, (err) => {
            if (err) console.error('创建测评结果表失败:', err);
            else console.log('✅ 测评结果表就绪');
        });

        // 8. 胜任力模型表
        db.run(`CREATE TABLE IF NOT EXISTS competency_models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_name TEXT NOT NULL,
            dimension_name TEXT NOT NULL,
            dimension_code TEXT,
            description TEXT,
            source TEXT
        )`, (err) => {
            if (err) console.error('创建胜任力模型表失败:', err);
            else console.log('✅ 胜任力模型表就绪');
        });

        // 等待表创建完成，然后插入初始数据
        setTimeout(() => {
            insertInitialData();
        }, 1000);
    });
}

// 插入初始数据
function insertInitialData() {
    console.log('\n开始插入初始数据...');
    
    // 1. 创建默认用户（admin）
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password_hash, real_name, email, status) 
            VALUES (?, ?, ?, ?, ?)`,
            ['admin', defaultPassword, '系统管理员', '<EMAIL_REDACTED>', 1],
            function(err) {
                if (err) console.error('创建默认用户失败:', err);
                else console.log('✅ 默认用户创建成功 (admin/admin123)');
            }
    );
    
    // 2. 创建部门
    const departments = [
        ['总部', 0, '公司总部'],
        ['研发部', 0, '产品研发部门'],
        ['销售部', 0, '市场销售部门'],
        ['人力资源部', 0, '人力资源管理'],
        ['生产部', 0, '生产制造部门']
    ];
    
    departments.forEach(([dept_name, parent_id, description]) => {
        db.run(`INSERT OR IGNORE INTO departments (dept_name, parent_id, description) VALUES (?, ?, ?)`,
                [dept_name, parent_id, description],
                function(err) {
                    if (err) console.error('创建部门失败:', err);
                }
        );
    });
    console.log('✅ 部门数据已插入');
    
    // 3. 创建测评工具
    const tools = [
        ['大五人格测评', 'personality', '基于大五人格理论的专业测评，评估开放性、尽责性、外向性、宜人性和神经质五个维度', 60, 20, 1],
        ['MBTI职业性格测评', 'personality', '基于荣格心理类型理论，评估16种性格类型', 93, 25, 1],
        ['DISC行为风格测评', 'behavior', '评估支配型、影响型、稳健型和谨慎型四种行为风格', 24, 15, 1],
        ['霍兰德职业兴趣测评', 'interest', '评估六种职业兴趣类型：现实型、研究型、艺术型、社会型、企业型、常规型', 60, 20, 1],
        ['情商（EQ）测评', 'emotion', '评估情绪感知、情绪理解、情绪使用和情绪管理四个维度', 33, 15, 1],
        ['工作动机测评', 'motivation', '评估成就动机、权力动机、亲和动机等工作动机维度', 20, 10, 1],
        ['工作价值观测评', 'value', '评估工作价值观偏好，包括成就、认可、支持、独立等维度', 21, 10, 1]
    ];
    
    tools.forEach(([tool_name, tool_type, description, question_count, estimated_time, status]) => {
        db.run(`INSERT OR IGNORE INTO assessment_tools (tool_name, tool_type, description, question_count, estimated_time, status) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [tool_name, tool_type, description, question_count, estimated_time, status],
                function(err) {
                    if (err) console.error('创建测评工具失败:', err);
                }
        );
    });
    console.log('✅ 测评工具数据已插入（7个专业测评工具）');
    
    // 4. 为第一个测评工具（大五人格）插入示例题目
    insertSampleQuestions();
    
    // 5. 插入胜任力模型数据
    insertCompetencyModels();
    
    // 完成初始化
    setTimeout(() => {
        console.log('\n✅ 数据库初始化完成！');
        console.log('====================================');
        console.log('登录信息：');
        console.log('  用户名: admin');
        console.log('  密码: admin123');
        console.log('====================================\n');
        db.close();
    }, 2000);
}

// 插入示例题目
function insertSampleQuestions() {
    console.log('开始插入示例题目...');
    
    // 先获取大五人格测评的ID
    db.get('SELECT id FROM assessment_tools WHERE tool_name = ?', ['大五人格测评'], (err, tool) => {
        if (err || !tool) {
            console.error('获取测评工具失败:', err);
            return;
        }
        
        const toolId = tool.id;
        
        // 插入10个示例题目（实际应该有60个）
        const questions = [
            [toolId, '我喜欢尝试新鲜事物和新的体验', 'likert', '开放性', '非常不同意', '不同意', '中立', '同意', '非常同意', 1, 2, 3, 4, 5, 1],
            [toolId, '我总是认真地完成自己的工作', 'likert', '尽责性', '非常不同意', '不同意', '中立', '同意', '非常同意', 1, 2, 3, 4, 5, 2],
            [toolId, '我喜欢与人交往和聊天', 'likert', '外向性', '非常不同意', '不同意', '中立', '同意', '非常同意', 1, 2, 3, 4, 5, 3],
            [toolId, '我乐于帮助他人解决问题', 'likert', '宜人性', '非常不同意', '不同意', '中立', '同意', '非常同意', 1, 2, 3, 4, 5, 4],
            [toolId, '我容易感到焦虑和压力', 'likert', '神经质', '非常不同意', '不同意', '中立', '同意', '非常同意', 5, 4, 3, 2, 1, 5],
            [toolId, '我有丰富的想象力和创意', 'likert', '开放性', '非常不同意', '不同意', '中立', '同意', '非常同意', 1, 2, 3, 4, 5, 6],
            [toolId, '我做事有条理和计划性', 'likert', '尽责性', '非常不同意', '不同意', '中立', '同意', '非常同意', 1, 2, 3, 4, 5, 7],
            [toolId, '我在社交场合感到自在', 'likert', '外向性', '非常不同意', '不同意', '中立', '同意', '非常同意', 1, 2, 3, 4, 5, 8],
            [toolId, '我容易信任他人', 'likert', '宜人性', '非常不同意', '不同意', '中立', '同意', '非常同意', 1, 2, 3, 4, 5, 9],
            [toolId, '我情绪波动较大', 'likert', '神经质', '非常不同意', '不同意', '中立', '同意', '非常同意', 5, 4, 3, 2, 1, 10]
        ];
        
        questions.forEach(([tool_id, question_text, question_type, dimension, option_a, option_b, option_c, option_d, option_e, score_a, score_b, score_c, score_d, score_e, order_num]) => {
            db.run(`INSERT OR IGNORE INTO questions (tool_id, question_text, question_type, dimension, option_a, option_b, option_c, option_d, score_a, score_b, score_c, score_d, order_num) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [tool_id, question_text, question_type, dimension, option_a, option_b, option_c, option_d || option_e, score_a, score_b, score_c, score_d, order_num],
                    function(err) {
                        if (err) console.error('插入题目失败:', err);
                    }
            );
        });
        
        console.log('✅ 示例题目已插入（10题，完整版应有60题）');
    });
}

// 插入胜任力模型数据
function insertCompetencyModels() {
    console.log('开始插入胜任力模型数据...');
    
    const competencies = [
        // SHL模型
        ['SHL全方位胜任力模型', '成就导向', 'ACH', '设定高目标并努力实现', 'SHL'],
        ['SHL全方位胜任力模型', '适应能力', 'ADAPT', '灵活应对变化和挑战', 'SHL'],
        ['SHL全方位胜任力模型', '分析思维', 'ANAL', '系统地分析问题和信息', 'SHL'],
        ['SHL全方位胜任力模型', '沟通能力', 'COMM', '有效表达和倾听', 'SHL'],
        ['SHL全方位胜任力模型', '领导力', 'LEAD', '影响和引导他人', 'SHL'],
        
        // 北森模型
        ['北森综合胜任力模型', '创新能力', 'INNO', '产生新想法和解决方案', '北森'],
        ['北森综合胜任力模型', '团队合作', 'TEAM', '与他人协作实现目标', '北森'],
        ['北森综合胜任力模型', '客户导向', 'CUST', '关注客户需求和满意度', '北森'],
        ['北森综合胜任力模型', '学习能力', 'LEAR', '快速学习新知识和技能', '北森'],
        ['北森综合胜任力模型', '压力承受', 'STRESS', '在压力下保持绩效', '北森']
    ];
    
    competencies.forEach(([model_name, dimension_name, dimension_code, description, source]) => {
        db.run(`INSERT OR IGNORE INTO competency_models (model_name, dimension_name, dimension_code, description, source) VALUES (?, ?, ?, ?, ?)`,
                [model_name, dimension_name, dimension_code, description, source],
                function(err) {
                    if (err) console.error('插入胜任力模型失败:', err);
                }
        );
    });
    
    console.log('✅ 胜任力模型数据已插入（10个维度）');
}

// 启动初始化
console.log('====================================');
console.log('人才测评系统 - 数据库初始化');
console.log('====================================\n');
initDatabase();
