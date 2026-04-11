import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'

const Hero = ({ onSearch }) => {
  return (
    <section className="relative">
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(430px, 48vw, 500px)' }}>
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
          alt="Modern city skyline with residential buildings"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.5) 55%, rgba(0, 0, 0, 0.4) 100%)' }} />

        <div className="absolute inset-0 mx-auto flex h-full max-w-7xl items-center px-4 lg:px-8">
          <div className="max-w-2xl text-white">
            <h1 className="js-hero-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Find Your Perfect Property
            </h1>
            <p className="js-hero-subheading mt-3 text-sm text-white/90 sm:text-base">
              Buy, rent, or list properties across India with confidence on CityPloter.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/post-property"
                className="inline-flex items-center justify-center rounded-full bg-(--color-cta-orange) px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:brightness-95"
              >
                Post Property
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition duration-200 hover:bg-white/20"
              >
                Login / Signup
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-16 w-[92%] max-w-5xl sm:-mt-20">
        <SearchBar onSearch={onSearch} />
      </div>
    </section>
  )
}

export default Hero
