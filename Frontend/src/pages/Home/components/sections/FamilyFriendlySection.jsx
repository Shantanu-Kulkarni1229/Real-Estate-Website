import PropertyCarouselSection from './PropertyCarouselSection'

const properties = [
  {
    id: 301,
    title: '3 BHK Family Apartment, 2 Baths',
    location: 'Aundh ITI Road, Pune',
    price: 'Rs 1.08 Cr',
    postedBy: 'Owner',
    time: '9 days ago',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 302,
    title: '2 BHK Garden Facing Flat',
    location: 'NIBM Road, Pune',
    price: 'Rs 68 L',
    postedBy: 'Agent',
    time: '2 days ago',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 303,
    title: '3 BHK Spacious Home, 3 Baths',
    location: 'Kalyani Nagar, Pune',
    price: 'Rs 1.36 Cr',
    postedBy: 'Builder',
    time: '1 week ago',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 304,
    title: '2 BHK Corner Flat with Balcony',
    location: 'Bibwewadi, Pune',
    price: 'Rs 62 L',
    postedBy: 'Owner',
    time: '4 weeks ago',
    image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80',
  },
]

const FamilyFriendlySection = () => {
  return (
    <PropertyCarouselSection
      title="Family-Friendly Locality Picks"
      subtitle="Homes close to schools, parks, and daily essentials"
      filters={['Near Schools', 'Low Traffic', '2-3 BHK']}
      properties={properties}
    />
  )
}

export default FamilyFriendlySection
