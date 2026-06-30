# Render 部署指南 - 人才测评系统

## ⚠️ 重要提醒：数据库持久化问题

**Render 免费层的限制：**
- 文件系统是**临时的**，每次部署或重启都会重置
- SQLite 数据库文件会**丢失数据**

**解决方案（3选1）：**

### 方案A：接受数据丢失（适合演示）
- 直接部署，数据会丢失，但可以快速演示功能
- 适合：临时测试、功能演示

### 方案B：使用 Render 持久化磁盘（付费）
- 费用：约 $10/月
- 数据永久保存
- 适合：生产环境

### 方案C：改用 PostgreSQL（推荐，免费）
- 使用 **Neon PostgreSQL** 免费层（3GB 存储）
- 需要修改代码（SQLite → PostgreSQL）
- 数据永久保存，完全免费
- 适合：生产环境

---

## 🚀 部署步骤（方案A：直接部署，接受数据丢失）

### 第1步：注册 Render

1. 访问 [https://render.com](https://render.com)
2. 点击 **"Get Started for Free"**
3. 用 GitHub、GitLab 或邮箱注册

### 第2步：准备代码仓库

**选项1：推送到 GitHub（推荐）**

```bash
# 在你的本地项目目录执行
cd "C:\Users\Lu Liang\WorkBuddy\2026-06-27-09-07-16\talent-assessment-system"

# 初始化 Git 仓库
git init
git add .
git commit -m "初始提交：人才测评系统"

# 创建 GitHub 仓库（需要在 GitHub 网站上手动创建）
# 然后关联并推送
git remote add origin https://github.com/你的用户名/talent-assessment-system.git
git push -u origin main
```

**选项2：直接上传 ZIP（简单）**

1. 将 `talent-assessment-system` 文件夹压缩成 ZIP
2. 在 Render 控制台选择 "Upload Files"

### 第3步：在 Render 创建 Web Service

1. 登录 Render 控制台
2. 点击 **"New +"** → 选择 **"Web Service"**
3. 连接你的 GitHub 仓库（或上传 ZIP）
4. 填写配置：

| 字段 | 值 |
|------|------|
| **Name** | `talent-assessment-system` |
| **Environment** | `Node` |
| **Region** | `Ohio (US)` 或 `Frankfurt (EU)` |
| **Branch** | `main` (或 `master`) |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

5. 点击 **"Advanced"** 展开高级设置
6. 添加环境变量（可选）：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `你的密钥（随便输入一串字符）` |

7. 点击 **"Create Web Service"**

### 第4步：等待部署

- Render 会自动构建和部署
- 耗时约 5-10 分钟
- 部署成功后，会得到一个免费域名：`https://talent-assessment-system.onrender.com`

### 第5步：访问系统

1. 打开 `https://你的项目名.onrender.com`
2. 使用账号登录：`admin` / `admin123`
3. 开始使用！

---

## 🚀 部署步骤（方案C：改用 PostgreSQL，数据永久保存）

### 第1步：注册 Neon 免费数据库

1. 访问 [https://neon.tech](https://neon.tech)
2. 注册并创建免费数据库
3. 复制连接字符串（类似：`postgresql://user:pass@ep-xxx.neon.tech/dbname`）

### 第2步：修改代码支持 PostgreSQL

（需要我帮你修改代码，请联系我）

### 第3步：在 Render 部署

1. 在 Render 创建 Web Service
2. 添加环境变量 `DATABASE_URL`，值为 Neon 连接字符串
3. 部署

---

## 📋 部署后检查清单

- [ ] 网站能正常打开
- [ ] 能登录系统
- [ ] 能查看测评工具列表
- [ ] 能创建测评项目
- [ ] 能查看九宫格

---

## 🔧 常见问题

### Q1：部署后网站打不开？

**可能原因：**
- Build Command 或 Start Command 错误
- 端口没有使用 `process.env.PORT`

**解决方法：**
- 检查 Render 日志
- 确保 `package.json` 的 `start` 脚本正确

### Q2：数据库数据丢失？

**原因：** Render 免费层文件系统是临时的

**解决方法：**
- 升级到付费计划（持久化磁盘）
- 或改用 PostgreSQL（Neon 免费层）

### Q3：免费层会休眠？

**是的**，Render 免费层在 15 分钟无活动后会休眠，下次访问需要等待 30-60 秒唤醒。

---

## 💡 推荐方案

| 用途 | 推荐方案 | 费用 |
|------|----------|------|
| 演示/测试 | 直接部署到 Render 免费层 | 免费 |
| 生产使用（<100人） | Render + Neon PostgreSQL | 免费 |
| 生产使用（>100人） | Render 付费层 | $10/月 |

---

## 📞 需要帮助？

如果遇到问题，请截图 Render 部署日志，发给我，我会帮你解决！
