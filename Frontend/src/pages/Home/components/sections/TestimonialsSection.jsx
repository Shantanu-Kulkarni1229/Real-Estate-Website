import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import { apiRequest } from '../../../../lib/api'

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < rating
    return (
      <span key={`star-${index}`} className={isFilled ? 'text-yellow-400' : 'text-slate-300'}>
        ★
      </span>
    )
  })
}

function formatRole(role) {
  if (!role) return 'User'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

// Brand colors - only using the defined brand palette
const BRAND_COLORS = [
  { border: 'border-l-4 border-l-[#2563eb]', name: 'blue' },       // primary
  { border: 'border-l-4 border-l-[#f97316]', name: 'orange' },     // cta-orange
  { border: 'border-l-4 border-l-[#16a34a]', name: 'green' },      // cta-green
  { border: 'border-l-4 border-l-[#2563eb]', name: 'blue-alt' },
  { border: 'border-l-4 border-l-[#f97316]', name: 'orange-alt' },
]

const SquareReviewCard = ({ item, index }) => {
  const colorConfig = BRAND_COLORS[index % BRAND_COLORS.length]

  return (
    <div className={`h-72 w-72 shrink-0 snap-start rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border border-slate-200 ${colorConfig.border}`}>
      <div className="flex h-full flex-col justify-between">
        {/* Header - Name & Role */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{item.displayName}</p>
              <p className="text-xs text-slate-500 font-medium">{formatRole(item.role)}</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <svg className="h-4 w-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.4-4-7-4m0 19c-4 0-7-1-7-8V5c0-1.25 4.4-4 7-4" />
              </svg>
            </div>
          </div>

          {/* Stars with Rating Number */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 text-base leading-none">
              {renderStars(item.rating)}
            </div>
            <span className="text-sm font-semibold text-slate-700">{item.rating}.0</span>
          </div>
        </div>

        {/* Review Text */}
        <div className="flex-1 py-3">
          <p className="line-clamp-3 text-sm leading-6 text-slate-700">
            {item.reviewText}
          </p>
        </div>

        {/* Footer - Location */}
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-medium text-slate-500">
            📍 {item.city || 'India'}
          </p>
        </div>
      </div>
    </div>
  )
}

const TestimonialsSection = () => {
  const { isAuthenticated, token, user } = useAuth()
  const scrollContainerRef = useRef(null)
  const autoScrollIntervalRef = useRef(null)

  const [testimonials, setTestimonials] = useState([])
  const [summary, setSummary] = useState({ totalReviews: 0, averageRating: 0, ratingDistribution: {} })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    reviewText: '',
    city: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const loadTestimonials = async () => {
    setIsLoading(true)

    try {
      const response = await apiRequest('/testimonials?limit=100')
      setTestimonials(response?.data || [])
      setSummary(response?.summary || { totalReviews: 0, averageRating: 0, ratingDistribution: {} })
    } catch (error) {
      setFeedback(error.message || 'Could not load testimonials')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTestimonials()
  }, [])

  // Infinite auto-scroll with pause on hover
  useEffect(() => {
    if (!scrollContainerRef.current || testimonials.length === 0) {
      return
    }

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const scrollAmount = 2
        container.scrollLeft += scrollAmount

        // Seamless loop - reset when reaching end
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 20) {
          container.scrollLeft = 0
        }
      }, 30)
    }

    const stopAutoScroll = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('mouseenter', stopAutoScroll)
      container.addEventListener('mouseleave', startAutoScroll)
    }

    startAutoScroll()

    return () => {
      stopAutoScroll()
      if (container) {
        container.removeEventListener('mouseenter', stopAutoScroll)
        container.removeEventListener('mouseleave', startAutoScroll)
      }
    }
  }, [testimonials.length])

  const hasUserReview = useMemo(() => {
    if (!user?.userId) {
      return false
    }

    return testimonials.some((item) => {
      if (!item?.userId) {
        return false
      }

      const testimonialUserId = typeof item.userId === 'string' ? item.userId : item.userId?._id
      return testimonialUserId === user.userId
    })
  }, [testimonials, user])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isAuthenticated) {
      setFeedback('Please login first to submit your review.')
      return
    }

    if (formData.reviewText.trim().length < 10) {
      setFeedback('Review should be at least 10 characters.')
      return
    }

    setIsSubmitting(true)
    setFeedback('')

    try {
      await apiRequest('/testimonials', {
        method: 'POST',
        token,
        body: {
          rating: Number(formData.rating),
          reviewText: formData.reviewText.trim(),
          city: formData.city.trim()
        }
      })

      setFeedback('🎉 Thank you! Your review is now live.')
      setFormData((current) => ({
        ...current,
        reviewText: ''
      }))

      setTimeout(() => {
        setIsFormOpen(false)
        setFeedback('')
      }, 2000)

      await loadTestimonials()
    } catch (error) {
      setFeedback(error.message || 'Could not submit your review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingPercentage = (count) => {
    if (summary.totalReviews === 0) return 0
    return Math.round((count / summary.totalReviews) * 100)
  }

  return (
    <section className="relative w-full bg-white py-16">
      <div className="relative mx-auto w-[92%] max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--color-secondary-text)">⭐ Real Reviews from Real Users</p>
          <h2 className="mt-4 text-5xl font-black text-slate-900 lg:text-6xl">
            What <span className="text-(--color-primary)">Users Love</span> About Us
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Join thousands who found their perfect home on CityPloter
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3 lg:gap-6">
          <div className="rounded-2xl border border-l-4 border-l-(--color-primary) bg-white p-6 text-center shadow-sm">
            <p className="text-2xl font-black text-(--color-primary)">{summary.averageRating || '0'}</p>
            <p className="mt-1 text-xs font-semibold uppercase text-slate-600">★ Average Rating</p>
          </div>

          <div className="rounded-2xl border border-l-4 border-l-(--color-cta-orange) bg-white p-6 text-center shadow-sm">
            <p className="text-2xl font-black text-(--color-cta-orange)">{summary.totalReviews || '0'}</p>
            <p className="mt-1 text-xs font-semibold uppercase text-slate-600">📝 Total Reviews</p>
          </div>

          <div className="rounded-2xl border border-l-4 border-l-(--color-cta-green) bg-white p-6 text-center shadow-sm">
            <p className="text-2xl font-black text-(--color-cta-green)">{getRatingPercentage((summary.ratingDistribution[4] || 0) + (summary.ratingDistribution[5] || 0))}%</p>
            <p className="mt-1 text-xs font-semibold uppercase text-slate-600">😍 Highly Satisfied</p>
          </div>
        </div>

          {/* Infinite Scroll Carousel */}
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">Testimonials</h3>
              {!isFormOpen && (
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-(--color-cta-green) px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl hover:brightness-110"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your Review
                </button>
              )}
            </div>

          {isLoading ? (
            <div className="flex h-80 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
              <p className="text-sm text-slate-600">Loading amazing reviews...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="flex h-80 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
              <p className="text-sm text-slate-600">No reviews yet. Be the first!</p>
            </div>
          ) : (
            <div className="group relative">
              {/* Left gradient fade */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-linear-to-r from-slate-50 to-transparent" />
              {/* Right gradient fade */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-linear-to-l from-slate-50 to-transparent" />

              <div
                ref={scrollContainerRef}
                className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth rounded-2xl p-4"
              >
                {/* Original testimonials */}
                {testimonials.map((item, index) => (
                  <SquareReviewCard key={`original-${item._id}`} item={item} index={index} />
                ))}
                
                {/* Duplicate for infinite scroll effect */}
                {testimonials.length > 0 && (
                  <>
                    {testimonials.slice(0, Math.min(5, testimonials.length)).map((item, index) => (
                      <SquareReviewCard key={`duplicate-${item._id}`} item={item} index={index} />
                    ))}
                  </>
                )}
              </div>

              {/* Scroll indicator hint */}
              {testimonials.length > 0 && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  ↔️ Scroll to see more reviews or hover to pause
                </p>
              )}
            </div>
          )}
        </div>

        {/* Add Review Section */}
        {isFormOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
              <div className="relative">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">Share Your Review</h3>
                    <p className="mt-2 text-slate-600">Help others find their perfect home</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      setFeedback('')
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-600 transition hover:border-slate-400 hover:bg-white"
                    aria-label="Close form"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!isAuthenticated ? (
                  <div className="rounded-2xl border border-slate-300 bg-slate-50 p-6">
                    <p className="font-bold text-slate-900">🔐 Login to submit review</p>
                    <p className="mt-1 text-sm text-slate-600">Create an account or sign in to share your experience</p>
                    <Link
                      to="/auth?redirect=/"
                      className="mt-4 inline-flex rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
                    >
                      Login Now
                    </Link>
                  </div>
                ) : (
                  <form className="space-y-8" onSubmit={handleSubmit}>
                    {/* Rating Section */}
                    <div>
                      <label className="mb-3 block text-lg font-bold text-slate-900">How would you rate us?</label>
                      <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFormData((current) => ({ ...current, rating: value }))}
                            className={`transition-all h-14 w-14 rounded-xl border-2 text-3xl font-bold ${
                              Number(formData.rating) >= value
                                ? 'border-(--color-cta-orange) bg-(--color-secondary-bg) text-(--color-primary) scale-110 shadow-lg'
                                : 'border-slate-300 bg-white text-slate-400 hover:border-slate-400 hover:scale-105'
                            }`}
                            aria-label={`Rate ${value} stars`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* City Section */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-900" htmlFor="testimonial-city">
                        Your City
                      </label>
                      <input
                        id="testimonial-city"
                        type="text"
                        placeholder="Mumbai, Bangalore, Delhi..."
                        value={formData.city}
                        onChange={(event) => setFormData((current) => ({ ...current, city: event.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-(--color-primary) focus:shadow-md focus:ring-1 focus:ring-(--color-primary)/20"
                      />
                    </div>

                    {/* Review Text Section */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-bold text-slate-900" htmlFor="testimonial-review">
                          Your Review
                        </label>
                        <span className="text-xs font-semibold text-slate-500">
                          {formData.reviewText.length}/800
                        </span>
                      </div>
                      <textarea
                        id="testimonial-review"
                        rows="6"
                        placeholder="Tell us about your experience... What did you like? How CityPloter helped you?"
                        value={formData.reviewText}
                        onChange={(event) => setFormData((current) => ({ ...current, reviewText: event.target.value.slice(0, 800) }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-(--color-primary) focus:shadow-md focus:ring-1 focus:ring-(--color-primary)/20 resize-none"
                      />
                    </div>

                    {/* Feedback Messages */}
                    {feedback && (
                      <div className={`rounded-xl border p-4 text-sm font-semibold ${
                        feedback.includes('🎉')
                          ? 'border-[#16a34a]/30 bg-[#16a34a]/5 text-[#16a34a]'
                          : 'border-slate-300 bg-slate-100 text-slate-700'
                      }`}>
                        {feedback}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!isAuthenticated || isSubmitting || formData.reviewText.trim().length < 10}
                      className="w-full rounded-xl bg-(--color-cta-green) px-6 py-4 text-base font-bold text-white shadow-lg transition hover:shadow-xl hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25" />
                              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1v2.5" />
                            </svg>
                            {hasUserReview ? 'Update My Review' : 'Submit Review'}
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default TestimonialsSection
