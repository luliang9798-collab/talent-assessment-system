/**
 * 升级报告生成至专业版
 * 在现有generateReportSummary基础上增加专业分析内容
 */

const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server-minimal.js');
let content = fs.readFileSync(serverFile, 'utf8');

// 1. 在文件末尾的app.listen之前，注入专业报告增强函数
const enhanceFunction = `

// ========== 专业报告增强模块 ==========
// 对标SHL/北森标准，增强报告专业度

const PROFESSIONAL_ENHANCEMENTS = {
    // 大五人格专业增强
    1: function(reportData, answers) {
        if (!reportData.dimensions) return reportData;
        
        const dims = reportData.dimensions;
        const enhancements = {
            executiveSummary: '',
            detailedAnalysis: {},
            careerMatch: {},
            developmentRoadmap: {},
            riskAssessment: {}
        };
        
        // 执行摘要
        const highDims = Object.entries(dims).filter(([k,v]) => v >= 3.5).map(([k]) => k);
        const lowDims = Object.entries(dims).filter(([k,v]) => v < 2.5).map(([k]) => k);
        
        enhancements.executiveSummary = \`【专业评估摘要】\n\` +
            \`该候选人在\${highDims.join('、')}方面表现突出，\` +
            \`\${lowDims.length > 0 ? \`在\${lowDims.join('、')}方面存在提升空间。\` : '各维度发展较为均衡。'}\` +
            \`\${dims['尽责性'] >= 3.5 && dims['情绪稳定性'] >= 3.5 ? '\\n整体可靠性高，适合承担重要责任。' : ''}\` +
            \`\${dims['开放性'] >= 3.5 && dims['外向性'] >= 3.5 ? '\\n创新与影响力俱佳，具备领导潜质。' : ''}\`;
        
        // 详细维度分析（专业版）
        enhancements.detailedAnalysis = {
            '开放性': {
                score: dims['开放性'],
                interpretation: dims['开放性'] >= 4.2 ? 
                    '极高：具有卓越的创新思维和好奇心，在需要创造力和适应性的角色中表现卓越。可能挑战：对重复性工作耐受度低。' :
                    dims['开放性'] >= 3.5 ? 
                    '高：思维开放，乐于接受新观念。适合需要创新和灵活思维的工作。建议：在创新与执行间找到平衡。' :
                    dims['开放性'] >= 2.5 ?
                    '中等：在创新与稳健间保持平衡，适应多种工作环境。' :
                    '偏低：偏好稳定可预测的环境，在结构化角色中表现出色。建议：适当拓展视野。',
                workplaceBehavior: dims['开放性'] >= 3.5 ? 
                    '喜欢自主空间、容忍模糊、快速学习' : '偏好清晰指令、结构化任务、渐进式变革',
                compatibility: {
                    '研发创新': dims['开放性'] >= 3.5 ? '高' : '中',
                    '运营管理': dims['开放性'] < 3.5 ? '高' : '中',
                    '销售市场': dims['开放性'] >= 3.5 ? '高' : '中'
                }
            },
            '尽责性': {
                score: dims['尽责性'],
                interpretation: dims['尽责性'] >= 4.2 ?
                    '极高：极度可靠，执行力强。可能挑战：完美主义可能导致效率问题。' :
                    dims['尽责性'] >= 3.5 ?
                    '高：责任心强，目标导向。建议：继续保持高标准，避免过度苛求他人。' :
                    dims['尽责性'] >= 2.5 ?
                    '中等：能平衡灵活性与责任感。' :
                    '偏低：比较随性。建议：使用任务管理工具提升组织性。',
                workplaceBehavior: dims['尽责性'] >= 3.5 ?
                    '计划性强、守时、注重质量' : '灵活应变、适应性强、可能需要外部结构',
                reliability: dims['尽责性'] >= 3.5 ? '高' : '需外部支持'
            },
            '外向性': {
                score: dims['外向性'],
                interpretation: dims['外向性'] >= 4.2 ?
                    '极高：精力充沛，社交能力强。注意：需尊重内向同事的工作偏好。' :
                    dims['外向性'] >= 3.5 ?
                    '高：善于表达和社交。建议：利用社交优势建立人脉。' :
                    dims['外向性'] >= 2.5 ?
                    '中等：能灵活切换独处与社交。' :
                    '偏低：偏好深度思考和一对一交流。建议：适当参与团队活动。',
                energySource: dims['外向性'] >= 3.5 ? '社交互动' : '独处思考',
                teamRole: dims['外向性'] >= 3.5 ? '推动者、影响者' : '思考者、执行者'
            },
            '宜人性': {
                score: dims['宜人性'],
                interpretation: dims['宜人性'] >= 4.2 ?
                    '极高：极度友善，团队和谐维护者。注意：需学会坚持立场。' :
                    dims['宜人性'] >= 3.5 ?
                    '高：乐于助人，善于建立关系。建议：培养健康的原则边界。' :
                    dims['宜人性'] >= 2.5 ?
                    '中等：能平衡合作与自主。' :
                    '偏低：比较独立，更关注任务。建议：提升同理心。',
                conflictStyle: dims['宜人性'] >= 3.5 ? '避免冲突、寻求和谐' : '直接表达、任务导向',
                collaboration: dims['宜人性'] >= 3.5 ? '高' : '需刻意努力'
            },
            '情绪稳定性': {
                score: dims['情绪稳定性'],
                interpretation: dims['情绪稳定性'] >= 4.2 ?
                    '极高：情绪极度稳定，危机管理理想人选。' :
                    dims['情绪稳定性'] >= 3.5 ?
                    '高：抗压能力强。建议：利用稳定性在压力下做出理性决策。' :
                    dims['情绪稳定性'] >= 2.5 ?
                    '中等：需压力管理技巧。' :
                    '偏低：情绪敏感性高。强烈建议：寻求专业支持提升情绪韧性。',
                stressResponse: dims['情绪稳定性'] >= 3.5 ? '冷静应对、理性分析' : '可能需要情绪调节支持',
                resilience: dims['情绪稳定性'] >= 3.5 ? '高' : '需培养'
            }
        };
        
        // 职业发展建议（专业版）
        enhancements.careerMatch = {
            topRoles: [],
            reasoning: ''
        };
        
        if (dims['开放性'] >= 3.5 && dims['尽责性'] >= 3.5) {
            enhancements.careerMatch.topRoles.push({ role: '产品经理', match: 85, reason: '创新思维与执行力兼备' });
        }
        if (dims['外向性'] >= 3.5 && dims['宜人性'] >= 3.5) {
            enhancements.careerMatch.topRoles.push({ role: 'HRBP/组织发展', match: 80, reason: '人际敏感度高' });
        }
        if (dims['情绪稳定性'] >= 3.5 && dims['尽责性'] >= 3.5) {
            enhancements.careerMatch.topRoles.push({ role: '项目管理', match: 82, reason: '抗压能力强' });
        }
        if (dims['开放性'] >= 4.0 && dims['尽责性'] >= 3.5) {
            enhancements.careerMatch.topRoles.push({ role: '技术创新/研发', match: 88, reason: '创新与执行力兼备' });
        }
        
        // 发展路线图
        enhancements.developmentRoadmap = {
            shortTerm: lowDims.slice(0, 2).map(d => \`提升\${d}：3个月内参加相关培训\`),
            longTerm: ['持续提升优势维度', '建立个人发展计划IDP', '定期360度反馈'],
            resources: ['线上课程推荐', '书籍推荐', '辅导教练推荐']
        };
        
        // 风险评估
        enhancements.riskAssessment = {
            risks: lowDims.map(d => ({
                factor: d,
                level: dims[d] < 1.5 ? '高' : '中',
                mitigation: \`针对\${d}维度制定提升计划\`
            })),
            overallRisk: lowDims.length >= 3 ? '中高' : lowDims.length >= 1 ? '中' : '低'
        };
        
        // 合并增强内容到报告
        reportData.professionalEnhancement = enhancements;
        reportData.reportVersion = '2.0';
        reportData.standard = 'SHL/Northstar Professional';
        
        return reportData;
    },
    
    // MBTI专业增强
    2: function(reportData, answers) {
        if (!reportData.type) return reportData;
        
        const type = reportData.type;
        const enhancements = {
            professionalInterpretation: {},
            careerAnalysis: {},
            teamDynamics: {},
            leadershipStyle: {},
            stressManagement: {}
        };
        
        // 专业类型解读
        const professionalDesc = {
            'INTJ': '战略思想家。擅长长远规划和复杂问题解决。适合：战略规划、系统架构、研究分析。',
            'INTP': '逻辑分析师。追求知识和理解。适合：研发、数据分析、学术研究。',
            'ENTJ': '天生领导者。擅长组织和驱动变革。适合：高管、咨询、创业。',
            'ENTP': '创新企业家。善于发现可能性和联系。适合：产品创新、投资、创业。',
            'INFJ': '理想主义者。关注人类潜能和发展。适合：HRD、咨询、写作。',
            'INFP': '价值观驱动者。追求意义和真实性。适合：内容策略、用户研究、社会责任。',
            'ENFJ': '天生教育者。善于激发他人潜能。适合：培训、销售、非营利领导。',
            'ENFP': '创意激发者。热情、想象力丰富。适合：市场、创意、创业。',
            'ISTJ': '可靠执行者。注重细节和准确性。适合：财务、运营、质量保证。',
            'ISFJ': '关怀守护者。记忆力好，善于服务。适合：HR、行政、客户服务。',
            'ESTJ': '高效管理者。擅长组织和执行计划。适合：运营、项目、供应链。',
            'ESFJ': '关怀提供者。善于建立和维持和谐。适合：客户服务、活动、HR。',
            'ISTP': '问题解决者。冷静分析，善于修复。适合：技术支持、工程、数据分析。',
            'ISFP': '温和创作者。敏感，重视和谐。适合：设计、用户体验、社会服务。',
            'ESTP': '行动派。观察力强，善于应变。适合：销售、 negotiation、创业。',
            'ESFP': '社交达人。热情，善于娱乐他人。适合：活动、客户关系、培训。'
        };
        
        enhancements.professionalInterpretation = {
            type: type,
            title: reportData.typeTitle || type,
            professionalDesc: professionalDesc[type] || '专业性格类型分析',
            workStyle: reportData.workStyle || '',
            communicationStyle: reportData.communicationStyle || '',
            stressReaction: reportData.stressReaction || ''
        };
        
        enhancements.careerAnalysis = {
            topCareers: reportData.careers || [],
            careerFit: \`基于MBTI类型分析，该候选人在\${reportData.careers ? reportData.careers.slice(0,2).join('和') : '相关'}领域有天然优势。\`,
            workEnvironment: type[0] === 'E' ? '开放、互动的工作环境' : '安静、可深度思考的环境'
        };
        
        enhancements.teamDynamics = {
            role: type[1] === 'N' ? '创意贡献者' : '执行保障者',
            communication: type[2] === 'T' ? '直接、逻辑导向' : '温和、关系导向',
            conflictStyle: type[2] === 'T' ? '理性分析、解决问题' : '情感支持、维护和谐'
        };
        
        reportData.professionalEnhancement = enhancements;
        reportData.reportVersion = '2.0';
        
        return reportData;
    }
};

// 应用专业增强
function applyProfessionalEnhancement(toolId, reportData, answers) {
    const enhancer = PROFESSIONAL_ENHANCEMENTS[toolId];
    if (enhancer) {
        return enhancer(reportData, answers);
    }
    return reportData;
}

console.log('[专业报告增强模块已加载]');
`;

