import PropertyCarouselSection from './PropertyCarouselSection'

const properties = [
  {
    id: 201,
    title: '3 BHK Furnished Apartment, 3 Baths',
    location: 'Balewadi High Street, Pune',
    price: 'Rs 98 L',
    postedBy: 'Agent',
    time: '4 days ago',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 202,
    title: '2 BHK Ready Flat, 2 Baths',
    location: 'Near Viman Nagar Junction, Pune',
    price: 'Rs 64 L',
    postedBy: 'Owner',
    time: '2 weeks ago',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 203,
    title: '4 BHK Duplex with Terrace',
    location: 'Koregaon Park Annexe, Pune',
    price: 'Rs 1.95 Cr',
    postedBy: 'Builder',
    time: '3 days ago',
    image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 204,
    title: '2 BHK Society Apartment, 2 Baths',
    location: 'Pimple Saudagar, Pune',
    price: 'Rs 72 L',
    postedBy: 'Agent',
    time: '6 days ago',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
  },
]

const ReadyToMoveSection = () => {
  return (
    <PropertyCarouselSection
      title="Ready to Move-In Properties"
      subtitle="Skip waiting period and shift faster"
      filters={['Immediate Possession', 'Furnished', 'Gated Society']}
      properties={properties}
    />
  )
}

export default ReadyToMoveSection
