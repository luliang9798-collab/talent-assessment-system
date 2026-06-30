const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./talent_assessment.db');

// 读取SQL文件
const sqlPath = path.join(__dirname, '../database/rebuild-database-v2.sql');
let sql = fs.readFileSync(sqlPath, 'utf8');

// 移除COMMIT语句和ALTER TABLE语句（SQLite不支持ALTER TABLE添加多列）
sql = sql.replace(/ALTER TABLE.*?;/g, '');
sql = sql.replace(/COMMIT;/g, '');

// 分割SQL语句
const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

console.log('开始执行数据库重建...');
console.log('共', statements.length, '条SQL语句');

let completed = 0;
let errors = 0;

db.serialize(() => {
    statements.forEach((stmt, index) => {
        if (!stmt) return;
        
        db.run(stmt, (err) => {
            if (err) {
                // 忽略表和索引已存在的错误
                if (!err.message.includes('already exists') && 
                    !err.message.includes('duplicate column name') &&
                    !err.message.includes('no such table')) {
                    console.error(`语句 ${index + 1} 错误:`, err.message);
                    console.error('SQL:', stmt.substring(0, 100));
                    errors++;
                }
            }
            
            completed++;
            if (completed === statements.length) {
                console.log('数据库重建完成');
                if (errors > 0) {
                    console.log('有', errors, '个错误（已忽略可忽略的错误）');
                }
                
                // 验证表是否创建成功
                db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
                    if (err) {
                        console.error('验证失败:', err);
                    } else {
                        console.log('\n已创建的表:');
                        tables.forEach(t => console.log('  -', t.name));
                    }
                    db.close();
                });
            }
        });
    });
});
