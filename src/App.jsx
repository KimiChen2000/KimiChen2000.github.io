import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Asterisk,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { profile } from './profile.js'

gsap.registerPlugin(ScrollTrigger)

function Loader() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    let frame

    const tick = (time) => {
      const value = Math.min(100, Math.round(((time - startedAt) / 1200) * 100))
      setProgress(value)
      if (value < 100) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="loader" aria-hidden="true">
      <div className="loader-mark">{profile.fullName}</div>
      <div className="loader-bottom">
        <span>正在整理现场</span>
        <span>{String(progress).padStart(3, '0')}%</span>
      </div>
      <div className="loader-line" style={{ '--progress': `${progress}%` }} />
    </div>
  )
}

function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: -1000, y: -1000 }
    let particles = []
    let frame
    let width = 0
    let height = 0

    const resize = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = width * dpr
      canvas.height = height * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(58, Math.round(width / 24))
      particles = Array.from({ length: count }, (_, index) => ({
        x: (index * 137.5) % width,
        y: (index * 83.7) % height,
        radius: index % 7 === 0 ? 2.2 : 1,
        speed: 0.08 + (index % 5) * 0.025,
        offset: index * 0.7,
      }))
    }

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height)
      particles.forEach((particle) => {
        const drift = reduceMotion ? 0 : Math.sin(time * 0.0004 + particle.offset) * 10
        const px = particle.x + drift
        let py = particle.y + (reduceMotion ? 0 : time * particle.speed * 0.015)
        py %= height
        const distance = Math.hypot(px - pointer.x, py - pointer.y)
        const influence = Math.max(0, 1 - distance / 180)

        context.beginPath()
        context.arc(px, py, particle.radius + influence * 2.4, 0, Math.PI * 2)
        context.fillStyle = `rgba(23, 23, 20, ${0.16 + influence * 0.38})`
        context.fill()
      })

      if (!reduceMotion) frame = requestAnimationFrame(draw)
    }

    const handlePointer = (event) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', handlePointer)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', handlePointer)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />
}

function WordLine({ children, className = '' }) {
  return (
    <span className={`word-line ${className}`}>
      {children.split(' ').map((word, index) => (
        <span className="word-clip" key={`${word}-${index}`}>
          <span className="word">{word}</span>
        </span>
      ))}
    </span>
  )
}

function ProjectVisual({ project, index }) {
  return (
    <div
      className={`project-visual project-visual-${index + 1}`}
      style={{ '--project-color': project.color }}
      aria-hidden="true"
    >
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
      <div className="visual-window">
        <div className="visual-window-bar">
          <i />
          <i />
          <i />
        </div>
        <div className="visual-window-content">
          <span>{project.number}</span>
          <strong>{project.title}</strong>
          <em>{project.titleZh}</em>
          <div className="visual-rule" />
          <small>{project.type} · {project.typeZh}</small>
        </div>
      </div>
      <span className="visual-code">{String(index + 1).padStart(2, '0')} / 03</span>
    </div>
  )
}

