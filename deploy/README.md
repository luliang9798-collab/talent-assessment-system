# 人才测评系统 — 公司内部服务器部署指南

本目录包含将「人才测评系统」部署到公司内网/内部服务器所需的全部文件。系统采用 **Node.js + SQLite** 单体架构，无需外部数据库，开箱即用。

---

## 一、系统架构概述

```
┌─────────────┐         ┌──────────────────────────────┐
│  浏览器/员工 │ ──HTTP──▶│   Nginx (反向代理, 可选HTTPS)  │
└─────────────┘         └──────────────┬───────────────┘
                                        │  proxy_pass
                                        ▼
                         ┌──────────────────────────────┐
                         │  Node.js 服务 (端口 3000)      │
                         │  - 提供 REST API (/api/...)    │
                         │  - 托管前端静态文件 (frontend/) │
                         │  - SQLite 数据库 (单文件)       │
                         └──────────────────────────────┘
```

- **后端**：`backend-nodejs/server-minimal.js`（Express + better-sqlite3）
- **前端**：`frontend/*.html`（纯静态，由后端统一托管）
- **数据库**：SQLite 单文件，首次启动自动建表并写入种子数据（1401 题、28 个测评工具、管理员账号）

---

## 二、环境要求

| 组件 | 版本要求 | 说明 |
|------|----------|------|
| 操作系统 | Linux x86_64（Ubuntu 20.04+/CentOS 7+/Debian 10+）| 推荐；Windows Server 亦可（见第五节）|
| Node.js | ≥ 18 | 安装后执行 `node -v` 验证 |
| Nginx | ≥ 1.18 | 仅在使用域名/HTTPS 反向代理时需要 |
| 内存 | ≥ 1 GB | SQLite 轻量，资源占用极低 |
| 磁盘 | ≥ 2 GB | 含题目与附件空间 |

> **注意**：`better-sqlite3` 为原生模块，安装时会自动下载预编译二进制（glibc Linux x64）。
> 若服务器**无外网**，需在有网的同环境机器执行 `npm install` 后，将整个目录（含 `node_modules`）拷贝至服务器。

---

## 三、方式一：Linux + systemd + Nginx（推荐 ⭐）

### 步骤 1：准备代码
将整个项目目录 `talent-assessment-system/` 上传到服务器（例如 `/opt/` 或 `/home/`）。
建议放置于 `/opt/talent-assessment/`。

```bash
# 假设已通过 scp/git 将代码放到当前目录
sudo mkdir -p /opt/talent-assessment
sudo cp -r talent-assessment-system/. /opt/talent-assessment/
```

### 步骤 2：一键安装（推荐）
```bash
cd /opt/talent-assessment
sudo bash deploy/install.sh
```
脚本会自动：安装 Node 依赖、生成随机 `JWT_SECRET`、初始化数据库、修正前端硬编码地址、注册并启动 systemd 服务。

安装完成后访问 `http://<服务器IP>:3000` 即可。

### 步骤 3（可选）：配置 Nginx 域名 + HTTPS
```bash
sudo cp deploy/nginx-talent-assessment.conf /etc/nginx/conf.d/talent-assessment.conf
# 编辑文件，将 server_name 改为贵公司内网域名
sudo nginx -t && sudo systemctl reload nginx
```
此后可通过 `http://assessment.your-company.com` 访问。

### 常用运维命令
```bash
sudo systemctl status talent-assessment      # 查看状态
sudo systemctl restart talent-assessment     # 重启
sudo systemctl stop talent-assessment        # 停止
journalctl -u talent-assessment -n 100 -f    # 查看日志
```

---

## 四、方式二：Docker / docker-compose（最省心）

无需在服务器上装 Node 环境，一条命令启动。

### 步骤 1：安装 Docker 与 docker-compose
```bash
curl -fsSL https://get.docker.com | bash -s docker
sudo systemctl enable --now docker
```

### 步骤 2：启动
```bash
cd talent-assessment-system
# 可选：编辑 .env 设置 JWT_SECRET 与端口
docker compose up -d --build
```
服务启动后访问 `http://<服务器IP>:3000`。

- 数据持久化在 `./data/talent_assessment_new.db`（容器重启不丢失）
- 健康检查：`http://<IP>:3000/api/health`
- 查看日志：`docker compose logs -f app`

> 如需 HTTPS，可启用 `docker/nginx/nginx.conf` 并在 `docker-compose.yml` 中挂载证书（参考文件内注释）。

