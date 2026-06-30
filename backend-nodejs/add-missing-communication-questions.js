/**
 * 补充沟通能力测评题目 (达到65题)
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./talent_assessment_new.db');

// 沟通能力测评剩余的题目 (39题)
const additionalCommunicationQuestions = [
    // 书面沟通 (13题) - 题目27-39
    {dim: '书面沟通', q: '我能够写出结构清晰、逻辑严密的文档'},
    {dim: '书面沟通', q: '我在写作前会明确目标和读者对象'},
    {dim: '书面沟通', q: '我善于使用标题、列表和段落组织内容'},
    {dim: '书面沟通', q: '我能够用简洁的语言表达完整意思'},
    {dim: '书面沟通', q: '我在发送前会仔细校对文档'},
    {dim: '书面沟通', q: '我能够根据文档类型使用合适的格式和风格'},
    {dim: '书面沟通', q: '我善于使用图表和附件增强文档效果'},
    {dim: '书面沟通', q: '我能够在书面沟通中保持专业和礼貌'},
    {dim: '书面沟通', q: '我避免书面沟通中的歧义和误解'},
    {dim: '书面沟通', q: '我能够根据反馈改进文档质量'},
    {dim: '书面沟通', q: '我善于写电子邮件清晰表达请求和期望'},
    {dim: '书面沟通', q: '我能够在书面沟通中适当使用强调和标注'},
    {dim: '书面沟通', q: '我能够撰写有说服力的提案和报告'},
    
    // 非语言沟通 (13题) - 题目40-52
    {dim: '非语言沟通', q: '我能够意识到并控制自己的面部表情'},
    {dim: '非语言沟通', q: '我善于通过肢体语言增强表达效果'},
    {dim: '非语言沟通', q: '我能够解读他人的非语言信号'},
    {dim: '非语言沟通', q: '我在沟通中保持适当的眼神接触'},
    {dim: '非语言沟通', q: '我注意自己的语气和语调对沟通的影响'},
    {dim: '非语言沟通', q: '我能够在视频会议中保持良好的镜头感'},
    {dim: '非语言沟通', q: '我善于通过空间距离传达尊重和专业'},
    {dim: '非语言沟通', q: '我能够识别并回应他人的情绪信号'},
    {dim: '非语言沟通', q: '我在沟通中保持开放和友好的姿态'},
    {dim: '非语言沟通', q: '我善于使用手势辅助表达'},
    {dim: '非语言沟通', q: '我能够调整自己的沟通风格适应对方'},
    {dim: '非语言沟通', q: '我在跨文化沟通中注意非语言差异'},
    {dim: '非语言沟通', q: '我能够通过非语言方式建立信任'},
    
    // 冲突处理 (13题) - 题目53-65
    {dim: '冲突处理', q: '我能够在冲突中保持冷静和客观'},
    {dim: '冲突处理', q: '我善于找到冲突的根本原因'},
    {dim: '冲突处理', q: '我能够在不伤害关系的前提下表达不同意见'},
    {dim: '冲突处理', q: '我善于引导冲突双方找到共同利益'},
    {dim: '冲突处理', q: '我能够在冲突中倾听各方观点'},
    {dim: '冲突处理', q: '我善于将情绪冲突转化为问题解决'},
    {dim: '冲突处理', q: '我能够在冲突中保持对事不对人'},
    {dim: '冲突处理', q: '我善于使用我语言表达感受而非指责'},
    {dim: '冲突处理', q: '我能够在冲突后修复和维护关系'},
    {dim: '冲突处理', q: '我善于在冲突中寻求双赢解决方案'},
    {dim: '冲突处理', q: '我能够识别并管理自己的冲突触发点'},
    {dim: '冲突处理', q: '我善于在团队中建立冲突处理规范'},
    {dim: '冲突处理', q: '我能够在冲突中保持建设性的沟通'}
];

async function main() {
    console.log('🚀 补充沟通能力测评题目...\n');
    
    let addedCount = 0;
    const startOrder = 27; // 从第27题开始
    
    for (let i = 0; i < additionalCommunicationQuestions.length; i++) {
        const item = additionalCommunicationQuestions[i];
        await new Promise((resolve) => {
            db.run(`INSERT OR IGNORE INTO questions 
                    (tool_id, question_text, question_type, dimension, 
                     option_a, option_b, option_c, option_d, option_e,
                     score_a, score_b, score_c, score_d, score_e,
                     order_num) 
                    VALUES (?, ?, 'likert', ?, '完全不符合', '不太符合', '一般', '比较符合', '完全符合', 1, 2, 3, 4, 5, ?)`,
                [9, item.q, item.dim, startOrder + i],
                function(err) {
                    if (err) {
                        console.error(`   ❌ 添加题目失败: ${item.q}`, err.message);
                    } else if (this.changes > 0) {
                        addedCount++;
                        if (addedCount % 10 === 0) {
                            console.log(`   已添加 ${addedCount} 道题目...`);
                        }
                    }
                    resolve();
                }
            );
        });
    }
    
    console.log(`\n✅ 补充完成！共添加 ${addedCount} 道题目\n`);
    
    // 验证结果
    console.log('📊 验证沟通能力测评题目数量...');
    await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM questions WHERE tool_id = 9', [], (err, row) => {
            if (err) {
                reject(err);
            } else {
                console.log(`\n沟通能力测评题目数量: ${row.count}/65`);
                if (row.count >= 65) {
                    console.log('✅ 题目数量已达到要求！\n');
                } else {
                    console.log(`⚠️  还缺少 ${65 - row.count} 道题\n`);
                }
                resolve();
            }
        });
    });
    
    console.log('🎉 沟通能力测评题目补充完成！');
}

main()
    .then(() => {
        db.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ 执行失败:', err);
        db.close();
        process.exit(1);
    });