function App() {
  const rootRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoaded(true), 1650)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.05,
      smoothWheel: true,
      anchors: true,
    })
    const update = (time) => lenis.raf(time * 1000)

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined

    const cursor = document.querySelector('.cursor')
    const follower = document.querySelector('.cursor-follower')
    const moveCursorX = gsap.quickTo(cursor, 'x', { duration: 0.12, ease: 'power3' })
    const moveCursorY = gsap.quickTo(cursor, 'y', { duration: 0.12, ease: 'power3' })
    const moveFollowerX = gsap.quickTo(follower, 'x', { duration: 0.45, ease: 'power3' })
    const moveFollowerY = gsap.quickTo(follower, 'y', { duration: 0.45, ease: 'power3' })

    const onMove = (event) => {
      moveCursorX(event.clientX)
      moveCursorY(event.clientY)
      moveFollowerX(event.clientX)
      moveFollowerY(event.clientY)
    }
    const onOver = (event) => {
      if (event.target.closest('a, button, [data-cursor]')) {
        follower.classList.add('is-active')
      }
    }
    const onOut = (event) => {
      if (event.target.closest('a, button, [data-cursor]')) {
        follower.classList.remove('is-active')
      }
    }

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
    }
  }, [])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined
    const magnets = document.querySelectorAll('[data-magnetic]')
    const listeners = []

    magnets.forEach((element) => {
      const onMove = (event) => {
        const bounds = element.getBoundingClientRect()
        const x = event.clientX - bounds.left - bounds.width / 2
        const y = event.clientY - bounds.top - bounds.height / 2
        gsap.to(element, { x: x * 0.18, y: y * 0.18, duration: 0.35, ease: 'power2.out' })
      }
      const onLeave = () => {
        gsap.to(element, { x: 0, y: 0, duration: 0.75, ease: 'elastic.out(1, 0.35)' })
      }
      element.addEventListener('pointermove', onMove)
      element.addEventListener('pointerleave', onLeave)
      listeners.push({ element, onMove, onLeave })
    })

    return () => listeners.forEach(({ element, onMove, onLeave }) => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
    })
  }, [])

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set('.hero .word', { yPercent: 115 })
        gsap.set('.hero-kicker, .hero-meta, .scroll-hint', { opacity: 0, y: 18 })

        gsap
          .timeline({ delay: 1.5 })
          .to('.hero .word', {
            yPercent: 0,
            duration: 1.15,
            stagger: 0.075,
            ease: 'power4.out',
          })
          .to(
            '.hero-kicker, .hero-meta, .scroll-hint',
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
            '-=0.65',
          )

        gsap.to('.hero-title', {
          yPercent: 24,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })

        gsap.to('.hero-orb', {
          rotate: 150,
          yPercent: 42,
          scale: 0.78,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        })

        gsap.utils.toArray('[data-reveal]').forEach((element) => {
          gsap.fromTo(
            element,
            { y: 55, opacity: 0, filter: 'blur(12px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: { trigger: element, start: 'top 88%', once: true },
            },
          )
        })

        const aboutWords = gsap.utils.toArray('.about-copy .story-word')
        gsap.fromTo(
          aboutWords,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.04,
            ease: 'none',
            scrollTrigger: {
              trigger: '.about-story',
              start: 'top 70%',
              end: 'bottom 70%',
              scrub: true,
            },
          },
        )

        gsap.to('.marquee-track', {
          xPercent: -32,
          ease: 'none',
          scrollTrigger: {
            trigger: '.marquee',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })

        gsap.utils.toArray('.project-card').forEach((card) => {
          const visual = card.querySelector('.project-visual')
          const windowElement = card.querySelector('.visual-window')
          gsap.fromTo(
            visual,
            { clipPath: 'inset(0 0 100% 0 round 24px)' },
            {
              clipPath: 'inset(0 0 0% 0 round 24px)',
              duration: 1.2,
              ease: 'power4.inOut',
              scrollTrigger: { trigger: card, start: 'top 80%', once: true },
            },
          )
          gsap.fromTo(
            windowElement,
            { yPercent: 16, rotate: -5 },
            {
              yPercent: -12,
              rotate: 2,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            },
          )
        })

        gsap.fromTo(
          '.timeline-line span',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.experience-list',
              start: 'top 75%',
              end: 'bottom 60%',
              scrub: true,
            },
          },
        )

        gsap.to('.contact-orbit', {
          rotate: 180,
          scale: 1.22,
          ease: 'none',
          scrollTrigger: {
            trigger: '.contact',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1,
          },
        })

        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => gsap.set('.scroll-progress span', { scaleX: self.progress }),
        })
      })
    }, rootRef)

    return () => {
      media.revert()
      context.revert()
    }
  }, [])

  return (
    <div className="site" ref={rootRef}>
      {!loaded && <Loader />}
      <a className="skip-link" href="#main">跳到主要内容</a>
      <div className="cursor" aria-hidden="true" />
      <div className="cursor-follower" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true"><span /></div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页">
          <span>{profile.fullName}</span>
          <i />
        </a>
        <nav aria-label="主导航">
          <a href="#about"><span>ABOUT</span><small>关于</small></a>
          <a href="#education"><span>EDUCATION</span><small>教育</small></a>
          <a href="#work"><span>WORK</span><small>项目</small></a>
          <a href="#experience"><span>JOURNEY</span><small>经历</small></a>
        </nav>
        <a className="header-cta" href="#contact">
          CONTACT <small>联系</small> <ArrowDownRight size={16} strokeWidth={1.7} />
        </a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <ParticleField />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orb" aria-hidden="true">
            <div className="orb-core">
              {profile.markLines.map((line) => <span key={line}>{line}</span>)}
            </div>
            <div className="orb-ring ring-a" />
            <div className="orb-ring ring-b" />
            <Sparkles className="orb-spark" size={26} strokeWidth={1.2} />
          </div>

          <div className="hero-kicker">
            <span className="status-dot" />
            {profile.availability}
          </div>

          <h1 className="hero-title hero-title-en">
            <WordLine>{profile.heroLines[0]}</WordLine>
            <WordLine className="indent">{profile.heroLines[1]}</WordLine>
          </h1>
          <p className="hero-tagline-zh">{profile.heroTaglineZh}</p>

          <div className="hero-meta">
            <p>{profile.intro}</p>
            <div>
              <MapPin size={15} strokeWidth={1.6} />
              <span>{profile.location}</span>
            </div>
          </div>

          <a className="scroll-hint" href="#about" aria-label="向下滚动到关于部分">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown size={18} strokeWidth={1.5} />
          </a>
        </section>

        <section className="about section-pad" id="about">
          <div className="section-heading" data-reveal>
            <span className="section-index">01</span>
            <p><strong>ABOUT</strong><small>关于我</small></p>
            <div className="section-rule" />
            <Asterisk size={20} strokeWidth={1.2} />
          </div>

          <div className="about-layout">
            <aside className="about-profile" data-reveal>
              <div className="about-profile-top">
                <span>PROFILE · 01</span>
                <div className="about-avatar" aria-hidden="true">{profile.initials}</div>
              </div>
              <div className="about-profile-name">
                <strong>{profile.fullName}</strong>
                <small>{profile.chineseName}</small>
              </div>
              <div className="about-profile-role">
                <p>{profile.role}</p>
                <small>{profile.roleZh}</small>
              </div>
              <div className="about-profile-location">
                <MapPin size={14} strokeWidth={1.7} />
                <span>{profile.location}</span>
              </div>
            </aside>
            <div className="about-story">
              <p className="about-kicker" data-reveal>
                {profile.aboutKicker}<small>{profile.aboutKickerZh}</small>
              </p>
              <h2 className="about-copy">
                {profile.aboutHeadline.map((line) => (
                  <span className="about-copy-line" key={line}>
                    {line.split(' ').map((word, index) => (
                      <span className="story-word" key={`${word}-${index}`}>{word}</span>
                    ))}
                  </span>
                ))}
              </h2>
              <p className="about-headline-zh" data-reveal>{profile.aboutHeadlineZh}</p>
            </div>
          </div>

          <div className="about-narrative">
            <article data-reveal>
              <span>01</span>
              <div><strong>BACKGROUND</strong><small>交叉背景</small><p>{profile.about}</p></div>
            </article>
            <article data-reveal>
              <span>02</span>
              <div><strong>APPROACH</strong><small>实践方式</small><p>{profile.philosophy}</p></div>
            </article>
          </div>

          <div className="stats">
            {profile.stats.map((stat, index) => (
              <div className="stat" data-reveal key={stat.label}>
                <span className="stat-index">0{index + 1}</span>
                <strong>{stat.value}</strong>
                <span>{stat.label}<small>{stat.labelZh}</small></span>
              </div>
            ))}
          </div>
        </section>

        <section className="education section-pad" id="education">
          <div className="section-heading section-heading-light" data-reveal>
            <span className="section-index">02</span>
            <p><strong>EDUCATION</strong><small>教育背景</small></p>
            <div className="section-rule" />
            <span>2019 — 2025</span>
          </div>

          <div className="education-intro" data-reveal>
            <div>
              <span>CS × MATH</span>
              <h2>TWO DISCIPLINES.<br />ONE DIRECTION.</h2>
            </div>
            <p><strong>计算机科学 × 数学</strong>数学训练让我理解问题的结构，计算机科学让我把答案变成真实运行的系统。</p>
          </div>

          <div className="education-list">
            {profile.education.map((item) => (
              <article className="education-card" data-reveal key={item.code} style={{ '--education-accent': item.accent }}>
                <div className="education-brand">
                  <div className={`education-mark education-mark-${item.code.toLowerCase()}`}>
                    <img src={item.logo} alt={`${item.school} official logo`} />
                  </div>
                  <span aria-hidden="true">{item.code}</span>
                </div>
                <div className="education-school">
                  <time>{item.period}</time>
                  <h3>{item.school}</h3>
                  <small>{item.schoolZh}</small>
                </div>
                <div className="education-detail">
                  <strong>{item.degree}</strong>
                  <small>{item.degreeZh}</small>
                  <p>{item.statement}</p>
                  <ul>
                    {item.focus.map((focus) => <li key={focus}>{focus}</li>)}
                  </ul>
                  {item.award && <span className="education-award">{item.award}<small>国际学费奖学金</small></span>}
                </div>
              </article>
            ))}
          </div>
          <p className="education-trademark" data-reveal>
            SCHOOL NAMES &amp; MARKS ARE SHOWN ONLY TO IDENTIFY EDUCATION HISTORY.
            <small>校名与标识仅用于说明教育经历，不代表学校对本网站的认可或背书。</small>
          </p>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1, 2].map((item) => (
              <div className="marquee-set" key={item}>
                <span>THINK IN SYSTEMS</span>
                <Asterisk />
                <span>BUILD INTELLIGENTLY</span>
                <Asterisk />
              </div>
            ))}
          </div>
        </div>

        <section className="work section-pad" id="work">
          <div className="section-heading section-heading-light" data-reveal>
            <span className="section-index">03</span>
            <p><strong>SELECTED WORK</strong><small>精选项目</small></p>
            <div className="section-rule" />
            <span>2024 — 2025</span>
          </div>

          <div className="work-intro" data-reveal>
            <h2>FROM MODELS<br />TO SYSTEMS.</h2>
            <p><strong>从模型到系统的实践</strong>项目覆盖 Agent 工作流、模型微调部署和机器学习建模，呈现从问题拆解到工程落地的完整过程。</p>
          </div>

          <div className="project-list">
            {profile.projects.map((project, index) => (
              <article className="project-card" key={project.title}>
                <a href={project.href} aria-label={`查看项目：${project.title}`}>
                  <ProjectVisual project={project} index={index} />
                  <div className="project-info" data-reveal>
                    <div className="project-title-row">
                      <span>{project.number}</span>
                      <h3>{project.title}<small>{project.titleZh}</small></h3>
                      <ArrowUpRight size={30} strokeWidth={1.2} />
                    </div>
                    <p>{project.summary}</p>
                    <div className="project-tags">
                      {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      <time>{project.year}</time>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities section-pad">
          <div className="section-heading" data-reveal>
            <span className="section-index">04</span>
            <p><strong>CAPABILITIES</strong><small>专业能力</small></p>
            <div className="section-rule" />
            <Sparkles size={19} strokeWidth={1.2} />
          </div>
          <div className="capability-list">
            {profile.capabilities.map((item) => (
              <div className="capability-row" data-reveal data-cursor key={item.title}>
                <span>{item.number}</span>
                <h3>{item.title}<small>{item.titleZh}</small></h3>
                <p>{item.description}</p>
                <ArrowDownRight size={28} strokeWidth={1.1} />
              </div>
            ))}
          </div>
        </section>

        <section className="experience section-pad" id="experience">
          <div className="experience-title" data-reveal>
            <span>05 · JOURNEY <small>成长经历</small></span>
            <h2>KEEP LEARNING.<br />KEEP BUILDING.<small>持续学习，持续构建。</small></h2>
          </div>
          <div className="experience-list">
            <div className="timeline-line" aria-hidden="true"><span /></div>
            {profile.experience.map((item) => (
              <div className="experience-item" data-reveal key={item.period}>
                <i />
                <time>{item.period}</time>
                <strong>{item.company}<small>{item.companyZh}</small></strong>
                <span>{item.role}<small>{item.roleZh}</small></span>
              </div>
            ))}
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="contact-top" data-reveal>
            <span className="status-dot status-dot-light" />
            {profile.availability}
          </div>
          <div className="contact-main">
            <p data-reveal>HAVE AN IDEA? <small>有一个想法，或者只是想打个招呼？</small></p>
            <h2 data-reveal>LET'S BUILD.<br />WHAT'S NEXT.</h2>
            <a className="contact-button" data-magnetic href={`mailto:${profile.email}`}>
              <Mail size={22} strokeWidth={1.4} />
              <span>SAY HELLO<small>联系我</small></span>
              <ArrowUpRight size={22} strokeWidth={1.4} />
            </a>
          </div>
          <footer>
            <a className="footer-brand" href="#top">{profile.name}</a>
            <div className="social-links">
              {profile.socials.map((social) => (
                <a href={social.href} key={social.label}>{social.label}<ArrowUpRight size={13} /></a>
              ))}
            </div>
            <span>© 2026 · CURIOUS BY NATURE <small>保持好奇</small></span>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default App
