/**
 * 添加胜任力测评报告生成函数
 * 为工具8-15添加专业的报告生成函数
 */

const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server-minimal.js');

// 读取当前 server-minimal.js
let serverCode = fs.readFileSync(serverFile, 'utf8');

// 新的报告生成函数
const newReportGenerators = `

// ========== 胜任力测评报告生成函数 ==========

// 工具8: 领导力胜任力测评
function genLeadership(answers) {
    const dimensions = {
        '战略思维': { score: 0, count: 0 },
        '决策能力': { score: 0, count: 0 },
        '影响力': { score: 0, count: 0 },
        '发展他人': { score: 0, count: 0 },
        '变革管理': { score: 0, count: 0 }
    };
    
    answers.forEach(a => {
        if (dimensions[a.dimension]) {
            dimensions[a.dimension].score += a.score;
            dimensions[a.dimension].count++;
        }
    });
    
    // 计算各维度平均分
    Object.keys(dimensions).forEach(dim => {
        if (dimensions[dim].count > 0) {
            dimensions[dim] = Math.round(dimensions[dim].score / dimensions[dim].count * 20); // 转换为百分制
        } else {
            dimensions[dim] = 60;
        }
    });
    
    const overallScore = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / 5);
    
    // 领导力类型判断
    let leadershipType = '';
    let leadershipDesc = '';
    if (dimensions['战略思维'] >= 70 && dimensions['决策能力'] >= 70) {
        leadershipType = '战略型领导者';
        leadershipDesc = '善于全局思考和果断决策';
    } else if (dimensions['影响力'] >= 70 && dimensions['发展他人'] >= 70) {
        leadershipType = '赋能型领导者';
        leadershipDesc = '善于影响他人和发展团队';
    } else if (dimensions['变革管理'] >= 70) {
        leadershipType = '变革型领导者';
        leadershipDesc = '善于推动组织变革和创新';
    } else {
        leadershipType = '综合型领导者';
        leadershipDesc = '具备全面的领导能力';
    }
    
    return {
        type: leadershipType,
        typeDesc: leadershipDesc,
        overallScore: overallScore,
        dimensions: dimensions,
        strengths: [
            { name: '战略思维', score: dimensions['战略思维'], desc: dimensions['战略思维'] >= 70 ? '具备优秀的战略思维能力' : '战略思维有提升空间' },
            { name: '决策能力', score: dimensions['决策能力'], desc: dimensions['决策能力'] >= 70 ? '决策能力强，善于判断' : '决策能力需要加强' },
            { name: '影响力', score: dimensions['影响力'], desc: dimensions['影响力'] >= 70 ? '影响力强，善于说服' : '影响力需要提升' },
            { name: '发展他人', score: dimensions['发展他人'], desc: dimensions['发展他人'] >= 70 ? '善于培养和发展他人' : '需要加强人才培养' },
            { name: '变革管理', score: dimensions['变革管理'], desc: dimensions['变革管理'] >= 70 ? '变革管理能力强' : '变革管理能力有待提升' }
        ],
        suggestions: [
            dimensions['战略思维'] < 60 ? '建议：加强战略思维训练，学习如何从全局角度思考问题' : '',
            dimensions['决策能力'] < 60 ? '建议：提高决策能力，学习决策分析模型和方法' : '',
            dimensions['影响力'] < 60 ? '建议：提升影响力，学习说服和谈判技巧' : '',
            dimensions['发展他人'] < 60 ? '建议：加强人才培养意识，学习教练和辅导技巧' : '',
            dimensions['变革管理'] < 60 ? '建议：学习变革管理理论，提高推动变革的能力' : ''
        ].filter(s => s !== '')
    };
}

// 工具9: 沟通能力测评
function genCommunication(answers) {
    const dimensions = {
        '倾听理解': { score: 0, count: 0 },
        '清晰表达': { score: 0, count: 0 },
        '书面沟通': { score: 0, count: 0 },
        '非语言沟通': { score: 0, count: 0 },
        '冲突处理': { score: 0, count: 0 }
    };
    
    answers.forEach(a => {
        if (dimensions[a.dimension]) {
            dimensions[a.dimension].score += a.score;
            dimensions[a.dimension].count++;
        }
    });
    
    Object.keys(dimensions).forEach(dim => {
        if (dimensions[dim].count > 0) {
            dimensions[dim] = Math.round(dimensions[dim].score / dimensions[dim].count * 20);
        } else {
            dimensions[dim] = 60;
        }
    });
    
    const overallScore = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / 5);
    
    return {
        overallScore: overallScore,
        dimensions: dimensions,
        level: overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '需要提升',
        strengths: [
            { name: '倾听理解', score: dimensions['倾听理解'], desc: dimensions['倾听理解'] >= 70 ? '倾听能力强，善于理解他人' : '倾听能力需要提升' },
            { name: '清晰表达', score: dimensions['清晰表达'], desc: dimensions['清晰表达'] >= 70 ? '表达清晰，逻辑严密' : '表达能力需要加强' },
            { name: '书面沟通', score: dimensions['书面沟通'], desc: dimensions['书面沟通'] >= 70 ? '书面沟通能力强' : '书面沟通需要提升' },
            { name: '非语言沟通', score: dimensions['非语言沟通'], desc: dimensions['非语言沟通'] >= 70 ? '非语言沟通得当' : '需要注意非语言沟通' },
            { name: '冲突处理', score: dimensions['冲突处理'], desc: dimensions['冲突处理'] >= 70 ? '冲突处理能力强' : '冲突处理能力需要提升' }
        ],
        suggestions: [
            dimensions['倾听理解'] < 60 ? '建议：练习积极倾听技巧，提高理解能力' : '',
            dimensions['清晰表达'] < 60 ? '建议：加强表达训练，提高沟通清晰度' : '',
            dimensions['书面沟通'] < 60 ? '建议：提高书面沟通能力，学习商务写作' : '',
            dimensions['非语言沟通'] < 60 ? '建议：注意非语言沟通，提高沟通效果' : '',
            dimensions['冲突处理'] < 60 ? '建议：学习冲突处理技巧，提高解决能力' : ''
        ].filter(s => s !== '')
    };
}

// 工具10: 团队协作测评
function genTeamwork(answers) {
    const dimensions = {
        '合作精神': { score: 0, count: 0 },
        '信任建立': { score: 0, count: 0 },
        '角色贡献': { score: 0, count: 0 },
        '团队支持': { score: 0, count: 0 },
        '目标对齐': { score: 0, count: 0 }
    };
    
    answers.forEach(a => {
        if (dimensions[a.dimension]) {
            dimensions[a.dimension].score += a.score;
            dimensions[a.dimension].count++;
        }
    });
    
    Object.keys(dimensions).forEach(dim => {
        if (dimensions[dim].count > 0) {
            dimensions[dim] = Math.round(dimensions[dim].score / dimensions[dim].count * 20);
        } else {
            dimensions[dim] = 60;
        }
    });
    
    const overallScore = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / 5);
    
    return {
        overallScore: overallScore,
        dimensions: dimensions,
        teamRole: overallScore >= 80 ? '优秀团队成员' : overallScore >= 60 ? '良好团队成员' : '需要提升协作能力',
        strengths: Object.keys(dimensions).map(dim => ({
            name: dim,
            score: dimensions[dim],
            desc: dimensions[dim] >= 70 ? \`\${dim}能力强\` : \`\${dim}需要提升\`
        })),
        suggestions: [
            dimensions['合作精神'] < 60 ? '建议：培养合作精神，学习团队协作技巧' : '',
            dimensions['信任建立'] < 60 ? '建议：提高信任建立能力，学习建立互信' : '',
            dimensions['角色贡献'] < 60 ? '建议：明确团队角色，提高贡献度' : '',
            dimensions['团队支持'] < 60 ? '建议：加强团队支持，学习互助技巧' : '',
            dimensions['目标对齐'] < 60 ? '建议：提高目标对齐能力，学习目标管理' : ''
        ].filter(s => s !== '')
    };
}

// 工具11-15的报告生成函数（简化版，基于相同模式）
function genProblemSolving(answers) {
    return genGenericCompetencyReport(answers, ['分析思维', '批判性思维', '创造性解决', '决策判断', '方案执行']);
}

function genResilience(answers) {
    return genGenericCompetencyReport(answers, ['情绪调节', '压力应对', '挫折恢复', '适应性', '自我激励']);
}

function genLearning(answers) {
    return genGenericCompetencyReport(answers, ['学习意愿', '学习方法', '知识应用', '反思总结', '持续成长']);
}

function genInnovation(answers) {
    return genGenericCompetencyReport(answers, ['创新思维', '风险承担', '开放心态', '改进意识', '资源整合']);
}

function genExecution(answers) {
    return genGenericCompetencyReport(answers, ['目标导向', '计划组织', '时间管理', '结果交付', '责任心']);
}

// 通用胜任力报告生成函数
function genGenericCompetencyReport(answers, dimensionNames) {
    const dimensions = {};
    dimensionNames.forEach(dim => {
        dimensions[dim] = { score: 0, count: 0 };
    });
    
    answers.forEach(a => {
        if (dimensions[a.dimension] !== undefined) {
            dimensions[a.dimension].score += a.score;
            dimensions[a.dimension].count++;
        }
    });
    
    Object.keys(dimensions).forEach(dim => {
        if (dimensions[dim].count > 0) {
            dimensions[dim] = Math.round(dimensions[dim].score / dimensions[dim].count * 20);
        } else {
            dimensions[dim] = 60;
        }
    });
    
    const overallScore = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / dimensionNames.length);
    
    return {
        overallScore: overallScore,
        dimensions: dimensions,
        level: overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '需要提升',
        strengths: Object.keys(dimensions).map(dim => ({
            name: dim,
            score: dimensions[dim],
            desc: dimensions[dim] >= 70 ? \`\${dim}能力强\` : \`\${dim}需要提升\`
        })),
        suggestions: Object.keys(dimensions).filter(dim => dimensions[dim] < 60).map(dim => \`建议：提升\${dim}能力\`)
    };
}

// ========== 结束：胜任力测评报告生成函数 ==========
`;

