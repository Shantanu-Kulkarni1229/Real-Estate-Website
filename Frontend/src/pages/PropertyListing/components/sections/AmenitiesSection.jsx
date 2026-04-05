import { FormField, FormSection } from '../FormSection'

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-secondary-bg)'

const AmenitiesSection = ({ form, onChange }) => {
  return (
    <FormSection
      title="Amenities and extras"
      description="Enter amenities as comma separated values so they are stored as an array in MongoDB."
    >
      <div className="grid gap-5">
        <FormField label="Amenities" hint="Example: lift, parking, security, power backup">
          <textarea
            rows="4"
            value={form.amenitiesText}
            onChange={(event) => onChange('amenitiesText', event.target.value)}
            className={inputClassName}
            placeholder="lift, parking, security, gym"
          />
        </FormField>
        <FormField label="Virtual tour URL" hint="Optional link to a 3D tour or hosted video walk-through.">
          <input
            type="url"
            value={form.virtualTourUrl}
            onChange={(event) => onChange('virtualTourUrl', event.target.value)}
            className={inputClassName}
            placeholder="https://example.com/virtual-tour"
          />
        </FormField>
      </div>
    </FormSection>
  )
}

export default AmenitiesSection
