import { useMemo, useState } from 'react'

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 transition duration-200 focus:border-(--color-primary) focus:bg-white focus:outline-none'

const CityDropdown = ({
  label = 'City',
  value,
  onChange,
  options = [],
  placeholder = 'Search city...',
  buttonClassName = 'group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50 focus:border-(--color-primary) focus:outline-none',
  menuClassName = 'absolute top-full left-0 z-50 mt-2 w-72 rounded-xl border border-slate-100 bg-white shadow-2xl',
  selectedClassName = 'bg-(--color-secondary-bg) text-(--color-primary) font-semibold',
  showLabel = false,
  allowClear = false,
  clearLabel = 'All India'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return options
    }

    return options.filter((option) => option.toLowerCase().includes(query))
  }, [options, searchQuery])

  const handleSelect = (nextValue) => {
    onChange(nextValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="relative">
      {showLabel ? <p className="text-sm font-medium text-slate-700">{label}</p> : null}
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => {
            const next = !current
            if (next) {
              setSearchQuery('')
            }
            return next
          })
        }}
        className={buttonClassName}
      >
        <svg
          className="h-4 w-4 text-slate-500 transition duration-200 group-hover:text-slate-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-medium">{value}</span>
        <svg
          className="h-4 w-4 transition duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0l-7 7m7-7v14" />
        </svg>
      </button>

      {isOpen ? (
        <div className={menuClassName}>
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className={inputClassName}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto py-2">
            {allowClear ? (
              <button
                type="button"
                onClick={() => handleSelect(clearLabel)}
                className={`w-full px-4 py-2.5 text-left text-sm transition duration-150 ${
                  value === clearLabel ? selectedClassName : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {clearLabel}
              </button>
            ) : null}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition duration-150 ${
                    value === option ? selectedClassName : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-sm text-slate-500">No cities found</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CityDropdown
