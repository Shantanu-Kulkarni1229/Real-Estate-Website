/**
 * Seed Dummy Testimonials
 * Generates sample reviews for testing the testimonials section
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Testimonial = require('../models/Testimonial.model');

const DUMMY_REVIEWS = [
  {
    displayName: 'Rajesh Kumar',
    role: 'buyer',
    city: 'Mumbai',
    rating: 5,
    reviewText: 'CityPloter made finding my dream home so easy! The interface is intuitive and the verified listings gave me confidence. Highly recommended!'
  },
  {
    displayName: 'Priya Sharma',
    role: 'seller',
    city: 'Bangalore',
    rating: 5,
    reviewText: 'Sold my property in just 3 weeks through CityPloter. The leads were quality and the platform made the entire process smooth.'
  },
  {
    displayName: 'Anil Patel',
    role: 'renter',
    city: 'Pune',
    rating: 4,
    reviewText: 'Great experience finding a rental! The filters are super helpful and I found multiple options matching my budget perfectly.'
  },
  {
    displayName: 'Sneha Gupta',
    role: 'buyer',
    city: 'Delhi',
    rating: 5,
    reviewText: 'As a first-time home buyer, CityPloter was my trusted guide. All property details were accurate and verified!'
  },
  {
    displayName: 'Vikram Singh',
    role: 'seller',
    city: 'Hyderabad',
    rating: 4,
    reviewText: 'Professional platform with genuine buyers. The response rate from interested parties was amazing!'
  },
  {
    displayName: 'Deepa Menon',
    role: 'buyer',
    city: 'Kochi',
    rating: 5,
    reviewText: 'Found my perfect apartment on CityPloter! The support team was very helpful throughout the process.'
  },
  {
    displayName: 'Rohan Desai',
    role: 'renter',
    city: 'Ahmedabad',
    rating: 5,
    reviewText: 'Best rental platform I have used. Clear listings, authentic owners, and zero hassle experience!'
  },
  {
    displayName: 'Ananya Bhat',
    role: 'buyer',
    city: 'Jaipur',
    rating: 4,
    reviewText: 'Loved the virtual tours feature! Made it easy to explore properties before scheduling visits.'
  },
  {
    displayName: 'Nikhil Verma',
    role: 'seller',
    city: 'Chennai',
    rating: 5,
    reviewText: 'Outstanding service! Got serious enquiries immediately after posting. Very impressed with CityPloter!'
  },
  {
    displayName: 'Shreya Chatterjee',
    role: 'buyer',
    city: 'Kolkata',
    rating: 5,
    reviewText: 'The platform is so user-friendly! Found my ideal home within my budget. Highly satisfied!'
  },
  {
    displayName: 'Arjun Nair',
    role: 'renter',
    city: 'Thrissur',
    rating: 4,
    reviewText: 'Great collection of rental properties. The verification process gives confidence in authenticity.'
  },
  {
    displayName: 'Pooja Sinha',
    role: 'seller',
    city: 'Lucknow',
    rating: 5,
    reviewText: 'CityPloter truly transformed my property selling experience. Quick, efficient, and professional!'
  },
  {
    displayName: 'Harshit Malhotra',
    role: 'buyer',
    city: 'Chandigarh',
    rating: 5,
    reviewText: 'Excellent platform! Got connected with the perfect property within days of searching.'
  },
  {
    displayName: 'Neha Kapoor',
    role: 'buyer',
    city: 'Indore',
    rating: 4,
    reviewText: 'Very helpful filters and accurate property information. Makes house hunting so much easier!'
  },
  {
    displayName: 'Sameer Khan',
    role: 'seller',
    city: 'Surat',
    rating: 5,
    reviewText: 'Best decision to list on CityPloter! Got fantastic response from buyers immediately.'
  },
  {
    displayName: 'Tanya Mahajan',
    role: 'renter',
    city: 'Nagpur',
    rating: 5,
    reviewText: 'Found my perfect PG setup through CityPloter! The booking process was seamless and secure.'
  }
];

async function seedDummyTestimonials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');

    // Check if testimonials already exist
    const count = await Testimonial.countDocuments();
    if (count > 0) {
      console.log(`ℹ Database already has ${count} testimonials. Skipping seed.`);
      process.exit(0);
    }

    // Create dummy testimonials without userId (for demo purposes)
    const dummyTestimonials = DUMMY_REVIEWS.map((review) => ({
      ...review,
      isActive: true
    }));

    const created = await Testimonial.insertMany(dummyTestimonials);
    console.log(`✓ Seeded ${created.length} dummy testimonials`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding testimonials:', error.message);
    process.exit(1);
  }
}

seedDummyTestimonials();
