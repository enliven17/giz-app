import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Faq from './components/Faq'
import Closing from './components/Closing'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </>
  )
}
