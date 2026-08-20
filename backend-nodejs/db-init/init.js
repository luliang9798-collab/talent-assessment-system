// 数据库自动初始化模块
// 在首次启动时检查数据库是否为空；若为空则执行 schema.sql 与 seed.sql 建表并写入初始数据。
// 适用于公司内部服务器全新部署，无需手动执行 SQL。

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DB_PATH || './talent_assessment_new.db';
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

function ensureDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    db.get(
      "SELECT COUNT(*) AS c FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      (err, row) => {
        if (err) { db.close(); return reject(err); }

        if (row.c > 0) {
          db.close();
          console.log('[init] 检测到已有数据表，跳过初始化。');
          return resolve(false);
        }

        console.log('[init] 数据库为空，开始执行初始化...');
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        db.exec(schema, (e1) => {
          if (e1) { db.close(); return reject(new Error('执行 schema.sql 失败: ' + e1.message)); }
          console.log('[init] 表结构创建完成。');

          if (!fs.existsSync(SEED_PATH)) { db.close(); return resolve(true); }
          const seed = fs.readFileSync(SEED_PATH, 'utf8');
          db.exec(seed, (e2) => {
            db.close();
            if (e2) return reject(new Error('执行 seed.sql 失败: ' + e2.message));
            console.log('[init] 初始数据写入完成（管理员账号 admin / admin123）。');
            resolve(true);
          });
        });
      }
    );
  });
}

module.exports = { ensureDatabase, DB_PATH };

if (require.main === module) {
  ensureDatabase()
    .then(() => { console.log('[init] 完成。'); process.exit(0); })
    .catch((e) => { console.error('[init] 失败:', e.message); process.exit(1); });
}
