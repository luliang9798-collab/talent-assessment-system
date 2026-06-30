const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const db = new sqlite3.Database(path.join(__dirname, 'talent_assessment.db'));

// 获取九宫格数据
router.get('/data', (req, res) => {
    // 模拟九宫格数据
    // 实际应该基于测评结果计算
    const boxData = [2, 5, 3, 8, 15, 7, 4, 9, 2];
    
    res.json({
        success: true,
        boxData: boxData,
        summary: {
            total: 55,
            superStar: 2,
            highPotential: 7,
            core: 15
        }
    });
});

// 获取人才列表（按九宫格位置）
router.get('/talents', (req, res) => {
    const { boxPosition } = req.query;
    
    // 模拟数据
    const talents = [
        { id: 1, name: '张三', department: '研发中心', position: '高级工程师', boxPosition: 8, performance: 4.5, potential: 4.2 },
        { id: 2, name: '李四', department: '销售中心', position: '销售经理', boxPosition: 7, performance: 4.2, potential: 3.8 },
        { id: 3, name: '王五', department: '生产中心', position: '生产主管', boxPosition: 4, performance: 3.5, potential: 3.2 }
    ];
    
    res.json({
        success: true,
        talents: talents
    });
});

console.log('九宫格API已加载');
module.exports = router;
