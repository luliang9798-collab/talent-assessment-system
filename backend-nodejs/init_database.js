const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'talent_assessment.db'));

console.log('开始重新初始化数据库...');

// 启用外键约束
db.run('PRAGMA foreign_keys = OFF');

// 删除现有表
db.serialize(() => {
    console.log('删除现有表...');
    db.run('DROP TABLE IF EXISTS assessment_answers');
    db.run('DROP TABLE IF EXISTS assessment_questions');
    db.run('DROP TABLE IF EXISTS assessment_reports');
    db.run('DROP TABLE IF EXISTS assessment_tasks');
    db.run('DROP TABLE IF EXISTS assessment_tools');
    db.run('DROP TABLE IF EXISTS assessment_projects');
    db.run('DROP TABLE IF EXISTS departments');
    db.run('DROP TABLE IF EXISTS roles');
    db.run('DROP TABLE IF EXISTS users', (err) => {
        if (err) {
            console.error('删除表失败:', err);
        } else {
            console.log('现有表已删除');
            createTables();
        }
    });
});

function createTables() {
    console.log('开始创建表...');
    
    // 1. 用户表
    db.run(`CREATE TABLE users (
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
    )`, (err) => {
        if (err) console.error('创建users表失败:', err);
        else console.log('users表已创建');
    });
    
    // 2. 角色表
    db.run(`CREATE TABLE roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_name TEXT UNIQUE NOT NULL,
        role_code TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('创建roles表失败:', err);
        else console.log('roles表已创建');
    });
    
    // 3. 部门表
    db.run(`CREATE TABLE departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dept_name TEXT NOT NULL,
        parent_id INTEGER,
        dept_head_id INTEGER,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('创建departments表失败:', err);
        else console.log('departments表已创建');
    });
    
    // 4. 测评项目表
    db.run(`CREATE TABLE assessment_projects (
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
    )`, (err) => {
        if (err) console.error('创建assessment_projects表失败:', err);
        else console.log('assessment_projects表已创建');
    });
    
    // 5. 测评工具表
    db.run(`CREATE TABLE assessment_tools (
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
    )`, (err) => {
        if (err) console.error('创建assessment_tools表失败:', err);
        else console.log('assessment_tools表已创建');
    });
    
    // 6. 测评题目表
    db.run(`CREATE TABLE assessment_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_order INTEGER,
        question_type TEXT DEFAULT 'scale',
        options TEXT,
        dimension TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tool_id) REFERENCES assessment_tools(id)
    )`, (err) => {
        if (err) console.error('创建assessment_questions表失败:', err);
        else console.log('assessment_questions表已创建');
    });
    
    // 7. 测评任务表
    db.run(`CREATE TABLE assessment_tasks (
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
    )`, (err) => {
        if (err) console.error('创建assessment_tasks表失败:', err);
        else console.log('assessment_tasks表已创建');
    });
    
    // 8. 测评答案表
    db.run(`CREATE TABLE assessment_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        question_id INTEGER,
        answer_value INTEGER,
        answer_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES assessment_tasks(id),
        FOREIGN KEY (question_id) REFERENCES assessment_questions(id)
    )`, (err) => {
        if (err) console.error('创建assessment_answers表失败:', err);
        else console.log('assessment_answers表已创建');
    });
    
    // 9. 测评报告表
    db.run(`CREATE TABLE assessment_reports (
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
    )`, (err) => {
        if (err) console.error('创建assessment_reports表失败:', err);
        else {
            console.log('assessment_reports表已创建');
            insertBaseData();
        }
    });
}

