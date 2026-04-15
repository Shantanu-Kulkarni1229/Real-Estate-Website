import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import SearchBar from './SearchBar'
import { apiRequest } from '../../../lib/api'

const brandTypingText = 'Find Your Perfect Property'

const fallbackSlides = [
  {
    id: 'brand-intro',
    title: 'Find Your Perfect\nProperty',
    subtitle: 'Buy, rent, or list properties across India with confidence on CityPloter.',
    image: 'https://media.licdn.com/dms/image/v2/C4E12AQH0DZkSOcaL_Q/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1520057674401?e=1777507200&v=beta&t=sCOcFZUeCWqSLXoIg0zY8wygPIw_5I8Nz2I2xKsc4j4',
    isBrandSlide: true,
    badge: 'CityPloter',
    stat1: { value: '2.4L+', label: 'Properties' },
    stat2: { value: '180+', label: 'Cities' },
    stat3: { value: '98%', label: 'Satisfaction' }
  },
  {
    id: 'promo-slot-1',
    title: 'Premium Paid\nPromotion Slot',
    subtitle: 'Your featured project ad will appear here after payment verification and approval.',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1920&q=80',
    isBrandSlide: false,
    badge: 'Sponsored'
  },
  {
    id: 'promo-slot-2',
    title: 'Top Builder\nCampaign Placement',
    subtitle: 'Use this section to highlight premium launches, offers, and high-visibility campaigns.',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1920&q=80',
    isBrandSlide: false,
    badge: 'Sponsored'
  }
]

