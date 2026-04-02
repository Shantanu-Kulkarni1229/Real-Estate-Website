import SearchBar from './SearchBar'

const Hero = () => {
  return (
    <section className="relative">
      <div className="relative h-[430px] w-full overflow-hidden sm:h-[500px]">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
          alt="Modern city skyline with residential buildings"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/40" />

        <div className="absolute inset-0 mx-auto flex h-full max-w-7xl items-center px-4 lg:px-8">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Find Your Perfect Property
            </h1>
            <p className="mt-3 text-sm text-white/90 sm:text-base">
              Buy, rent, or list properties across India with confidence on CityPloter.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-16 w-[92%] max-w-5xl sm:-mt-20">
        <SearchBar />
      </div>
    </section>
  )
}

export default Hero
