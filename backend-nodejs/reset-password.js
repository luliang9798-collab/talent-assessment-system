const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'talent_assessment.db'));

// 生成新的密码hash
const newPassword = 'admin123';
const passwordHash = bcrypt.hashSync(newPassword, 10);

console.log('新的密码hash:', passwordHash);

// 更新admin用户的密码
db.run('UPDATE users SET password = ? WHERE username = ?', [passwordHash, 'admin'], function(err) {
    if (err) {
        console.error('更新密码失败:', err);
    } else {
        console.log('admin用户密码已重置为: admin123');
        console.log('影响的行数:', this.changes);
    }
    
    // 验证更新
    db.get('SELECT id, username, password FROM users WHERE username = ?', ['admin'], (err, user) => {
        if (err) {
            console.error('查询用户失败:', err);
        } else if (user) {
            console.log('验证: admin用户密码hash已更新');
            console.log('密码hash长度:', user.password ? user.password.length : 0);
            
            // 测试密码验证
            const testResult = bcrypt.compareSync('admin123', user.password);
            console.log('密码验证测试:', testResult ? '成功' : '失败');
        }
        
        db.close();
    });
});
