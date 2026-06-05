import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'

export default function BetaShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="py-16 md:py-24">
        <div className="container-narrow max-w-[600px]">{children}</div>
      </main>
      <Footer />
    </>
  )
}
