import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Asterisk,
  Download,
  MapPin,
  Music2,
  Sparkles,
} from 'lucide-react'
import { profile } from './profile.js'

gsap.registerPlugin(ScrollTrigger)

function createLightMusic() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null

  const context = new AudioContextClass()
  const master = context.createGain()
  const compressor = context.createDynamicsCompressor()
  const filter = context.createBiquadFilter()
  const delay = context.createDelay(1)
  const feedback = context.createGain()
  const wet = context.createGain()
  let sequenceTimer
  let suspendTimer
  let step = 0
  let wantsToPlay = false

  master.gain.value = 0.0001
  compressor.threshold.value = -22
  compressor.knee.value = 20
  compressor.ratio.value = 4
  compressor.attack.value = 0.015
  compressor.release.value = 0.32
  filter.type = 'lowpass'
  filter.frequency.value = 4400
  delay.delayTime.value = 0.24
  feedback.gain.value = 0.13
  wet.gain.value = 0.17

  filter.connect(master)
  filter.connect(delay)
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(wet)
  wet.connect(master)
  master.connect(compressor)
  compressor.connect(context.destination)

  const chords = [
    [261.63, 329.63, 392, 493.88],
    [220, 261.63, 329.63, 392],
    [174.61, 220, 261.63, 329.63],
    [196, 246.94, 293.66, 329.63],
  ]
  const arpeggio = [0, 1, 2, 1, 3, 2, 1, 2]

  const playNote = (frequency, now, peak = 0.04, length = 0.78, type = 'triangle') => {
    const oscillator = context.createOscillator()
    const overtone = context.createOscillator()
    const overtoneGain = context.createGain()
    const noteGain = context.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, now)
    overtone.type = 'sine'
    overtone.frequency.setValueAtTime(frequency * 2, now)
    overtoneGain.gain.value = 0.15
    noteGain.gain.setValueAtTime(0.0001, now)
    noteGain.gain.exponentialRampToValueAtTime(peak, now + 0.018)
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + length)
    oscillator.connect(noteGain)
    overtone.connect(overtoneGain)
    overtoneGain.connect(noteGain)
    noteGain.connect(filter)
    oscillator.start(now)
    overtone.start(now)
    oscillator.stop(now + length + 0.05)
    overtone.stop(now + length + 0.05)
  }

  const playWash = (chord, now) => {
    chord.slice(0, 3).forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const noteGain = context.createGain()
      oscillator.type = index === 1 ? 'triangle' : 'sine'
      oscillator.frequency.setValueAtTime(frequency / 2, now)
      oscillator.detune.value = index * 3 - 3
      noteGain.gain.setValueAtTime(0.0001, now)
      noteGain.gain.exponentialRampToValueAtTime(0.009, now + 0.42)
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.65)
      oscillator.connect(noteGain)
      noteGain.connect(filter)
      oscillator.start(now)
      oscillator.stop(now + 3.7)
    })
  }

  const playStep = () => {
    if (context.state !== 'running' || !wantsToPlay) return
    const now = context.currentTime
    const chord = chords[Math.floor(step / 8) % chords.length]
    const position = step % arpeggio.length
    const frequency = chord[arpeggio[position]]
    playNote(frequency, now)
    if (position === 0) {
      playWash(chord, now)
      playNote(chord[0] / 2, now, 0.018, 1.35, 'sine')
    }
    if (position === 4) playNote(frequency * 2, now, 0.01, 0.52, 'sine')
    step += 1
  }

  return {
    async play() {
      wantsToPlay = true
      window.clearTimeout(suspendTimer)
      await context.resume()
      const now = context.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now)
      master.gain.exponentialRampToValueAtTime(0.22, now + 0.55)
      if (!sequenceTimer) {
        playStep()
        sequenceTimer = window.setInterval(playStep, 480)
      }
    },
    pause() {
      wantsToPlay = false
      window.clearInterval(sequenceTimer)
      sequenceTimer = undefined
      const now = context.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now)
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)
      suspendTimer = window.setTimeout(() => {
        if (!wantsToPlay && context.state === 'running') context.suspend()
      }, 370)
    },
    destroy() {
      wantsToPlay = false
      window.clearInterval(sequenceTimer)
      window.clearTimeout(suspendTimer)
      context.close().catch(() => {})
    },
  }
}

