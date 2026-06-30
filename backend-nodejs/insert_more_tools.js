const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment.db');

// 开始事务
db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // 插入更多测评工具
    const tools = [
        ['MBTI职业性格测试', 'MBTI', 'PERSONALITY', '基于卡尔·荣格的心理类型理论，评估个人的性格类型偏好，包括外向/内向、感觉/直觉、思考/情感、判断/知觉四个维度', 25, 1],
        ['DISC行为风格测评', 'DISC', 'BEHAVIOR', '评估个人的行为风格类型，包括支配型(D)、影响型(I)、稳健型(S)、服从型(C)四个维度，广泛应用于企业人才选拔', 15, 1],
        ['情商测试(EQ)', 'EQ', 'EMOTIONAL', '评估个人的情绪智力水平，包括自我意识、自我管理、社交意识、关系管理四个维度', 20, 1],
        ['职业锚测试', 'CAREER_ANCHOR', 'CAREER', '基于Edgar Schein的职业锚理论，评估个人的职业价值观和职业定位偏好', 20, 1],
        ['组织文化测评', 'ORG_CULTURE', 'ORGANIZATION', '评估个人与组织文化的匹配度，包括创新、稳定性、尊重员工、结果导向、团队导向五个维度', 15, 1]
    ];
    
    const toolStmt = db.prepare(`INSERT OR IGNORE INTO assessment_tools (tool_name, tool_code, tool_type, description, estimated_time, status) VALUES (?, ?, ?, ?, ?, ?)`);
    
    tools.forEach(tool => {
        toolStmt.run(tool, (err) => {
            if (err) console.error('插入工具失败:', err.message);
        });
    });
    toolStmt.finalize();

    
    // 插入测评维度
    const dimensions = [
        // MBTI维度
        ['MBTI_EI', 'MBTI', '外向-内向', '评估个人能量来源倾向', 1.0],
        ['MBTI_SN', 'MBTI', '感觉-直觉', '评估个人信息获取倾向', 1.0],
        ['MBTI_TF', 'MBTI', '思考-情感', '评估个人决策判断倾向', 1.0],
        ['MBTI_JP', 'MBTI', '判断-知觉', '评估个人生活方式倾向', 1.0],
        // DISC维度
        ['DISC_D', 'DISC', '支配型(D)', '评估个人的支配和控制倾向', 1.0],
        ['DISC_I', 'DISC', '影响型(I)', '评估个人的社交和影响倾向', 1.0],
        ['DISC_S', 'DISC', '稳健型(S)', '评估个人的稳定和合作倾向', 1.0],
        ['DISC_C', 'DISC', '服从型(C)', '评估个人的服从和完美倾向', 1.0],
        // EQ维度
        ['EQ_SELF_AWARE', 'EQ', '自我意识', '识别和理解自己情绪的能力', 1.0],
        ['EQ_SELF_MANAGE', 'EQ', '自我管理', '管理和调节自己情绪的能力', 1.0],
        ['EQ_SOCIAL_AWARE', 'EQ', '社交意识', '识别和理解他人情绪的能力', 1.0],
        ['EQ_RELATION_MGMT', 'EQ', '关系管理', '建立和维护良好关系的能力', 1.0],
        // 职业锚维度
        ['CAREER_TECH', 'CAREER_ANCHOR', '技术/职能型', '偏好在特定技术领域深耕', 1.0],
        ['CAREER_MANAGE', 'CAREER_ANCHOR', '管理型', '偏好管理和领导他人', 1.0],
        ['CAREER_AUTO', 'CAREER_ANCHOR', '自主/独立型', '偏好自主工作和独立决策', 1.0],
        ['CAREER_SECURITY', 'CAREER_ANCHOR', '安全/稳定型', '偏好稳定和安全的工作环境', 1.0],
        // 组织文化维度
        ['CULTURE_INNOVATE', 'ORG_CULTURE', '创新', '组织鼓励创新和变革的程度', 1.0],
        ['CULTURE_STABILITY', 'ORG_CULTURE', '稳定性', '组织注重稳定和秩序的程度', 1.0],
        ['CULTURE_RESPECT', 'ORG_CULTURE', '尊重员工', '组织尊重员工和人文关怀的程度', 1.0],
        ['CULTURE_RESULT', 'ORG_CULTURE', '结果导向', '组织注重结果和绩效的程度', 1.0],
        ['CULTURE_TEAM', 'ORG_CULTURE', '团队导向', '组织注重团队合作的程度', 1.0]
    ];
    
    const dimStmt = db.prepare(`INSERT OR IGNORE INTO assessment_dimensions (dimension_id, tool_code, dimension_name, description, weight) VALUES (?, ?, ?, ?, ?)`);
    
    dimensions.forEach(dim => {
        dimStmt.run(dim, (err) => {
            if (err) console.error('插入维度失败:', err.message);
        });
    });
    dimStmt.finalize();
    
    console.log('✅ 测评工具和维度数据插入完成！');
    
    // 提交事务
    db.run('COMMIT', (err) => {
        if (err) {
            console.error('提交事务失败:', err);
            db.run('ROLLBACK');
        } else {
            console.log('✅ 事务提交成功！');
            
            // 查询验证
            db.all('SELECT * FROM assessment_tools', (err, rows) => {
                if (err) {
                    console.error('查询失败:', err);
                } else {
                    console.log(`\n测评工具列表 (${rows.length}个):`);
                    rows.forEach(row => {
                        console.log(`  - ${row.tool_name} (${row.tool_code})`);
                    });
                }
                
                db.all('SELECT * FROM assessment_dimensions', (err, rows) => {
                    if (err) {
                        console.error('查询失败:', err);
                    } else {
                        console.log(`\n测评维度列表 (${rows.length}个):`);
                    }
                    
                    db.close();
                });
            });
        }
    });
});
