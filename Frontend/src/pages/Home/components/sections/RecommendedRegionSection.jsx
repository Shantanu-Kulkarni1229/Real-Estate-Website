import PropertyCarouselSection from './PropertyCarouselSection'

const properties = [
  {
    id: 1,
    title: '2 BHK Apartment, 2 Baths',
    location: 'In Pranav Kastur Kunj, Beed Bypass',
    price: 'Rs 34 L',
    postedBy: 'Owner',
    time: '7 months ago',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: '3 BHK Premium Flat, 3 Baths',
    location: 'Near Magarpatta City, Hadapsar',
    price: 'Rs 78 L',
    postedBy: 'Agent',
    time: '2 months ago',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: '1 BHK Studio Apartment',
    location: 'Kharadi IT Park Road, Pune',
    price: 'Rs 29 L',
    postedBy: 'Builder',
    time: '12 days ago',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    title: 'Villa with Garden, 4 Baths',
    location: 'Baner Hills, Pune',
    price: 'Rs 1.45 Cr',
    postedBy: 'Owner',
    time: '1 month ago',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    title: '2 BHK Furnished Home, 2 Baths',
    location: 'Wakad Main Road, Pune',
    price: 'Rs 56 L',
    postedBy: 'Agent',
    time: '3 weeks ago',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
  },
]

const RecommendedRegionSection = () => {
  return (
    <PropertyCarouselSection
      title="Recommended Properties in Your Region"
      subtitle="Curated especially for you"
      filters={['Near You', 'Top Rated', 'Owner Verified']}
      properties={properties}
    />
  )
}

export default RecommendedRegionSection
