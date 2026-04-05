import { FormField, FormSection } from '../FormSection'
import {
  commercialUseOptions,
  facingOptions,
  furnishingOptions,
  parkingTypeOptions
} from '../../propertyListing.constants'
import { getPropertySpecCategory } from '../../../../constants/propertyTypes'

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-secondary-bg)'

const CheckboxCard = ({ label, checked, onChange, description }) => {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-(--color-primary) focus:ring-(--color-secondary-bg)"
      />
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description ? <span className="mt-1 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  )
}

const SpecificationSection = ({ form, onNestedChange }) => {
  const specCategory = getPropertySpecCategory(form.propertyType)

  if (specCategory === 'plot') {
    return (
      <FormSection
        title="Plot specifications"
        description="Add land dimensions and plot-specific information."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Plot area">
            <input
              type="number"
              min="0"
              value={form.specifications.plot.plotArea}
              onChange={(event) => onNestedChange('plot', 'plotArea', event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Length">
            <input
              type="number"
              min="0"
              value={form.specifications.plot.length}
              onChange={(event) => onNestedChange('plot', 'length', event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Width">
            <input
              type="number"
              min="0"
              value={form.specifications.plot.width}
              onChange={(event) => onNestedChange('plot', 'width', event.target.value)}
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <CheckboxCard
            label="Boundary wall"
            description="Mark if the plot already has a boundary wall."
            checked={form.specifications.plot.boundaryWall}
            onChange={(value) => onNestedChange('plot', 'boundaryWall', value)}
          />
          <CheckboxCard
            label="Corner plot"
            description="Mark if the plot is at a corner."
            checked={form.specifications.plot.cornerPlot}
            onChange={(value) => onNestedChange('plot', 'cornerPlot', value)}
          />
        </div>
      </FormSection>
    )
  }

  if (specCategory === 'commercial') {
    return (
      <FormSection
        title="Commercial specifications"
        description="Describe the business use, floor, and furnishing status."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Property use">
            <select
              value={form.specifications.commercial.propertyUse}
              onChange={(event) => onNestedChange('commercial', 'propertyUse', event.target.value)}
              className={inputClassName}
            >
              {commercialUseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Floor">
            <input
              type="number"
              min="0"
              value={form.specifications.commercial.floor}
              onChange={(event) => onNestedChange('commercial', 'floor', event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Washrooms">
            <input
              type="number"
              min="0"
              value={form.specifications.commercial.washrooms}
              onChange={(event) => onNestedChange('commercial', 'washrooms', event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Furnished status">
            <select
              value={form.specifications.commercial.furnishedStatus}
              onChange={(event) => onNestedChange('commercial', 'furnishedStatus', event.target.value)}
              className={inputClassName}
            >
              {furnishingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <CheckboxCard
            label="Pantry available"
            description="Mark if the property has a pantry."
            checked={form.specifications.commercial.pantry}
            onChange={(value) => onNestedChange('commercial', 'pantry', value)}
          />
        </div>
      </FormSection>
    )
  }

  return (
    <FormSection
      title="Residential specifications"
      description="Fill out the structural details for apartments and villas."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="BHK">
          <input
            type="number"
            min="0"
            value={form.specifications.residential.bhk}
            onChange={(event) => onNestedChange('residential', 'bhk', event.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Bathrooms">
          <input
            type="number"
            min="0"
            value={form.specifications.residential.bathrooms}
            onChange={(event) => onNestedChange('residential', 'bathrooms', event.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Balconies">
          <input
            type="number"
            min="0"
            value={form.specifications.residential.balconies}
            onChange={(event) => onNestedChange('residential', 'balconies', event.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Super built-up area">
          <input
            type="number"
            min="0"
            value={form.specifications.residential.superBuiltUpArea}
            onChange={(event) => onNestedChange('residential', 'superBuiltUpArea', event.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Carpet area">
          <input
            type="number"
            min="0"
            value={form.specifications.residential.carpetArea}
            onChange={(event) => onNestedChange('residential', 'carpetArea', event.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Furnishing">
          <select
            value={form.specifications.residential.furnishing}
            onChange={(event) => onNestedChange('residential', 'furnishing', event.target.value)}
            className={inputClassName}
          >
            {furnishingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Floor number">
          <input
            type="number"
            min="0"
            value={form.specifications.residential.floorNumber}
            onChange={(event) => onNestedChange('residential', 'floorNumber', event.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Total floors">
          <input
            type="number"
            min="0"
            value={form.specifications.residential.totalFloors}
            onChange={(event) => onNestedChange('residential', 'totalFloors', event.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Property age">
          <input
            type="number"
            min="0"
            value={form.specifications.residential.propertyAge}
            onChange={(event) => onNestedChange('residential', 'propertyAge', event.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Facing">
          <select
            value={form.specifications.residential.facing}
            onChange={(event) => onNestedChange('residential', 'facing', event.target.value)}
            className={inputClassName}
          >
            {facingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <CheckboxCard
          label="Parking available"
          description="Mark if the home includes parking."
          checked={form.specifications.residential.parkingAvailable}
          onChange={(value) => onNestedChange('residential', 'parkingAvailable', value)}
        />
        <FormField label="Parking type">
          <select
            value={form.specifications.residential.parkingType}
            onChange={(event) => onNestedChange('residential', 'parkingType', event.target.value)}
            className={inputClassName}
          >
            {parkingTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </FormSection>
  )
}

export default SpecificationSection
