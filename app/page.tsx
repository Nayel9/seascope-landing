import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Trust } from '@/components/sections/Trust'
import { FeedbackLoop } from '@/components/sections/FeedbackLoop'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Trust />
        <FeedbackLoop />
      </main>
      <Footer />
    </>
  )
}
