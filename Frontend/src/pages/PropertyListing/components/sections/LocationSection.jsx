import { FormField, FormSection } from '../FormSection'
import { CITY_OPTIONS } from '../../../../constants/cities'
import CityDropdown from '../../../../components/CityDropdown'

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-secondary-bg)'

const LocationSection = ({ form, onChange }) => {
  return (
    <FormSection
      title="Location details"
      description="Add the full address and geo coordinates if you have them."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Address">
          <input
            type="text"
            value={form.address}
            onChange={(event) => onChange('address', event.target.value)}
            className={inputClassName}
            placeholder="Full street address"
          />
        </FormField>
        <FormField label="Locality">
          <input
            type="text"
            value={form.locality}
            onChange={(event) => onChange('locality', event.target.value)}
            className={inputClassName}
            placeholder="Area, sector, or neighborhood"
          />
        </FormField>
        <FormField label="City">
          <CityDropdown
            value={form.city || 'Select city'}
            onChange={(value) => onChange('city', value)}
            options={CITY_OPTIONS.filter((city) => city !== 'All India')}
            placeholder="Search city"
            buttonClassName="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition duration-200 hover:border-slate-300 hover:bg-white focus:border-(--color-primary) focus:outline-none"
            menuClassName="absolute left-0 top-full z-40 mt-2 w-full rounded-2xl border border-slate-100 bg-white shadow-2xl"
            selectedClassName="bg-(--color-secondary-bg) text-(--color-primary) font-semibold"
          />
        </FormField>
        <FormField label="State">
          <input
            type="text"
            value={form.state}
            onChange={(event) => onChange('state', event.target.value)}
            className={inputClassName}
            placeholder="Maharashtra"
          />
        </FormField>
        <FormField label="Pincode">
          <input
            type="text"
            value={form.pincode}
            onChange={(event) => onChange('pincode', event.target.value)}
            className={inputClassName}
            placeholder="400001"
          />
        </FormField>
        <FormField label="Landmark">
          <input
            type="text"
            value={form.landmark}
            onChange={(event) => onChange('landmark', event.target.value)}
            className={inputClassName}
            placeholder="Near Metro Station"
          />
        </FormField>
        <FormField label="Latitude" hint="Optional, useful for map integrations.">
          <input
            type="number"
            step="any"
            value={form.latitude}
            onChange={(event) => onChange('latitude', event.target.value)}
            className={inputClassName}
            placeholder="19.0760"
          />
        </FormField>
        <FormField label="Longitude" hint="Optional, useful for map integrations.">
          <input
            type="number"
            step="any"
            value={form.longitude}
            onChange={(event) => onChange('longitude', event.target.value)}
            className={inputClassName}
            placeholder="72.8777"
          />
        </FormField>
      </div>
    </FormSection>
  )
}

export default LocationSection
