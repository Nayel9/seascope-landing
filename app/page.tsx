import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Personalization } from '@/components/sections/Personalization'
import { Trust } from '@/components/sections/Trust'
import { FAQ } from '@/components/sections/FAQ'
import { BetaForm } from '@/components/sections/BetaForm'
import { FeedbackLoop } from '@/components/sections/FeedbackLoop'
import { FeedbackForm } from '@/components/sections/FeedbackForm'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Personalization />
        <Trust />
        <FAQ />
        <BetaForm />
        <FeedbackLoop />
        <FeedbackForm />
      </main>
      <Footer />
    </>
  )
}
