import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ApprovedPropertiesSection from './components/sections/ApprovedPropertiesSection'
import { useState } from 'react'

const HomePage = () => {
  const [searchFilters, setSearchFilters] = useState({})

  return (
    <div className="min-h-screen bg-(--color-surface)">
      <Navbar />
      <Hero onSearch={setSearchFilters} />
      <ApprovedPropertiesSection filters={searchFilters} />
    </div>
  )
}

export default HomePage
