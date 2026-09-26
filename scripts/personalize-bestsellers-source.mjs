import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const packageRoot = dirname(require.resolve('@designcodeio/threeui/package.json'))

export const SOURCE_HASH = '7c1ed1ca4a4c58f1c33956c84edd8f7ba450ea0312df718701e634a207568138'
export const SOURCE_FILE = join(
  packageRoot,
  'lib-dist',
  'assets',
  'landing-pages',
  'bestsellers-book-showcase.html',
)
export const OUTPUT_FILE = fileURLToPath(
  new URL('../public/landing-pages/bestsellers-book-showcase.html', import.meta.url),
)

function replaceOnce(source, from, to, label) {
  const first = source.indexOf(from)
  const last = source.lastIndexOf(from)

  if (first === -1) throw new Error(`Missing personalization anchor: ${label}`)
  if (first !== last) throw new Error(`Ambiguous personalization anchor: ${label}`)

  return `${source.slice(0, first)}${to}${source.slice(first + from.length)}`
}

const settingsCss = `

    /* Portfolio settings reuse the authored overlay language without touching
       the book geometry, cover media, or motion system. */
    .settings-glyph {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.65;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform 420ms var(--ease);
    }

    [data-settings="open"] .settings-glyph {
      transform: rotate(45deg);
    }

    /* Keep the detail close control available while the mobile document scrolls. */
    .close-button {
      position: fixed;
    }

    .settings-layer {
      position: fixed;
      z-index: 41;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 92px 24px 36px;
      background:
        radial-gradient(circle at 50% 43%, rgba(111, 91, 61, .26), transparent 42%),
        rgba(30, 27, 21, .95);
      opacity: 0;
      transition: opacity 460ms ease;
      pointer-events: none;
      backdrop-filter: blur(18px);
    }

    [data-settings="open"] .settings-layer {
      opacity: 1;
      pointer-events: auto;
    }

    .settings-card {
      width: min(560px, 100%);
      color: var(--paper);
      text-align: center;
      transform: translateY(22px);
      transition: transform 500ms var(--ease);
    }

    [data-settings="open"] .settings-card {
      transform: translateY(0);
    }

    .settings-kicker {
      margin: 0 0 12px;
      color: #cdb68f;
      font-family: Arial, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .18em;
      text-transform: uppercase;
    }

    .settings-title {
      margin: 0;
      color: var(--pink);
      font-size: clamp(58px, 8vw, 104px);
      font-style: italic;
      font-weight: 500;
      letter-spacing: -.055em;
      line-height: .95;
    }

    .language-setting {
      margin-top: 42px;
      padding-top: 30px;
      border-top: 1px solid rgba(255, 255, 255, .18);
    }

    .setting-label {
      display: block;
      margin-bottom: 16px;
      color: rgba(255, 248, 232, .72);
      font-family: Arial, sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .14em;
      text-transform: uppercase;
    }

    .language-options {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      width: min(390px, 100%);
      margin: 0 auto;
      padding: 6px;
      border: 1px solid rgba(255, 255, 255, .18);
      border-radius: 999px;
      background: rgba(255, 255, 255, .06);
    }

    .language-option {
      min-height: 50px;
      padding: 0 18px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: rgba(255, 248, 232, .68);
      cursor: pointer;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: .04em;
      transition: color 220ms ease, background-color 220ms ease, transform 220ms var(--ease);
    }

    .language-option:hover {
      color: #fff;
      transform: translateY(-1px);
    }

    .language-option[aria-checked="true"] {
      background: var(--paper);
      color: #30291f;
      box-shadow: 0 8px 24px rgba(0, 0, 0, .18);
    }

    .language-option:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }

    .settings-hint {
      margin: 18px 0 0;
      color: rgba(255, 248, 232, .52);
      font-family: Arial, sans-serif;
      font-size: 12px;
      letter-spacing: .04em;
    }

    .settings-close {
      min-width: 124px;
      min-height: 44px;
      margin-top: 26px;
      padding: 0 24px;
      border: 1px solid rgba(255, 255, 255, .22);
      border-radius: 999px;
      background: transparent;
      color: var(--paper);
      cursor: pointer;
      font-family: Arial, sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      transition: background-color 220ms ease, color 220ms ease, transform 220ms var(--ease);
    }

    .settings-close:hover {
      background: var(--paper);
      color: #30291f;
      transform: translateY(-2px);
    }

    .settings-close:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }

    .quick-summary {
      position: fixed;
      z-index: 18;
      top: 92px;
      right: 3.2vw;
      max-width: min(760px, 72vw);
      color: rgba(245, 231, 205, .78);
      font-family: Arial, sans-serif;
      text-align: right;
      transition: opacity 280ms ease, transform 360ms var(--ease);
      pointer-events: auto;
    }

    .quick-summary-line,
    .quick-summary-context {
      margin: 0;
      letter-spacing: .055em;
      line-height: 1.45;
    }

    .quick-summary-line {
      color: var(--pink);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .quick-summary-context {
      margin-top: 3px;
      font-size: 12px;
    }

    .quick-summary-links {
      display: flex;
      justify-content: flex-end;
      gap: 14px;
      margin-top: 5px;
    }

    .quick-summary-links a {
      color: #f2dfbc;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .08em;
      text-decoration-thickness: 1px;
      text-underline-offset: 3px;
      text-transform: uppercase;
    }

    [data-mode="detail"] .quick-summary,
    [data-menu="open"] .quick-summary,
    [data-settings="open"] .quick-summary {
      opacity: 0;
      transform: translateY(-8px);
      pointer-events: none;
    }

    @media (max-width: 700px) {
      .quick-summary {
        top: 78px;
        right: 20px;
        left: 20px;
        max-width: none;
        text-align: center;
      }

      .quick-summary-line {
        font-size: 12px;
      }

      .quick-summary-context {
        font-size: 12px;
      }

      .quick-summary-links {
        justify-content: center;
        margin-top: 4px;
      }
    }

    @media (max-width: 560px) {
      [data-mode="detail"] .brand span {
        display: none;
      }

      .close-button {
        top: 20px;
        left: calc(50% + 5px);
        width: 44px;
        height: 44px;
        font-size: 24px;
      }

      .ticket-button {
        display: inline-grid;
        min-width: 78px;
        padding: 0 13px;
        font-size: 10px;
      }

      .nav-actions {
        gap: 8px;
      }

      .settings-layer {
        padding-inline: 20px;
      }
    }
`