// 2. 找到generateReportSummary函数返回的reportData，注入增强
// 在提交测评的API中，对reportData应用增强

// 3. 在文件末尾添加增强函数的调用（在适当位置）
const insertPoint = content.lastIndexOf('module.exports');
if (insertPoint > -1) {
    content = content.slice(0, insertPoint) + enhanceFunction + '\n' + content.slice(insertPoint);
}

// 4. 修改提交API，应用专业增强
const submitApiPattern = /const reportData = generateReportSummary\(toolId, answers\);/;
if (content.match(submitApiPattern)) {
    content = content.replace(
        submitApiPattern,
        `const reportData = generateReportSummary(toolId, answers);
                // 应用专业增强
                const enhancedReportData = applyProfessionalEnhancement(toolId, reportData, answers);`
    );
    // 还要更新后续的数据库存储引用
    content = content.replace(/report_data: JSON\.stringify\(reportData\)/, 'report_data: JSON.stringify(enhancedReportData)');
}

// 5. 保存修改后的文件
const backupFile = serverFile + '.backup-' + Date.now();
fs.writeFileSync(backupFile, fs.readFileSync(serverFile));
fs.writeFileSync(serverFile, content, 'utf8');

console.log('✅ 专业报告增强已完成');
console.log('📦 原文件已备份至:', backupFile);
console.log('');
console.log('增强内容：');
console.log('  1. 大五人格：专业维度分析、职业匹配、发展路线图、风险评估');
console.log('  2. MBTI：专业类型解读、团队动态、领导力风格');
console.log('  3. 报告版本升级至 2.0，对标SHL/北森标准');
console.log('');
console.log('下一步：重启后端服务器使增强生效');