function Loader() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    let frame
    const tick = (time) => {
      const value = Math.min(100, Math.round(((time - startedAt) / 1050) * 100))
      setProgress(value)
      if (value < 100) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="loader" aria-hidden="true">
      <div className="loader-symbol">
        <span>K</span><i /><span>C</span>
      </div>
      <div className="loader-meta">
        <span>INITIALIZING PORTFOLIO</span>
        <span>{String(progress).padStart(3, '0')}%</span>
      </div>
      <div className="loader-track"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
    </div>
  )
}

function AuroraField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0.5, y: 0.45, active: false }
    let width = 0
    let height = 0
    let dpr = 1
    let nodes = []
    let frame

    const makeNodes = () => {
      const count = width < 700 ? 34 : Math.min(82, Math.round(width / 18))
      nodes = Array.from({ length: count }, (_, index) => ({
        x: ((index * 0.6180339887) % 1) * width,
        y: ((index * 0.3819660113 + 0.17) % 1) * height,
        baseX: ((index * 0.6180339887) % 1) * width,
        baseY: ((index * 0.3819660113 + 0.17) % 1) * height,
        phase: index * 0.73,
        speed: 0.00018 + (index % 6) * 0.000022,
        radius: index % 9 === 0 ? 2.2 : 1.05,
      }))
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      dpr = Math.min(window.devicePixelRatio || 1, 1.6)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      makeNodes()
    }

    const glow = (x, y, radius, color) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = gradient
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height)
      context.fillStyle = '#070a0d'
      context.fillRect(0, 0, width, height)

      const drift = reducedMotion ? 0 : time * 0.00016
      context.globalCompositeOperation = 'screen'
      glow(
        width * (0.73 + Math.sin(drift * 0.9) * 0.12),
        height * (0.25 + Math.cos(drift * 1.15) * 0.12),
        Math.max(width, height) * 0.48,
        'rgba(197, 161, 92, 0.16)',
      )
      glow(
        width * (0.2 + Math.cos(drift * 0.75) * 0.13),
        height * (0.72 + Math.sin(drift) * 0.13),
        Math.max(width, height) * 0.43,
        'rgba(90, 255, 164, 0.13)',
      )
      glow(
        width * (0.55 + Math.sin(drift * 1.3) * 0.22),
        height * (0.58 + Math.cos(drift * 0.65) * 0.16),
        Math.max(width, height) * 0.3,
        'rgba(188, 157, 92, 0.07)',
      )

      const pointerX = pointer.x * width
      const pointerY = pointer.y * height
      nodes.forEach((node) => {
        const waveX = Math.sin(time * node.speed + node.phase) * 30
        const waveY = Math.cos(time * node.speed * 0.82 + node.phase) * 22
        const pull = pointer.active ? Math.max(0, 1 - Math.hypot(node.baseX - pointerX, node.baseY - pointerY) / 360) : 0
        node.x = node.baseX + waveX + (pointerX - node.baseX) * pull * 0.075
        node.y = node.baseY + waveY + (pointerY - node.baseY) * pull * 0.075
      })

      context.globalCompositeOperation = 'source-over'
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i]
        for (let j = i + 1; j < nodes.length; j += 1) {
          const other = nodes[j]
          const distance = Math.hypot(node.x - other.x, node.y - other.y)
          const threshold = width < 700 ? 112 : 155
          if (distance < threshold) {
            context.beginPath()
            context.moveTo(node.x, node.y)
            context.lineTo(other.x, other.y)
            context.strokeStyle = `rgba(181, 204, 225, ${(1 - distance / threshold) * 0.11})`
            context.lineWidth = 0.7
            context.stroke()
          }
        }
        context.beginPath()
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        context.fillStyle = i % 7 === 0 ? 'rgba(139, 255, 178, 0.72)' : 'rgba(221, 232, 241, 0.46)'
        context.fill()
      }

      if (pointer.active) glow(pointerX, pointerY, 170, 'rgba(139, 255, 178, 0.055)')
      if (!reducedMotion) frame = requestAnimationFrame(draw)
    }

    const onMove = (event) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = (event.clientX - bounds.left) / bounds.width
      pointer.y = (event.clientY - bounds.top) / bounds.height
      pointer.active = true
    }
    const onLeave = () => { pointer.active = false }

    resize()
    draw()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas className="aurora-field" ref={canvasRef} aria-hidden="true" />
}

