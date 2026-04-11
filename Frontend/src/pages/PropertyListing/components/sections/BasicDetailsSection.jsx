import { FormField, FormSection } from '../FormSection'
import { listingTypeOptions, propertyTypeOptions } from '../../propertyListing.constants'

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-secondary-bg)'

const BasicDetailsSection = ({ form, onChange, onUnitChange, onUnitAdd, onUnitRemove }) => {
  const showUnitConfigurations = Boolean(form.hasMultipleUnits)

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
        <FormField label={showUnitConfigurations ? 'Base price (auto from units)' : 'Price'} hint="Use numeric value only. The backend stores it as a number.">
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(event) => onChange('price', event.target.value)}
            className={inputClassName}
            placeholder="7500000"
            readOnly={showUnitConfigurations}
          />
        </FormField>
      </div>

      <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Multiple unit pricing</p>
            <p className="text-xs text-slate-500">Enable this for apartment/skyscraper listings with different sizes and prices.</p>
          </div>
          <input
            type="checkbox"
            checked={showUnitConfigurations}
            onChange={(event) => onChange('hasMultipleUnits', event.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-(--color-primary) focus:ring-(--color-secondary-bg)"
          />
        </div>

        {showUnitConfigurations ? (
          <div className="space-y-3">
            {(Array.isArray(form.unitConfigurations) ? form.unitConfigurations : []).map((unit, index) => (
              <div key={`unit-${index}`} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="grid gap-3 md:grid-cols-4">
                  <input
                    type="text"
                    value={unit.unitLabel || ''}
                    onChange={(event) => onUnitChange(index, 'unitLabel', event.target.value)}
                    className={inputClassName}
                    placeholder="Unit label (e.g. Tower A - 2BHK)"
                  />
                  <input
                    type="number"
                    min="0"
                    value={unit.bhk || ''}
                    onChange={(event) => onUnitChange(index, 'bhk', event.target.value)}
                    className={inputClassName}
                    placeholder="BHK"
                  />
                  <input
                    type="number"
                    min="0"
                    value={unit.sizeSqFt || ''}
                    onChange={(event) => onUnitChange(index, 'sizeSqFt', event.target.value)}
                    className={inputClassName}
                    placeholder="Size (sq ft)"
                  />
                  <input
                    type="number"
                    min="0"
                    value={unit.price || ''}
                    onChange={(event) => onUnitChange(index, 'price', event.target.value)}
                    className={inputClassName}
                    placeholder="Price"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onUnitRemove(index)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Remove unit
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={onUnitAdd}
              className="rounded-xl bg-(--color-secondary-bg) px-4 py-2 text-sm font-semibold text-(--color-primary) transition hover:brightness-95"
            >
              Add another unit
            </button>
          </div>
        ) : null}
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
