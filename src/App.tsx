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
import BottomNav from './components/BottomNav'
import type { Vault } from './data'

type Screen = 'onboard' | 'auth' | 'app' | 'vault'
type Tab = 'home' | 'vaults' | 'swap' | 'settings'

const slide = {
  initial: { opacity: 0, x: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -24, filter: 'blur(6px)' },
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboard')
  const [tab, setTab] = useState<Tab>('home')
  const [vault, setVault] = useState<Vault | null>(null)
  const [trade, setTrade] = useState<'buy' | 'sell' | null>(null)

  const openVault = (v: Vault) => {
    setVault(v)
    setScreen('vault')
  }

  // ponytail: vault ekraninda alt aksiyon bari var, nav gizleniyor
  const showNav = screen === 'app'

  return (
    <Shell>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen === 'app' ? tab : screen}
          {...slide}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {screen === 'onboard' && <Onboarding onStart={() => setScreen('auth')} />}
          {screen === 'auth' && <Auth onBack={() => setScreen('onboard')} onDone={() => setScreen('app')} />}
          {screen === 'app' && tab === 'home' && <Home onOpenVault={openVault} />}
          {screen === 'app' && tab === 'vaults' && <Vaults onOpenVault={openVault} />}
          {screen === 'app' && tab === 'swap' && <Exchange />}
          {screen === 'app' && tab === 'settings' && (
            <Settings
              onDisconnect={() => {
                setTab('home')
                setScreen('onboard')
              }}
            />
          )}
          {screen === 'vault' && vault && (
            <VaultDetail vault={vault} onBack={() => setScreen('app')} onTrade={setTrade} />
          )}
        </motion.div>
      </AnimatePresence>

      {showNav && <BottomNav active={tab} onChange={(id) => setTab(id as Tab)} />}

      <AnimatePresence>
        {trade && vault && <SwapSheet vault={vault} side={trade} onClose={() => setTrade(null)} />}
      </AnimatePresence>
    </Shell>
  )
}
