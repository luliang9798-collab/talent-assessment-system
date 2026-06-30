const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment.db');

console.log('=== 检查数据库 ===\n');

// 检查表
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error('错误:', err);
        return;
    }
    
    console.log('数据库表:', tables.map(t => t.name).join(', '));
    
    // 检查测评工具
    db.all("SELECT * FROM assessment_tools", [], (err, tools) => {
        if (err) {
            console.error('测评工具表错误:', err);
        } else {
            console.log('\n测评工具数量:', tools.length);
            if (tools.length > 0) {
                console.log('测评工具:');
                tools.forEach(t => {
                    console.log(`  - ${t.tool_name} (${t.tool_type}) - 状态: ${t.status}`);
                });
            } else {
                console.log('⚠️  测评工具表为空！需要初始化数据');
            }
        }
        
        // 检查用户
        db.all("SELECT * FROM users", [], (err, users) => {
            if (err) {
                console.error('用户表错误:', err);
            } else {
                console.log('\n用户数量:', users.length);
                users.forEach(u => {
                    console.log(`  - ${u.username} (${u.real_name})`);
                });
            }
            
            db.close();
        });
    });
});
