/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Property = require('../models/Property.model');

const METRO_CITIES = [
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    pincodes: ['400001', '400050', '400053', '400070', '400076'],
    localities: ['Bandra', 'Andheri West', 'Powai', 'Worli', 'Lower Parel'],
    landmarks: ['Near Metro Station', 'Near BKC', 'Near IT Park', 'Near Sea Link', 'Near Phoenix Mall']
  },
  {
    city: 'Delhi',
    state: 'Delhi',
    pincodes: ['110001', '110017', '110024', '110048', '110070'],
    localities: ['Connaught Place', 'Saket', 'Lajpat Nagar', 'Greater Kailash', 'Vasant Kunj'],
    landmarks: ['Near Metro Hub', 'Near Select Citywalk', 'Near Ring Road', 'Near M Block Market', 'Near Airport Road']
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    pincodes: ['560001', '560034', '560066', '560076', '560100'],
    localities: ['MG Road', 'Koramangala', 'Whitefield', 'JP Nagar', 'Electronic City'],
    landmarks: ['Near CBD', 'Near Forum Mall', 'Near Tech Park', 'Near Metro Junction', 'Near Elevated Expressway']
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    pincodes: ['500001', '500032', '500081', '500084', '500089'],
    localities: ['Banjara Hills', 'Gachibowli', 'Hitech City', 'Kondapur', 'Madhapur'],
    landmarks: ['Near Jubilee Checkpost', 'Near Financial District', 'Near IT Corridor', 'Near Botanical Garden', 'Near Metro Bridge']
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincodes: ['600001', '600028', '600040', '600096', '600119'],
    localities: ['T Nagar', 'Adyar', 'Anna Nagar', 'Perungudi', 'Sholinganallur'],
    landmarks: ['Near Railway Station', 'Near OMR', 'Near Metro Terminal', 'Near IT Expressway', 'Near ECR Junction']
  },
  {
    city: 'Kolkata',
    state: 'West Bengal',
    pincodes: ['700001', '700017', '700032', '700091', '700156'],
    localities: ['Park Street', 'Ballygunge', 'Salt Lake', 'New Town', 'Rajarhat'],
    landmarks: ['Near Business District', 'Near South City Mall', 'Near Sector V', 'Near Eco Park', 'Near Airport Link']
  },
  {
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincodes: ['431001', '431002', '431003', '431005', '431009'],
    localities: ['CIDCO', 'Jalna Road', 'Osmanpura', 'Nirala Bazar', 'Garkheda'],
    landmarks: ['Near Prozone Mall', 'Near Airport Road', 'Near Railway Station', 'Near Kranti Chowk', 'Near Beed Bypass']
  }
];

const METRO_PROPERTY_BLUEPRINTS = [
  {
    propertyType: 'Residential',
    titlePrefix: 'Premium Residential Apartment',
    description: 'Well-ventilated 2BHK with modern amenities and quick access to transit and shopping.',
    listingType: 'sell',
    basePrice: 9200000,
    amenities: ['gym', 'pool', 'security', 'parking'],
    specifications: {
      residential: {
        bhk: 2,
        bathrooms: 2,
        balconies: 1,
        superBuiltUpArea: 1220,
        carpetArea: 890,
        furnishing: 'semi-furnished',
        floorNumber: 8,
        totalFloors: 18,
        propertyAge: 3,
        facing: 'east',
        parking: { available: true, type: 'covered' }
      }
    }
  },
  {
    propertyType: 'House/Villa',
    titlePrefix: 'Luxury 4BHK Villa',
    description: 'Independent villa with premium interiors, private lawn, and covered parking.',
    listingType: 'sell',
    basePrice: 24500000,
    amenities: ['garden', 'security', 'parking', 'power-backup'],
    specifications: {
      residential: {
        bhk: 4,
        bathrooms: 4,
        balconies: 2,
        superBuiltUpArea: 3600,
        carpetArea: 2650,
        furnishing: 'furnished',
        floorNumber: 0,
        totalFloors: 2,
        propertyAge: 4,
        facing: 'north',
        parking: { available: true, type: 'open' }
      }
    }
  },
  {
    propertyType: 'Office Space',
    titlePrefix: 'Grade A Office Space',
    description: 'Move-in ready office with high-speed internet, reception area, and power backup.',
    listingType: 'rent',
    basePrice: 98000,
    amenities: ['ac', 'internet', 'security', 'parking'],
    specifications: {
      commercial: {
        propertyUse: 'office',
        floor: 11,
        washrooms: 2,
        pantry: true,
        furnishedStatus: 'furnished'
      }
    }
  },
  {
    propertyType: 'Shop/Showroom',
    titlePrefix: 'Main Road Showroom',
    description: 'Street-facing commercial unit in a high footfall zone ideal for retail brands.',
    listingType: 'rent',
    basePrice: 72000,
    amenities: ['security', 'parking', 'elevator'],
    specifications: {
      commercial: {
        propertyUse: 'shop',
        floor: 0,
        washrooms: 1,
        pantry: false,
        furnishedStatus: 'semi-furnished'
      }
    }
  },
  {
    propertyType: 'Plot',
    titlePrefix: 'Residential Plot',
    description: 'Clear-title plot in a rapidly developing zone with broad approach road.',
    listingType: 'sell',
    basePrice: 5400000,
    amenities: ['open-plot', 'corner-plot'],
    specifications: {
      plot: {
        plotArea: 1600,
        length: 50,
        width: 32,
        boundaryWall: true,
        cornerPlot: true
      }
    }
  }
];