function SectionLabel({ index, label, labelZh, end }) {
  return (
    <div className="section-label" data-reveal>
      <span>{index}</span>
      <p>{label}<small>{labelZh}</small></p>
      <i />
      {end && <em>{end}</em>}
    </div>
  )
}

function ProjectVisual({ project, index }) {
  const systemCode = index === 0 ? 'RAG / 01' : index === 1 ? 'LLM / 02' : 'ML / 03'
  const coreCode = index === 0 ? 'AGENT' : index === 1 ? 'LORA' : 'AUC 83+'

  return (
    <div className={`project-visual project-visual-${index + 1}`} style={{ '--accent': project.color }} aria-hidden="true">
      <div className="project-visual-head">
        <span><i /><i /><i /></span>
        <small>SYSTEM BLUEPRINT · 0{index + 1}</small>
      </div>
      <div className="project-stage">
        <div className="blueprint-coordinate">X: 24.083<br />Y: 118.204</div>
        <div className="system-pipeline">
          <div className="system-node node-input">
            <span>01</span><strong>INPUT</strong><small>RAW DATA</small>
          </div>
          <div className="system-connector connector-a"><i /></div>
          <div className="project-core">
            <span>{systemCode}</span>
            <strong>{coreCode}</strong>
            <small>PROCESSING CORE</small>
          </div>
          <div className="system-connector connector-b"><i /></div>
          <div className="system-node node-output">
            <span>03</span><strong>OUTPUT</strong><small>VERIFIED</small>
          </div>
        </div>
        <div className="blueprint-metrics">
          <span>STATUS <b>ONLINE</b></span>
          <span>PIPELINE <b>03 NODES</b></span>
          <span>OUTPUT <b>STRUCTURED</b></span>
        </div>
      </div>
      <div className="project-visual-foot">
        <span>{project.type}</span>
        <span>2025 / CN</span>
      </div>
    </div>
  )
}

