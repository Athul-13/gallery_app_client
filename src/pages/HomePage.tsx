import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiPhotograph, HiLockClosed, HiServer } from 'react-icons/hi'
import { HiArrowRight, HiPlay } from 'react-icons/hi'
import { ROUTES } from '@/constants'
import { useAuthStore } from '@/store'

interface PolaroidPosition {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

interface PolaroidImage {
  id: number
  src: string
  rotation: number
  position: PolaroidPosition
  delay: string
}

const polaroidImages: PolaroidImage[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=300&h=400&fit=crop',
    rotation: -12,
    position: { top: '10%', left: '5%' },
    delay: 'floating',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
    rotation: 8,
    position: { top: '15%', right: '8%' },
    delay: 'floating-delayed',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=400&fit=crop',
    rotation: -6,
    position: { bottom: '20%', left: '10%' },
    delay: 'floating-slow',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&h=400&fit=crop',
    rotation: 15,
    position: { bottom: '15%', right: '5%' },
    delay: 'floating',
  },
]

const features = [
  {
    icon: <HiPhotograph className="w-6 h-6" />,
    title: 'Unlimited Uploads',
    description: 'Store all your precious moments without limits',
  },
  {
    icon: <HiServer className="w-6 h-6" />,
    title: 'Smart Albums',
    description: 'Organize with AI-powered auto-categorization',
  },
  {
    icon: <HiLockClosed className="w-6 h-6" />,
    title: 'Private & Secure',
    description: 'Your memories are encrypted and protected',
  },
]

export const HomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-white/5 via-white/3 to-white/5 pointer-events-none z-0" />

      {/* Ambient glow effects */}
      <div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none bg-blue-500/30"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none bg-blue-500/30"
        style={{
          transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
        }}
      />

      {/* Floating Polaroids */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {polaroidImages.map((polaroid) => (
          <div
            key={polaroid.id}
            className={`polaroid absolute w-32 md:w-44 pointer-events-auto cursor-pointer ${polaroid.delay}`}
            style={{
              top: polaroid.position.top,
              bottom: polaroid.position.bottom,
              left: polaroid.position.left,
              right: polaroid.position.right,
              transform: `rotate(${polaroid.rotation}deg)`,
            }}
          >
            <img
              src={polaroid.src}
              alt="Memory"
              className="w-full aspect-[3/4] object-cover rounded-sm"
            />
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-xs text-white/60 font-medium tracking-wide">
                Memory #{polaroid.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-6">
          <div className="flex items-center gap-2 animate-fade-up">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <HiPhotograph className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">Memoir</span>
          </div>

          <div className="hidden md:flex items-center gap-8 animate-fade-up">
            <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm text-white/70 hover:text-white transition-colors">
              About
            </a>
            <a href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-4 animate-fade-up">
            {isAuthenticated ? (
              <Link
                to={ROUTES.DASHBOARD}
                className="glass-button text-sm !px-5 !py-2.5"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm text-white/70 hover:text-white transition-colors hidden md:block"
                >
                  Sign In
                </Link>
                <Link to={ROUTES.REGISTER} className="glass-button text-sm !px-5 !py-2.5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm text-white/70">Your personal photo sanctuary</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] animate-fade-up-delay-1 text-white">
              Where Every
              <br />
              <span className="text-gradient-gold">Memory</span> Lives
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-up-delay-2">
              A beautiful, private space to store, organize, and relive your most treasured moments.
              Your photos, your story, forever preserved.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-up-delay-3">
              {isAuthenticated ? (
                <Link to={ROUTES.DASHBOARD} className="glass-button text-base">
                  Go to Dashboard
                  <HiArrowRight className="inline-block ml-2 w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to={ROUTES.REGISTER} className="glass-button text-base">
                    Start Your Album
                    <HiArrowRight className="inline-block ml-2 w-4 h-4" />
                  </Link>
                  <button className="glass-button-outline text-base">
                    Watch Demo
                    <HiPlay className="inline-block ml-2 w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-16 pt-12 animate-fade-up-delay-3">
              {[
                { value: '10M+', label: 'Photos Stored' },
                { value: '50K+', label: 'Happy Users' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gradient-gold">{stat.value}</div>
                  <div className="text-sm text-white/70 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section id="features" className="px-6 md:px-12 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Crafted for Your Memories
              </h2>
              <p className="text-white/70 max-w-xl mx-auto">
                Every feature designed with care to make preserving your moments effortless.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="glass-card p-8 group hover:border-white/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 md:px-12 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card p-12 md:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                  Ready to Preserve
                  <br />
                  Your Memories?
                </h2>
                <p className="text-white/70 max-w-lg mx-auto mb-8">
                  Join thousands who trust Memoir to keep their precious photos safe and beautifully
                  organized.
                </p>
                {isAuthenticated ? (
                  <Link to={ROUTES.DASHBOARD} className="glass-button text-lg">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to={ROUTES.REGISTER} className="glass-button text-lg">
                      Create Free Account
                    </Link>
                    <p className="text-sm text-white/70 mt-4">No credit card required</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-8 border-t border-white/10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <HiPhotograph className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Memoir</span>
            </div>
            <div className="text-sm text-white/70">© 2025 Memoir. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
