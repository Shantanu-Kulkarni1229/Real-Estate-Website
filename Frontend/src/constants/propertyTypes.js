export const PROPERTY_TYPE_GROUPS = [
  {
    title: 'Residential',
    options: ['Residential', 'Flat', 'House/Villa', 'Plot']
  },
  {
    title: 'Commercial',
    options: [
      'Commercial',
      'Office Space',
      'Shop/Showroom',
      'Commercial Land',
      'Warehouse/Godown',
      'Industrial Building',
      'Industrial Shed'
    ]
  },
  {
    title: 'Other Property Types',
    options: ['Agricultural Land', 'Farm House']
  }
]

export const PROPERTY_TYPE_OPTIONS = PROPERTY_TYPE_GROUPS.flatMap((group) => group.options)

export const LEGACY_TO_PROPERTY_TYPE = {
  apartment: 'Flat',
  villa: 'House/Villa',
  commercial: 'Commercial',
  plot: 'Plot'
}

const PLOT_TYPES = new Set(['Plot', 'Commercial Land', 'Agricultural Land'])

const COMMERCIAL_TYPES = new Set([
  'Commercial',
  'Office Space',
  'Shop/Showroom',
  'Warehouse/Godown',
  'Industrial Building',
  'Industrial Shed'
])

export function normalizePropertyType(value) {
  const raw = String(value || '').trim()
  if (!raw) {
    return ''
  }

  if (LEGACY_TO_PROPERTY_TYPE[raw]) {
    return LEGACY_TO_PROPERTY_TYPE[raw]
  }

  const normalized = PROPERTY_TYPE_OPTIONS.find((item) => item.toLowerCase() === raw.toLowerCase())
  return normalized || ''
}

export function getPropertySpecCategory(propertyType) {
  const normalized = normalizePropertyType(propertyType)

  if (!normalized) {
    return 'residential'
  }

  if (PLOT_TYPES.has(normalized)) {
    return 'plot'
  }

  if (COMMERCIAL_TYPES.has(normalized)) {
    return 'commercial'
  }

  return 'residential'
}