function App() {
  const rootRef = useRef(null)
  const musicEngineRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [musicSupported, setMusicSupported] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoaded(true), 1450)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => () => musicEngineRef.current?.destroy(), [])

  const toggleMusic = async () => {
    if (musicOn) {
      musicEngineRef.current?.pause()
      setMusicOn(false)
      return
    }
    try {
      if (!musicEngineRef.current) musicEngineRef.current = createLightMusic()
      if (!musicEngineRef.current) {
        setMusicSupported(false)
        return
      }
      await musicEngineRef.current.play()
      setMusicOn(true)
    } catch {
      setMusicSupported(false)
      setMusicOn(false)
    }
  }

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > window.innerHeight * 0.75)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const lenis = new Lenis({ autoRaf: false, duration: 1.05, smoothWheel: true, anchors: true })
    const update = (time) => lenis.raf(time * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set('.hero-reveal', { y: 38, opacity: 0 })
        gsap.set('.hero-title-line > span', { yPercent: 112 })

        gsap.timeline({ delay: 1.18 })
          .to('.hero-title-line > span', {
            yPercent: 0,
            duration: 1.15,
            stagger: 0.11,
            ease: 'power4.out',
          })
          .to('.hero-reveal', {
            y: 0,
            opacity: 1,
            duration: 0.78,
            stagger: 0.08,
            ease: 'power3.out',
          }, '-=0.62')

        gsap.to('.hero-content', {
          yPercent: 18,
          opacity: 0.18,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        })

        gsap.utils.toArray('[data-reveal]').forEach((element) => {
          gsap.fromTo(element, { y: 45, opacity: 0 }, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          })
        })

        gsap.utils.toArray('.project-card').forEach((card) => {
          const visual = card.querySelector('.project-visual')
          const core = card.querySelector('.project-core')
          gsap.fromTo(visual, { clipPath: 'inset(0 0 100% 0 round 28px)' }, {
            clipPath: 'inset(0 0 0% 0 round 28px)',
            duration: 1.25,
            ease: 'power4.inOut',
            scrollTrigger: { trigger: card, start: 'top 82%', once: true },
          })
          gsap.to(core, {
            yPercent: -7,
            rotate: 0,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
          })
        })

        gsap.fromTo('.timeline-progress', { scaleY: 0 }, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.journey-list', start: 'top 76%', end: 'bottom 64%', scrub: true },
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
      <div className="site-noise" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true"><span /></div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页">
          <span className="brand-mark">KC</span>
          <span className="brand-name">KIMI CHEN<small>AI ENGINEER</small></span>
        </a>
        <nav aria-label="主导航">
          <a href="#about">ABOUT <small>关于</small></a>
          <a href="#education">EDUCATION <small>教育</small></a>
          <a href="#work">WORK <small>项目</small></a>
          <a href="#experience">JOURNEY <small>经历</small></a>
        </nav>
        <button
          className={`music-control${musicOn ? ' is-playing' : ''}`}
          type="button"
          onClick={toggleMusic}
          aria-pressed={musicOn}
          aria-label={musicOn ? '关闭背景音乐' : '开启背景音乐'}
          disabled={!musicSupported}
        >
          <Music2 size={17} strokeWidth={1.7} aria-hidden="true" />
          <span>{musicOn ? 'SOUND ON' : 'SOUND OFF'}</span>
        </button>
      </header>

      <a
        className={`back-to-top${showBackToTop ? ' is-visible' : ''}`}
        href="#top"
        aria-label="返回页面顶部"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
      >
        <ArrowUp size={18} strokeWidth={1.6} />
      </a>

      <main id="main">
        <section className="hero" id="top">
          <AuroraField />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-scan" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-kicker hero-reveal">
              <span><i /> {profile.eyebrow}</span>
              <span>{profile.availability}</span>
            </div>

            <h1 className="hero-title" aria-label={`${profile.heroLines[0]} ${profile.heroLines[1]}`}>
              <span className="hero-title-line"><span>{profile.heroLines[0]}</span></span>
              <span className="hero-title-line hero-title-accent"><span>{profile.heroLines[1]}</span></span>
            </h1>

            <div className="hero-lower hero-reveal">
              <div className="hero-intro">
                <span className="hero-intro-label">/ {profile.heroTaglineZh}</span>
                <p>{profile.intro}</p>
              </div>
              <div className="hero-data">
                <div><strong>03+</strong><span>AI / ML<br />PROJECTS</span></div>
                <div><strong>83%+</strong><span>MODEL<br />AUC</span></div>
              </div>
            </div>

            <div className="hero-footer hero-reveal">
              <span><MapPin size={14} strokeWidth={1.6} />{profile.location}</span>
              <a href="#about">SCROLL TO EXPLORE <ArrowDown size={16} strokeWidth={1.6} /></a>
              <span>© {new Date().getFullYear()} · PORTFOLIO</span>
            </div>
          </div>
        </section>

        <section className="about section" id="about">
          <div className="shell">
            <SectionLabel index="01" label="ABOUT" labelZh="关于我" end="FROM MODEL TO PRODUCT" />
            <div className="about-grid">
              <aside className="profile-card" data-reveal>
                <div className="profile-card-top">
                  <span>PROFILE / 01</span><i>OPEN TO WORK</i>
                </div>
                <div className="profile-avatar" aria-hidden="true">
                  <span>{profile.initials}</span>
                  <div className="avatar-orbit" />
                </div>
                <div className="profile-name">
                  <h3>{profile.fullName}</h3>
                  <span>{profile.chineseName}</span>
                </div>
                <div className="profile-role">
                  <p>{profile.role}</p><span>{profile.roleZh}</span>
                </div>
                <div className="profile-location"><MapPin size={15} />{profile.location}</div>
                <a className="button-link" href={`${import.meta.env.BASE_URL}resume/Kimi-Chen-Resume.docx`} download="Kimi-Chen-Resume.docx">
                  <span>DOWNLOAD CV<small>下载简历</small></span><Download size={18} strokeWidth={1.6} />
                </a>
              </aside>

              <div className="about-story">
                <p className="overline" data-reveal>{profile.aboutKicker}<small>{profile.aboutKickerZh}</small></p>
                <h2 data-reveal>
                  {profile.aboutHeadline.map((line) => <span key={line}>{line}</span>)}
                </h2>
                <p className="about-lead" data-reveal>{profile.aboutHeadlineZh}</p>
                <div className="about-notes">
                  <article data-reveal><span>01 / BACKGROUND</span><h3>交叉背景</h3><p>{profile.about}</p></article>
                  <article data-reveal><span>02 / APPROACH</span><h3>实践方式</h3><p>{profile.philosophy}</p></article>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              {profile.stats.map((stat, index) => (
                <article className="stat-card" data-reveal data-index={`0${index + 1}`} key={stat.label}>
                  <span>0{index + 1}</span><strong>{stat.value}</strong><p>{stat.label}<small>{stat.labelZh}</small></p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="education section" id="education">
          <div className="education-glow" aria-hidden="true" />
          <div className="shell">
            <SectionLabel index="02" label="EDUCATION" labelZh="教育背景" end="2019 — 2025" />
            <div className="section-intro" data-reveal>
              <h2>TWO DISCIPLINES.<br /><em>ONE DIRECTION.</em></h2>
              <p><strong>计算机科学 × 数学</strong>数学训练让我理解问题的结构，计算机科学让我把答案变成真实运行的系统。</p>
            </div>
            <div className="education-list">
              {profile.education.map((item, index) => (
                <article className="education-card" data-reveal key={item.code} style={{ '--accent': item.accent }}>
                  <div className="education-number">0{index + 1}</div>
                  <div className="education-logo"><img src={item.logo} alt={`${item.school} official logo`} /></div>
                  <div className="education-school">
                    <time>{item.period}</time>
                    <h3>{item.school}</h3><span>{item.schoolZh}</span>
                  </div>
                  <div className="education-detail">
                    <h4>{item.degree}<small>{item.degreeZh}</small></h4>
                    <p>{item.statement}</p>
                    <ul>{item.focus.map((focus) => <li key={focus}>{focus}</li>)}</ul>
                    {item.award && <div className="education-award"><Sparkles size={15} />{item.award}<small>国际学费奖学金</small></div>}
                  </div>
                </article>
              ))}
            </div>
            <p className="trademark" data-reveal>SCHOOL NAMES &amp; MARKS ARE SHOWN ONLY TO IDENTIFY EDUCATION HISTORY.<small>校名与标识仅用于说明教育经历，不代表学校对本网站的认可或背书。</small></p>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((item) => (
              <div className="ticker-set" key={item}>
                <span>THINK IN SYSTEMS</span><Asterisk /><span>BUILD INTELLIGENTLY</span><Asterisk /><span>SHIP REAL IMPACT</span><Asterisk />
              </div>
            ))}
          </div>
        </div>

        <section className="work section" id="work">
          <div className="shell">
            <SectionLabel index="03" label="SELECTED WORK" labelZh="精选项目" end="2024 — 2025" />
            <div className="section-intro work-intro" data-reveal>
              <h2>FROM MODELS.<br /><em>TO SYSTEMS.</em></h2>
              <p><strong>从模型到系统的实践</strong>项目覆盖 Agent 工作流、模型微调部署和机器学习建模，呈现从问题拆解到工程落地的完整过程。</p>
            </div>
            <div className="project-list">
              {profile.projects.map((project, index) => (
                <article className="project-card" key={project.title}>
                  <a href={project.href} target="_blank" rel="noreferrer" aria-label={`查看项目：${project.title}`}>
                    <ProjectVisual project={project} index={index} />
                    <div className="project-info" data-reveal>
                      <span className="project-index">PROJECT / {project.number}</span>
                      <div className="project-title-row"><h3>{project.title}<small>{project.titleZh}</small></h3><ArrowUpRight size={32} strokeWidth={1.25} /></div>
                      <p>{project.summary}</p>
                      <div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}<time>{project.year}</time></div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="capabilities section" id="capabilities">
          <div className="shell">
            <SectionLabel index="04" label="CAPABILITIES" labelZh="专业能力" end="WHAT I DO" />
            <div className="capability-heading" data-reveal>
              <h2>ONE WORKFLOW.<br />END TO END.</h2>
              <p>从数据和模型，到服务与交互。<br />把每一层连接成真正可用的 AI 产品。</p>
            </div>
            <div className="capability-grid">
              {profile.capabilities.map((item) => (
                <article className="capability-card" data-reveal key={item.title}>
                  <span>{item.number}</span>
                  <div className="capability-icon"><Sparkles size={18} strokeWidth={1.4} /></div>
                  <h3>{item.title}<small>{item.titleZh}</small></h3>
                  <p>{item.description}</p>
                  <ArrowRight className="capability-arrow" size={22} strokeWidth={1.4} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="journey section" id="experience">
          <div className="shell">
            <SectionLabel index="05" label="JOURNEY" labelZh="成长经历" end="KEEP BUILDING" />
            <div className="journey-grid">
              <div className="journey-heading" data-reveal>
                <h2>KEEP LEARNING.<br /><em>KEEP BUILDING.</em></h2>
                <p>持续学习，持续构建。</p>
              </div>
              <div className="journey-list">
                <div className="journey-line"><span className="timeline-progress" /></div>
                {profile.experience.map((item, index) => (
                  <article className="journey-item" data-reveal key={item.period}>
                    <i /><span>0{index + 1}</span><time>{item.period}</time>
                    <h3>{item.company}<small>{item.companyZh}</small></h3>
                    <p>{item.role}<small>{item.roleZh}</small></p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="contact section" id="contact">
          <div className="contact-orb" aria-hidden="true" />
          <div className="shell">
            <div className="contact-top">
              <span><i /> AVAILABLE FOR OPPORTUNITIES</span>
              <span>06 / CONTACT · 联系</span>
            </div>
            <div className="contact-main">
              <p>HAVE AN IDEA?<small>有一个值得实现的想法？</small></p>
              <a href={`mailto:${profile.email}`}>LET&apos;S BUILD.<ArrowUpRight strokeWidth={1.1} /></a>
            </div>
            <div className="contact-bottom">
              <div><span>EMAIL</span><a href={`mailto:${profile.email}`}>{profile.email}</a></div>
              <div><span>FIND ME</span>{profile.socials.map((social) => <a href={social.href} key={social.label}>{social.label}</a>)}</div>
              <div><span>LOCATION</span><p>{profile.location}</p></div>
              <a className="contact-top-link" href="#top">BACK TO TOP <ArrowUp size={16} /></a>
            </div>
            <div className="contact-legal"><span>© {new Date().getFullYear()} {profile.fullName}</span><span>DESIGNED &amp; BUILT WITH INTENTION</span></div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
