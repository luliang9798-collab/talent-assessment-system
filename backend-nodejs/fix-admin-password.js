const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'talent_assessment.db'));

// 检查admin用户的密码hash
db.get('SELECT id, username, password_hash FROM users WHERE username = ?', ['admin'], (err, user) => {
    if (err) {
        console.error('查询用户失败:', err);
        db.close();
        return;
    }
    
    if (!user) {
        console.log('admin用户不存在，创建新用户');
        
        // 创建admin用户
        const passwordHash = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT INTO users (username, password_hash, real_name, email, role_id) 
                VALUES (?, ?, ?, ?, ?)`, 
                ['admin', passwordHash, '系统管理员', 'admin@talent.com', 1], 
                function(err) {
                    if (err) {
                        console.error('创建admin用户失败:', err);
                    } else {
                        console.log('admin用户创建成功');
                        console.log('用户名: admin');
                        console.log('密码: admin123');
                    }
                    db.close();
                });
    } else {
        console.log('admin用户存在');
        console.log('密码hash:', user.password_hash ? '存在' : '为空');
        
        // 如果密码hash为空或格式不正确，重置密码
        if (!user.password_hash || user.password_hash.length < 10) {
            console.log('密码hash无效，重置密码...');
            const passwordHash = bcrypt.hashSync('admin123', 10);
            
            db.run('UPDATE users SET password_hash = ? WHERE username = ?', [passwordHash, 'admin'], function(err) {
                if (err) {
                    console.error('重置密码失败:', err);
                } else {
                    console.log('密码已重置为: admin123');
                }
                db.close();
            });
        } else {
            console.log('密码hash有效');
            // 测试密码验证
            const testResult = bcrypt.compareSync('admin123', user.password_hash);
            console.log('密码验证测试:', testResult ? '成功' : '失败');
            
            if (!testResult) {
                console.log('密码验证失败，重置密码...');
                const passwordHash = bcrypt.hashSync('admin123', 10);
                
                db.run('UPDATE users SET password_hash = ? WHERE username = ?', [passwordHash, 'admin'], function(err) {
                    if (err) {
                        console.error('重置密码失败:', err);
                    } else {
                        console.log('密码已重置为: admin123');
                    }
                    db.close();
                });
            } else {
                db.close();
            }
        }
    }
});
