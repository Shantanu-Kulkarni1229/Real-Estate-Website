import PropertyCarouselSection from './PropertyCarouselSection'

const properties = [
  {
    id: 101,
    title: '2 BHK Compact Home, 2 Baths',
    location: 'Near Satara Road, Pune',
    price: 'Rs 42 L',
    postedBy: 'Owner',
    time: '5 days ago',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 102,
    title: '1 BHK Starter Apartment',
    location: 'Kondhwa Main Road, Pune',
    price: 'Rs 28 L',
    postedBy: 'Agent',
    time: '1 week ago',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 103,
    title: '2 BHK Semi-Furnished Flat',
    location: 'In Lohegaon, Pune',
    price: 'Rs 47 L',
    postedBy: 'Builder',
    time: '3 weeks ago',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 104,
    title: '1 RK Studio for Investment',
    location: 'Hinjewadi Phase 1, Pune',
    price: 'Rs 24 L',
    postedBy: 'Owner',
    time: '10 days ago',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
  },
]

const BudgetFriendlySection = () => {
  return (
    <PropertyCarouselSection
      title="Best Budget-Friendly Homes"
      subtitle="Value picks under smart budget ranges"
      filters={['Under Rs 50 L', '2 BHK', 'Low Maintenance']}
      properties={properties}
    />
  )
}

export default BudgetFriendlySection
