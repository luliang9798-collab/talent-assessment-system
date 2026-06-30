const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const db = new sqlite3.Database('./talent_assessment.db');

// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 1. 数据上传接口
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: '请选择文件' });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileType = path.extname(fileName).toLowerCase();

        let data = [];
        
        if (fileType === '.xlsx' || fileType === '.xls') {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = xlsx.utils.sheet_to_json(worksheet);
        }
        
        db.run("INSERT INTO uploaded_data (file_name, file_path, file_type, record_count, status) VALUES (?, ?, ?, ?, ?)",
            [fileName, filePath, fileType, data.length, 1],
            function(err) {
                if (err) {
                    return res.json({ success: false, message: '保存失败' });
                }
                res.json({
                    success: true,
                    message: '文件上传成功',
                    fileName: fileName,
                    recordCount: data.length,
                    data: data.slice(0, 10)
                });
            }
        );
    } catch (error) {
        res.json({ success: false, message: '处理失败: ' + error.message });
    }
});

// 2. 获取上传历史
router.get('/upload/history', (req, res) => {
    db.all("SELECT * FROM uploaded_data ORDER BY uploaded_at DESC", [], (err, records) => {
        if (err) {
            return res.json({ success: false, message: '获取失败' });
        }
        res.json(records);
    });
});

// 3. 创建测评任务
router.post('/tasks', (req, res) => {
    const { projectId, userId, toolId } = req.body;
    
    if (!projectId || !userId || !toolId) {
        return res.json({ success: false, message: '参数不完整' });
    }

    db.get("SELECT * FROM assessment_tasks WHERE project_id = ? AND user_id = ? AND tool_id = ?",
        [projectId, userId, toolId],
        (err, task) => {
            if (task) {
                return res.json({ success: false, message: '任务已存在' });
            }

            db.run("INSERT INTO assessment_tasks (project_id, user_id, tool_id, status) VALUES (?, ?, ?, ?)",
                [projectId, userId, toolId, 0],
                function(err) {
                    if (err) {
                        return res.json({ success: false, message: '创建失败' });
                    }
                    res.json({ success: true, taskId: this.lastID });
                }
            );
        }
    );
});

// 4. 获取项目任务
router.get('/tasks/:projectId', (req, res) => {
    const projectId = req.params.projectId;
    
    db.all(`SELECT t.*, u.real_name, u.username, at.tool_name 
            FROM assessment_tasks t 
            LEFT JOIN users u ON t.user_id = u.id 
            LEFT JOIN assessment_tools at ON t.tool_id = at.id 
            WHERE t.project_id = ?`,
        [projectId],
        (err, tasks) => {
            if (err) {
                return res.json({ success: false, message: '获取失败' });
            }
            res.json(tasks);
        }
    );
});

// 5. 提交测评
router.post('/tasks/:taskId/submit', (req, res) => {
    const taskId = req.params.taskId;
    const { score } = req.body;
    
    db.run("UPDATE assessment_tasks SET status = 2, submit_time = CURRENT_TIMESTAMP, score = ? WHERE id = ?",
        [score, taskId],
        function(err) {
            if (err) {
                return res.json({ success: false, message: '提交失败' });
            }
            res.json({ success: true, message: '提交成功' });
        }
    );
});

// 6. 获取报告
router.get('/reports/:reportId', (req, res) => {
    const reportId = req.params.reportId;
    
    db.get(`SELECT r.*, u.real_name, u.username 
            FROM assessment_reports r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?`,
        [reportId],
        (err, report) => {
            if (err) {
                return res.json({ success: false, message: '获取失败' });
            }
            if (!report) {
                return res.json({ success: false, message: '报告不存在' });
            }
            res.json({ success: true, report: report });
        }
    );
});

// 7. 获取用户报告
router.get('/reports/user/:userId', (req, res) => {
    const userId = req.params.userId;
    
    db.all("SELECT * FROM assessment_reports WHERE user_id = ? ORDER BY generated_at DESC", [userId], (err, reports) => {
        if (err) {
            return res.json({ success: false, message: '获取失败' });
        }
        res.json(reports);
    });
});

// 8. 获取所有用户
router.get('/users/list', (req, res) => {
    db.all("SELECT id, username, real_name, email FROM users WHERE status = 1", [], (err, users) => {
        if (err) {
            return res.json({ success: false, message: '获取失败' });
        }
        res.json(users);
    });
});

// 9. 批量导入用户
router.post('/users/import', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: '请选择文件' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const users = xlsx.utils.sheet_to_json(worksheet);

        let successCount = 0;

        users.forEach(user => {
            const username = user['用户名'] || user['username'];
            const password = user['密码'] || '123456';
            const realName = user['姓名'] || user['real_name'];

            if (!username) return;

            const hashedPassword = bcrypt.hashSync(password, 10);

            db.run("INSERT OR IGNORE INTO users (username, password, real_name, status) VALUES (?, ?, ?, ?)",
                [username, hashedPassword, realName, 1],
                function(err) {
                    if (!err && this.changes > 0) {
                        successCount++;
                    }
                }
            );
        });

        setTimeout(() => {
            res.json({
                success: true,
                message: `导入完成：成功 ${successCount} 条`
            });
        }, 1000);

    } catch (error) {
        res.json({ success: false, message: '导入失败: ' + error.message });
    }
});

console.log('第二期功能API已加载');

module.exports = router;
