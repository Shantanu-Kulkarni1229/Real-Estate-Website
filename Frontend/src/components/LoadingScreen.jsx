const LoadingScreen = ({
  label = 'Loading... ',
  sublabel = '',
  fullScreen = false,
  className = ''
}) => {
  const containerClass = fullScreen
    ? 'min-h-screen'
    : 'min-h-[260px] rounded-3xl border border-slate-200 bg-white shadow-sm'

  return (
    <div
      className={`${containerClass} flex items-center justify-center ${className}`}
      style={{
        background: fullScreen
          ? 'radial-gradient(circle_at_top_left, rgba(37, 99, 235, 0.14), transparent 30%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)'
          : undefined
      }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-14 w-14">
          <span className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-(--color-primary) border-r-(--color-primary)" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-secondary-text)">{label}</p>
          {sublabel ? <p className="mt-1 text-sm text-slate-600">{sublabel}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen