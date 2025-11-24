import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Palette, Shield, Truck, Star } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const featuredCategories = [
    { name: 'Paintings', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop', count: 1250 },
    { name: 'Photography', image: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&h=500&fit=crop', count: 890 },
    { name: 'Sculptures', image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&h=500&fit=crop', count: 340 },
    { name: 'Digital Art', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop', count: 720 },
  ]

  const stats = [
    { label: 'Artists', value: '2,500+' },
    { label: 'Artworks', value: '15,000+' },
    { label: 'Collectors', value: '50,000+' },
    { label: 'Countries', value: '80+' },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Art Collector',
      content: 'Artist Gallery helped me discover amazing emerging artists. The quality of work and the buying experience are exceptional.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    {
      name: 'Michael Chen',
      role: 'Artist',
      content: 'As an artist, this platform has been transformative for my career. I\'ve connected with collectors worldwide.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    {
      name: 'Emma Williams',
      role: 'Interior Designer',
      content: 'I recommend Artist Gallery to all my clients. The curated selection makes it easy to find the perfect piece.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1920&h=1080&fit=crop"
            alt="Art gallery background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gallery-dark/90 to-gallery-dark/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Discover Extraordinary Art from Talented Artists
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Connect with artists worldwide. Find unique pieces that speak to you. Support independent creators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/gallery">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Explore Gallery
                </Button>
              </Link>
              <Link href="/register?artist=true">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gallery-dark">
                  Become an Artist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gallery-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gallery-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of artworks across various mediums and styles.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredCategories.map((category) => (
              <Link
                key={category.name}
                href={`/gallery?category=${encodeURIComponent(category.name)}`}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {category.count.toLocaleString()} artworks
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Why Choose Artist Gallery
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 bg-gallery-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-7 h-7 text-gallery-accent" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Curated Collection
              </h3>
              <p className="text-gray-600">
                Every artwork is carefully selected to ensure quality and authenticity.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 bg-gallery-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-gallery-accent" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Transactions
              </h3>
              <p className="text-gray-600">
                Buy with confidence using our secure payment system powered by Stripe.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 bg-gallery-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-7 h-7 text-gallery-accent" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Worldwide Shipping
              </h3>
              <p className="text-gray-600">
                Professional packaging and delivery to collectors around the globe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white p-6 rounded-xl border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gallery-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Ready to Start Your Art Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of collectors and artists on the platform that celebrates creativity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/gallery">
              <Button size="lg">
                Start Exploring
              </Button>
            </Link>
            <Link href="/register?artist=true">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gallery-dark">
                Sell Your Art
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