// 找到 generateReportSummary 函数，在其前面插入新的报告生成函数
const insertPosition = serverCode.indexOf('function generateReportSummary');
if (insertPosition !== -1) {
    serverCode = serverCode.slice(0, insertPosition) + newReportGenerators + '\n' + serverCode.slice(insertPosition);
    console.log('✅ 找到了 generateReportSummary 函数，在其前面插入新的报告生成函数');
} else {
    console.log('❌ 未找到 generateReportSummary 函数');
    process.exit(1);
}

// 更新 generateReportSummary 函数，添加对新工具的支持
const oldSwitch = `switch(parseInt(toolId)) {
            case 1: return genBigFive(answers);
            case 2: return genMBTI(answers);
            case 3: return genDISC(answers);
            case 4: return genHolland(answers);
            case 5: return genEQ(answers);
            case 6: return genMotivation(answers);
            case 7: return genValues(answers);
            default: return { overallScore: 70, dimensions: {}, text: '测评完成' };
        }`;

const newSwitch = `switch(parseInt(toolId)) {
            case 1: return genBigFive(answers);
            case 2: return genMBTI(answers);
            case 3: return genDISC(answers);
            case 4: return genHolland(answers);
            case 5: return genEQ(answers);
            case 6: return genMotivation(answers);
            case 7: return genValues(answers);
            case 8: return genLeadership(answers);
            case 9: return genCommunication(answers);
            case 10: return genTeamwork(answers);
            case 11: return genProblemSolving(answers);
            case 12: return genResilience(answers);
            case 13: return genLearning(answers);
            case 14: return genInnovation(answers);
            case 15: return genExecution(answers);
            default: return { overallScore: 70, dimensions: {}, text: '测评完成' };
        }`;

if (serverCode.includes(oldSwitch)) {
    serverCode = serverCode.replace(oldSwitch, newSwitch);
    console.log('✅ 更新了 generateReportSummary 函数，添加对新工具的支持');
} else {
    console.log('⚠️  未找到旧的 switch 语句，可能需要手动更新 generateReportSummary 函数');
}

// 备份原文件
const backupFile = serverFile + '.backup-' + Date.now();
fs.writeFileSync(backupFile, fs.readFileSync(serverFile));
console.log(`📦 已备份原文件到: ${backupFile}`);

// 写入新文件
fs.writeFileSync(serverFile, serverCode, 'utf8');
console.log(`✅ 已更新 ${serverFile}`);
console.log('\n📋 下一步:');
console.log('   1. 重启后端服务器');
console.log('   2. 测试新测评工具的报告生成');
console.log('   3. 根据需要调整报告内容\n');
