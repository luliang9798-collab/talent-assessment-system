const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'talent-assessment-secret-2024';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

const db = new sqlite3.Database('./talent_assessment_new.db', (err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connected successfully');
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.json({ success: false, message: 'No token provided' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.json({ success: false, message: 'Username and password required' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.json({ success: false, message: 'Database error' });
        }
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            return res.json({ success: false, message: 'Wrong password' });
        }
        
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token: token,
            user: {
                id: user.id,
                username: user.username,
                realName: user.real_name
            }
        });
    });
});

app.get('/api/tools', authenticateToken, (req, res) => {
    db.all('SELECT * FROM assessment_tools', [], (err, tools) => {
        if (err) {
            return res.json({ success: false, message: 'Failed to get tools' });
        }
        res.json({ success: true, tools: tools });
    });
});

app.get('/api/questions/:toolId', authenticateToken, (req, res) => {
    const toolId = req.params.toolId;
    
    db.all('SELECT * FROM questions WHERE tool_id = ? ORDER BY order_num', [toolId], (err, questions) => {
        if (err) {
            return res.json({ success: false, message: 'Failed to get questions' });
        }
        res.json({ success: true, questions: questions });
    });
});

app.get('/api/projects', authenticateToken, (req, res) => {
    db.all('SELECT * FROM assessment_projects ORDER BY created_at DESC', [], (err, projects) => {
        if (err) {
            return res.json({ success: false, message: 'Failed to get projects' });
        }
        res.json({ success: true, projects: projects });
    });
});

app.post('/api/projects', authenticateToken, (req, res) => {
    const { projectName, projectType, description } = req.body;
    
    if (!projectName) {
        return res.json({ success: false, message: 'Project name required' });
    }
    
    db.run('INSERT INTO assessment_projects (project_name, project_type, description, created_by) VALUES (?, ?, ?, ?)',
        [projectName, projectType || 'RECRUITMENT', description, req.user.userId],
        function(err) {
            if (err) {
                return res.json({ success: false, message: 'Failed to create project: ' + err.message });
            }
            res.json({ success: true, projectId: this.lastID });
        }
    );
});

app.get('/api/tasks', authenticateToken, (req, res) => {
    db.all('SELECT * FROM assessment_tasks WHERE user_id = ? OR ? IN (SELECT id FROM users WHERE username = "admin")',
        [req.user.userId, req.user.userId],
        (err, tasks) => {
            if (err) {
                return res.json({ success: false, message: 'Failed to get tasks' });
            }
            res.json({ success: true, tasks: tasks });
        }
    );
});

app.get('/api/users', authenticateToken, (req, res) => {
    db.all('SELECT id, username, real_name, email FROM users', [], (err, users) => {
        if (err) {
            return res.json({ success: false, message: 'Failed to get users' });
        }
        res.json({ success: true, users: users });
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log('====================================');
    console.log('Talent Assessment System Started!');
    console.log('====================================');
    console.log('');
    console.log('Backend API: <ADDRESS_REMOVED>
    console.log('Frontend: <ADDRESS_REMOVED>
    console.log('');
    console.log('Login: admin / admin123');
    console.log('');
});
