const http = require('http');
const fs = require('fs');

// 第一步：登录
const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

console.log('正在登录...');

const loginReq = http.request(loginOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('登录响应:', body);
        try {
            const loginResult = JSON.parse(body);
            if (loginResult.success) {
                const token = loginResult.token;
                console.log('登录成功，token已获取');
                
                // 第二步：创建项目
                const projectData = JSON.stringify({
                    projectName: '测试项目' + Date.now(),
                    projectType: 'RECRUITMENT',
                    description: '这是一个测试项目'
                });
                
                const projectOptions = {
                    hostname: 'localhost',
                    port: 3000,
                    path: '/api/projects',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(projectData),
                        'Authorization': 'Bearer ' + token
                    }
                };
                
                console.log('正在创建项目...');
                console.log('发送的数据:', projectData);
                
                const projectReq = http.request(projectOptions, (res2) => {
                    let body2 = '';
                    res2.on('data', (chunk) => body2 += chunk);
                    res2.on('end', () => {
                        console.log('创建项目响应:', body2);
                        try {
                            const projectResult = JSON.parse(body2);
                            if (projectResult.success) {
                                console.log('✅ 项目创建成功！项目ID:', projectResult.projectId);
                            } else {
                                console.log('❌ 项目创建失败:', projectResult.message);
                            }
                        } catch (e) {
                            console.error('解析创建项目响应失败:', e.message);
                        }
                    });
                });
                
                projectReq.on('error', (e) => {
                    console.error('创建项目请求失败:', e.message);
                });
                
                projectReq.write(projectData);
                projectReq.end();
                
            } else {
                console.error('登录失败:', loginResult.message);
            }
        } catch (e) {
            console.error('解析登录响应失败:', e.message);
        }
    });
});

loginReq.on('error', (e) => {
    console.error('登录请求失败:', e.message);
});

loginReq.write(loginData);
loginReq.end();