const booksSource = `const localizedContent = {
        en: {
          ui: {
            documentTitle: "Kimi Chen — AI Application Developer",
            settings: "Settings",
            preferences: "Preferences",
            language: "Language",
            languageHint: "Your choice is saved on this device.",
            done: "Done",
            quickSummary: "Quick résumé overview",
            summaryLine: "AI Application Developer · 3 Selected AI / ML Projects · ROC-AUC > 0.83",
            summaryContext: "M.S. in Computer Science, Boston University · B.S. in Mathematics, University of Arizona · Fuzhou, China",
            openSettings: "Open settings",
            closeSettings: "Close settings",
            openNavigation: "Open résumé navigation",
            closeNavigation: "Close résumé navigation",
            hero: "Kimi.",
            heroLabel: "Kimi Chen",
            resumePdf: "Résumé PDF",
            profile: "Profile",
            education: "Education",
            experience: "Work & Projects",
            read: "Open",
            portfolio: "Résumé",
            profileSubtitle: "AI Application Developer",
            profileFooter: "LLM Apps · Model Engineering",
            educationSubtitle: "Computer Science · Mathematics",
            educationFooter: "Boston · Arizona",
            experienceSubtitle: "Experience · Selected Work",
            experienceFooter: "Agents · Deployment · ML",
            email: "Email",
            copyQq: "Copy QQ",
            copiedQq: "QQ number copied: 1090402233",
            detailLabel: "Résumé chapter details",
            detailActions: "Résumé and contact actions",
            metaLabel: "Résumé chapter and timeline",
            selectedChapter: "Selected chapter",
            siteMenu: "Résumé navigation",
            closeDetail: "Close detail view",
            galleryLabel: "Kimi Chen résumé chapters"
          },
          books: {
            codex: {
              title: "Kimi Chen",
              year: "About",
              description: "I am an AI application developer with graduate training in computer science and an undergraduate foundation in mathematics. I build LLM applications, model pipelines, and machine-learning products.",
              labels: ["Core skills", "Positioning", "Working style"],
              steps: [
                { title: "LLM applications", body: "Dify, Agentic RAG, prompt engineering, and structured outputs." },
                { title: "Model engineering", body: "LLaMA-Factory, LoRA, PyTorch, vLLM, and Docker." },
                { title: "Software & data", body: "Python, machine learning, MySQL, React, and JavaScript." },
                { title: "Location & communication", body: "Based in Fuzhou, China · Comfortable working in English." }
              ],
              prompt: "From model capability to a reliable, usable product.",
              review: "I learn unfamiliar technologies quickly, break complex problems into clear workflows, and carry ideas through implementation."
            },
            claude: {
              title: "Education",
              year: "2019–2025",
              description: "Graduate training in computer science builds on an undergraduate foundation in mathematics, combining systems engineering with quantitative reasoning.",
              labels: ["Education", "Academic lens", "What it adds"],
              steps: [
                { title: "Boston University", body: "M.S. in Computer Science · 2024.09 - 2025.12" },
                { title: "Graduate study", body: "Algorithms, Machine Learning, Operating Systems, and database work with MySQL." },
                { title: "University of Arizona", body: "B.S. in Mathematics · 2019.09 - 2023.12" },
                { title: "Undergraduate study", body: "Linear Algebra, Discrete Mathematics, Numerical Analysis, and Formal Languages." }
              ],
              prompt: "Mathematics × Computer Science",
              review: "This combination supports rigorous modeling, fast technical learning, and clear implementation."
            },
            cursor: {
              title: "Work & Projects",
              year: "2024–Present",
              description: "Professional experience and selected projects spanning AI applications, model deployment, and predictive modeling.",
              labels: ["Experience & selected projects", "Evidence", "Scope"],
              steps: [
                { title: "China Telecom Fufu", body: "AI Application Developer · 2026.08 - Present" },
                { title: "Fuchang Weikong", body: "Algorithm Engineer Intern · 2024.05 - 2024.08" },
                { title: "Lesson Plan Agent · 2025", body: "Built a multi-stage Dify workflow using vector retrieval, reranking, and structured prompts to generate editable lesson-plan drafts." },
                { title: "LLaMA Summarization · 2025", body: "Standardized training data, fine-tuned with LoRA, evaluated with BLEU and ROUGE, and deployed an OpenAI-compatible inference API with vLLM and Docker." },
                { title: "DOTA2 Match Predictor · 2025", body: "Engineered difference features from the first five minutes of each match, compared multiple classifiers, and achieved ROC-AUC above 0.83." }
              ],
              prompt: "3 selected AI / ML projects · ROC-AUC > 0.83",
              review: "Work covers agent workflows, model fine-tuning and serving, and machine-learning evaluation with a measurable result."
            }
          }
        },
        zh: {
          ui: {
            documentTitle: "陈俊哲 — AI 应用开发工程师",
            settings: "设置",
            preferences: "偏好设置",
            language: "显示语言",
            languageHint: "语言选择会保存在当前设备上。",
            done: "完成",
            quickSummary: "简历速览",
            summaryLine: "AI 应用开发工程师 · 3 个精选 AI / ML 项目 · ROC-AUC > 0.83",
            summaryContext: "波士顿大学计算机科学硕士 · 亚利桑那大学数学学士 · 福建福州",
            openSettings: "打开设置",
            closeSettings: "关闭设置",
            openNavigation: "打开简历导航",
            closeNavigation: "关闭简历导航",
            hero: "Kimi.",
            heroLabel: "Kimi Chen",
            resumePdf: "简历 PDF",
            profile: "个人简介",
            education: "教育经历",
            experience: "工作与项目",
            read: "查看",
            portfolio: "简历",
            profileSubtitle: "AI 应用开发工程师",
            profileFooter: "大模型应用 · 模型工程",
            educationSubtitle: "计算机科学 · 数学",
            educationFooter: "波士顿 · 亚利桑那",
            experienceSubtitle: "工作经历 · 精选项目",
            experienceFooter: "智能体 · 部署 · 机器学习",
            email: "邮箱",
            copyQq: "复制 QQ 号码",
            copiedQq: "已复制 QQ：1090402233",
            detailLabel: "简历章节详情",
            detailActions: "简历与联系方式",
            metaLabel: "简历章节与时间",
            selectedChapter: "当前章节",
            siteMenu: "简历导航",
            closeDetail: "关闭详情",
            galleryLabel: "陈俊哲的简历章节"
          },
          books: {
            codex: {
              title: "陈俊哲",
              year: "个人简介",
              description: "计算机科学硕士、数学学士，现从事 AI 应用开发，重点关注大模型应用、模型工程与机器学习产品落地。",
              labels: ["核心能力", "职业定位", "工作方式"],
              steps: [
                { title: "大模型应用", body: "Dify、Agentic RAG、提示词工程与结构化输出。" },
                { title: "模型工程", body: "LLaMA-Factory、LoRA、PyTorch、vLLM 与 Docker。" },
                { title: "软件与数据", body: "Python、机器学习、MySQL、React 与 JavaScript。" },
                { title: "地点与沟通", body: "现居福建福州，可使用英语进行工作交流。" }
              ],
              prompt: "把模型能力转化为稳定、清晰、真正可用的产品。",
              review: "能够快速学习陌生技术，将复杂问题拆解为清晰工作流，并推进到具体实现。"
            },
            claude: {
              title: "教育经历",
              year: "2019–2025",
              description: "以数学本科训练为基础，在计算机科学硕士阶段进一步学习算法、机器学习与系统工程。",
              labels: ["教育背景", "学科基础", "能力支撑"],
              steps: [
                { title: "波士顿大学", body: "计算机科学硕士 · 2024.09 – 2025.12" },
                { title: "研究生学习", body: "算法、机器学习、操作系统，以及基于 MySQL 的数据库实践。" },
                { title: "亚利桑那大学", body: "数学学士 · 2019.09 – 2023.12" },
                { title: "本科学习", body: "线性代数、离散数学、数值分析与形式语言。" }
              ],
              prompt: "数学 × 计算机科学",
              review: "跨学科训练强化了建模推理、技术学习与工程实现能力。"
            },
            cursor: {
              title: "工作与项目",
              year: "2024–至今",
              description: "工作与项目覆盖 AI 应用、模型微调与推理部署，以及可量化的预测建模。",
              labels: ["工作经历与精选项目", "成果", "覆盖范围"],
              steps: [
                { title: "中国电信福富", body: "AI 应用开发工程师 · 2026.08 – 至今" },
                { title: "福建富昌维控", body: "算法工程师实习生 · 2024.05 – 2024.08" },
                { title: "教案生成智能体 · 2025", body: "基于 Dify 搭建多阶段工作流，通过向量检索、重排序与结构化提示词生成可编辑的教案初稿。" },
                { title: "LLaMA 文本摘要模型 · 2025", body: "完成训练数据标准化、LoRA 微调及 BLEU、ROUGE 评测，并以 vLLM 与 Docker 部署兼容 OpenAI API 的推理服务。" },
                { title: "DOTA2 胜负预测 · 2025", body: "基于每场对局前五分钟数据构建差值特征，对比多种分类模型，最终 ROC-AUC 超过 0.83。" }
              ],
              prompt: "3 个精选 AI / ML 项目 · ROC-AUC > 0.83",
              review: "涉及智能体工作流、模型微调与推理服务，以及具有量化结果的机器学习评估。"
            }
          }
        }
      };

      let currentLanguage = "en";
      let books = localizedContent[currentLanguage].books`

