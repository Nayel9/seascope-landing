import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { Decide } from '@/components/sections/Decide'
import { Prepare } from '@/components/sections/Prepare'
import { Explore } from '@/components/sections/Explore'
import { Navigate } from '@/components/sections/Navigate'
import { Security } from '@/components/sections/Security'
import { Comparison } from '@/components/sections/Comparison'
import { Pricing } from '@/components/sections/Pricing'
import { Story } from '@/components/sections/Story'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCta } from '@/components/sections/FinalCta'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Decide />
        <Prepare />
        <Explore />
        <Navigate />
        <Security />
        <Comparison />
        <Pricing />
        <Story />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
