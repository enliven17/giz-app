import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Shell from './components/Shell'
import Onboarding from './components/Onboarding'
import Auth from './components/Auth'
import Home from './components/Home'
import Vaults from './components/Vaults'
import Exchange from './components/Exchange'
import Settings from './components/Settings'
import VaultDetail from './components/VaultDetail'
import SwapSheet from './components/SwapSheet'
import TransferSheet from './components/TransferSheet'
import Notifications from './components/Notifications'
import SubPage from './components/SubPage'
import BottomNav from './components/BottomNav'
import type { Vault } from './data'
import useIsDesktop from './useIsDesktop'
import DesktopApp from './desktop/DesktopApp'

type Screen = 'onboard' | 'auth' | 'app' | 'vault' | 'notifications' | 'sub'
type Tab = 'home' | 'vaults' | 'swap' | 'settings'

const slide = {
  initial: { opacity: 0, x: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -24, filter: 'blur(6px)' },
}

export default function App() {
  const isDesktop = useIsDesktop()
  const [screen, setScreen] = useState<Screen>('onboard')
  const [tab, setTab] = useState<Tab>('home')
  const [vault, setVault] = useState<Vault | null>(null)
  const [trade, setTrade] = useState<'buy' | 'sell' | null>(null)
  const [transfer, setTransfer] = useState<'deposit' | 'withdraw' | null>(null)
  const [sub, setSub] = useState('')

  const openSub = (id: string) => {
    setSub(id)
    setScreen('sub')
  }

  const openVault = (v: Vault) => {
    setVault(v)
    setScreen('vault')
  }

  // ponytail: vault ekraninda alt aksiyon bari var, nav gizleniyor
  const showNav = screen === 'app'

  if (isDesktop) return <DesktopApp />

  return (
    <Shell>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen === 'app' ? tab : screen === 'sub' ? `sub-${sub}` : screen}
          {...slide}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {screen === 'onboard' && <Onboarding onStart={() => setScreen('auth')} />}
          {screen === 'auth' && <Auth onBack={() => setScreen('onboard')} onDone={() => setScreen('app')} />}
          {screen === 'app' && tab === 'home' && (
            <Home
              onOpenVault={openVault}
              onNotifications={() => setScreen('notifications')}
              onSeeAllVaults={() => setTab('vaults')}
              onTransfer={setTransfer}
              onActivity={() => openSub('activity')}
            />
          )}
          {screen === 'app' && tab === 'vaults' && <Vaults onOpenVault={openVault} />}
          {screen === 'app' && tab === 'swap' && <Exchange />}
          {screen === 'app' && tab === 'settings' && (
            <Settings
              onOpen={openSub}
              onDisconnect={() => {
                setTab('home')
                setScreen('onboard')
              }}
            />
          )}
          {screen === 'notifications' && <Notifications onBack={() => setScreen('app')} />}
          {screen === 'sub' && <SubPage id={sub} onBack={() => setScreen('app')} />}
          {screen === 'vault' && vault && (
            <VaultDetail vault={vault} onBack={() => setScreen('app')} onTrade={setTrade} />
          )}
        </motion.div>
      </AnimatePresence>

      {showNav && <BottomNav active={tab} onChange={(id) => setTab(id as Tab)} />}

      <AnimatePresence>
        {trade && vault && <SwapSheet vault={vault} side={trade} onClose={() => setTrade(null)} />}
        {transfer && <TransferSheet mode={transfer} onClose={() => setTransfer(null)} />}
      </AnimatePresence>
    </Shell>
  )
}