---

## 五、方式三：Windows Server（简要）

1. 安装 [Node.js 18+](https://nodejs.org/)（勾选添加到 PATH）。
2. 以管理员身份打开 PowerShell，进入项目目录：
   ```powershell
   cd C:\path\to\talent-assessment-system\backend-nodejs
   npm install --omit=dev
   ```
3. 启动：
   ```powershell
   node server-minimal.js
   ```
4. 访问 `http://localhost:3000`。
5. 生产环境建议用 **NSSM** 或 **Windows 任务计划程序** 将其注册为开机自启服务。

---

## 六、初始化与默认账号

系统首次启动会自动执行 `backend-nodejs/db-init/init.js`：
- 创建全部数据表
- 写入 1401 道题目、28 个测评工具、岗位胜任力模型等种子数据
- 创建管理员账号

**默认管理员账号**：
- 用户名：`admin`
- 密码：`admin123`

> ⚠️ **生产环境务必登录后立即修改管理员密码**，并妥善保管 `.env` 中的 `JWT_SECRET`。

---

## 七、配置文件说明（`.env`）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3000 | 服务监听端口 |
| `JWT_SECRET` | 随机（安装脚本生成）| JWT 签名密钥，务必复杂 |
| `DB_PATH` | ./talent_assessment_new.db | 数据库文件路径 |
| `FRONTEND_URL` | 空 | CORS 白名单，同源可留空 |
| `LOG_LEVEL` | info | 日志级别 |

---

## 八、备份与升级

### 备份数据库
```bash
bash deploy/backup.sh
# 或加入定时任务（每日凌晨 2 点）：
# crontab -e  →  0 2 * * * /opt/talent-assessment/deploy/backup.sh
```
备份文件位于 `backups/talent_assessment_YYYYMMDD_HHMMSS.db.gz`。

### 升级步骤
1. 停止服务：`sudo systemctl stop talent-assessment`
2. 备份数据库：`bash deploy/backup.sh`
3. 覆盖代码（保留 `backend-nodejs/talent_assessment_new.db` 与 `.env`）
4. 重新安装依赖：`cd backend-nodejs && npm install --omit=dev`
5. 启动服务：`sudo systemctl start talent-assessment`

> SQLite 数据库向后兼容，升级通常不会破坏已有数据。如涉及表结构变更，升级脚本会自动 `CREATE TABLE IF NOT EXISTS` 补全。

---

## 九、常见问题

**Q1：访问页面提示 502 / 连接被拒绝？**
- 检查服务是否运行：`systemctl status talent-assessment` 或 `curl http://localhost:3000/api/health`
- 若用 Nginx，确认 `proxy_pass` 指向的端口与 `PORT` 一致

**Q2：前端页面能打开，但登录/提交报错？**
- 多为前端硬编码 `localhost:3000` 导致。运行 `bash deploy/fix-frontend-api.sh` 修正。

**Q3：npm install 卡在 better-sqlite3 编译？**
- 服务器为 Alpine/musl 或离线环境。改用 Debian/Ubuntu 基础镜像，或离线拷贝含 `node_modules` 的目录。

**Q4：如何修改服务端口？**
- 编辑 `.env` 中的 `PORT`，重启服务即可。Nginx 中同步修改 `proxy_pass` 端口。

**Q5：上传的题目/附件存在哪？**
- 默认在后端目录内。可通过 `DB_PATH` 与代码中的上传目录配置调整至数据盘。

---

## 十、文件清单

| 文件 | 用途 |
|------|------|
| `deploy/install.sh` | Linux 一键安装脚本 |
| `deploy/start.sh` | 手动启动脚本（无 systemd 时）|
| `deploy/talent-assessment.service` | systemd 服务单元 |
| `deploy/nginx-talent-assessment.conf` | Nginx 反向代理配置模板 |
| `deploy/backup.sh` | SQLite 数据库备份脚本 |
| `deploy/fix-frontend-api.sh` | 修正前端硬编码 API 地址 |
| `deploy/.env.example` | 环境变量模板 |
| `deploy/README.md` | 本文件 |
| `Dockerfile` | 容器镜像构建（根目录）|
| `docker-compose.yml` | 容器编排（根目录）|
| `docker/nginx/nginx.conf` | 容器内 Nginx 配置 |
| `backend-nodejs/db-init/` | 数据库自动初始化（schema + seed）|
