import gsap from 'gsap'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/** Smooth scrolling, driven by the gsap ticker so both share one rAF loop. */
export function startSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const lenis = new Lenis({ duration: 1.05, smoothWheel: true })

  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // anchor links keep working
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null
    const id = link?.getAttribute('href')
    if (!id || id === '#') return
    const target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    lenis.scrollTo(target as HTMLElement, { offset: -100 })
  })
}
