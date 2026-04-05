import { FormField, FormSection } from '../FormSection'

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-secondary-bg)'

const MediaSection = ({ imagePreviews, onImagesChange, form, onChange, imageCount }) => {
  return (
    <FormSection
      title="Media"
      description="Upload property images and add any hosted video links. Images are sent to Cloudinary before the property is created."
    >
      <div className="grid gap-5">
        <FormField
          label="Property images"
          hint={`Select up to 10 images. Current selection: ${imageCount} image${imageCount === 1 ? '' : 's'}.`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => onImagesChange(event.target.files)}
            className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-(--color-secondary-bg) file:px-4 file:py-2 file:text-sm file:font-semibold file:text-(--color-primary) hover:border-slate-400"
          />
        </FormField>

        {imagePreviews.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {imagePreviews.map((preview, index) => (
              <div key={`${preview}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img src={preview} alt={`Preview ${index + 1}`} className="h-36 w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        <FormField label="Video URLs" hint="Optional. Paste one or more URLs separated by new lines or commas.">
          <textarea
            rows="4"
            value={form.videosText}
            onChange={(event) => onChange('videosText', event.target.value)}
            className={inputClassName}
            placeholder="https://...\nhttps://..."
          />
        </FormField>
      </div>
    </FormSection>
  )
}

export default MediaSection