/* ── tiny sparkle particles ── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1.5 + Math.random() * 3,
  delay: Math.random() * 6,
  dur: 3 + Math.random() * 4
}))

const Hero = ({ onSearch }) => {
  const [promoSlides, setPromoSlides] = useState([])
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [prevIndex, setPrevIndex] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const heroRef = useRef(null)
  const autoplayRef = useRef(null)

  const heroSlides = useMemo(() => {
    const dynamicPromoSlides = promoSlides.map((promotion) => ({
      id: promotion._id,
      title: promotion.title,
      subtitle: promotion.subtitle || 'Featured sponsored campaign on CityPloter.',
      image: promotion.imageUrl,
      isBrandSlide: false,
      badge: 'Sponsored',
      redirectUrl: promotion.redirectUrl || ''
    }))
    return [fallbackSlides[0], ...dynamicPromoSlides, ...fallbackSlides.slice(1)]
  }, [promoSlides])

  const safeIndex = heroSlides.length > 0 ? activeSlideIndex % heroSlides.length : 0
  const activeSlide = useMemo(() => heroSlides[safeIndex] || heroSlides[0], [heroSlides, safeIndex])

  /* mouse parallax */
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    })
  }, [])

  /* slide change with transition */
  const changeSlide = useCallback((nextIndex) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setPrevIndex(safeIndex)
    setTimeout(() => {
      setActiveSlideIndex(nextIndex)
      setIsTransitioning(false)
      setPrevIndex(null)
    }, 600)
  }, [isTransitioning, safeIndex])

  /* load promotions */
  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const response = await apiRequest('/promotions/active')
        if (isMounted) setPromoSlides(Array.isArray(response?.data) ? response.data : [])
      } catch { if (isMounted) setPromoSlides([]) }
    }
    load()
    return () => { isMounted = false }
  }, [])

  /* autoplay */
  useEffect(() => {
    autoplayRef.current = window.setInterval(() => {
      changeSlide((safeIndex + 1) % heroSlides.length)
    }, 5500)
    return () => window.clearInterval(autoplayRef.current)
  }, [heroSlides.length, safeIndex, changeSlide])

  /* typing effect */
  useEffect(() => {
    if (!activeSlide?.isBrandSlide) return
    const resetTimer = window.setTimeout(() => setTypedText(''), 0)
    let i = 0
    const t = window.setInterval(() => {
      i += 1
      setTypedText(brandTypingText.slice(0, i))
      if (i >= brandTypingText.length) window.clearInterval(t)
    }, 52)
    return () => {
      window.clearTimeout(resetTimer)
      window.clearInterval(t)
    }
  }, [activeSlide])

  const goTo = (index) => changeSlide(index % heroSlides.length)
  const goToPrev = () => goTo(safeIndex === 0 ? heroSlides.length - 1 : safeIndex - 1)
  const goToNext = () => goTo((safeIndex + 1) % heroSlides.length)

  /* parallax offset */
  const px = (mousePos.x - 0.5) * 22
  const py = (mousePos.y - 0.5) * 12

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap');

        .hero-root {
          position: relative;
          font-family: 'Outfit', sans-serif;
        }

        /* ── slide images ── */
        .slide-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 8s cubic-bezier(.25,.1,.25,1), opacity 0.65s ease;
          will-change: transform;
        }

        .slide-img.active  { opacity: 1;  z-index: 1; transform: scale(1.06) translate(calc(var(--px) * 0.4px), calc(var(--py) * 0.4px)); }
        .slide-img.exiting { opacity: 0;  z-index: 0; }
        .slide-img.waiting { opacity: 0;  z-index: 0; transform: scale(1.1); }

        /* ── overlays ── */
        .hero-overlay-cinema {
          position: absolute; inset: 0; z-index: 2;
          background: linear-gradient(
            108deg,
            rgba(0,0,0,0.78) 0%,
            rgba(0,0,0,0.52) 40%,
            rgba(0,0,0,0.28) 70%,
            rgba(0,0,0,0.15) 100%
          );
        }

        .hero-overlay-vignette {
          position: absolute; inset: 0; z-index: 3;
          background: radial-gradient(ellipse 120% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%);
        }

        .hero-overlay-grain {
          position: absolute; inset: 0; z-index: 4; opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 128px 128px;
          pointer-events: none;
        }

        /* ── scan lines ── */
        .hero-scanlines {
          position: absolute; inset: 0; z-index: 4;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.018) 2px,
            rgba(0,0,0,0.018) 4px
          );
          pointer-events: none;
        }

        /* ── top gradient bar ── */
        .hero-topbar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 20;
          background: linear-gradient(90deg, var(--color-primary, #2563eb), #6366f1, var(--color-cta-orange, #f97316));
        }

        /* ── particles ── */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.65);
          z-index: 5;
          pointer-events: none;
          animation: particleFloat var(--dur) ease-in-out var(--delay) infinite alternate;
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0)   scale(1);   opacity: 0.2; }
          50%  { opacity: 0.7; }
          100% { transform: translateY(-28px) scale(1.4); opacity: 0.1; }
        }

        /* ── content ── */
        .hero-content {
          position: absolute; inset: 0; z-index: 10;
          display: flex; align-items: center;
        }

        .hero-inner {
          margin: 0 auto;
          width: 100%;
          max-width: 1280px;
          padding: 0 2rem;
        }

        /* badge */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.22);
          backdrop-filter: blur(10px);
          border-radius: 999px;
          padding: 0.32rem 0.85rem 0.32rem 0.45rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: white;
          animation: badgePop 0.55s cubic-bezier(.34,1.56,.64,1) 0.1s both;
        }
        .hero-badge-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--color-cta-orange, #f97316);
          box-shadow: 0 0 6px 2px rgba(249,115,22,0.6);
          animation: pulseDot 1.8s ease infinite;
        }
        @keyframes pulseDot {
          0%,100% { box-shadow: 0 0 6px 2px rgba(249,115,22,0.6); }
          50%      { box-shadow: 0 0 12px 4px rgba(249,115,22,0.9); }
        }
        @keyframes badgePop {
          from { opacity: 0; transform: scale(0.7) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* heading */
        .hero-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 900;
          font-size: clamp(2.6rem, 5.5vw, 4.4rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: white;
          margin-top: 1.1rem;
          animation: headingReveal 0.75s cubic-bezier(.22,1,.36,1) 0.25s both;
          text-shadow: 0 4px 32px rgba(0,0,0,0.35);
        }
        @keyframes headingReveal {
          from { opacity: 0; transform: translateY(24px) skewY(1.5deg); }
          to   { opacity: 1; transform: translateY(0) skewY(0); }
        }

        .hero-heading-line2 {
          display: block;
          background: linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.85) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-heading-accent {
          display: block;
          background: linear-gradient(90deg, var(--color-cta-orange, #f97316) 0%, #fbbf24 60%, var(--color-cta-orange, #f97316) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: gradientShift 4s linear infinite;
        }
        @keyframes gradientShift {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        /* cursor blink */
        .cursor-blink {
          display: inline-block;
          width: 3px;
          height: 0.85em;
          background: var(--color-cta-orange, #f97316);
          border-radius: 2px;
          margin-left: 3px;
          vertical-align: middle;
          animation: cursorBlink 1s step-end infinite;
          box-shadow: 0 0 8px rgba(249,115,22,0.7);
        }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* subtitle */
        .hero-subtitle {
          margin-top: 1.1rem;
          font-size: clamp(0.875rem, 1.4vw, 1.05rem);
          color: rgba(255,255,255,0.8);
          max-width: 460px;
          line-height: 1.7;
          font-weight: 400;
          animation: fadeUp 0.7s ease 0.5s both;
          letter-spacing: 0.01em;
        }

        /* divider line */
        .hero-divider {
          width: 52px; height: 2px;
          background: linear-gradient(90deg, var(--color-cta-orange, #f97316), transparent);
          border-radius: 2px;
          margin-top: 1.1rem;
          animation: fadeUp 0.7s ease 0.55s both;
        }

        @keyframes fadeUp {
          from { opacity:0; transform: translateY(16px); }
          to   { opacity:1; transform: translateY(0); }
        }

        /* CTA buttons */
        .hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.75rem;
          animation: fadeUp 0.7s ease 0.65s both;
        }

        .btn-primary-hero {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.75rem;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--color-cta-orange, #f97316) 0%, #dc6002 100%);
          color: white;
          font-size: 0.875rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          text-decoration: none;
          box-shadow: 0 6px 24px rgba(249,115,22,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset;
          transition: all 0.25s cubic-bezier(.4,0,.2,1);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.01em;
        }
        .btn-primary-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.15);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .btn-primary-hero:hover::before { transform: scaleX(1); }
        .btn-primary-hero:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(249,115,22,0.55);
        }
        .btn-primary-hero svg { transition: transform 0.2s ease; }
        .btn-primary-hero:hover svg { transform: translateX(3px); }

        .btn-ghost-hero {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.6rem;
          border-radius: 999px;
          border: 1.5px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          text-decoration: none;
          transition: all 0.25s ease;
          letter-spacing: 0.01em;
        }
        .btn-ghost-hero:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.5);
          transform: translateY(-2px);
        }

        .btn-explore-hero {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.6rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.95);
          color: #0f172a;
          font-size: 0.875rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          letter-spacing: 0.01em;
        }
        .btn-explore-hero:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        /* stats strip */
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 0;
          margin-top: 2.25rem;
          animation: fadeUp 0.7s ease 0.8s both;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          padding-right: 1.75rem;
          margin-right: 1.75rem;
          border-right: 1px solid rgba(255,255,255,0.18);
          transition: transform 0.25s ease;
        }
        .stat-item:last-child { border-right: none; padding-right: 0; margin-right: 0; }
        .stat-item:hover { transform: translateY(-2px); }

        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .stat-value span {
          background: linear-gradient(90deg, var(--color-cta-orange, #f97316), #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-top: 0.2rem;
        }

        /* progress bar */
        .slide-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 2.5px;
          background: linear-gradient(90deg, var(--color-cta-orange, #f97316), #fbbf24);
          z-index: 20;
          border-radius: 0 2px 0 0;
          animation: progressBar 5.5s linear forwards;
        }
        @keyframes progressBar { from { width: 0; } to { width: 100%; } }

        /* nav dots */
        .slide-dots {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dot {
          border: none;
          cursor: pointer;
          border-radius: 999px;
          background: rgba(255,255,255,0.45);
          height: 6px;
          transition: all 0.35s cubic-bezier(.4,0,.2,1);
          padding: 0;
        }
        .dot.active {
          width: 36px;
          background: var(--color-cta-orange, #f97316);
          box-shadow: 0 0 10px rgba(249,115,22,0.6);
        }
        .dot:not(.active) { width: 6px; }
        .dot:not(.active):hover { background: rgba(255,255,255,0.75); width: 12px; }

        /* arrow buttons */
        .slide-arrows {
          position: absolute;
          bottom: 1.25rem;
          right: 2rem;
          z-index: 20;
          display: flex;
          gap: 0.5rem;
        }

        .arrow-btn {
          width: 42px; height: 42px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(8px);
          color: white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .arrow-btn:hover {
          background: rgba(249,115,22,0.7);
          border-color: transparent;
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(249,115,22,0.4);
        }

        /* corner badge top-right */
        .corner-badge {
          position: absolute;
          top: 1.25rem; right: 1.5rem;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 999px;
          padding: 0.3rem 0.75rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.85);
          text-transform: uppercase;
        }
        .corner-badge.sponsored { color: #fbbf24; border-color: rgba(251,191,36,0.35); }

        /* search float up */
        .search-wrapper {
          position: relative;
          z-index: 30;
          margin: 0 auto;
          margin-top: -4.5rem;
          width: 92%;
          max-width: 900px;
        }

        /* slide number */
        .slide-counter {
          position: absolute;
          top: 50%;
          right: 2.5rem;
          transform: translateY(-50%);
          z-index: 20;
          writing-mode: vertical-rl;
          font-family: 'Playfair Display', serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .slide-counter-active { color: white; font-size: 1rem; }
        .slide-counter-line { width: 1px; height: 48px; background: rgba(255,255,255,0.2); }

        @media (max-width: 640px) {
          .hero-stats { gap: 0; }
          .stat-item { padding-right: 1rem; margin-right: 1rem; }
          .stat-value { font-size: 1.25rem; }
          .slide-counter { display: none; }
          .hero-inner { padding: 0 1.25rem; }
          .hero-heading { font-size: clamp(2rem, 10vw, 2.8rem); }
        }
      `}</style>

      <section className="hero-root" ref={heroRef} onMouseMove={handleMouseMove}>
        {/* ── main image viewport ── */}
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', height: 'clamp(480px, 52vw, 580px)' }}>

          {/* top accent bar */}
          <div className="hero-topbar" />

          {/* slide images */}
          {heroSlides.map((slide, i) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              className={`slide-img ${i === safeIndex ? 'active' : i === prevIndex ? 'exiting' : 'waiting'}`}
              style={{
                '--px': px,
                '--py': py,
                ...(i === safeIndex ? { transform: `scale(1.06) translate(${px * 0.4}px, ${py * 0.4}px)` } : {})
              }}
            />
          ))}

          {/* overlays */}
          <div className="hero-overlay-cinema" />
          <div className="hero-overlay-vignette" />
          <div className="hero-overlay-grain" />
          <div className="hero-scanlines" />

          {/* particles */}
          {PARTICLES.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                '--dur': `${p.dur}s`,
                '--delay': `${p.delay}s`
              }}
            />
          ))}

          {/* slide counter vertical */}
          <div className="slide-counter">
            <span className="slide-counter-active">0{safeIndex + 1}</span>
            <div className="slide-counter-line" />
            <span>0{heroSlides.length}</span>
          </div>

          {/* corner badge */}
          <div className={`corner-badge ${!activeSlide.isBrandSlide ? 'sponsored' : ''}`}>
            {!activeSlide.isBrandSlide ? (
              <>
                <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#fbbf24"/></svg>
                Sponsored
              </>
            ) : (
              <>
                <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#3b82f6"/></svg>
                CityPloter
              </>
            )}
          </div>

          {/* ── hero content ── */}
          <div className="hero-content">
            <div className="hero-inner">
              <div style={{ maxWidth: 580 }}>

                {/* badge */}
                <div className="hero-badge">
                  <div className="hero-badge-dot" />
                  {activeSlide.badge}
                </div>

                {/* heading */}
                <h1 className="hero-heading">
                  {activeSlide.isBrandSlide ? (
                    <>
                      <span className="hero-heading-line2">
                        {typedText.includes(' ') ? typedText.substring(0, typedText.lastIndexOf(' ', 14)) : typedText}
                      </span>
                      <span className="hero-heading-accent">
                        {typedText.length > 14 ? typedText.substring(typedText.lastIndexOf(' ', 14) + 1) : ''}
                        <span className="cursor-blink" />
                      </span>
                    </>
                  ) : (
                    <>
                      {activeSlide.title.split('\n').map((line, i) => (
                        <span key={i} className={i === 0 ? 'hero-heading-line2' : 'hero-heading-accent'} style={{ display: 'block' }}>
                          {line}
                        </span>
                      ))}
                    </>
                  )}
                </h1>

                {/* divider */}
                <div className="hero-divider" />

                {/* subtitle */}
                <p className="hero-subtitle">{activeSlide.subtitle}</p>

              </div>
            </div>
          </div>

          {/* slide progress bar */}
          <div key={`${safeIndex}-prog`} className="slide-progress" />

          {/* dot indicators */}
          <div className="slide-dots">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goTo(index)}
                className={`dot ${safeIndex === index ? 'active' : ''}`}
              />
            ))}
          </div>

          {/* arrow controls */}
          <div className="slide-arrows">
            <button type="button" onClick={goToPrev} aria-label="Previous slide" className="arrow-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button type="button" onClick={goToNext} aria-label="Next slide" className="arrow-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── floating search bar ── */}
        <div className="search-wrapper">
          <SearchBar onSearch={onSearch} />
        </div>
      </section>
    </>
  )
}

export default Hero