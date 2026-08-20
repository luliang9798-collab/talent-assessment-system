# 运维与部署手册（talent-assessment-system）

覆盖：本地启动、依赖安装、内网部署（systemd+Nginx / Docker）、备份、常见故障排查。

## 一、本地启动（开发/演示）

```bash
cd talent-assessment-system/backend-nodejs
npm install            # 安装 express / better-sqlite3 / bcrypt / jsonwebtoken / cors / body-parser
node server-minimal.js # 首次启动自动建库并预置数据
```

- 访问：http://localhost:3000
- 默认账号：`admin / admin123`
- 环境变量：`PORT`（默认3000）、`JWT_SECRET`、`DB_PATH`
- 数据库文件：`./talent_assessment_new.db`（SQLite，单文件，随项目走）

> Windows 用户也可双击项目根目录 `start-system.bat` 一键启动。

## 二、公司内部服务器部署（Linux，推荐 systemd + Nginx）

部署文件位于 `deploy/`：
- `.env.example` — 环境变量模板
- `install.sh` — 复制项目、装依赖、初始化（含 rsync/cp 双回退）
- `start.sh` — 启动脚本
- `talent-assessment.service` — systemd 服务单元
- `nginx-talent-assessment.conf` — Nginx 反向代理配置
- `backup.sh` — SQLite 单文件备份
- `fix-frontend-api.sh` — 将前端硬编码的 localhost 替换为域名（内网部署必跑）
- `README.md` — 完整步骤

**要点**：
1. 把 `talent-assessment-deploy/`（干净分发包）拷到服务器
2. 运行 `deploy/install.sh`
3. 配置 `.env`：`PORT=3000`、`JWT_SECRET=<强随机串>`、`DB_PATH=/var/lib/tas/talent_assessment_new.db`
4. 安装 systemd 服务：`cp deploy/talent-assessment.service /etc/systemd/system/ && systemctl daemon-reload && systemctl enable --now talent-assessment`
5. 配置 Nginx 反向代理（8000/80 → 127.0.0.1:3000），并 `deploy/fix-frontend-api.sh` 替换 localhost
6. **务必修改默认管理员密码** `admin123`

## 三、Docker 部署

- 根目录 `Dockerfile`（Debian 基础镜像，避免 better-sqlite3 在 alpine/musl 编译失败；入口 `server-minimal.js`）
- `docker-compose.yml`：Node 服务 + Nginx，挂载 SQLite 数据卷
- `docker/nginx/nginx.conf`：反向代理与静态资源
- 启动：`docker compose up -d -build`
- 数据持久化：将 `DB_PATH` 指向挂载卷路径

> 已废弃的 `docker-compose.prod.yml`（旧 Spring Boot 架构）不再使用，请勿采用。

## 四、备份与恢复

SQLite 是单文件数据库，**备份=复制文件**：
```bash
cp talent_assessment_new.db /backup/tas-$(date +%F).db
```
恢复时停止服务 → 覆盖 db 文件 → 启动服务即可。建议每日定时备份（`deploy/backup.sh` 可接入 cron）。

## 五、常见故障排查

| 现象 | 原因 | 解决 |
|------|------|------|
| `ERR_CONNECTION_REFUSED` | 后端未启动 / 端口被占 | 启动服务；`lsof -i:3000` 查占用进程 |
| 九宫格"打印报告"报 401 | 前端用 `?token=` 参数，后端只认 `Authorization` 头 | 用 axios 带 `Authorization: Bearer` 头调用导出；前端已有降级方案 |
| 报告看不到深度分析 | 看的是修复前生成的旧报告 | 重新提交一次测评，新报告才含 `professionalEnhancement` |
| 前端页面空白 / API 全 401 | 前端硬编码 `localhost:3000`，内网域名访问失败 | 运行 `deploy/fix-frontend-api.sh` 替换为相对路径或域名 |
| 首次启动无数据 | 未执行 `db-init` 初始化 | 确认 `server-minimal.js` 已 `require('./db-init/init')` 且 `schema.sql`/`seed.sql` 存在 |
| Docker 构建卡在 better-sqlite3 编译 | 用了 alpine 镜像 | 改用 Debian 基础镜像（已配置） |

## 六、安全 checklist（上线前必做）
- [ ] 修改 `JWT_SECRET` 为强随机串
- [ ] 修改默认管理员 `admin / admin123` 密码
- [ ] Nginx 启用 HTTPS
- [ ] 数据库文件权限限制为服务账户可读写
- [ ] 定期备份（见第四节）
- [ ] 限制 `/api/nine-box/grids/:id/export` 等敏感接口的内网访问范围
