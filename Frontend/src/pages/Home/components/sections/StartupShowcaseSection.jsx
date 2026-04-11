import { Link } from 'react-router-dom'

const trustStats = [
  { label: 'Verified Listings You Can Trust', value: '12,800+' },
  { label: 'Happy Families Served', value: '31,000+' },
  { label: 'Cities with Active Support', value: '42' },
  { label: 'Avg Time to Find Matches', value: '3.2 min' },
]

const growthPillars = [
  {
    title: 'Verified and Transparent',
    description: 'Listings go through checks so you can browse with confidence and fewer surprises.',
    badge: 'Trust',
  },
  {
    title: 'Smarter Property Discovery',
    description: 'Find homes faster using practical filters for city, budget, type, and lifestyle needs.',
    badge: 'Speed',
  },
  {
    title: 'Support at Every Step',
    description: 'From first search to final decision, our workflows keep your journey organized and clear.',
    badge: 'Care',
  },
  {
    title: 'Built for Buyers and Sellers',
    description: 'Balanced tools help buyers discover better and help sellers respond to genuine intent.',
    badge: 'Balanced',
  },
]

const launchSteps = [
  {
    title: 'Search Confidently',
    description: 'Start with clean filters and curated suggestions designed around real customer needs.',
  },
  {
    title: 'Compare Better',
    description: 'Evaluate price, location, specs, and listing quality before spending time on follow-ups.',
  },
  {
    title: 'Connect Securely',
    description: 'Reach out through structured flows that keep interactions reliable and trackable.',
  },
  {
    title: 'Move Forward Faster',
    description: 'Get decision-ready with transparency and support from discovery to final action.',
  },
]

const StartupShowcaseSection = () => {
  return (
    <section className="mx-auto w-[92%] max-w-7xl pb-10 pt-8 lg:pt-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-sky-50/60 to-amber-50/60 p-6 shadow-sm lg:p-8">
        <div className="pointer-events-none absolute -left-16 top-4 h-48 w-48 rounded-full bg-(--color-primary)/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-10 h-56 w-56 rounded-full bg-(--color-cta-orange)/15 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-secondary-text)">Why Choose CityPloter</p>
            <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-tight text-slate-900 lg:text-4xl">
              Everything customers expect from a modern property platform, all in one reliable experience.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 lg:text-base">
              Whether you are buying, renting, or selling, CityPloter helps you make faster and more confident decisions with verified listings and structured support.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/search?searchType=buy"
                className="inline-flex items-center justify-center rounded-full bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
              >
                Start Searching Homes
              </Link>
              <Link
                to="/search?searchType=rent"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition duration-200 hover:border-slate-400 hover:bg-slate-50"
              >
                Explore Rentals
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {trustStats.map((metric, index) => (
              <div
                key={metric.label}
                className="group rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full bg-(--color-primary) motion-safe:animate-pulse ${
                      index % 2 === 0 ? '' : '[animation-delay:250ms]'
                    }`}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">Trusted</p>
                </div>
                <p className="text-lg font-bold text-slate-900 lg:text-xl">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-600">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {growthPillars.map((pillar) => (
          <article
            key={pillar.title}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-600">
              {pillar.badge}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">{pillar.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{pillar.description}</p>
            <div className="mt-4 h-1.5 w-16 rounded-full bg-slate-200 transition-all duration-300 group-hover:w-24 group-hover:bg-(--color-primary)" />
          </article>
        ))}
      </div>

      <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-secondary-text)">How It Works</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">How we make your property journey easier</h3>
          </div>
          <Link
            to="/post-property"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition duration-200 hover:bg-slate-50"
          >
            List Your Property
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {launchSteps.map((step, index) => (
            <article
              key={step.title}
              className="relative rounded-2xl border border-slate-200 bg-linear-to-b from-white to-slate-50 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-(--color-secondary-bg) text-sm font-bold text-(--color-primary)">
                {index + 1}
              </span>
              <h4 className="text-base font-semibold text-slate-900">{step.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StartupShowcaseSection
