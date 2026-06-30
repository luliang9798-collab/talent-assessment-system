const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./talent_assessment.db');

// 第三期功能：高级分析API

// 1. 人才地图 - 部门人才分布
router.get('/talent/map', (req, res) => {
    const sql = `
        SELECT 
            d.dept_name,
            COUNT(DISTINCT u.id) as total_employees,
            AVG(r.overall_score) as avg_score,
            COUNT(DISTINCT r.id) as total_reports
        FROM departments d
        LEFT JOIN users u ON d.id = u.department_id
        LEFT JOIN assessment_reports r ON u.id = r.user_id
        GROUP BY d.id
    `;
    
    db.all(sql, [], (err, result) => {
        if (err) {
            return res.json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: result });
    });
});

// 2. 继任计划 - 高潜力人才识别
router.get('/talent/high-potential', (req, res) => {
    const sql = `
        SELECT 
            u.id,
            u.real_name,
            u.username,
            d.dept_name,
            AVG(r.overall_score) as avg_score,
            COUNT(r.id) as assessment_count
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN assessment_reports r ON u.id = r.user_id
        GROUP BY u.id
        HAVING avg_score >= 80
        ORDER BY avg_score DESC
        LIMIT 50
    `;
    
    db.all(sql, [], (err, talents) => {
        if (err) {
            return res.json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: talents });
    });
});

// 3. 离职风险预测（基于测评数据）
router.get('/talent/retention-risk', (req, res) => {
    const sql = `
        SELECT 
            u.id,
            u.real_name,
            d.dept_name,
            r.overall_score,
            CASE 
                WHEN r.overall_score < 60 THEN '高风险'
                WHEN r.overall_score < 75 THEN '中风险'
                ELSE '低风险'
            END as risk_level
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN assessment_reports r ON u.id = r.user_id
        WHERE r.id IS NOT NULL
        ORDER BY r.overall_score ASC
    `;
    
    db.all(sql, [], (err, risks) => {
        if (err) {
            return res.json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: risks });
    });
});

// 4. 团队对比分析
router.get('/talent/team-comparison', (req, res) => {
    const sql = `
        SELECT 
            d.dept_name,
            COUNT(DISTINCT u.id) as employee_count,
            AVG(r.overall_score) as avg_score,
            MAX(r.overall_score) as max_score,
            MIN(r.overall_score) as min_score
        FROM departments d
        LEFT JOIN users u ON d.id = u.department_id
        LEFT JOIN assessment_reports r ON u.id = r.user_id
        WHERE r.id IS NOT NULL
        GROUP BY d.id
        ORDER BY avg_score DESC
    `;
    
    db.all(sql, [], (err, comparison) => {
        if (err) {
            return res.json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: comparison });
    });
});

// 5. 预测分析 - 基于历史数据的趋势
router.get('/talent/prediction', (req, res) => {
    const sql = `
        SELECT 
            strftime('%Y-%m', r.generated_at) as month,
            COUNT(r.id) as report_count,
            AVG(r.overall_score) as avg_score
        FROM assessment_reports r
        WHERE r.generated_at IS NOT NULL
        GROUP BY strftime('%Y-%m', r.generated_at)
        ORDER BY month
    `;
    
    db.all(sql, [], (err, trends) => {
        if (err) {
            return res.json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: trends });
    });
});

// 6. 技能差距分析
router.get('/talent/skill-gap', (req, res) => {
    const sql = `
        SELECT 
            at.tool_name,
            at.tool_type,
            AVG(r.overall_score) as avg_score,
            COUNT(r.id) as assessment_count
        FROM assessment_tools at
        LEFT JOIN assessment_tasks t ON at.id = t.tool_id
        LEFT JOIN assessment_reports r ON t.id = r.user_id
        WHERE r.id IS NOT NULL
        GROUP BY at.id
        ORDER BY avg_score ASC
    `;
    
    db.all(sql, [], (err, gaps) => {
        if (err) {
            return res.json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: gaps });
    });
});

// 7. 导出报告（简化版）
router.get('/export/reports', (req, res) => {
    const sql = `
        SELECT 
            r.report_code,
            r.project_id,
            p.project_name,
            u.real_name,
            u.username,
            r.overall_score,
            r.strengths,
            r.recommendations,
            r.generated_at
        FROM assessment_reports r
        LEFT JOIN assessment_projects p ON r.project_id = p.id
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.generated_at DESC
    `;
    
    db.all(sql, [], (err, reports) => {
        if (err) {
            return res.json({ success: false, message: '查询失败' });
        }
        
        // 生成CSV
        let csv = '报告编号,项目名称,姓名,用户名,总体得分,优势,建议,生成时间\n';
        reports.forEach(r => {
            csv += `${r.report_code},${r.project_name},${r.real_name},${r.username},${r.overall_score},"${r.strengths}","${r.recommendations}",${r.generated_at}\n`;
        });
        
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=reports.csv');
        res.send(csv);
    });
});

console.log('第三期功能API已加载');

module.exports = router;