function insertBaseData() {
    console.log('开始插入基础数据...');
    
    // 插入角色
    db.run(`INSERT INTO roles (role_name, role_code, description) VALUES 
        ('系统管理员', 'ADMIN', '系统管理员，拥有全部权限'),
        ('HR管理员', 'HR_MANAGER', 'HR管理员，负责人力资源测评管理'),
        ('普通用户', 'USER', '普通用户，可以参与测评')`, (err) => {
        if (err) console.error('插入角色失败:', err);
        else console.log('角色数据已插入');
    });
    
    // 插入管理员账号 (密码: admin123)
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync('admin123', 10);
    
    db.run(`INSERT INTO users (username, password_hash, real_name, email, role_id) VALUES 
        ('admin', '${passwordHash}', '系统管理员', 'admin@talent.com', 1)`, (err) => {
        if (err) console.error('插入管理员失败:', err);
        else console.log('管理员账号已创建');
    });
    
    // 插入部门
    db.run(`INSERT INTO departments (dept_name, description) VALUES 
        ('总部', '公司总部'),
        ('研发中心', '负责产品研发'),
        ('生产中心', '负责生产制造'),
        ('销售中心', '负责市场销售'),
        ('人力资源部', '负责人力资源管理')`, (err) => {
        if (err) console.error('插入部门失败:', err);
        else console.log('部门数据已插入');
    });
    
    // 插入测评工具
    db.run(`INSERT INTO assessment_tools (tool_name, tool_code, description, tool_type, estimated_time, dimensions) VALUES 
        ('大五人格测试', 'PERSONALITY', '基于大五人格模型的人格测评工具', 'personality', 15, '["开放性","尽责性","外向性","宜人性","神经质"]'),
        ('职业兴趣测试', 'HOLLAND', '基于霍兰德职业兴趣理论', 'interest', 10, '["R型","I型","A型","S型","E型","C型"]'),
        ('工作动机测试', 'MOTIVATION', '评估工作动机和驱动力', 'motivation', 8, '["薪酬回报","职业发展","工作意义","工作自主","工作环境"]'),
        ('领导力测评', 'LEADERSHIP', '评估领导力能力和风格', 'leadership', 12, '["愿景传达","创新鼓励","决策参与","反馈指导","榜样作用"]'),
        ('工作价值观测试', 'VALUES', '评估工作价值观和伦理取向', 'values', 10, '["诚实","公平","尊重","责任","团队合作"]'),
        ('MBTI职业性格测试', 'MBTI', '基于MBTI理论的职业性格测评', 'personality', 20, '["E_I","S_N","T_F","J_P"]'),
        ('DISC行为风格测评', 'DISC', '基于DISC理论的行为风格测评', 'behavior', 15, '["D型","I型","S型","C型"]'),
        ('情商测试', 'EQ', '评估情商能力和水平', 'emotion', 12, '["自我意识","自我调节","动机","同理心","社交技能"]'),
        ('职业锚测试', 'CAREER_ANCHOR', '评估职业锚和发展定位', 'career', 10, '["技术/职能","管理","自主性","安全感","创业"]'),
        ('组织文化测评', 'ORG_CULTURE', '评估组织文化匹配度', 'culture', 10, '["价值观匹配","文化适应","重视感","留任意愿","推荐意愿"]')`, (err) => {
        if (err) console.error('插入测评工具失败:', err);
        else {
            console.log('测评工具数据已插入');
            insertSampleQuestions();
        }
    });
}

function insertSampleQuestions() {
    console.log('开始插入题目数据...');
    
    // 为大五人格测试插入10道题
    const personalityQuestions = [
        { question: '我有丰富的想象力', dimension: '开放性', order: 1 },
        { question: '我做事有条理', dimension: '尽责性', order: 2 },
        { question: '我善于社交', dimension: '外向性', order: 3 },
        { question: '我信任他人', dimension: '宜人性', order: 4 },
        { question: '我容易感到焦虑', dimension: '神经质', order: 5 },
        { question: '我关注艺术和美', dimension: '开放性', order: 6 },
        { question: '我可靠可信赖', dimension: '尽责性', order: 7 },
        { question: '我喜欢与人交谈', dimension: '外向性', order: 8 },
        { question: '我乐于助人', dimension: '宜人性', order: 9 },
        { question: '我情绪波动大', dimension: '神经质', order: 10 }
    ];
    
    // 获取大五人格工具的ID
    db.get('SELECT id FROM assessment_tools WHERE tool_code = ?', ['PERSONALITY'], (err, tool) => {
        if (err || !tool) {
            console.error('获取工具失败:', err);
            return;
        }
        
        const toolId = tool.id;
        const options = JSON.stringify([
            { value: 1, label: '完全不符合' },
            { value: 2, label: '不太符合' },
            { value: 3, label: '一般' },
            { value: 4, label: '比较符合' },
            { value: 5, label: '完全符合' }
        ]);
        
        // 插入题目
        let completed = 0;
        personalityQuestions.forEach(q => {
            db.run(`INSERT INTO assessment_questions (tool_id, question_text, question_order, question_type, options, dimension) 
                    VALUES (?, ?, ?, 'scale', ?, ?)`, 
                [toolId, q.question, q.order, options, q.dimension], 
                (err) => {
                if (err) {
                    console.error('插入题目失败:', err);
                } else {
                    completed++;
                    if (completed === personalityQuestions.length) {
                        console.log(`大五人格测试的题目已插入 (${completed}题)`);
                        // 更新工具的题目数量
                        db.run('UPDATE assessment_tools SET question_count = ? WHERE id = ?', [completed, toolId]);
                        console.log('\n数据库初始化完成！');
                        db.close();
                    }
                }
            });
        });
    });
}

// 开始执行
console.log('数据库初始化脚本开始执行...');
