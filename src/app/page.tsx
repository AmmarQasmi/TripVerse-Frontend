import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroCarousel } from '@/components/landing/HeroCarousel'
import { SearchBar } from '@/components/landing/SearchBar'
import { FAQSection } from '@/components/landing/FAQSection'
import { Footer } from '@/components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      
      {/* Hero Section with Carousel and Search */}
      <section className="relative pt-16">
        <HeroCarousel />
        <SearchBar />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Why Choose TripVerse?
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Everything you need for your perfect journey, all in one place
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🏨</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Hotels</h3>
              <p className="text-gray-600">
                Find and book the perfect hotel for your stay with real-time availability 
                and best price guarantees.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Car Rental</h3>
              <p className="text-gray-600">
                Rent cars from verified drivers and explore your destination at your own pace 
                with flexible options.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Monument Recognition</h3>
              <p className="text-gray-600">
                Upload photos to identify historical monuments and learn about their fascinating 
                history with AI technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white text-opacity-90">Happy Travelers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white text-opacity-90">Hotels Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-white text-opacity-90">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white text-opacity-90">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-8 text-white text-opacity-90 max-w-2xl mx-auto">
            Join thousands of travelers who trust TripVerse for their journey planning
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
              Get Started Free
            </button>
            <button className="bg-transparent border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
