import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DesktopEntry from './DesktopEntry'
import DesktopShell from './DesktopShell'
import DesktopHome from './DesktopHome'
import DesktopVaults from './DesktopVaults'
import ComingSoon from '../components/ComingSoon'
import DesktopSettings from './DesktopSettings'
import DesktopVaultDetail from './DesktopVaultDetail'
import Notifications from '../components/Notifications'
import SubPage from '../components/SubPage'
import TransferSheet from '../components/TransferSheet'
import type { Vault } from '../data'

type Screen = 'entry' | 'app' | 'vault' | 'notifications' | 'sub'
type Tab = 'home' | 'vaults' | 'swap' | 'settings'

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function DesktopApp() {
  const [screen, setScreen] = useState<Screen>('entry')
  const [tab, setTab] = useState<Tab>('home')
  const [vault, setVault] = useState<Vault | null>(null)
  const [transfer, setTransfer] = useState<'deposit' | 'withdraw' | null>(null)
  const [sub, setSub] = useState('')

  const openVault = (v: Vault) => {
    setVault(v)
    setScreen('vault')
  }

  const openSub = (id: string) => {
    setSub(id)
    setScreen('sub')
  }

  if (screen === 'entry') return <DesktopEntry onDone={() => setScreen('app')} />

  return (
    <DesktopShell
      tab={screen === 'app' ? tab : ''}
      onTab={(id) => {
        setTab(id as Tab)
        setScreen('app')
      }}
      onNotifications={() => setScreen('notifications')}
      onDisconnect={() => {
        setTab('home')
        setScreen('entry')
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={screen === 'app' ? tab : screen === 'sub' ? `sub-${sub}` : screen}
          {...fade}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {screen === 'app' && tab === 'home' && (
            <DesktopHome
              onOpenVault={openVault}
              onTransfer={setTransfer}
              onActivity={() => openSub('activity')}
              onSeeAllVaults={() => setTab('vaults')}
            />
          )}
          {screen === 'app' && tab === 'vaults' && <DesktopVaults onOpenVault={openVault} />}
          {screen === 'app' && tab === 'swap' && <ComingSoon />}
          {screen === 'app' && tab === 'settings' && <DesktopSettings onOpen={openSub} />}
          {screen === 'vault' && vault && (
            <DesktopVaultDetail vault={vault} onBack={() => setScreen('app')} />
          )}
          {screen === 'notifications' && (
            <div className="mx-auto flex min-h-0 w-full max-w-[760px] flex-1 flex-col px-12">
              <Notifications onBack={() => setScreen('app')} />
            </div>
          )}
          {screen === 'sub' && (
            <div className="mx-auto flex min-h-0 w-full max-w-[760px] flex-1 flex-col px-12">
              <SubPage id={sub} onBack={() => setScreen('app')} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {transfer && (
          <TransferSheet mode={transfer} variant="modal" onClose={() => setTransfer(null)} />
        )}
      </AnimatePresence>
    </DesktopShell>
  )
}
