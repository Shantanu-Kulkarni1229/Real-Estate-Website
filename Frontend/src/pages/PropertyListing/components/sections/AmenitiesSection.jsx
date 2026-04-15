import { FormField, FormSection } from '../FormSection'
import { predefinedAmenities } from '../../propertyListing.constants'

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-secondary-bg)'

const AmenitiesSection = ({ form, onChange }) => {
  const selectedAmenities = Array.isArray(form.selectedAmenities) ? form.selectedAmenities : []

  const handleAmenityToggle = (amenityLabel) => {
    const alreadySelected = selectedAmenities.includes(amenityLabel)

    const nextAmenities = alreadySelected
      ? selectedAmenities.filter((item) => item !== amenityLabel)
      : [...selectedAmenities, amenityLabel]

    onChange('selectedAmenities', nextAmenities)
  }

  return (
    <FormSection
      title="Amenities and extras"
      description="Choose from the full amenities checklist and optionally add extra amenities separated by commas."
    >
      <div className="grid gap-5">
        <FormField label="Select amenities" hint="Tick all amenities available in this property.">
          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {predefinedAmenities.map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity)

              return (
                <label key={amenity} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-slate-700 transition hover:bg-white">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="h-4 w-4 accent-(--color-primary)"
                  />
                  <span>{amenity}</span>
                </label>
              )
            })}
          </div>
        </FormField>

        <FormField label="Other amenities" hint="Add additional amenities not listed above, separated by commas.">
          <textarea
            rows="3"
            value={form.customAmenitiesText}
            onChange={(event) => onChange('customAmenitiesText', event.target.value)}
            className={inputClassName}
            placeholder="Temple nearby, Smart home controls, Soundproof windows"
          />
        </FormField>
      </div>
    </FormSection>
  )
}

export default AmenitiesSection
