const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let token = '';
let testResults = [];

// 辅助函数：记录测试结果
function logTest(name, passed, message) {
    testResults.push({ name, passed, message });
    console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
}

// 1. 测试登录
async function testLogin() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        if (response.data.success) {
            token = response.data.token;
            logTest('用户登录', true, '登录成功，获取到token');
            return true;
        }
    } catch (error) {
        logTest('用户登录', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 2. 测试创建测评项目
async function testCreateProject() {
    try {
        const response = await axios.post(`${BASE_URL}/projects`, {
            projectName: '测试测评项目',
            projectType: 'RECRUITMENT',
            description: '自动化测试创建的项目'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
            logTest('创建测评项目', true, `项目创建成功，ID: ${response.data.id || 'N/A'}`);
            return response.data.id || 1;
        }
    } catch (error) {
        logTest('创建测评项目', false, error.response?.data?.message || error.message);
        return null;
    }
}

// 3. 测试获取测评工具列表
async function testGetTools() {
    try {
        const response = await axios.get(`${BASE_URL}/tools`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
            logTest('获取测评工具', true, `获取到 ${response.data.tools.length} 个测评工具`);
            return response.data.tools;
        }
    } catch (error) {
        logTest('获取测评工具', false, error.response?.data?.message || error.message);
        return null;
    }
}

// 4. 测试创建用户
async function testCreateUser() {
    try {
        const response = await axios.post(`${BASE_URL}/users`, {
            username: 'testuser',
            password: 'test123',
            realName: '测试用户',
            email: 'test@company.com',
            department: '研发中心'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
            logTest('创建用户', true, '用户创建成功');
            return response.data.id || 2;
        }
    } catch (error) {
        logTest('创建用户', false, error.response?.data?.message || error.message);
        return null;
    }
}

// 5. 测试分配测评任务
async function testCreateTask(projectId, userId, toolId) {
    try {
        const response = await axios.post(`${BASE_URL}/tasks`, {
            projectId: projectId,
            userId: userId,
            toolId: toolId,
            dueDate: '2026-07-31'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
            logTest('分配测评任务', true, '任务分配成功');
            return response.data.id || 1;
        }
    } catch (error) {
        logTest('分配测评任务', false, error.response?.data?.message || error.message);
        return null;
    }
}

// 6. 测试获取答题数据
async function testGetAssessmentForm(taskId) {
    try {
        const response = await axios.get(`${BASE_URL}/assessment-form/${taskId}`);
        
        if (response.data.success) {
            logTest('获取答题数据', true, `获取到 ${response.data.questions.length} 道题目`);
            return response.data.questions;
        }
    } catch (error) {
        logTest('获取答题数据', false, error.response?.data?.message || error.message);
        return null;
    }
}

// 7. 测试提交测评答案
async function testSubmitAssessment(taskId, questions) {
    try {
        const answers = questions.map(q => ({
            questionId: q.id,
            dimension: q.dimension,
            value: Math.floor(Math.random() * 5) + 1
        }));
        
        const response = await axios.post(`${BASE_URL}/submit-assessment/${taskId}`, {
            answers: answers,
            timeSpent: 300
        });
        
        if (response.data.success) {
            logTest('提交测评答案', true, '测评提交成功');
            return true;
        }
    } catch (error) {
        logTest('提交测评答案', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 8. 测试获取报告列表
async function testGetReports() {
    try {
        const response = await axios.get(`${BASE_URL}/reports`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
            logTest('获取报告列表', true, '报告列表获取成功');
            return true;
        }
    } catch (error) {
        logTest('获取报告列表', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 9. 测试人才地图
async function testTalentMap() {
    try {
        const response = await axios.get(`${BASE_URL}/talent-map`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
            logTest('人才地图', true, '人才地图数据获取成功');
            return true;
        }
    } catch (error) {
        logTest('人才地图', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 10. 测试继任计划
async function testSuccessionPlan() {
    try {
        const response = await axios.get(`${BASE_URL}/succession-plan`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
            logTest('继任计划', true, '继任计划数据获取成功');
            return true;
        }
    } catch (error) {
        logTest('继任计划', false, error.response?.data?.message || error.message);
        return false;
    }
}

// 主测试函数
async function runAllTests() {
    console.log('====================================');
    console.log('人才测评系统全流程测试');
    console.log('====================================\n');
    
    // 1. 登录
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
        console.log('\n登录失败，测试终止');
        return;
    }
    
    // 2. 创建项目
    const projectId = await testCreateProject();
    
    // 3. 获取测评工具
    const tools = await testGetTools();
    const toolId = tools && tools.length > 0 ? tools[0].id : 1;
    
    // 4. 创建用户
    const userId = await testCreateUser();
    
    // 5. 分配任务
    if (projectId && userId && toolId) {
        const taskId = await testCreateTask(projectId, userId, toolId);
        
        // 6. 获取答题数据
        if (taskId) {
            const questions = await testGetAssessmentForm(taskId);
            
            // 7. 提交答案
            if (questions) {
                await testSubmitAssessment(taskId, questions);
            }
        }
    }
    
    // 8. 获取报告
    await testGetReports();
    
    // 9. 人才地图
    await testTalentMap();
    
    // 10. 继任计划
    await testSuccessionPlan();
    
    // 输出测试报告
    console.log('\n====================================');
    console.log('测试报告');
    console.log('====================================');
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    console.log(`总测试数: ${total}`);
    console.log(`通过: ${passed}`);
    console.log(`失败: ${total - passed}`);
    console.log(`通过率: ${(passed / total * 100).toFixed(1)}%`);
    
    if (passed < total) {
        console.log('\n失败项:');
        testResults.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.name}: ${r.message}`);
        });
    }
    
    console.log('\n====================================');
    console.log('测试完成！');
    console.log('====================================');
}

// 运行测试
runAllTests().catch(error => {
    console.error('测试执行出错:', error);
});
