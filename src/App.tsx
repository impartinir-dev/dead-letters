import { useCallback, useEffect, useState } from 'react'
import Home from './components/Home'
import CaseBrowser from './components/CaseBrowser'
import CaseScreen from './components/CaseScreen'
import HelpModal from './components/HelpModal'
import { dailyCaseId } from './lib/daily'

type Route =
  | { name: 'home' }
  | { name: 'cases'; vol: number }
  | { name: 'case'; id: number }
  | { name: 'help' }

function parseHash(): Route {
  const h = location.hash.replace(/^#/, '') || '/'
  const [path, query] = h.split('?')
  if (path === '/cases') {
    const v = Number(new URLSearchParams(query ?? '').get('v') ?? 1)
    return { name: 'cases', vol: v >= 1 && v <= 3 ? v : 1 }
  }
  const m = path.match(/^\/case\/(\d+)$/)
  if (m) {
    const id = Math.min(150, Math.max(1, Number(m[1])))
    return { name: 'case', id }
  }
  if (path === '/daily') return { name: 'case', id: dailyCaseId() }
  if (path === '/help') return { name: 'help' }
  return { name: 'home' }
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const nav = useCallback((h: string) => {
    if (location.hash === h) setRoute(parseHash())
    else location.hash = h
  }, [])

  switch (route.name) {
    case 'cases':
      return <CaseBrowser nav={nav} initialVol={route.vol} />
    case 'case':
      return <CaseScreen key={route.id} id={route.id} nav={nav} />
    case 'help':
      return <HelpModal nav={nav} />
    default:
      return <Home nav={nav} />
  }
}
