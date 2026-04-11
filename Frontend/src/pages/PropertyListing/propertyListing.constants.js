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
    hasMultipleUnits: false,
    unitConfigurations: [createEmptyUnitConfiguration()],
    negotiable: false,
    address: '',
    city: '',
    state: '',
    pincode: '',
    locality: '',
    landmark: '',
    latitude: '',
    longitude: '',
    amenitiesText: '',
    virtualTourUrl: '',
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
