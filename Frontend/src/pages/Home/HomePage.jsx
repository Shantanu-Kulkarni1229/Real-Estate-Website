import Navbar from './components/Navbar'
import Hero from './components/Hero'
import RecommendedProperties from './components/RecommendedProperties'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-(--color-surface)">
      <Navbar />
      <Hero />
      <RecommendedProperties />
    </div>
  )
}

export default HomePage
