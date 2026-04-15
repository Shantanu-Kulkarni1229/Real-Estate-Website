import { Link } from 'react-router-dom'

const quickLinks = [
  { label: 'Browse Properties', to: '/search' },
  { label: 'Post Property', to: '/post-property' },
  { label: 'Login / Signup', to: '/auth' },
  { label: 'Dashboard', to: '/dashboard' },
]

const serviceLinks = [
  { label: 'Buy Homes', to: '/search' },
  { label: 'Rent Homes', to: '/search' },
  { label: 'Sell Faster', to: '/post-property' },
  { label: 'Saved Listings', to: '/dashboard?tab=liked' },
]

const contactLinks = [
  { label: 'support@cityploter.com', href: 'mailto:support@cityploter.com' },
  { label: '+91 98765 43210', href: 'tel:+919876543210' },
  { label: 'India', href: '/search' },
]

const socialLinks = [
  {
    label: 'Facebook',
    path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  },
  {
    label: 'Instagram',
    path: 'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5-.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z',
  },
  {
    label: 'LinkedIn',
    path: 'M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm5 7H6v8h3v-8zm.25-3.25a1.75 1.75 0 10-3.5 0 1.75 1.75 0 003.5 0zM18 18h-3v-4.2c0-1-.02-2.3-1.4-2.3-1.4 0-1.62 1.1-1.62 2.23V18h-3v-8h2.88v1.1h.04c.4-.75 1.38-1.53 2.84-1.53 3.04 0 3.6 2 3.6 4.58V18z',
  },
]

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-slate-100 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">CityPloter</p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.15] sm:text-4xl lg:text-[2.5rem]">
              Find the right property faster with a premium experience.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Explore verified listings, post your own property, and connect with real buyers and renters in one polished platform.
            </p>  
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              to="/search"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Explore Listings
            </Link>
            <Link
              to="/post-property"
              className="inline-flex items-center justify-center rounded-full border border-teal-300/40 bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-teal-500"
            >
              Post Property
            </Link>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg shadow-black/10">
                <span className="text-xl font-black">C</span>
              </div>
              <div>
                <p className="text-lg font-semibold tracking-wide">CityPloter</p>
                <p className="text-sm text-slate-300">Modern real estate discovery</p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
              A refined real-estate platform designed to help users discover, compare, and act on properties with confidence.
            </p>

            <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
              {[
                { value: '10K+', label: 'Listings' },
                { value: '4.9/5', label: 'Rating' },
                { value: '24/7', label: 'Support' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-300/80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">Quick Links</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-200">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link className="transition duration-200 hover:text-teal-300" to={link.to}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">Services</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-200">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link className="transition duration-200 hover:text-teal-300" to={link.to}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-200">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
                    <a className="transition duration-200 hover:text-teal-300" href={link.href}>
                      {link.label}
                    </a>
                  ) : (
                    <Link className="transition duration-200 hover:text-teal-300" to={link.href}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((icon) => (
                <a
                  key={icon.label}
                  href="#"
                  aria-label={icon.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition duration-200 hover:-translate-y-0.5 hover:border-teal-300/50 hover:bg-teal-500/20"
                  onClick={(event) => event.preventDefault()}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={icon.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CityPloter. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Verified listings</span>
            <span className="h-1 w-1 rounded-full bg-slate-400/70" />
            <span>Secure connections</span>
            <span className="h-1 w-1 rounded-full bg-slate-400/70" />
            <span>Built for modern real estate</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer