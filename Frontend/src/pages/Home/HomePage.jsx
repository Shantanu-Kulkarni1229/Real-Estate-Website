import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ApprovedPropertiesSection from './components/sections/ApprovedPropertiesSection'
import StartupShowcaseSection from './components/sections/StartupShowcaseSection'
import TestimonialsSection from './components/sections/TestimonialsSection'
import Footer from './components/Footer'
import { useState } from 'react'

const HomePage = () => {
  const [searchFilters, setSearchFilters] = useState({})

  return (
    <div className="min-h-screen bg-(--color-surface)">
      <Navbar />
      <Hero onSearch={setSearchFilters} />
      <ApprovedPropertiesSection filters={searchFilters} />
      <TestimonialsSection />
      <StartupShowcaseSection />
      <Footer />
    </div>
  )
}

export default HomePage
