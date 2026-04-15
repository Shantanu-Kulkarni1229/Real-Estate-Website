import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { apiRequest } from '../../../lib/api'
import AmenitiesSection from './sections/AmenitiesSection'
import BasicDetailsSection from './sections/BasicDetailsSection'
import LocationSection from './sections/LocationSection'
import MediaSection from './sections/MediaSection'
import OwnershipSection from './sections/OwnershipSection'
import SpecificationSection from './sections/SpecificationSection'
import SubmissionPanel from './sections/SubmissionPanel'
import { createEmptyUnitConfiguration, getInitialForm } from '../propertyListing.constants'
import { getPropertySpecCategory } from '../../../constants/propertyTypes'

function normalizeTextList(text) {
  if (!text) {
    return []
  }

  return text
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeAmenitiesList(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

function mergeAmenities(form) {
  const selectedAmenities = normalizeAmenitiesList(form.selectedAmenities)
  const customAmenities = normalizeTextList(form.customAmenitiesText)
  const seen = new Set()

  return [...selectedAmenities, ...customAmenities].filter((amenity) => {
    const key = amenity.toLowerCase()
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function cleanNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function buildSpecifications(form) {
  const specCategory = getPropertySpecCategory(form.propertyType)

  if (specCategory === 'plot') {
    return {
      plot: {
        plotArea: cleanNumber(form.specifications.plot.plotArea),
        length: cleanNumber(form.specifications.plot.length),
        width: cleanNumber(form.specifications.plot.width),
        boundaryWall: form.specifications.plot.boundaryWall,
        cornerPlot: form.specifications.plot.cornerPlot
      }
    }
  }

  if (specCategory === 'commercial') {
    return {
      commercial: {
        propertyUse: form.specifications.commercial.propertyUse || undefined,
        floor: cleanNumber(form.specifications.commercial.floor),
        washrooms: cleanNumber(form.specifications.commercial.washrooms),
        pantry: form.specifications.commercial.pantry,
        furnishedStatus: form.specifications.commercial.furnishedStatus || undefined
      }
    }
  }

  return {
    residential: {
      bhk: cleanNumber(form.specifications.residential.bhk),
      bathrooms: cleanNumber(form.specifications.residential.bathrooms),
      balconies: cleanNumber(form.specifications.residential.balconies),
      superBuiltUpArea: cleanNumber(form.specifications.residential.superBuiltUpArea),
      carpetArea: cleanNumber(form.specifications.residential.carpetArea),
      furnishing: form.specifications.residential.furnishing || undefined,
      floorNumber: cleanNumber(form.specifications.residential.floorNumber),
      totalFloors: cleanNumber(form.specifications.residential.totalFloors),
      propertyAge: cleanNumber(form.specifications.residential.propertyAge),
      facing: form.specifications.residential.facing || undefined,
      parking: {
        available: form.specifications.residential.parkingAvailable,
        type: form.specifications.residential.parkingType || undefined
      }
    }
  }
}

function buildPayload(form, uploadedImages) {
  const unitConfigurations = (Array.isArray(form.unitConfigurations) ? form.unitConfigurations : [])
    .map((unit) => ({
      unitLabel: String(unit?.unitLabel || '').trim(),
      bhk: cleanNumber(unit?.bhk),
      sizeSqFt: cleanNumber(unit?.sizeSqFt),
      price: cleanNumber(unit?.price)
    }))
    .filter((unit) => unit.price !== undefined)

  const monthlyRent = cleanNumber(form.rentMonthlyAmount)
  const salePrice = unitConfigurations.length > 0
    ? Math.min(...unitConfigurations.map((unit) => Number(unit.price)))
    : cleanNumber(form.price)
  const derivedPrice = form.listingType === 'rent' ? monthlyRent : salePrice

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    propertyType: form.propertyType,
    listingType: form.listingType,
    price: derivedPrice,
    unitConfigurations,
    negotiable: form.negotiable,
    possessionStatus: form.possessionStatus,
    possessionDate: form.possessionStatus === 'under_construction' ? (form.possessionDate || undefined) : undefined,
    address: form.address.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    pincode: form.pincode.trim(),
    locality: form.locality.trim() || undefined,
    landmark: form.landmark.trim() || undefined,
    googleMapsLink: form.googleMapsLink.trim() || undefined,
    specifications: buildSpecifications(form),
    amenities: mergeAmenities(form),
    images: uploadedImages,
    videos: normalizeTextList(form.videosText),
    rentDetails: form.listingType === 'rent'
      ? {
          monthlyRent,
          depositRequired: Boolean(form.rentDepositRequired),
          securityDeposit: form.rentDepositRequired ? cleanNumber(form.rentSecurityDeposit) : undefined,
        }
      : undefined,
    ownerName: form.ownerName.trim(),
    contactNumber: form.contactNumber.trim(),
    ownershipType: form.ownershipType,
    availableFrom: form.availableFrom || undefined
  }
}

function validateForm(form, imageFiles) {
  const missing = []

  if (!form.title.trim()) missing.push('title')
  if (!form.description.trim()) missing.push('description')
  if (!form.possessionStatus) missing.push('possession status')
  if (form.possessionStatus === 'under_construction' && !form.possessionDate) {
    missing.push('possession date')
  }
  if (form.hasMultipleUnits) {
    const validUnits = (Array.isArray(form.unitConfigurations) ? form.unitConfigurations : [])
      .map((unit) => ({
        unitLabel: String(unit?.unitLabel || '').trim(),
        sizeSqFt: cleanNumber(unit?.sizeSqFt),
        price: cleanNumber(unit?.price)
      }))
      .filter((unit) => unit.price !== undefined)

    if (validUnits.length === 0) {
      missing.push('at least one unit price')
    }
  } else if (form.listingType !== 'rent' && !form.price) {
    missing.push('price')
  }

  if (form.listingType === 'rent' && !form.rentMonthlyAmount) {
    missing.push('monthly rent')
  }

  if (form.listingType === 'rent' && form.rentDepositRequired && !form.rentSecurityDeposit) {
    missing.push('security deposit')
  }
  if (!form.address.trim()) missing.push('address')
  if (!form.city.trim()) missing.push('city')
  if (!form.state.trim()) missing.push('state')
  if (!form.pincode.trim()) missing.push('pincode')
  if (!form.ownerName.trim()) missing.push('ownerName')
  if (!form.contactNumber.trim()) missing.push('contactNumber')

  if (imageFiles.length === 0) missing.push('images')
  if (imageFiles.length > 10) missing.push('max 10 images')

  const specCategory = getPropertySpecCategory(form.propertyType)

  if (specCategory === 'plot') {
    if (!form.specifications.plot.plotArea) missing.push('plotArea')
  }

  if (specCategory === 'commercial') {
    if (!form.specifications.commercial.propertyUse) missing.push('propertyUse')
  }

  if (specCategory === 'residential') {
    if (!form.specifications.residential.bhk) missing.push('bhk')
    if (!form.specifications.residential.superBuiltUpArea) missing.push('superBuiltUpArea')
    if (!form.specifications.residential.carpetArea) missing.push('carpetArea')
    if (!form.specifications.residential.furnishing) missing.push('furnishing')
  }

  return missing
}

const PropertyListingForm = () => {
  const { user, token } = useAuth()
  const [form, setForm] = useState(() => getInitialForm(user))
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [error, setError] = useState('')
  const [successState, setSuccessState] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roleLabel = useMemo(() => user?.role || 'unknown', [user?.role])

  useEffect(() => {
    const nextForm = getInitialForm(user)
    setForm(nextForm)
    setImageFiles([])
    setImagePreviews([])
  }, [user])

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviews([])
      return undefined
    }

    const previews = imageFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [imageFiles])

  const handleChange = (field, value) => {
    setForm((current) => {
      if (field === 'listingType' && value === 'rent') {
        return {
          ...current,
          listingType: value,
          hasMultipleUnits: false,
          unitConfigurations: [createEmptyUnitConfiguration()],
        }
      }

      if (field === 'rentDepositRequired' && !value) {
        return {
          ...current,
          rentDepositRequired: false,
          rentSecurityDeposit: ''
        }
      }

      return {
        ...current,
        [field]: value
      }
    })
  }

  const handleNestedChange = (section, field, value) => {
    setForm((current) => ({
      ...current,
      specifications: {
        ...current.specifications,
        [section]: {
          ...current.specifications[section],
          [field]: value
        }
      }
    }))
  }

  const handleUnitConfigurationChange = (index, field, value) => {
    setForm((current) => {
      const currentUnits = Array.isArray(current.unitConfigurations)
        ? current.unitConfigurations
        : []

      const nextUnits = currentUnits.map((unit, unitIndex) => (
        unitIndex === index
          ? { ...unit, [field]: value }
          : unit
      ))

      return {
        ...current,
        unitConfigurations: nextUnits
      }
    })
  }

  const addUnitConfiguration = () => {
    setForm((current) => ({
      ...current,
      hasMultipleUnits: true,
      unitConfigurations: [
        ...(Array.isArray(current.unitConfigurations) ? current.unitConfigurations : []),
        createEmptyUnitConfiguration(),
      ]
    }))
  }

  const removeUnitConfiguration = (index) => {
    setForm((current) => {
      const nextUnits = (Array.isArray(current.unitConfigurations) ? current.unitConfigurations : [])
        .filter((_, unitIndex) => unitIndex !== index)

      return {
        ...current,
        unitConfigurations: nextUnits.length > 0 ? nextUnits : [createEmptyUnitConfiguration()]
      }
    })
  }

  const handleImagesChange = (files) => {
    const selectedFiles = Array.from(files || [])
    setImageFiles(selectedFiles.slice(0, 10))
  }

  const resetForm = ({ keepSuccess = false } = {}) => {
    setForm(getInitialForm(user))
    setImageFiles([])
    setError('')

    if (!keepSuccess) {
      setSuccessState(null)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessState(null)

    if (!token) {
      setError('You must be signed in to submit a property')
      return
    }

    const missing = validateForm(form, imageFiles)
    if (missing.length > 0) {
      setError(`Please complete: ${missing.join(', ')}`)
      return
    }

    setIsSubmitting(true)

    try {
      const uploadFormData = new FormData()
      imageFiles.forEach((file) => uploadFormData.append('images', file))

      const uploadResponse = await apiRequest('/uploads/property-images', {
        method: 'POST',
        body: uploadFormData,
        token
      })

      const uploadedImages = Array.isArray(uploadResponse?.data)
        ? uploadResponse.data.map((item) => item.url).filter(Boolean)
        : []

      const payload = buildPayload(form, uploadedImages)

      const propertyResponse = await apiRequest('/properties', {
        method: 'POST',
        body: payload,
        token
      })

      setSuccessState({
        propertyId: propertyResponse?.data?._id || propertyResponse?.data?.id || null,
        title: propertyResponse?.data?.title || form.title,
        status: propertyResponse?.data?.status || 'pending'
      })
      resetForm({ keepSuccess: true })
    } catch (submissionError) {
      setError(submissionError.message || 'Failed to create the property listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successState) {
    return (
      <div
        className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
        style={{
          background:
            'radial-gradient(circle_at_top_left, rgba(22, 163, 74, 0.14), transparent 30%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)'
        }}
      >
        <div className="mx-auto max-w-3xl border border-white/60 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-sm" style={{ borderRadius: '2rem' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Submission complete</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Your property listing has been created</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {successState.title} is now in <span className="font-semibold text-slate-900">{successState.status}</span> state and ready for admin review.
          </p>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p>
              Property ID: <span className="font-medium text-slate-900">{successState.propertyId || 'Generated by backend'}</span>
            </p>
            <p className="mt-2">Images were uploaded through Cloudinary and the returned URLs were stored in the property record.</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSuccessState(null)}
              className="rounded-2xl bg-(--color-primary) px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:brightness-95"
            >
              Create another listing
            </button>
            <Link
              to="/"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background:
          'radial-gradient(circle_at_top_left, rgba(37, 99, 235, 0.16), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)'
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Property listing</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Complete the listing flow</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-(--color-secondary-bg) px-4 py-2 text-sm font-semibold text-(--color-primary)">
              Signed in as {roleLabel}
            </div>
            <Link
              to="/"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Home
            </Link>
          </div>
        </div>

        <form id="property-listing-form" onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <BasicDetailsSection
              form={form}
              onChange={handleChange}
              onUnitChange={handleUnitConfigurationChange}
              onUnitAdd={addUnitConfiguration}
              onUnitRemove={removeUnitConfiguration}
            />
            <LocationSection form={form} onChange={handleChange} />
            <AmenitiesSection form={form} onChange={handleChange} />
            <SpecificationSection form={form} onNestedChange={handleNestedChange} />
            <MediaSection
              form={form}
              onChange={handleChange}
              onImagesChange={handleImagesChange}
              imagePreviews={imagePreviews}
              imageCount={imageFiles.length}
            />
            <OwnershipSection form={form} onChange={handleChange} roleLabel={roleLabel} />
          </div>

          <SubmissionPanel
            form={form}
            imageCount={imageFiles.length}
            isSubmitting={isSubmitting}
            onReset={resetForm}
            roleLabel={roleLabel}
          />
        </form>
      </div>
    </div>
  )
}

export default PropertyListingForm
