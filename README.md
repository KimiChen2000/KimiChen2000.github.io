# Kimi Chen · Interactive Résumé

Kimi Chen 的中英文互动简历，以 ThreeUI Bestsellers Book Showcase 的原始书本动画为展示框架，介绍个人简介、教育背景、工作经历与精选 AI / ML 项目。

## 功能

- 保留 ThreeUI 原版书本动画、响应式布局与嵌入媒体
- 中英文切换，`Kimi.` 标题保持不变
- 姓名导航、设置弹窗与完整键盘操作
- 桌面端和移动端简历详情
- PDF 简历、GitHub、邮箱与 QQ 联系入口

## 本地运行

```bash
npm install
npm run dev
```

构建及验证：

```bash
npm test
npm run build
npm run preview
```

构建过程会从已锁定版本的 `@designcodeio/threeui` 中读取规范源文件，校验 SHA-256 后生成个性化页面：

`public/landing-pages/bestsellers-book-showcase.html`

## 发布

推送到 `main` 后，`.github/workflows/deploy.yml` 会构建并发布到 GitHub Pages：

<https://kimichen2000.github.io/>
