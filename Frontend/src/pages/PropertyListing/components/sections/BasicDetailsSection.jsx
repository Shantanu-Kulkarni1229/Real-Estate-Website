import { FormField, FormSection } from '../FormSection'
import { listingTypeOptions, propertyTypeOptions } from '../../propertyListing.constants'

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-secondary-bg)'

const BasicDetailsSection = ({ form, onChange }) => {
  return (
    <FormSection
      title="Basic details"
      description="Capture the core property information buyers and admins will see first."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Property title" hint="Use a clear title with locality and key feature.">
          <input
            type="text"
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            className={inputClassName}
            placeholder="Spacious 3 BHK in Baner"
          />
        </FormField>
        <FormField label="Property type">
          <select
            value={form.propertyType}
            onChange={(event) => onChange('propertyType', event.target.value)}
            className={inputClassName}
          >
            {propertyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Listing type">
          <select
            value={form.listingType}
            onChange={(event) => onChange('listingType', event.target.value)}
            className={inputClassName}
          >
            {listingTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Price" hint="Use numeric value only. The backend stores it as a number.">
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(event) => onChange('price', event.target.value)}
            className={inputClassName}
            placeholder="7500000"
          />
        </FormField>
      </div>

      <div className="mt-5 grid gap-5">
        <FormField label="Description">
          <textarea
            rows="6"
            value={form.description}
            onChange={(event) => onChange('description', event.target.value)}
            className={inputClassName}
            placeholder="Write a detailed description of the property, surroundings, access, and selling points."
          />
        </FormField>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800">Negotiable price</p>
            <p className="text-xs text-slate-500">Mark this if the amount can be negotiated.</p>
          </div>
          <input
            type="checkbox"
            checked={form.negotiable}
            onChange={(event) => onChange('negotiable', event.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-(--color-primary) focus:ring-(--color-secondary-bg)"
          />
        </div>
      </div>
    </FormSection>
  )
}

export default BasicDetailsSection
