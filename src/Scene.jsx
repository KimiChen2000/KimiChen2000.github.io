import { useEffect, useRef } from 'react'
import { BestsellersBookShowcase } from '@designcodeio/threeui'
import '@designcodeio/threeui/style.css'
import './scene.css'

export function Scene() {
  const sceneRef = useRef(null)

  useEffect(() => {
    const frame = sceneRef.current?.querySelector('iframe')
    if (frame) frame.title = 'Kimi Chen — Interactive Résumé'

    const syncDocumentLanguage = (event) => {
      if (event.source !== frame?.contentWindow || event.data?.source !== 'kimi-resume') return
      if (event.data.type !== 'language-change') return

      document.title = event.data.title
      document.documentElement.lang = event.data.language === 'zh' ? 'zh-CN' : 'en'
    }

    window.addEventListener('message', syncDocumentLanguage)
    return () => window.removeEventListener('message', syncDocumentLanguage)
  }, [])

  return (
    <div className="shader-frame" ref={sceneRef}>
      <BestsellersBookShowcase
        headingFont="iowan-old-style"
        bodyFont="iowan-old-style"
        headingWeight="500"
        bodyWeight="400"
        primaryColor="#c3a47b"
        headingSize={325}
        bodySize={17}
        headingLetterSpacing={-0.085}
      />
    </div>
  )
}