export function transformTemplate(template) {
  let page = template

  page = replaceOnce(
    page,
    'content="An earth-toned interactive field library for Codex, Claude Code, and Cursor."',
    'content="Kimi Chen is an AI application developer focused on LLM applications, model engineering, and machine learning."',
    'description',
  )
  page = replaceOnce(
    page,
    '<title>Field Manuals — Tools for Thought</title>',
    '<title>Kimi Chen — AI Application Developer</title>',
    'document title',
  )
  page = replaceOnce(
    page,
    '</style>',
    `${settingsCss}\n  </style>`,
    'settings styles',
  )
  page = replaceOnce(
    page,
    '<body data-mode="gallery" data-menu="closed">',
    '<body data-mode="gallery" data-menu="closed" data-settings="closed" data-language="en" data-portfolio="kimi-chen">',
    'body marker',
  )
  page = replaceOnce(
    page,
    '<main class="stage" aria-label="Interactive AI coding field library">',
    '<main class="stage" aria-label="Kimi Chen interactive résumé">',
    'main label',
  )
  page = replaceOnce(
    page,
    '<a class="brand" href="#" aria-label="Field Manuals home">Field Manuals</a>',
    '<a class="brand" href="#" data-home aria-label="Open résumé navigation" aria-controls="menuLayer" aria-expanded="false">Kimi Chen <span lang="zh-CN">陈俊哲</span></a>',
    'brand',
  )
  page = replaceOnce(
    page,
    `<button class="icon-button" id="menuButton" type="button" aria-label="Open menu" aria-expanded="false">
          <span class="menu-glyph" aria-hidden="true"></span>
        </button>`,
    `<button class="icon-button" id="settingsButton" type="button" aria-label="Open settings" aria-controls="settingsLayer" aria-expanded="false">
          <svg class="settings-glyph" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3.2"/>
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.55v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-.6-1A1.7 1.7 0 0 0 2.4 13.6H2V9.55h.4A1.7 1.7 0 0 0 4.1 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06L6.56 3.7l.06.06A1.7 1.7 0 0 0 8.5 4.1a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2h4.05v.4A1.7 1.7 0 0 0 15 4.1a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 8.5a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.9v4.05h-.9A1.7 1.7 0 0 0 19.4 15Z"/>
          </svg>
        </button>`,
    'settings button',
  )
  page = replaceOnce(
    page,
    '<button class="ticket-button" type="button" data-toast="The collection is complete.">The Collection</button>',
    '<a class="ticket-button" href="../resume/Kimi-Chen-Resume.pdf" target="_blank" rel="noreferrer">Résumé PDF</a>',
    'top action',
  )
  page = replaceOnce(
    page,
    '<h1 class="hero-word" aria-hidden="true">Agents</h1>',
    '<h1 class="hero-word" aria-label="Kimi Chen">Kimi.</h1>',
    'hero word',
  )
  page = replaceOnce(
    page,
    '<h1 class="hero-word" aria-label="Kimi Chen">Kimi.</h1>',
    `<aside class="quick-summary" aria-label="Quick résumé overview">
      <p class="quick-summary-line" id="summaryLine">AI Application Developer · 3 Selected AI / ML Projects · ROC-AUC &gt; 0.83</p>
      <p class="quick-summary-context" id="summaryContext">M.S. in Computer Science, Boston University · B.S. in Mathematics, University of Arizona · Fuzhou, China</p>
      <div class="quick-summary-links">
        <a href="mailto:chen.junzhe2000@qq.com" id="summaryEmail">Email</a>
        <a href="https://github.com/KimiChen2000" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </aside>

    <h1 class="hero-word" aria-label="Kimi Chen">Kimi.</h1>`,
    'quick résumé overview',
  )
  page = replaceOnce(
    page,
    '<section class="gallery" aria-label="AI coding field manuals">',
    '<section class="gallery" aria-label="Kimi Chen résumé chapters">',
    'gallery label',
  )

  page = replaceOnce(page, 'aria-label="Open Codex details"', 'aria-label="Open profile details"', 'profile aria label')
  page = replaceOnce(page, 'aria-label="Open Claude Code details"', 'aria-label="Open education details"', 'education aria label')
  page = replaceOnce(page, 'aria-label="Open Cursor details"', 'aria-label="Open experience details"', 'experience aria label')

  page = replaceOnce(page, '<span class="cover-kicker">Field Manual · I</span>', '<span class="cover-kicker">Résumé · I</span>', 'profile kicker')
  page = replaceOnce(page, '<span class="cover-title">Codex</span>', '<span class="cover-title">Profile</span>', 'profile title')
  page = replaceOnce(page, '<span class="cover-subtitle">The Agentic Engineer</span>', '<span class="cover-subtitle">AI Application Developer</span>', 'profile subtitle')
  page = replaceOnce(page, '<span class="cover-footer">Systems · Tools · Taste</span>', '<span class="cover-footer">LLM Apps · Model Engineering</span>', 'profile footer')

  page = replaceOnce(page, '<span class="cover-kicker">Field Manual · II</span>', '<span class="cover-kicker">Résumé · II</span>', 'education kicker')
  page = replaceOnce(page, '<span class="cover-title">Claude<br>Code</span>', '<span class="cover-title">Education</span>', 'education title')
  page = replaceOnce(page, '<span class="cover-subtitle">The Quiet Terminal</span>', '<span class="cover-subtitle">Computer Science · Mathematics</span>', 'education subtitle')
  page = replaceOnce(page, '<span class="cover-footer">Context · Craft · Care</span>', '<span class="cover-footer">Boston · Arizona</span>', 'education footer')

  page = replaceOnce(page, '<span class="cover-kicker">Field Manual · III</span>', '<span class="cover-kicker">Résumé · III</span>', 'experience kicker')
  page = replaceOnce(page, '<span class="cover-title">Cursor</span>', '<span class="cover-title">Work &amp; Projects</span>', 'experience title')
  page = replaceOnce(page, '<span class="cover-subtitle">The Augmented Editor</span>', '<span class="cover-subtitle">Experience · Selected Work</span>', 'experience subtitle')
  page = replaceOnce(page, '<span class="cover-footer">Select · Predict · Refine</span>', '<span class="cover-footer">Agents · Deployment · ML</span>', 'experience footer')

  page = replaceOnce(page, '<p class="doc-label" id="gettingStartedLabel">Getting started</p>', '<p class="doc-label" id="gettingStartedLabel">Core skills</p>', 'detail highlights label')
  page = replaceOnce(page, '<p class="doc-label" id="firstPromptLabel">Your first prompt</p>', '<p class="doc-label" id="firstPromptLabel">Positioning</p>', 'detail focus label')
  page = replaceOnce(page, '<p class="doc-label" id="reviewLabel">Before you ship</p>', '<p class="doc-label" id="reviewLabel">Working style</p>', 'detail perspective label')
  page = replaceOnce(page, '<h2 class="detail-title" id="detailTitle">Claude Code</h2>', '<h2 class="detail-title" id="detailTitle">Kimi Chen</h2>', 'initial detail title')
  page = replaceOnce(page, 'aria-label="Getting started guide"', 'aria-label="Résumé chapter details"', 'detail scroll label')
  page = replaceOnce(page, 'aria-label="Field manual actions"', 'aria-label="Résumé and contact actions"', 'detail actions label')
  page = replaceOnce(page, '<span class="review-source">Field Notes</span>', '<span class="review-source">Kimi Chen</span>', 'detail source')
  page = replaceOnce(page, 'aria-label="Field edition and publication year"', 'aria-label="Résumé chapter and timeline"', 'meta label')
  page = replaceOnce(page, 'aria-label="Field edition"', 'aria-label="Selected chapter"', 'stars label')

  page = replaceOnce(
    page,
    `<button class="pill language" type="button" data-toast="Field edition · 2026">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/>
              <path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7"/>
            </svg>
            Field Edition
          </button>
          <button class="pill" type="button" data-toast="Notes opened.">Read Notes</button>
          <button class="pill" type="button" data-toast="Guide opened.">View Guide</button>
          <button class="pill icon-only" id="saveButton" type="button" aria-label="Save book" aria-pressed="false">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.8 4.2h10.4v15.6L12 16.6l-5.2 3.2V4.2Z"/>
            </svg>
          </button>`,
    `<a class="pill language" href="../resume/Kimi-Chen-Resume.pdf" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 2h8l4 4v16H6Z" fill="none" stroke="currentColor" stroke-width="1.7"/>
              <path d="M14 2v5h5M9 12h6M9 16h6" fill="none" stroke="currentColor" stroke-width="1.7"/>
            </svg>
            Résumé PDF
          </a>
          <a class="pill" href="https://github.com/KimiChen2000" target="_blank" rel="noreferrer">GitHub</a>
          <a class="pill" href="mailto:chen.junzhe2000@qq.com">Email</a>
          <button class="pill" id="saveButton" type="button" aria-label="Copy QQ">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h6.4A1.8 1.8 0 0 1 19 5.8v9.4a1.8 1.8 0 0 1-1.8 1.8H16"/>
              <rect x="5" y="7" width="11" height="13" rx="2"/>
            </svg>
            <span id="qqActionText">Copy QQ</span>
          </button>`,
    'detail actions',
  )

  page = replaceOnce(
    page,
    `<li><a class="menu-link" href="#" data-menu-close>Volumes</a></li>
        <li><a class="menu-link" href="#notes" data-menu-close data-toast="Field notes are coming soon.">Notes</a></li>
        <li><a class="menu-link" href="#index" data-menu-close data-toast="An index of tools for thought.">Index</a></li>`,
    `<li><a class="menu-link" href="#profile" data-menu-close data-open-book="codex">Profile</a></li>
        <li><a class="menu-link" href="#education" data-menu-close data-open-book="claude">Education</a></li>
        <li><a class="menu-link" href="#experience" data-menu-close data-open-book="cursor">Work &amp; Projects</a></li>`,
    'menu links',
  )

  page = replaceOnce(
    page,
    `    </nav>
  </main>`,
    `    </nav>

    <section class="settings-layer" id="settingsLayer" role="dialog" aria-modal="true" aria-labelledby="settingsTitle" aria-hidden="true" inert>
      <div class="settings-card">
        <p class="settings-kicker" id="settingsKicker">Preferences</p>
        <h2 class="settings-title" id="settingsTitle">Settings</h2>
        <div class="language-setting">
          <span class="setting-label" id="languageLabel">Language</span>
          <div class="language-options" role="radiogroup" aria-labelledby="languageLabel">
            <button class="language-option" type="button" role="radio" aria-checked="true" tabindex="0" data-language-option="en">English</button>
            <button class="language-option" type="button" role="radio" aria-checked="false" tabindex="-1" data-language-option="zh">中文</button>
          </div>
          <p class="settings-hint" id="settingsHint">Your choice is saved on this device.</p>
          <button class="settings-close" id="settingsClose" type="button" data-settings-close>Done</button>
        </div>
      </div>
    </section>
  </main>`,
    'settings panel',
  )

  const booksStart = page.indexOf('const books = {')
  const booksEndAnchor = '\n\n      const body = document.body;'
  const booksEnd = page.indexOf(booksEndAnchor, booksStart)
  if (booksStart === -1 || booksEnd === -1) throw new Error('Unable to locate résumé data block')
  page = `${page.slice(0, booksStart)}${booksSource};${page.slice(booksEnd)}`

  page = replaceOnce(
    page,
    `      const closeButton = document.querySelector("#closeButton");
      const menuButton = document.querySelector("#menuButton");
      const menuLayer = document.querySelector("#menuLayer");
      const saveButton = document.querySelector("#saveButton");`,
    `      const closeButton = document.querySelector("#closeButton");
      const brand = document.querySelector("[data-home]");
      const settingsButton = document.querySelector("#settingsButton");
      const menuLayer = document.querySelector("#menuLayer");
      const settingsLayer = document.querySelector("#settingsLayer");
      const settingsKicker = document.querySelector("#settingsKicker");
      const settingsTitle = document.querySelector("#settingsTitle");
      const languageLabel = document.querySelector("#languageLabel");
      const settingsHint = document.querySelector("#settingsHint");
      const settingsClose = document.querySelector("#settingsClose");
      const languageOptions = [...document.querySelectorAll("[data-language-option]")];
      const heroWord = document.querySelector(".hero-word");
      const gallery = document.querySelector(".gallery");
      const quickSummary = document.querySelector(".quick-summary");
      const summaryLine = document.querySelector("#summaryLine");
      const summaryContext = document.querySelector("#summaryContext");
      const summaryEmail = document.querySelector("#summaryEmail");
      const ticketButton = document.querySelector(".ticket-button");
      const detailPdfLink = document.querySelector(".action-rail .language");
      const emailLink = document.querySelector('.action-rail a[href^="mailto:"]');
      const qqActionText = document.querySelector("#qqActionText");
      const docLabels = [...document.querySelectorAll(".doc-label")];
      const menuLinks = [...document.querySelectorAll(".menu-link")];
      const saveButton = document.querySelector("#saveButton");`,
    'settings and localization elements',
  )

  page = replaceOnce(
    page,
    `      function syncCoverMotion() {`,
    `      function renderDetail(data) {
        detailTitle.textContent = data.title;
        detailDescription.textContent = data.description;
        detailSteps.replaceChildren(...data.steps.map((step) => {
          const item = document.createElement("li");
          const copy = document.createElement("span");
          const title = document.createElement("strong");
          const bodyCopy = document.createElement("span");
          copy.className = "doc-step-copy";
          title.textContent = step.title;
          bodyCopy.textContent = step.body;
          copy.append(title, bodyCopy);
          item.append(copy);
          return item;
        }));
        detailPrompt.textContent = data.prompt;
        detailReview.textContent = data.review;
        detailYear.textContent = data.year;
        data.labels.forEach((label, index) => { docLabels[index].textContent = label; });
      }

      function setLanguage(language, persist = true) {
        currentLanguage = language === "zh" ? "zh" : "en";
        const content = localizedContent[currentLanguage];
        const ui = content.ui;
        books = content.books;
        document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
        document.title = ui.documentTitle;
        window.parent.postMessage({
          source: "kimi-resume",
          type: "language-change",
          language: currentLanguage,
          title: ui.documentTitle
        }, "*");
        body.dataset.language = currentLanguage;
        heroWord.textContent = ui.hero;
        heroWord.setAttribute("aria-label", ui.heroLabel);
        gallery.setAttribute("aria-label", ui.galleryLabel);
        stage.setAttribute("aria-label", ui.galleryLabel);
        ticketButton.textContent = ui.resumePdf;
        settingsKicker.textContent = ui.preferences;
        settingsTitle.textContent = ui.settings;
        languageLabel.textContent = ui.language;
        settingsHint.textContent = ui.languageHint;
        settingsClose.textContent = ui.done;
        settingsLayer.setAttribute("aria-label", ui.settings);
        quickSummary.setAttribute("aria-label", ui.quickSummary);
        summaryLine.textContent = ui.summaryLine;
        summaryContext.textContent = ui.summaryContext;
        summaryEmail.textContent = ui.email;
        brand.setAttribute("aria-label", body.dataset.menu === "open" ? ui.closeNavigation : ui.openNavigation);
        settingsButton.setAttribute("aria-label", body.dataset.settings === "open" ? ui.closeSettings : ui.openSettings);
        detailScroll.setAttribute("aria-label", ui.detailLabel);
        document.querySelector(".action-rail").setAttribute("aria-label", ui.detailActions);
        document.querySelector(".meta-row").setAttribute("aria-label", ui.metaLabel);
        document.querySelector(".stars").setAttribute("aria-label", ui.selectedChapter);
        menuLayer.setAttribute("aria-label", ui.siteMenu);
        menuLayer.setAttribute("aria-hidden", String(body.dataset.menu !== "open"));
        closeButton.setAttribute("aria-label", ui.closeDetail);
        saveButton.setAttribute("aria-label", ui.copyQq);
        qqActionText.textContent = ui.copyQq;
        detailPdfLink.lastChild.textContent = " " + ui.resumePdf;
        emailLink.textContent = ui.email;

        const chapters = [
          { key: "codex", roman: "I", title: ui.profile, subtitle: ui.profileSubtitle, footer: ui.profileFooter },
          { key: "claude", roman: "II", title: ui.education, subtitle: ui.educationSubtitle, footer: ui.educationFooter },
          { key: "cursor", roman: "III", title: ui.experience, subtitle: ui.experienceSubtitle, footer: ui.experienceFooter }
        ];

        chapters.forEach((chapter, index) => {
          const card = cards.find((item) => item.dataset.book === chapter.key);
          card.querySelector(".cover-kicker").textContent = ui.portfolio + " · " + chapter.roman;
          card.querySelector(".cover-title").textContent = chapter.title;
          card.querySelector(".cover-subtitle").textContent = chapter.subtitle;
          card.querySelector(".cover-footer").textContent = chapter.footer;
          card.querySelector(".open-badge").textContent = ui.read;
          card.setAttribute("aria-label", currentLanguage === "zh"
            ? "打开" + chapter.title + "详情"
            : "Open " + chapter.title.toLowerCase() + " details");
          menuLinks[index].textContent = chapter.title;
        });

        languageOptions.forEach((option) => {
          const selected = option.dataset.languageOption === currentLanguage;
          option.setAttribute("aria-checked", String(selected));
          option.tabIndex = selected ? 0 : -1;
        });

        renderDetail(selectedCard ? books[selectedCard.dataset.book] : books.codex);

        if (persist) {
          try { window.localStorage.setItem("kimi-resume-language", currentLanguage); } catch {}
        }
      }

      function syncCoverMotion() {`,
    'localization functions',
  )

  page = replaceOnce(
    page,
    `        detailTitle.textContent = data.title;
        detailDescription.textContent = data.description;
        detailSteps.replaceChildren(...data.steps.map((step) => {
          const item = document.createElement("li");
          const copy = document.createElement("span");
          const title = document.createElement("strong");
          const bodyCopy = document.createElement("span");
          copy.className = "doc-step-copy";
          title.textContent = step.title;
          bodyCopy.textContent = step.body;
          copy.append(title, bodyCopy);
          item.append(copy);
          return item;
        }));
        detailPrompt.textContent = data.prompt;
        detailReview.textContent = data.review;
        detailScroll.scrollTop = 0;
        detailYear.textContent = data.year;`,
    `        renderDetail(data);
        detailScroll.scrollTop = 0;`,
    'localized detail rendering',
  )

  page = replaceOnce(
    page,
    `      function toggleMenu(force) {
        const willOpen = typeof force === "boolean"
          ? force
          : body.dataset.menu !== "open";
        body.dataset.menu = willOpen ? "open" : "closed";
        menuLayer.inert = !willOpen;
        menuButton.setAttribute("aria-expanded", String(willOpen));
        menuButton.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
      }`,
    `      function trapFocus(event, elements) {
        const focusable = elements.filter((element) => !element.disabled && element.tabIndex >= 0);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!focusable.includes(document.activeElement)) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      }

      function toggleMenu(force) {
        const willOpen = typeof force === "boolean"
          ? force
          : body.dataset.menu !== "open";
        if (willOpen) toggleSettings(false);
        body.dataset.menu = willOpen ? "open" : "closed";
        menuLayer.inert = !willOpen;
        menuLayer.setAttribute("aria-hidden", String(!willOpen));
        brand.setAttribute("aria-expanded", String(willOpen));
        brand.setAttribute("aria-label", willOpen
          ? localizedContent[currentLanguage].ui.closeNavigation
          : localizedContent[currentLanguage].ui.openNavigation);
        if (willOpen) window.requestAnimationFrame(() => menuLinks[0]?.focus({ preventScroll: true }));
      }

      function toggleSettings(force) {
        const willOpen = typeof force === "boolean"
          ? force
          : body.dataset.settings !== "open";
        if (willOpen && body.dataset.menu === "open") toggleMenu(false);
        body.dataset.settings = willOpen ? "open" : "closed";
        settingsLayer.inert = !willOpen;
        settingsLayer.setAttribute("aria-hidden", String(!willOpen));
        settingsButton.setAttribute("aria-expanded", String(willOpen));
        settingsButton.setAttribute("aria-label", willOpen
          ? localizedContent[currentLanguage].ui.closeSettings
          : localizedContent[currentLanguage].ui.openSettings);
        if (willOpen) {
          const selectedLanguage = languageOptions.find((option) => option.getAttribute("aria-checked") === "true");
          window.requestAnimationFrame(() => selectedLanguage?.focus({ preventScroll: true }));
        }
      }`,
    'navigation and settings toggles',
  )

  page = replaceOnce(
    page,
    `      closeButton.addEventListener("click", closeDetail);
      menuButton.addEventListener("click", () => toggleMenu());`,
    `      closeButton.addEventListener("click", closeDetail);
      settingsButton.addEventListener("click", () => toggleSettings());
      settingsLayer.addEventListener("click", (event) => {
        if (event.target === settingsLayer) {
          toggleSettings(false);
          settingsButton.focus({ preventScroll: true });
        }
      });
      settingsClose.addEventListener("click", () => {
        toggleSettings(false);
        settingsButton.focus({ preventScroll: true });
      });
      languageOptions.forEach((option) => {
        option.addEventListener("click", () => setLanguage(option.dataset.languageOption));
        option.addEventListener("keydown", (event) => {
          const currentIndex = languageOptions.indexOf(option);
          let nextIndex = currentIndex;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % languageOptions.length;
          else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + languageOptions.length) % languageOptions.length;
          else if (event.key === "Home") nextIndex = 0;
          else if (event.key === "End") nextIndex = languageOptions.length - 1;
          else return;
          event.preventDefault();
          const nextOption = languageOptions[nextIndex];
          setLanguage(nextOption.dataset.languageOption);
          nextOption.focus({ preventScroll: true });
        });
      });`,
    'settings interactions',
  )

  page = replaceOnce(
    page,
    `saveButton.addEventListener("click", () => {
        const saved = saveButton.getAttribute("aria-pressed") !== "true";
        saveButton.setAttribute("aria-pressed", String(saved));
        showToast(saved ? "Saved to your reading list." : "Removed from your reading list.");
      });`,
    `saveButton.addEventListener("click", async () => {
        const qq = "1090402233";
        try {
          await navigator.clipboard.writeText(qq);
          showToast(localizedContent[currentLanguage].ui.copiedQq);
        } catch {
          showToast("QQ 1090402233");
        }
      });`,
    'QQ action',
  )

  page = replaceOnce(
    page,
    `document.addEventListener("click", (event) => {
        const toastTarget = event.target.closest("[data-toast]");`,
    `document.addEventListener("click", (event) => {
        const homeTarget = event.target.closest("[data-home]");
        if (homeTarget) {
          event.preventDefault();
          closeDetail();
          toggleMenu();
        }

        const bookTarget = event.target.closest("[data-open-book]");
        if (bookTarget) {
          event.preventDefault();
          const card = cards.find((item) => item.dataset.book === bookTarget.dataset.openBook);
          toggleMenu(false);
          if (card) window.setTimeout(() => selectBook(card), reducedMotion.matches ? 0 : 220);
        }

        const toastTarget = event.target.closest("[data-toast]");`,
    'navigation actions',
  )

  page = replaceOnce(
    page,
    `      syncCoverMotion();

      window.addEventListener("pointermove", (event) => {`,
    `      try {
        const savedLanguage = window.localStorage.getItem("kimi-resume-language");
        if (savedLanguage === "zh" || savedLanguage === "en") currentLanguage = savedLanguage;
      } catch {}
      setLanguage(currentLanguage, false);
      syncCoverMotion();

      window.addEventListener("pointermove", (event) => {`,
    'language initialization',
  )

  page = replaceOnce(
    page,
    `      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          if (body.dataset.menu === "open") {
            toggleMenu(false);
          } else {
            closeDetail();
          }
        }
      });`,
    `      document.addEventListener("keydown", (event) => {
        if (body.dataset.settings === "open") {
          if (event.key === "Escape") {
            toggleSettings(false);
            settingsButton.focus({ preventScroll: true });
          } else if (event.key === "Tab") {
            trapFocus(event, [...languageOptions, settingsClose]);
          }
          return;
        }

        if (body.dataset.menu === "open") {
          if (event.key === "Escape") {
            toggleMenu(false);
            brand.focus({ preventScroll: true });
          } else if (event.key === "Tab") {
            trapFocus(event, menuLinks);
          }
          return;
        }

        if (event.key === "Escape") closeDetail();
      });`,
    'escape behavior',
  )

  return page
}

export async function buildPersonalizedPage() {
  const template = await readFile(SOURCE_FILE)
  const actual = createHash('sha256').update(template).digest('hex')
  if (actual !== SOURCE_HASH) {
    throw new Error(`ThreeUI source hash mismatch: expected ${SOURCE_HASH}, received ${actual}`)
  }

  const output = transformTemplate(template.toString('utf8'))
  await mkdir(dirname(OUTPUT_FILE), { recursive: true })
  await writeFile(OUTPUT_FILE, output, 'utf8')

  const outputHash = createHash('sha256').update(output).digest('hex')
  console.log(`Personalized Bestsellers template: ${outputHash}`)
}

const invokedDirectly = process.argv[1]
  && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase()

if (invokedDirectly) await buildPersonalizedPage()
