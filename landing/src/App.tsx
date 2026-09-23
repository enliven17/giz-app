import Nav from './components/Nav'
import Hero from './components/Hero'
import { MoneyJourney, InvestmentJourney } from './components/Journey'
import Portfolio from './components/Portfolio'
import Strategies from './components/Strategies'
import Faq from './components/Faq'
import Closing from './components/Closing'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <MoneyJourney />
        <InvestmentJourney />
        <Portfolio />
        <Strategies />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </>
  )
}
