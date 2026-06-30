const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'talent_assessment_new.db'));

console.log('开始创建九宫格相关表...');

// 创建九宫格评估表
db.run(`CREATE TABLE IF NOT EXISTS nine_box_grids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid_name TEXT NOT NULL,
    grid_type TEXT DEFAULT 'talent_review',
    review_period TEXT,
    description TEXT,
    status TEXT DEFAULT 'draft',
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
)`, function(err) {
    if (err) {
        console.error('创建nine_box_grids表失败:', err);
    } else {
        console.log('✅ nine_box_grids表创建成功');
    }
});

// 创建九宫格位置表
db.run(`CREATE TABLE IF NOT EXISTS nine_box_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    performance_score REAL,
    potential_score REAL,
    grid_x INTEGER,
    grid_y INTEGER,
    quadrant INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grid_id) REFERENCES nine_box_grids(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(grid_id, user_id)
)`, function(err) {
    if (err) {
        console.error('创建nine_box_positions表失败:', err);
    } else {
        console.log('✅ nine_box_positions表创建成功');
    }
});

// 创建绩效记录表（用于存储员工的绩效分数）
db.run(`CREATE TABLE IF NOT EXISTS performance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    review_period TEXT,
    performance_score REAL,
    performance_level TEXT,
    kpi_score REAL,
    goals_achievement REAL,
    competencies_score REAL,
    reviewer_id INTEGER,
    review_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    UNIQUE(user_id, review_period)
)`, function(err) {
    if (err) {
        console.error('创建performance_records表失败:', err);
    } else {
        console.log('✅ performance_records表创建成功');
    }
});

setTimeout(() => {
    // 验证表创建
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'nine_box%' OR name LIKE 'performance%'", [], (err, tables) => {
        if (err) {
            console.error('查询表失败:', err);
        } else {
            console.log('\n📊 已创建的表:');
            tables.forEach(t => console.log('  -', t.name));
        }
        
        db.close();
        console.log('\n✅ 数据库迁移完成！');
    });
}, 1000);
