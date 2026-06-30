const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment.db');

console.log('=== 修复数据库 ===\n');

// 更新测评工具状态
db.run("UPDATE assessment_tools SET status = 1 WHERE status IS NULL", [], function(err) {
    if (err) {
        console.error('更新状态失败:', err);
    } else {
        console.log('✅ 已更新测评工具状态, 影响行数:', this.changes);
    }
    
    // 检查是否有题目数据
    db.get("SELECT COUNT(*) as count FROM assessment_questions", [], (err, row) => {
        if (err) {
            console.error('查询题目失败:', err);
        } else {
            console.log('题目数量:', row.count);
            if (row.count === 0) {
                console.log('⚠️  没有题目数据，需要插入题目');
            }
        }
        
        // 检查是否有量表数据
        db.get("SELECT COUNT(*) as count FROM assessment_scales", [], (err, row) => {
            if (err) {
                console.error('查询量表失败:', err);
            } else {
                console.log('测评量表数量:', row.count);
            }
            
            db.close();
        });
    });
});
