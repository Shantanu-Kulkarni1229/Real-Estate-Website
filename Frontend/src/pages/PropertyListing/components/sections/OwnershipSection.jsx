import { FormField, FormSection } from '../FormSection'
import { ownershipTypeOptions, possessionStatusOptions } from '../../propertyListing.constants'

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-secondary-bg)'

const OwnershipSection = ({ form, onChange, roleLabel }) => {
  return (
    <FormSection
      title="Ownership and contact"
      description={`This information is shown to admins and used to contact the owner. Your signed-in role is ${roleLabel}.`}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Owner name">
          <input
            type="text"
            value={form.ownerName}
            onChange={(event) => onChange('ownerName', event.target.value)}
            className={inputClassName}
            placeholder="Owner or business name"
          />
        </FormField>
        <FormField label="Contact number">
          <input
            type="tel"
            value={form.contactNumber}
            onChange={(event) => onChange('contactNumber', event.target.value)}
            className={inputClassName}
            placeholder="9876543210"
          />
        </FormField>
        <FormField label="Ownership type">
          <select
            value={form.ownershipType}
            onChange={(event) => onChange('ownershipType', event.target.value)}
            className={inputClassName}
          >
            {ownershipTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Possession Status">
          <div className="grid gap-2 sm:grid-cols-2">
            {possessionStatusOptions.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-white">
                <input
                  type="radio"
                  name="possessionStatus"
                  value={option.value}
                  checked={form.possessionStatus === option.value}
                  onChange={(event) => onChange('possessionStatus', event.target.value)}
                  className="h-4 w-4 border-slate-300 text-(--color-primary) focus:ring-(--color-secondary-bg)"
                />
                {option.label}
              </label>
            ))}
          </div>
        </FormField>
        {form.possessionStatus === 'under_construction' ? (
          <FormField label="Expected Possession Date" hint="Required when possession status is under construction.">
            <input
              type="date"
              value={form.possessionDate}
              onChange={(event) => onChange('possessionDate', event.target.value)}
              className={inputClassName}
            />
          </FormField>
        ) : null}
        <FormField label="Available from" hint="Optional date when the property becomes available.">
          <input
            type="date"
            value={form.availableFrom}
            onChange={(event) => onChange('availableFrom', event.target.value)}
            className={inputClassName}
          />
        </FormField>
      </div>
    </FormSection>
  )
}

export default OwnershipSection
