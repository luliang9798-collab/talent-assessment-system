const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, 'server-minimal.js');
let code = fs.readFileSync(src, 'utf8');

// ===== 新版专业报告生成函数（SHL/北森级别）=====
const newFunction = `
function generateReportSummary(toolId, answers, userInfo) {
    // ========== 1. 大五人格（OCEAN）- 专业版 ==========
    const genBigFive = function(answers) {
        const dims = ['开放性', '尽责性', '外向性', '宜人性', '情绪稳定性'];
        const scores = {}, counts = {};
        dims.forEach(d => { scores[d] = 0; counts[d] = 0; });
        
        answers.forEach(a => {
            const dim = a.dimension || '开放性';
            const val = a.answer || 0;
            if (scores[dim] !== undefined) { scores[dim] += val; counts[dim]++; }
        });
        
        const avg = {}, percentiles = {};
        dims.forEach(d => {
            avg[d] = counts[d] > 0 ? Math.round(scores[d] / counts[d] * 10) / 10 : 3;
            percentiles[d] = Math.min(99, Math.max(1, Math.round((avg[d] - 1) / 4 * 100)));
        });
        
        const sorted = Object.entries(avg).sort((a,b) => b[1] - a[1]);
        const maxDim = sorted[0], minDim = sorted[sorted.length-1];
        const overall = Math.round(sorted.reduce((s,x) => s+x[1], 0) / 5 * 10) / 10;

        // 团队角色映射（Belbin模型）
        const teamRoles = {
            '开放性': ['创新者', '善于提出新想法和创意方案'],
            '尽责性': ['执行者', '注重细节、按时交付、质量保证'],
            '外向性': ['协调者/资源探索者', '擅长对外联络、推动团队协作'],
            '宜人性': ['团队协作者', '营造和谐氛围、化解冲突'],
            '情绪稳定性': ['完成者', '在压力下保持冷静、确保任务完成']
        };

        return {
            toolName: '大五人格专业测评报告',
            overallScore: overall,
            dimensions: avg,
            percentiles: percentiles,
            summary: [
                '【测评概述】',
                '本次大五人格（Big Five/OCEAN）测评基于国际通用的五因素人格模型，从五个核心维度全面评估您的人格特质。该模型被广泛应用于人才选拔、职业发展、团队建设等领域，具有跨文化、跨行业的良好信效度。',
                '',
                '【综合评估】',
                '您的综合人格得分为 ' + overall + ' 分（5分制）。在' + maxDim[0] + '维度表现最为突出（' + maxDim[1] + '分），这表明您' + getBFDesc(maxDim[0], maxDim[1]) + '。相对而言，' + minDim[0] + '维度有较大提升空间（' + minDim[1] + '分），建议' + getBFSuggestion(minDim[0], minDim[1]) + '。',
                '',
                '【各维度详细解读】',
                ...dims.map(function(d) {
                    var p = percentiles[d];
                    var level = p >= 75 ? '高分段（前25%）' : p >= 50 ? '中高分段（前50%）' : p >= 25 ? '中低分段' : '低分段（后25%）';
                    return d + '（' + avg[d] + '分，常模' + level + '）：' + getBFDetail(d, avg[d]);
                }),
                '',
                '【职场优势分析】',
                ...sorted.filter(function(x) { return x[1] >= 3.5; }).map(function(x) { return '• ' + x[0] + '（' + x[1] + '分）：' + getBFDesc(x[0], x[1]); }),
                '',
                '【待发展领域】',
                ...sorted.filter(function(x) { return x[1] < 3.0; }).map(function(x) { return '• ' + x[0] + '（' + x[1] + '分）：建议' + getBFSuggestion(x[0], x[1]); }),
                '',
                '【团队角色定位】基于您的人格特质，您在团队中最适合担任「' + (teamRoles[maxDim[0]] ? teamRoles[maxDim[0]][0] : '多面手') + '」角色——' + (teamRoles[maxDim[0]] ? teamRoles[maxDim[0]][1] : '能够适应多种团队需求') + '。同时建议与' + (teamRoles[minDim[0]] ? teamRoles[minDim[0]][0] : '互补型成员') + '类型的同事协作，形成能力互补。',
                '',
                '【领导力潜质】' + (overall >= 3.8 ? '您展现出较强的领导力潜质，尤其在决策魄力和人际影响力方面表现突出。适合向管理岗位发展。' : overall >= 3.4 ? '您具备中等偏上的领导力基础，建议通过项目管理和团队协作实践进一步提升领导技能。' : '目前更适合作为个人贡献者深耕专业领域，未来可逐步培养管理意识。'),
                '',
                '【发展建议】',
                '短期（3个月）：针对' + minDim[0] + '维度进行专项提升，如参加相关培训或寻求导师指导。',
                '长期（12个月）：发挥' + maxDim[0] + '维度优势，将其转化为核心竞争力；同时系统性地改善短板维度。'
            ].join('\\n'),
            strengths: sorted.filter(function(x){return x[1]>=3.5}).map(function(x,i){return{name:x[0]+'维优势',desc:getBFDesc(x[0],x[1])+'（'+x[1]+'分）'}}),
            weaknesses: sorted.filter(function(x){return x[1]<3.0}).map(function(x,i){return{name:x[0]+'维待提升',desc:getBFSuggestion(x[0],x[1])}}),
            suggestions: [getBFSuggestion(minDim[0],minDim[1]), '持续发挥'+maxDim[0]+'维度的天然优势','建立系统的自我认知和反馈机制'],
            jobMatch: getBFJobMatch(avg),
            interviewQuestions: getBFInterviewQ(avg),
            leadershipPotential: overall >= 3.8 ? '高' : overall >= 3.4 ? '中高' : '发展中',
            teamRole: teamRoles[maxDim[0]] ? teamRoles[maxDim[0]][0] : '灵活型'
        };
    };

    // ========== 2. MBTI - 专业版 ==========
    const genMBTI = function(answers) {
        var E=0,I=0,S=0,N=0,T=0,F=0,J=0,P=0;
        var eC=0,iC=0,sC=0,nC=0,tC=0,fC=0,jC=0,pC=0;
        answers.forEach(function(a) {
            var v = a.answer || 0;
            var d = a.dimension || '';
            if (d === 'E/I' || d === 'EI') { if(v>=4) { E+=v; eC++; } else { I+=(6-v); iC++; } }
            else if (d === 'S/N' || d === 'SN') { if(v>=4) { S+=v; sC++; } else { N+=(6-v); nC++; } }
            else if (d === 'T/F' || d === 'TF') { if(v>=4) { T+=v; tC++; } else { F+=(6-v); fC++; } }
            else if (d === 'J/P' || d === 'JP') { if(v>=4) { J+=v; jC++; } else { P+=(6-v); pC++; } }
        });

        function pct(a,b) { var t=a+b; return t>0 ? Math.round(a/t*100) : 50; }
        function avg(a,c) { return c>0 ? Math.round(a/c*10)/10 : 3; }

        var type = (E>=I?'E':'I')+(S>=N?'S':'N')+(T>=F?'T':'F')+(J>=P?'J':'P');

        var profiles = {
            INTJ:{t:'建筑师',core:'战略性思维，追求效率与完美主义，独立且坚定地推进复杂目标。具有极强的系统思维能力和远见卓识，善于发现模式并制定长远规划。',str:['战略规划能力出色','独立决策、不受他人影响','对复杂问题有深度洞察力','高标准驱动持续改进'],wk:['可能过度批判他人想法','社交精力有限，需主动建立关系','对执行细节缺乏耐心'],fit:'首席技术官/架构师/战略顾问/数据科学家/研发总监'},
            INTP:{t:'逻辑学家',core:'好奇心驱动的分析者，热衷于理解事物背后的原理和逻辑框架。思维灵活开放，喜欢挑战假设和探索可能性空间。',str:['逻辑推理能力强','思维开放不拘一格','能快速学习新领域知识','创新性解决问题'],wk:['执行力有时不足','可能忽视他人情感需求','容易陷入过度分析而迟迟不做决定'],fit:'研究员/算法工程师/哲学家/技术顾问/产品策略师'},
            ENTJ:{t:'指挥官',core:'天生的领导者，具有强大的组织能力和推动力。善于制定战略愿景并动员资源去实现目标，在混乱中建立秩序。',str:['卓越的领导力和组织能力','果断决策，敢于承担责任','战略思维与执行力兼具','善于激励和推动团队'],wk:['可能过于强势导致团队压力','有时忽略细节和质量控制','需要更多耐心倾听不同意见'],fit:'CEO/总经理/创业者/咨询公司合伙人/投资经理'},
            ENTP:{t:'辩论家',core:'智力敏捷的挑战者，热爱头脑风暴和辩论各种可能性。思维发散且有创造力，善于发现机会和连接看似无关的概念。',str:['创新思维和创意丰富','快速适应变化的环境','善于说服和影响他人','能看到别人看不到的机会'],wk:['可能虎头蛇尾、难以坚持','容易对常规事务感到厌倦','需要更有纪律性的执行伙伴'],fit:'创业公司创始人/产品经理/市场战略师/投资人/创意总监'},
            INFJ:{t:'提倡者',core:'理想主义者兼战略家，既有深刻的同理心又有清晰的目标导向。致力于帮助他人实现潜能，追求有意义的社会影响。',str:['深刻洞察他人的需求和潜力','强烈的使命感和价值观驱动','优秀的倾听者和咨询师','能将愿景转化为行动计划'],wk:['容易过度承担他人情绪负担','对批评过于敏感','理想化倾向可能导致失望'],fit:'组织发展顾问/HBP/培训总监/心理咨询师/社会企业创始人'},
            INFP:{t:'调停者',core:'忠于内心价值观的理想主义者，以真诚和创造力与世界互动。追求真实性和意义感，对他人的情感有敏锐的感知力。',str:['真诚且富有同理心','创造力和想象力丰富','坚定的价值观和原则性','善于理解和接纳多样性'],wk:['可能在冲突面前退缩','决策时过于依赖情感','需要更务实的目标设定'],fit:'内容创作者/用户体验研究员/品牌策划师/心理咨询师/教育工作者'},
            ENFJ:{t:'主人公',core:'富有魅力的天然领导者，善于激励和赋能他人。具有强烈的人际敏感度和利他动机，致力于创建和谐共赢的团队环境。',str:['出色的感染力和号召力','天然的教练和导师气质','善于发现和发展他人潜力','团队凝聚力的核心人物'],wk:['可能过度关注他人而忽视自己','难以做出艰难的决定','需要学会设立边界'],fit:'HRD/培训总监/公关负责人/销售总监/非营利组织领导者'},
            ENFP:{t:'竞选者',core:'热情洋溢的创新者，对人充满好奇和真诚的兴趣。思维跳跃且富有创造力，善于在各种想法和人之间建立连接。',str:['极具感染力的热情和正能量','创造性思维和发散性思考','善于建立广泛的人际网络','适应性强、学习速度快'],wk:['注意力分散、难以专注','可能过度承诺而无法兑现','需要更强的项目管理能力'],fit:'市场营销/活动策划/用户增长/媒体人/创业者'},
            ISTJ:{t:'物流师',core:'务实可靠的责任担当者，重视秩序、规则和承诺。以严谨的态度处理每一项任务，是组织中最可信赖的基石型人才。',str:['高度的责任心和可靠性','注重细节和准确性','遵守规则和流程','稳定的情绪和执行力'],wk:['可能抗拒变化和创新','灵活性不足','需要更多的冒险精神'],fit:'财务总监/运营经理/合规审计/项目经理/质量管理'},
            ISFJ:{t:'守护者',core:'温暖细致的支持者，默默为他人付出。具有超强的事务性记忆和对细节的关注，是团队中的"粘合剂"和"稳定器"。',str:['细心周到、考虑周全','忠诚可靠的团队成员','优秀的服务意识和执行力','善于维护和谐的关系'],wk:['可能过度自我牺牲','难以拒绝他人的请求','需要更多地表达自己的需求'],fit:'行政总监/客户成功负责人/HR运营/医疗护理/教育行政'},
            ESTJ:{t:'总经理',core:'高效务实的管理者，以结果为导向，善于组织和协调资源。重视传统价值和明确的层级结构，是组织中不可或缺的执行力量。',str:['高效的组织和管理能力','明确的目标感和执行力','务实的问题解决方法','值得信赖的决策者'],wk:['可能显得不够灵活','对抽象和创新理念接受度低','需要注意工作生活平衡'],fit:'运营总监/项目经理/供应链管理者/银行经理/政府管理人员'},
            ESFJ:{t:'执政官',core:'社交能力强且热心助人的组织者，致力于营造和谐温暖的人际环境。善于感知他人的情绪变化并及时给予支持。',str:['出色的人际交往能力','热忱的服务态度','善于组织社交活动','团队的"润滑剂"和"暖心人"]',wk:['可能过分在意他人评价','决策时受情感影响较大','需要发展独立性'],fit:'HRBP/客户关系经理/教师/护士/酒店管理'},
            ISTP:{t:'鉴赏家',core:'冷静理性的问题解决者，擅长分析和拆解复杂系统。动手能力强，喜欢通过实际操作来理解事物的运作原理。',str:['出色的分析和故障排查能力','冷静应对危机','动手能力强、实操经验丰富','独立自主的工作方式'],wk:['沟通表达可以更加主动','长期规划和坚持需要加强','情感表达较为内敛'],fit:'工程师/技术人员/系统运维/质量控制/金融分析师'},
            ISFP:{t:'探险家',core:'温和敏感的艺术家型，追求美学和个人表达。尊重每个人的独特性，通过行动而非言语来表达关怀和善意。',str:['审美品味和艺术感知力','真诚待人、不虚伪做作','灵活适应环境','关注当下和具体细节'],wk:['面对冲突时倾向于回避','需要更自信地表达意见','长期目标规划能力待提升'],fit:'设计师/摄影师/文案/用户研究/客户服务'},
            ESTP:{t:'企业家',core:'行动派的风险承担者，反应敏捷且充满活力。善于抓住当下的机会并通过实际行动来验证想法，是天生的谈判者和推销员。',str:['快速反应和即兴发挥能力','出色的谈判和说服力','务实且结果导向','充满活力和感染力'],wk:['冲动决策可能导致风险','长期规划能力较弱','需要更多的反思和沉淀'],fit:'销售总监/创业者/体育教练/活动执行/贸易业务'},
            ESFP:{t:'表演者',core:'热情洋溢的享乐主义者，善于享受当下并带动周围人的情绪。具有天然的舞台魅力和娱乐才能，是聚会的焦点人物。',str:['极具亲和力和幽默感','善于活跃气氛和调动情绪','活在当下、享受生活','实用主义的社交高手'],wk:['需要更长远的规划视角','可能因追求即时满足而忽略责任','需要增强深度思考的习惯'],fit:'公关/演艺/旅游服务/销售/教育培训']
        };

        var pf = profiles[type] || profiles.INTJ;
        var eP=pct(E,I), iP=100-eP, sP=pct(S,N), nP=100-sP, tP=pct(T,F), fP=100-tP, jP=pct(J,P), pP=100-jP;

        var oScore = ((avg(E,eC)+avg(I,iC)+avg(S,sC)+avg(N,nC)+avg(T,tC)+avg(F,fC)+avg(J,jC)+avg(P,pC))/8 * 5 / 5).toFixed(1);

        return {
            toolName: 'MBTI职业性格专业测评报告',
            type: type,
            typeTitle: pf.t,
            typeDesc: pf.core,
            overallScore: parseFloat(oScore),
            totalScore: parseFloat(oScore),
            dimensions: {'外向(E)':avg(E,eC),'内向(I)':avg(I,iC),'感觉(S)':avg(S,sC),'直觉(N)':avg(N,nC),'思考(T)':avg(T,tC),'情感(F)':avg(F,fC),'判断(J)':avg(J,jC),'感知(P)':avg(P,pC)},
            typeScores: {E:eP,I:iP,S:sP,N:nP,T:tP,F:fP,J:jP,P:pP},
            careers: pf.fit.split('/'),
            summary: [
                '【MBTI职业性格测评专业报告】',
                '',
                '一、类型判定',
                '经过16道MBTI标准题目测评，您的四维偏好结果为：',
                '• 外倾(E)/内倾(I)：' + (E>=I?'偏向E-外倾('+eP+'%)':'偏向I-内倾('+iP+'%)'),
                '• 感觉(S)/直觉(N)：' + (S>=N?'偏向S-感觉('+sP+'%)':'偏向N-直觉('+nP+'%)'),
                '• 思考(T)/情感(F)：' + (T>=F?'偏向T-思考('+tP+'%)':'偏向F-情感('+fP+'%)'),
                '• 判断(J)/感知(P)：' + (J>=P?'偏向J-判断('+jP+'%)':'偏向P-感知('+pP+'%)'),
                '',
                '最终类型：' + type + ' —— 「' + pf.t + '」',
                '',
                '二、类型深度解析',
                pf.core,
                '',
                '三、核心优势',
                ...pf.str.map(function(s,i){return (i+1)+'. '+s;}),
                '',
                '四、潜在挑战与发展方向',
                ...pf.wk.map(function(w,i){return (i+1)+'. '+w;}),
                '',
                '五、职场表现特征',
                '• 决策风格：' + (type[0]==='E'?'倾向于快速决策、多方征求意见后拍板':'倾向于深思熟虑、充分分析后再做决定'),
                '• 沟通方式：' + (type[2]==='T'?'直接、逻辑化、关注事实和数据':'委婉、共情化、关注感受和人际关系'),
                '• 工作节奏：' + (type[3]==='J'?'偏好计划有序、按部就班、提前完成':'偏好灵活应变、临场发挥、截止日期前冲刺'),
                '• 压力反应：' + getTypeStress(type),
                '',
                '六、适合的职业方向',
                pf.fit,
                '',
                '七、发展建议',
                '• 发扬' + pf.str[0].substring(0,6) + '的天赋，选择能充分发挥此优势的工作环境和岗位',
                '• 针对' + pf.wk[0].substring(0,6) + '制定专项改进计划，寻找互补型的合作伙伴或导师',
                '• 在职业选择时优先考虑与' + type + '类型匹配度高的行业和组织文化'
            ].join('\\n'),
            strengths: pf.str.map(function(s,i){return{name:'核心优势'+(i+1),desc:s};}),
            weaknesses: pf.wk.map(function(w,i){return{name:'发展领域'+(i+1),desc:w};}),
            workStyle: (type[0]==='E'?'外向活跃型': '内向深思型') + ' + ' + (type[2]==='T'? '理性分析型': '感性共情型') + ' + ' + (type[3]==='J'? '计划有序型': '灵活适应型'),
            communicationStyle: type[2]==='T' ? '沟通简洁有力，注重事实依据，善用数据和逻辑支撑观点' : '沟通温和细腻，善于倾听和共情，注重维护对方的面子和感受',
            stressReaction: getTypeStress(type),
            developmentSuggestions: pf.wk.slice(0,3)
        };
    };

    // ========== 3. DISC - 专业版 ==========
    const genDISC = function(answers) {
        var scores={D:0,I:0,S:0,C:0}, counts={D:0,I:0,S:0,C:0};
        answers.forEach(function(a){
            var d=(a.dimension||'D')[0];
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={};
        var maxK='D',maxV=0;
        ['D','I','S','C'].forEach(function(k){
            avg[k]=counts[k]>0?Math.round(scores[k]/counts[k]*10)/10:3;
            if(avg[k]>maxV){maxV=avg[k];maxK=k;}
        });

        var discProfiles={
            D:{name:'支配型-Dominance',core:'结果导向型领导者，目标明确、行动迅速、敢于挑战权威。在面对困难和竞争时表现出色，能够在压力下保持清晰的判断力和推动力。适合需要快速决策和突破性成果的场景。',style:'直接、简洁、聚焦结果，不喜欢冗余信息。沟通时习惯使用指令性和确定性的语言。',strengths:['目标感强，结果导向','决策果断，敢于担责','在竞争中表现突出','推动变革的能力强'],weaknesses:['可能过于强势','对细节关注度不足','耐心有待提升','需要更多倾听'],mgmt:'给予充分的授权和决策空间，设定清晰的目标和期限，减少微观管理。定期进行一对一反馈，认可其成就。',stress:'高压下可能变得更加激进和控制欲强，建议练习深呼吸和暂时抽离。',roles:'CEO/销售总监/创业者/项目经理/变革推动者'},
            I:{name:'影响型-Influence',core:'人际导向型的影响者，热情洋溢、善于表达、乐于激励他人。具有天然的感染力和说服力，能够在团队中营造积极乐观的氛围。适合需要对外联络、影响和激励的场景。',style:'生动热情、富有感染力，善于讲故事和使用比喻。喜欢得到他人的关注和认可。',strengths:['极强的影响力和感染力','善于建立人际关系','乐观积极的心态','创意和表达能力突出'],weaknesses:['可能过于乐观而忽略风险','执行力有时不足','对枯燥重复工作的耐受度低','需要注意时间管理'],mgmt:'给予公开的认可和展示平台，提供社交机会。避免过多限制其自由度，用愿景和激情驱动。',stress:'压力下可能回避现实或转移话题，建议建立跟进机制和 accountability partner。',roles:'市场总监/公关/销售/培训师/活动策划'},
            S:{name:'稳健型-Steadiness',core:'关系导向型的支持者，耐心、稳重、善于倾听和配合。高度重视团队的和谐与稳定，是组织中最可靠的支持型成员。适合需要长期服务和稳定产出的场景。',style:'温和耐心、善于倾听，语速较慢但表达真诚。不喜欢冲突和突变，需要时间思考和准备。',strengths:['极高的团队合作意识','耐心细致的服务态度','情绪稳定可信赖','善于维护客户关系'],weaknesses:['面对变化的适应速度较慢','可能回避必要的冲突','主动性可以更强','需要更多表达自己的观点'],mgmt:'提供清晰稳定的指引和支持，给予充足的时间适应变化。营造安全的工作环境，逐步增加挑战。',stress:'压力下可能沉默退缩或过度顺从，鼓励其表达真实想法并提供支持。',roles:'客户成功/HR专员/运营支持/行政/客服/培训协调'},
            C:{name:'遵从型-Conscientiousness',core:'任务导向型的分析师，严谨准确、注重质量和规范。善于收集和分析信息，在做决策前会充分权衡各方因素。适合需要高质量输出和精确分析的场景。',style:'准确严谨、逻辑清晰，喜欢用数据和事实说话。沟通时注重细节和准确性，不喜欢模糊和不确定的表达。',strengths:['出色的分析能力','高度的质量意识','做事严谨有条理','遵守流程和规范'],weaknesses:['可能过度分析导致决策缓慢','灵活性有待提升','对模糊性的容忍度较低','需要更多关注人际关系'],mgmt:'提供充分的数据和分析时间，设定明确的质量标准和检查点。减少突发变化的需求，允许充足的准备时间。',stress:'压力下可能过度谨慎甚至瘫痪，帮助其设定决策时限和降低完美主义期望。',roles:'数据分析/质量控制/财务/法务/合规/研发工程师'}
        };

        var info=discProfiles[maxK];
        var workPerf=maxK==='D'?'倾向于快速决策、推动结果，适合需要驱动结果的角色':maxK==='I'?'倾向于激励他人、营造氛围，适合需要影响和协作的角色':maxK==='S'?'倾向于维护和谐、支持队友，适合需要稳定和协作的角色':'倾向于仔细分析、确保质量，适合需要准确和分析的角色';

        return {
            toolName: 'DISC行为风格专业测评报告',
            dimensions: avg,
            dominantStyle: maxK,
            overallScore: Math.round((avg.D+avg.I+avg.S+avg.C)/4*10)/10,
            summary: [
                '【DISC行为风格测评专业报告】',
                '',
                '一、主导风格识别',
                '您的DISC四维得分：支配(D)=' + avg.D + '，影响(I)=' + avg.I + '，稳健(S)=' + avg.S + '，遵从(C)=' + avg.C + '。',
                '主导风格为 ' + maxK + ' 型——' + info.name + '。',
                '',
                '二、风格画像',
                info.core,
                '',
                '三、沟通风格',
                info.style,
                '',
                '四、职场行为特征',
                '在团队和工作场景中，您' + workPerf + '。',
                '',
                '五、核心优势',
                ...info.strengths.map(function(s,i){return (i+1)+'. '+s;}),
                '',
                '六、发展建议',
                ...info.weaknesses.map(function(w,i){return (i+1)+'. '+w;}),
                '',
                '七、压力下的行为模式',
                info.stress,
                '',
                '八、管理建议（供管理者参考）',
                info.mgmt,
                '',
                '九、推荐适配岗位',
                info.roles
            ].join('\\n'),
            strengths: info.strengths.map(function(s,i){return{name:'优势'+(i+1),desc:s};}),
            weaknesses: info.weaknesses.map(function(w,i){return{name:'待提升'+(i+1),desc:w};}),
            style: info.style,
            suitableRoles: info.roles,
            communicationTips: info.style,
            stressReaction: info.stress,
            managementStyle: info.mgmt
        };
    };

    // ========== 4. 霍兰德 - 专业版 ==========
    const genHolland = function(answers) {
        var scores={R:0,I:0,A:0,S:0,E:0,C:0}, counts={R:0,I:0,A:0,S:0,E:0,C:0};
        var names={R:'现实型',I:'研究型',A:'艺术型',S:'社会型',E:'企业型',C:'常规型'};
        answers.forEach(function(a){
            var d=(a.dimension||'R')[0];
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={}, sorted=[];
        ['R','I','A','S','E','C'].forEach(function(k){
            avg[k]=counts[k]>0?Math.round(scores[k]/counts[k]*10)/10:3;
            sorted.push([k,avg[k]]);
        });
        sorted.sort(function(a,b){return b[1]-a[1];});
        var top3=sorted.slice(0,3).map(function(x){return x[0];}).join('');
        var topNames=top3.split('').map(function(x){return names[x];}).join('-');

        var hollandCareers={
            RIA:['机械工程师','电子工程师','土木工程师','技术员'],
            RIS:['外科医生','信息技术专家','生物学家','化学家'],
            RIE:['系统分析师','数学家','物理学家','地质学家'],
            RIC:['会计师','成本核算','银行职员','统计员'],
            RSE:['厨师','牙科技师','消防员','警察'],
            RSA:['园艺师','农民','兽医','宠物美容'],
            RES:['空乘','航海员','导游','采购'],
            REC:['办公室管理员','秘书','文字录入','仓库管理'],
            AIS:['建筑师','艺术家','摄影师','设计师'],
            AIR:['飞行员','计算机工程师','科学期刊编辑'],
            ASE:['心理学家','哲学研究者','大学教师','社会学'],
            AIE:['编辑/作家','翻译','语言学家','记者'],
            AIE_2:['音乐家','作曲家','指挥家','演奏家'],
            SAI:['心理咨询师','学校辅导员','社工','职业顾问'],
            SEC:['律师','法官','公务员','招聘专员'],
            SER:['体育教练/裁判','运动生理学家','理疗师','康复治疗'],
            SEI:['公共关系经理','人力资源总监','市场经理','销售经理'],
            SCA:['图书馆管理员','档案管理','博物馆讲解','税务专员'],
            SCE:['小学/幼儿园教师','职业教育师','特教老师','辅导员'],
            SIR:['护士/医生助理','物理治疗师','医学实验室技师','牙医'],
            SRI:['航空管制员','飞行员','交通调度','质检'],
            SRC:['办公室主任/行政','秘书','会员主管','办事员'],
            ECR:['财务经理','银行行长','预算分析师','审计师'],
            ECS:['商务经理','销售代表','房地产经纪人','采购代理'],
            ESR:['运动推广员','赛事组织者','旅游代理人','精品店店主'],
            ESI:['公关经理','传媒策划','营销策划','活动组织'],
            ERA:['广播/电视主持人','演说家','政治家','企业家'],
            ERI:['工业工程经理','工厂督导','项目经理','安全工程师'],
            ERC:['办公室经理','部门主管','区域经理','运营总监'],
            CRI:['会计','统计员','精算师','商业分析师'],
            CRS:['邮递员','档案管理员','银行柜员','前台接待'],
            CIA:['审计员','税务专员','法律助理','合规专员'],
            CIE:['计算机操作员','数据库管理','技术文档编写'],
            CIS:['应用软件程序员','系统分析师','网络管理员'],
            CIR:['质量检验','技术制图','建筑绘图','机械制图'],
            CSE:['法庭书记员','速记员','行政助理','人事档案'],
            CSR:['接待员','电话接线员','秘书','办公文员'],
            CSI:['调查分析师','校对员','信息整理','图书管理'],
            CES:['银行信贷员','保险核保','证券交易','预算分析师'],
            CER:['人事助理','招聘专员','薪酬福利专员','员工关系'],
            CIE_2:['计算机录入','桌面出版','数据录入','表格制作']
        };

        var careers=hollandCareers[top3]||['综合管理岗','行政助理','项目协调','客户服务'];
        var descMap={
            R:'喜欢使用工具和机器操作，偏好具体、实际的任务，动手能力强',
            I:'喜欢分析和解决智力性问题，对科学原理和理论探究感兴趣，思维缜密',
            A:'富于想象力和创造力，追求美感和自我表达，不喜欢高度结构化的工作',
            S:'乐于助人，善于与人沟通和合作，关心社会问题和他人福祉',
            E:'自信、有野心，喜欢领导和影响他人，追求经济回报和社会地位',
            C:'注重细节和条理，喜欢按照既定规程工作，重视准确性和可靠性'
        };

        return {
            toolName: '霍兰德职业兴趣专业测评报告',
            dimensions: avg,
            hollandCode: top3,
            dimensionNames: topNames,
            overallScore: Math.round((sorted[0][1]+sorted[1][1]+sorted[2][1])/3*10)/10,
            summary: [
                '【霍兰德职业兴趣测评专业报告】',
                '',
                '一、兴趣代码',
                '您的霍兰德职业兴趣代码为 ' + top3 + '（' + topNames + '）。',
                '这意味着您最匹配的三种兴趣类型依次为：',
                ...top3.split('').map(function(c,i){return (i+1)+'. '+names[c]+'（'+c+'）：'+avg[c]+'分 —— '+descMap[c];}),
                '',
                '二、职业兴趣深度分析',
                '根据霍兰德理论，您的兴趣组合呈现出以下特点：',
                '• 主导兴趣（'+names[sorted[0][0]]+'）：这是您最自然的职业倾向，在工作中从事此类活动时会感到最大的满足感和成就感。',
                '• 辅助兴趣（'+names[sorted[1][0]]+'和'+names[sorted[2][0]]+'）：这些兴趣类型可以作为主导兴趣的有益补充，拓宽您的职业选择范围。',
                '• 相对较弱的兴趣类型：建议在选择工作时不必强行迎合这些领域，以免产生职业倦怠。',
                '',
                '三、推荐职业方向',
                '基于您的兴趣代码 ' + top3 + '，以下职业与您的兴趣匹配度最高：',
                ...careers.map(function(c,i){return (i+1)+'. '+c;}),
                '',
                '四、择业建议',
                '• 优先选择能够充分发挥您主导兴趣（'+names[sorted[0][0]]+'）的工作内容和环境',
                '• 考虑将辅助兴趣融入工作中，使职业发展更加多元化和可持续',
                '• 避免长时间从事与您兴趣代码相悖的工作，这可能导致职业倦怠和绩效下降',
                '• 定期重新评估职业兴趣的变化，因为兴趣会随着经验和成长而演变'
            ].join('\\n'),
            careerSuggestions: careers,
            strengths: sorted.slice(0,3).map(function(x,i){return{name:'兴趣优势'+(i+1),desc:names[x[0]]+'倾向明显（'+x[1]+'分）'};}),
            limitations: sorted.slice(3).map(function(x,i){return{name:'兴趣盲区'+(i+1),desc:names[x[0]]+'兴趣较弱（'+x[1]+'分），不建议作为主要职业方向'}})
        };
    };

    // ========== 5. 情商EQ - 专业版 ==========
    var genEQ = function(answers) {
        var dims=['自我意识','自我调节','内在激励','同理心','社交技能'];
        var scores={}, counts={};
        dims.forEach(function(d){scores[d]=0;counts[d]=0;});
        answers.forEach(function(a){
            var d=a.dimension||'自我意识';
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={};
        dims.forEach(function(d){avg[d]=counts[d]>0?Math.round(scores[d]/counts[d]*10)/10:3;});
        var overall=Math.round(dims.reduce(function(s,d){return s+avg[d];},0)/5*10)/10;
        var level=overall>=4.2?'优秀':overall>=3.5?'良好':overall>=2.8?'一般':'需提升';
        var leadership=overall>=4.2?'高领导力潜质——情商是领导力的核心，您已具备成为优秀领导者的关键素质':overall>=3.5?'中等领导力潜质——继续提升同理心和社会技巧将显著增强您的影响力':'发展中——建议重点训练情绪觉察和社交技巧';

        var eqDetails={
            '自我意识':{'high':'您对自己的情绪状态有清晰的觉察，能够准确识别自己在不同情境下的情绪变化及其触发因素。这种自我认知能力是情商发展的基石。','low':'建议开始练习情绪日记，记录每天的情绪波动和触发事件，逐步提升对自己情绪模式的觉察。','workplace':'在会议中能客观评估自己的想法而不被情绪左右'},
            '自我调节':{'high':'您展现了出色的情绪管理能力，即使在压力环境下也能保持冷静和理性，不会让负面情绪影响决策和行为。','low':'当遇到挫折时容易情绪失控，建议学习深呼吸、正念冥想等即时调节技巧。','workplace':'面对批评或挫折时能快速恢复平静并继续工作'},
            '内在激励':{'high':'您拥有强大的内部驱动力，不依赖外部奖励也能保持高度的投入和热情。这种内在动力是长期成功的关键保障。','low':'可能过度依赖外部认可和奖励，建议找到工作的内在意义和价值。','workplace':'即使在没有监督的情况下也能保持高质量产出'},
            '同理心':{'high':'您能够准确感知和理解他人的情绪和立场，这使您在人际关系和团队合作中具有天然的优势。','low':'在理解他人感受方面还有提升空间，建议多练习换位思考。','workplace':'能预判团队成员的情绪变化并及时给予支持'},
            '社交技能':{'high':'您擅长建立和维护人际关系，能够有效地沟通、协商、合作和解决冲突。这是职场成功的重要软技能。','low':'在社交场合可能感到不适或不知道如何有效互动，建议从小范围练习开始。','workplace:'能在跨部门和跨层级沟通中游刃有余'}
        };

        return {
            toolName: '情商(EQ)专业测评报告',
            overallScore: overall,
            totalScore: overall,
            eqLevel: level,
            dimensions: avg,
            leadershipPotential: leadership,
            summary: [
                '【情商(EQ)专业测评报告】',
                '',
                '一、情商总评',
                '您的情商综合得分为 ' + overall + ' 分（5分制），等级评定为「' + level + '」。',
                '',
                '二、五维度详细评估',
                ...dims.map(function(d){
                    var detail=eqDetails[d];
                    var isHigh=avg[d]>=3.5;
                    return d + '（' + avg[d] + '分）：' + (isHigh?detail.high:detail.low);
                }),
                '',
                '三、领导力潜质评估',
                leadership,
                '',
                '四、各维度职场表现预期',
                ...dims.map(function(d){return '• ' + d + '：' + eqDetails[d].workplace;}),
                '',
                '五、提升建议',
                ...(level!=='优秀'?[
                    '1. 每天花5分钟进行正念呼吸练习，提升情绪觉察能力',
                    '2. 每周至少进行一次深度倾听练习（与他人对话时完全专注于对方的表达）',
                    '3. 建立情绪日志，追踪情绪模式和触发因素',
                    '4. 寻找一位情商较高的榜样观察和学习其社交方式'
                ]:[
                    '继续保持当前的高情商水平，可以考虑：
                    • 承担更多需要人际协调的管理职责
                    • 作为情商导师帮助团队其他成员成长
                    • 将情商优势应用于更高层次的领导力发展'])
            ].join('\\n'),
            strengths: dims.filter(function(d){return avg[d]>=3.5}).map(function(d){return{name:d+'优势',desc:eqDetails[d].high.substring(0,40)+'...'};}),
            weaknesses: dims.filter(function(d){return avg[d]<3.0}).map(function(d){return{name:d+'待提升',desc:eqDetails[d].low.substring(0,40)+'...'};}),
            suggestions: level!=='优秀' ? ['每日正念练习5分钟','建立情绪反馈机制','寻求高情商榜样学习'] : ['承担更多协调管理工作','辅导团队成员情商成长','向高层领导力发展']
        };
    };

    // ========== 6. 工作动机 - 专业版 ==========
    var genMotivation = function(answers) {
        var dims=['成就动机','权力动机','归属动机','金钱动机','安全感','自主性','成长发展','工作生活平衡'];
        var scores={}, counts={};
        dims.forEach(function(d){scores[d]=0;counts[d]=0;});
        answers.forEach(function(a){
            var d=a.dimension||'成就动机';
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={};
        dims.forEach(function(d){avg[d]=counts[d]>0?Math.round(scores[d]/counts[d]*10)/10:3;});
        var sorted=Object.entries(avg).sort(function(a,b){return b[1]-a[1];});

        var motivDesc={
            '成就动机':'追求卓越、渴望通过努力获得有形的结果和认可',
            '权力动机':'希望影响他人、掌控局面、推动变革',
            '归属动机':'重视人际关系和团队归属感，希望被接纳和认同',
            '金钱动机':'物质报酬是重要的激励来源',
            '安全感':'偏好稳定、可预测的工作环境，规避风险',
            '自主性':'重视工作中的自由度和决策权',
            '成长发展':'看重学习和成长的机会胜过短期收益',
            '工作生活平衡':'重视私人时间和家庭，不愿过度牺牲个人生活'
        };

        return {
            toolName: '工作动机专业测评报告',
            dimensions: avg,
            overallScore: Math.round(dims.reduce(function(s,d){return s+avg[d];},0)/dims.length*10)/10,
            summary: [
                '【工作动机专业测评报告】',
                '',
                '一、动机结构概览',
                '您的前三大驱动力为：',
                ...sorted.slice(0,3).map(function(x,i){return (i+1)+'. '+x[0]+'（'+x[1]+'分）：'+motivDesc[x[0]];}),
                '',
                '相对较弱的动机因素：',
                ...sorted.slice(-3).map(function(x){return '• '+x[0]+'（'+x[1]+'分）';}),
                '',
                '二、动机结构深度解读',
                '您属于「' + (sorted[0][1]>=4.0?'高驱动型':'均衡型') + '」人才。' +
                (sorted[0][1]>=4.0?
                    '您有非常明确的驱动力来源——'+sorted[0][0]+'是您的核心引擎。这种强烈的内在动机会让您在相关领域表现出色，但也需要注意不要让单一动机过度主导所有决策。':
                    '您的各项动机分布较为均匀，没有极端偏高或偏低的因素。这意味着您可以适应多种工作环境，但也需要找到真正能点燃您热情的核心驱动力。'),
                '',
                '三、激励建议',
                ...sorted.slice(0,3).map(function(x){
                    return '• 针对'+x[0]+'（'+x[1]+'分）：'+getMotivationTip(x[0]);
                }),
                '',
                '四、组织匹配建议',
                '选择雇主和组织时，请重点关注：',
                '• 组织文化和价值观是否与您的核心动机相契合',
                '• 该岗位是否能提供您最看重的激励要素',
                '• 职业发展路径是否支持您的成长动机'
            ].join('\\n'),
            strengths: sorted.slice(0,3).map(function(x,i){return{name:'核心驱动力'+(i+1),desc:motivDesc[x[0]]}}),
            suggestions: sorted.slice(0,3).map(function(x){return getMotivationTip(x[0]);})
        };
    };

    // ========== 7. 工作价值观 - 专业版 ==========
    var genValues = function(answers) {
        var dims=['成就感','经济报酬','工作稳定性','人际关系','自主性','创新创造','社会贡献','工作生活平衡','管理权力','声誉地位'];
        var scores={}, counts={};
        dims.forEach(function(d){scores[d]=0;counts[d]=0;});
        answers.forEach(function(a){
            var d=a.dimension||'成就感';
            var v=a.answer||0;
            if(scores[d]!==undefined){scores[d]+=v;counts[d]++;}
        });
        var avg={};
        dims.forEach(function(d){avg[d]=counts[d]>0?Math.round(scores[d]/counts[d]*10)/10:3;});
        var sorted=Object.entries(avg).sort(function(a,b){return b[1]-a[1]});
        var overall=Math.round(dims.reduce(function(s,d){return s+avg[d];},0)/dims.length*10)/10;

        var valueDesc={
            '成就感':'追求有挑战性的工作和可见的成果',
            '经济报酬':'重视薪资水平和物质回报',
            '工作稳定性':'偏好可预测和安全的工作环境',
            '人际关系':'重视和谐的同事关系和团队氛围',
            '自主性':'希望在工作中有较大的自由度',
            '创新创造':'喜欢尝试新方法和创造性解决问题',
            '社会贡献':'希望通过工作为社会带来正面影响',
            '工作生活平衡':'重视私人时间和家庭生活',
            '管理权力':'希望获得影响和领导的权力',
            '声誉地位':'追求职业声望和社会认可'
        };

        return {
            toolName: '工作价值观专业测评报告',
            dimensions: avg,
            overallScore: overall,
            topValues: sorted.slice(0,3).map(function(x){return x[0];}),
            summary: [
                '【工作价值观专业测评报告】',
                '',
                '一、核心价值观排序',
                '您最看重的三项工作价值观（降序排列）：',
                ...sorted.slice(0,3).map(function(x,i){return (i+1)+'. '+x[0]+'（'+x[1]+'分）— '+valueDesc[x[0]];}),
                '',
                '二、价值观画像分析',
                '您的工作价值观呈现出「' + 
                (sorted[0][1]>=4.2?'高诉求型 — 您对工作有较高期待，需要找到能满足核心价值诉求的平台':'务实型 — 您的价值诉求分布合理，可以在多种环境中找到平衡') + '」。',
                '',
                '您的核心价值观是「' + sorted[0][0] + '」（' + sorted[0][1] + '分）。' +
                '这意味着在选择工作时，' + getValueAdvice(sorted[0][0]),
                '',
                '三、组织文化匹配指南',
                '• 创业型公司：适合重视' + ['自主性','创新创造','经济报酬'].filter(function(v){return avg[v]>=3.5}).join('、') + '的候选人',
                '• 大型企业：适合重视' + ['工作稳定性','声誉地位','管理权力'].filter(function(v){return avg[v]>=3.5}).join('、') + '的候选人',
                '· 社会组织：适合重视' + ['社会贡献','人际关系','工作生活平衡'].filter(function(v){return avg[v]>=3.5}).join('、') + '的候选人',
                '',
                '四、职业决策建议',
                '1. 明确您的Top 3价值观是不可妥协的底线条件',
                '2. 在面试中主动了解候选组织的文化与您的价值观匹配度',
                '3. 接受offer前评估该岗位能否满足您的核心价值观',
                '4. 定期回顾和更新您的价值观排序，它会随人生阶段而变化'
            ].join('\\n'),
            organizationFit: {
                startup: avg['自主性']>=3.5 && avg['创新创造']>=3.5 ? '高度匹配' : '需考量',
                corporate: avg['工作稳定性']>=3.5 && avg['声誉地位']>=3.5 ? '高度匹配' : '需考量',
                nonprofit: avg['社会贡献']>=3.5 && avg['人际关系']>=3.5 ? '高度匹配' : '需考量'
            },
            careerSuggestions: sorted.slice(0,3).map(function(x){return '重视'+x[0]+':建议选择能满足'+valueDesc[x[0]].substring(0,10)+'...的岗位'})
        };
    };

    // ========== 工具分发器 ==========
    var generators = {
        1: genBigFive,
        2: genMBTI,
        3: genDISC,
        4: genHolland,
        5: genEQ,
        6: genMotivation,
        7: genValues
    };

    var fn = generators[toolId];
    if (fn) return fn(answers);
    return { toolName: '测评', summary: '测评已完成，报告已生成。', dimensions: {}, overallScore: 0 };
}

// ==================== 辅助函数 ====================

// 大五人格详细描述
function getBFDesc(dim, score) {
    var m = {
        '开放性': score>=4?'思维开阔、富有想象力和创造力，乐于接受新观念和新体验':score>=3?'有一定开放性能愿意尝试新事物':'比较保守、偏好熟悉的环境和既定方式',
        '尽责性': score>=4?'高度自律、有条理、可靠负责，始终如一地完成任务':score>=3?'基本靠谱能完成大部分工作':'需要加强计划和执行的连贯性',
        '外向性': score>=4?'精力充沛、善于社交、积极主动，在群体中自然发光':score>=3?'社交正常、能在需要时表现外向':'偏内向、更喜欢独处和小圈子交流',
        '宜人性': score>=4?'友善合作、信任他人、乐于助人，是团队中的润滑剂':score>=3?'基本友好能正常合作':'较为独立、有时显得有些疏离',
        '情绪稳定性': score>=4?'情绪成熟稳定、抗压能力强、从容应对压力':score>=3?'情绪基本可控但在强压下会有波动':'情绪敏感易受环境影响、需要情绪管理支持'
    };
    return m[dim] || '';
}
function getBFDetail(dim, score) {
    var details = {
        '开放性': score>=4?'您对新事物和新观念持开放态度，思维灵活富有创造力。在工作中能提出创新方案，适应变化能力强。':score>=3?'您对新事物持适度开放态度，能在必要时接受改变。':'您偏好熟悉的环境和既定方式，对变化持审慎态度。',
        '尽责性': score>=4?'您做事非常有条理，注重细节和质量，值得完全信赖交付重要任务。':score>=3?'您基本能做到按时保质完成任务。':'建议加强时间管理和任务跟踪习惯。',
        '外向性': score>=4?'您精力充沛善于交际，在团队活动中自然活跃，能有效影响和带动他人。':score>=3?'您社交能力正常，能根据场合调整行为。':'您更偏好独处或小范围交流，深度思考优于表面社交。',
        '宜人性': score>=4?'您天性善良合作，善于体察他人需求，是团队中的"润滑剂"。':score>=3?'您基本友善能正常合作。':'您较为独立直接，需要在合作与自主之间找到平衡。',
        '情绪稳定性': score>=4?'您情绪稳定成熟，即使在高压力下也能保持冷静和理性。':score>=3?'您情绪基本稳定但遇到重大压力时有波动。':'建议学习情绪调节技巧如正念和认知重构。'
    };
    return details[dim] || '';
}
function getBFSuggestion(dim, score) {
    var s = {
        '开放性':'每周接触一个新领域或新概念，拓展认知边界',
        '尽责性':'使用任务管理工具（如Todoist/Notion）建立系统和习惯',
        '外向性':'每周安排一次社交活动或公开演讲练习',
        '宜人性':'学习"温和而坚定"的沟通方式，在合作中保持原则',
        '情绪稳定性':'学习正念冥想和认知行为疗法的基本技巧'
    };
    return s[dim] || '持续学习和自我提升';
}
function getBFJobMatch(avg) {
    var jobs = [];
    if (avg['开放性']>=3.5) jobs.push('创意类岗位（设计/产品/营销）');
    if (avg['尽责性']>=3.5) jobs.push('管理类岗位（项目经理/运营）');
    if (avg['外向性']>=3.5) jobs.push('销售/公关/BD等对外岗位');
    if (avg['宜人性']>=3.5) jobs.push('HR/客服/培训等服务型岗位');
    if (avg['情绪稳定性']>=3.5) jobs.push('高压岗位（投行/咨询/急诊）');
    if (jobs.length===0) jobs.push('通用型岗位，可根据专业技能选择');
    return jobs;
}
function getBFInterviewQ(avg) {
    var qs = [];
    var sorted = Object.entries(avg).sort(function(a,b){return b[1]-a[1]});
    qs.push('请描述一次您利用'+sorted[0][0]+'优势成功解决问题的经历');
    qs.push('您如何看待自己在'+sorted[sorted.length-1][0]+'方面的不足？正在如何改善？');
    qs.push('如果让您在一个需要高度'+sorted[0][0]+'的团队中工作，您会如何贡献？');
    return qs;
}
function getTypeStress(type) {
    var sm = {
        INTJ:'可能变得更加孤立和挑剔，倾向于撤退到自己的思维世界中',
        INTP:'可能变得疏离和分析过度，暂停与外界互动',
        ENTJ:'可能变得更加强势和控制，试图强力扭转局势',
        ENTP:'可能用幽默和辩论来逃避现实的压力',
        INFJ:'可能过度吸收他人的负面情绪，感到身心俱疲',
        INFP:'可能退回到幻想世界或通过创作来逃避',
        ENFJ:'可能过度关心他人而忽视自己的需求，最终耗尽',
        ENFP:'可能变得散乱和分心，用新想法来逃避实际问题',
        ISTJ:'可能变得更加僵化和固守规则，拒绝任何变通',
        ISFJ:'可能过度操劳试图照顾所有人而崩溃',
        ESTJ:'可能采取强硬手段强制恢复秩序和控制',
        ESFJ:'可能变得焦虑并过度寻求他人的安慰和确认',
        ISTP:'可能完全关闭情感通道变成纯理性模式',
        ISFP:'可能通过感官享受或艺术创作来逃避',
        ESTP:'可能采取冒险或冲动的行为来释放压力',
        ESFP':可能通过社交狂欢和娱乐来暂时忘却烦恼'
    };
    return sm[type] || '需要适当的休息和支持来缓解压力';
}
function getMotivationTip(motiv) {
    var tips = {
        '成就动机':'设定具有挑战性但有可达成的目标，提供及时的进度反馈',
        '权力动机':'赋予一定的决策权和影响力范围，让其主导某个项目或模块',
        '归属动机':'安排团队协作任务，营造支持和认可的团队氛围',
        '金钱动机':'提供有竞争力的薪酬和绩效奖金制度',
        '安全感':'提供稳定的合同条款和清晰的职业发展路径',
        '自主性':'减少不必要的监管，允许灵活的工作方式和时间安排',
        '成长发展':'提供培训预算、导师指导和轮岗机会',
        '工作生活平衡':'尊重下班时间，提供远程工作选项和弹性工时'
    };
    return tips[motiv] || '根据个人特点定制激励方案';
}
function getValueAdvice(val) {
    var advice = {
        '成就感':'应优先选择具有挑战性和成长空间的职位，避免单调重复的工作',
        '经济报酬':'应坦诚讨论薪酬期望，选择具有竞争力的薪酬体系的公司',
        '工作稳定性':'应优先考虑大型企业或公共部门的岗位，关注公司的财务健康度',
        '人际关系':'应考察团队氛围和公司文化，选择重视协作和人文关怀的组织',
        '自主性':'应选择结果导向的管理风格，避免微观管理的团队和环境',
        '创新创造':'应寻找鼓励试错和创新文化的公司，避免官僚化的组织',
        '社会贡献':'应考虑加入社会企业、NGO或有社会责任感的公司',
        '工作生活平衡':'应明确工作边界，选择尊重员工个人时间的雇主',
        '管理权力':'应有清晰的晋升通道和管理培训计划',
        '声誉地位':'应选择行业领先者或知名品牌，关注平台的曝光度'
    };
    return advice[val] or '深入了解该价值观在实际工作中的体现';
}
`;

    // 执行替换
    var startMarker = 'function generateReportSummary(toolId, answers, userInfo)';
    var startIdx = code.indexOf(startMarker);
    if (startIdx === -1) {
        console.error('Could not find generateReportSummary start marker!');
        process.exit(1);
    }
    // Go back to include the comment line before it
    startIdx = code.lastIndexOf('\n', startIdx) + 1;

    // Find the end: look for the next major section after generateReportSummary
    // The function ends before "// ========== 大五人格辅助函数" or similar
    var endMarkers = ['\n// ========== 大五人格辅助函数', '\nfunction enrichAnswersWithDimensions', '\n// ========== 工具直接测评提交'];
    var endIdx = -1;
    for (var m = 0; m < endMarkers.length; m++) {
        var idx = code.indexOf(endMarkers[m], startIdx);
        if (idx > 0) { endIdx = idx; break; }
    }
    if (endIdx === -1) {
        console.error('Could not find end marker for generateReportSummary!');
        process.exit(1);
    }

    code = code.substring(0, startIdx) + newFunction + code.substring(endIdx);

    fs.writeFileSync(src, code, 'utf8');
    console.log('SUCCESS: generateReportSummary replaced (' + (endIdx - startIdx) + ' bytes removed, ' + newFunction.length + ' bytes added)');
