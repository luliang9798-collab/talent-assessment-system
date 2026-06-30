const http = require('http');

// 测试登录
function testLogin() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            username: 'admin',
            password: 'admin123'
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const result = JSON.parse(body);
                if (result.success) {
                    console.log('✅ 登录成功');
                    console.log('   Token:', result.token.substring(0, 30) + '...');
                    resolve(result.token);
                } else {
                    console.log('❌ 登录失败:', result.message);
                    reject(new Error(result.message));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// 测试获取测评工具（需要Token）
function testGetTools(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/tools',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const result = JSON.parse(body);
                if (result.success) {
                    console.log('✅ 获取测评工具成功');
                    console.log('   工具数量:', result.tools.length);
                    result.tools.forEach(t => {
                        console.log('   -', t.tool_name, `(${t.question_count}题)`);
                    });
                    resolve(result.tools);
                } else {
                    console.log('❌ 获取测评工具失败:', result.message);
                    reject(new Error(result.message));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// 运行测试
async function runTests() {
    console.log('======================================');
    console.log('  测试系统API');
    console.log('======================================\n');

    try {
        const token = await testLogin();
        console.log('');
        await testGetTools(token);
        console.log('\n======================================');
        console.log('  ✅ 所有测试通过！');
        console.log('======================================');
    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        process.exit(1);
    }
}

runTests();