# Kimi's Portfolio · Kimi 的个人主页

一个面向 GitHub Pages 的现代动态个人展示页，以英文标题配合中文说明，重点介绍 AI 应用开发工程师 Kimi Chen 的计算机科学与数学教育背景，以及大模型应用、模型微调部署和机器学习项目。

## 技术栈

- React + Vite
- GSAP + ScrollTrigger
- Lenis 平滑滚动
- Canvas 粒子背景
- GitHub Actions 自动部署

## 修改内容

个人资料、项目、经历和联系方式集中在 `src/profile.js`。浏览器标题和搜索摘要位于 `index.html`。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## GitHub Pages

仓库包含 `.github/workflows/deploy.yml`。在仓库的 **Settings → Pages** 中将 **Build and deployment → Source** 设置为 **GitHub Actions**，推送到 `main` 后即可自动部署。

页面会尊重操作系统的“减少动态效果”设置，并针对触屏设备降低高成本视觉效果。

公开地址：<https://kimichen2000.github.io/>
