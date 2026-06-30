# 🚀 快速部署到 Render - 3分钟搞定

## 方法一：通过 GitHub 部署（推荐）

### 1. 创建 GitHub 仓库

1. 访问 [https://github.com/new](https://github.com/new)
2. 仓库名：`talent-assessment-system`
3. 选择 **Public**
4. 点击 **"Create repository"**

### 2. 推送代码到 GitHub

在你的电脑上打开命令提示符（CMD），执行：

```bash
cd "C:\Users\Lu Liang\WorkBuddy\2026-06-27-09-07-16\talent-assessment-system"
git init
git add .
git commit -m "人才测评系统初始版本"
git remote add origin https://github.com/你的用户名/talent-assessment-system.git
git push -u origin main
```

### 3. 在 Render 部署

1. 访问 [https://dashboard.render.com](https://dashboard.render.com)
2. 点击 **"New +"** → **"Web Service"**
3. 选择你的 GitHub 仓库
4. 填写：
   - **Name**: `talent-assessment`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. 点击 **"Create Web Service"**

等 5 分钟，部署完成！🎉

---

## 方法二：直接上传 ZIP（最简单）

### 1. 打包代码

```bash
cd "C:\Users\Lu Liang\WorkBuddy\2026-06-27-09-07-16"
# 压缩 talent-assessment-system 文件夹
# 右键 → 发送到 → 压缩(zipped)文件夹
```

### 2. 在 Render 上传

1. 访问 [https://dashboard.render.com](https://dashboard.render.com)
2. 点击 **"New +"** → **"Web Service"**
3. 选择 **"Upload Files"**
4. 上传 ZIP 文件
5. 填写配置（同上）
6. 点击 **"Create Web Service"**

---

## ⚠️ 重要提醒

**Render 免费层的限制：**
- 数据库会丢失（每次部署重置）
- 15分钟无活动会休眠

**如果需要数据永久保存：**
→ 使用 PostgreSQL（Neon 免费层）
→ 或升级到 Render 付费计划（$10/月）

---

## 🎯 部署后

访问：`https://你的项目名.onrender.com`

登录账号：`admin`  
登录密码：`admin123`

---

需要帮助？截图发给我！