function metroPriceMultiplier(cityName) {
  const map = {
    Mumbai: 1.35,
    Delhi: 1.22,
    Bangalore: 1.15,
    Hyderabad: 1.05,
    Chennai: 1.0,
    Kolkata: 0.92
  };

  return map[cityName] || 1;
}

function getUniqueImages(seed) {
  return [
    `https://picsum.photos/seed/real-estate-${seed}-1/1200/800`,
    `https://picsum.photos/seed/real-estate-${seed}-2/1200/800`
  ];
}

function buildMetroProperties() {
  let uniqueSeed = 1;

  return METRO_CITIES.flatMap((metro) => {
    return METRO_PROPERTY_BLUEPRINTS.map((blueprint, index) => {
      const multiplier = metroPriceMultiplier(metro.city);
      const locality = metro.localities[index % metro.localities.length];
      const landmark = metro.landmarks[index % metro.landmarks.length];
      const pincode = metro.pincodes[index % metro.pincodes.length];

      const property = {
        ...blueprint,
        title: `${blueprint.titlePrefix} in ${metro.city}`,
        address: `${120 + uniqueSeed}, ${locality} Main Road`,
        city: metro.city,
        state: metro.state,
        pincode,
        locality,
        landmark,
        ownerName: 'Seller',
        contactNumber: '9000000002',
        price: Math.round(blueprint.basePrice * multiplier),
        images: getUniqueImages(uniqueSeed)
      };

      uniqueSeed += 1;
      return property;
    });
  });
}

const DUMMY_PROPERTIES = buildMetroProperties();

async function seedDummyProperties() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in .env');
  }

  await mongoose.connect(mongoUri);

  try {
    // Find the seller by email
    const seller = await User.findOne({ email: 'shantanuprogramming@gmail.com' });
    
    if (!seller) {
      console.error('Seller not found with email: shantanuprogramming@gmail.com');
      console.log('Please create the seller account first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n✅ Found seller: ${seller.firstName} ${seller.lastName}`);
    console.log(`📧 Email: ${seller.email}`);

    // Clear existing properties for this seller (optional)
    const deletedCount = await Property.deleteMany({ sellerId: seller._id });
    console.log(`\n🗑️  Cleared ${deletedCount.deletedCount} existing properties for this seller\n`);

    // Attach seller metadata for every generated property
    const propertiesWithSeller = DUMMY_PROPERTIES.map((prop) => ({
      ...prop,
      sellerId: seller._id,
      createdBy: seller._id,
      status: 'approved',
      verified: true
    }));

    const created = await Property.insertMany(propertiesWithSeller);

    console.log(`✨ Successfully seeded ${created.length} dummy properties!\n`);
    console.log('📊 Properties Created:');
    console.table(
      created.map(p => ({
        Type: p.propertyType,
        Title: p.title.substring(0, 40) + '...',
        'List Type': p.listingType,
        Price: `₹${p.price.toLocaleString('en-IN')}`,
        City: p.city
      }))
    );
  } catch (error) {
    console.error('Seed script failed:', error.message);
    throw error;
  }
}

seedDummyProperties()
  .then(async () => {
    await mongoose.disconnect();
    console.log('\n✅ Database seeding completed!');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
