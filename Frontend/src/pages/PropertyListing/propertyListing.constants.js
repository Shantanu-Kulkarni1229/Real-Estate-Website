import { PROPERTY_TYPE_OPTIONS } from '../../constants/propertyTypes'

export const propertyTypeOptions = PROPERTY_TYPE_OPTIONS.map((item) => ({
  value: item,
  label: item
}))

export const listingTypeOptions = [
  { value: 'sell', label: 'Sell' },
  { value: 'rent', label: 'Rent' }
]

export const furnishingOptions = [
  { value: '', label: 'Select furnishing' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi-furnished', label: 'Semi-furnished' },
  { value: 'unfurnished', label: 'Unfurnished' }
]

export const facingOptions = [
  { value: '', label: 'Select facing' },
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'north-east', label: 'North East' },
  { value: 'north-west', label: 'North West' },
  { value: 'south-east', label: 'South East' },
  { value: 'south-west', label: 'South West' }
]

export const ownershipTypeOptions = [
  { value: 'freehold', label: 'Freehold' },
  { value: 'leasehold', label: 'Leasehold' }
]

export const possessionStatusOptions = [
  { value: 'ready_to_move', label: 'Ready To Move' },
  { value: 'under_construction', label: 'Under Construction' }
]

export const parkingTypeOptions = [
  { value: '', label: 'Select parking type' },
  { value: 'open', label: 'Open' },
  { value: 'covered', label: 'Covered' },
  { value: 'basement', label: 'Basement' },
  { value: 'stilt', label: 'Stilt' }
]

export const commercialUseOptions = [
  { value: '', label: 'Select property use' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'other', label: 'Other' }
]

export const predefinedAmenities = [
  'Lift',
  'Parking',
  'Security',
  'Power Backup',
  'Water Supply',
  'CCTV',
  'Intercom',
  'Fire Safety',
  'Maintenance Staff',
  'Gated Community',
  'Club House',
  'Gym',
  'Swimming Pool',
  'Jogging Track',
  'Kids Play Area',
  'Garden',
  'Park',
  'Sports Court',
  'Indoor Games',
  'Party Hall',
  'Visitor Parking',
  'Wheelchair Access',
  'Rainwater Harvesting',
  'Solar Panels',
  'Waste Management',
  'EV Charging',
  'Wi-Fi',
  'Air Conditioning',
  'Modular Kitchen',
  'Balcony',
  'Servant Room',
  'Study Room',
  'Store Room',
  'Piped Gas',
  'Furnished',
  'Semi Furnished',
  'Unfurnished',
  'Corner Plot',
  'Boundary Wall',
  'Road Facing',
  'Metro Nearby',
  'School Nearby',
  'Hospital Nearby',
  'Market Nearby',
  'Pet Friendly',
]

export function createEmptyUnitConfiguration() {
  return {
    unitLabel: '',
    bhk: '',
    sizeSqFt: '',
    price: ''
  }
}

export function getInitialForm(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()

  return {
    title: '',
    description: '',
    propertyType: 'Residential',
    listingType: 'sell',
    price: '',
    rentMonthlyAmount: '',
    rentDepositRequired: false,
    rentSecurityDeposit: '',
    hasMultipleUnits: false,
    unitConfigurations: [createEmptyUnitConfiguration()],
    negotiable: false,
    possessionStatus: 'ready_to_move',
    possessionDate: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    locality: '',
    landmark: '',
    googleMapsLink: '',
    selectedAmenities: [],
    customAmenitiesText: '',
    ownerName: fullName,
    contactNumber: user?.phone || '',
    ownershipType: 'freehold',
    availableFrom: '',
    videosText: '',
    specifications: {
      residential: {
        bhk: '',
        bathrooms: '',
        balconies: '',
        superBuiltUpArea: '',
        carpetArea: '',
        furnishing: '',
        floorNumber: '',
        totalFloors: '',
        propertyAge: '',
        facing: '',
        parkingAvailable: false,
        parkingType: ''
      },
      plot: {
        plotArea: '',
        length: '',
        width: '',
        boundaryWall: false,
        cornerPlot: false
      },
      commercial: {
        propertyUse: '',
        floor: '',
        washrooms: '',
        pantry: false,
        furnishedStatus: ''
      }
    }
  }
}
