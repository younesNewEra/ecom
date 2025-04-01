"use client"
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, User } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'

const Home = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: '/silderBg1.jpg',
      title: 'Sale of the\nsummer collection',
      buttonText: 'Shop now',
      buttonLink: '/products'
    },
    {
      image: '/sliderBg2.jpg',
      title: 'New Arrivals\nSpring 2024',
      buttonText: 'Explore',
      buttonLink: '/new-arrivals'
    }
  ]

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentSlide(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => emblaApi.off('select', onSelect)
  }, [emblaApi, onSelect])

  return (
    <section className="min-h-screen relative">
      {/* Hero Carousel Section */}
      <div className="relative h-[90vh] w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
              <Image
                src={slide.image}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover object-top brightness-75 "
                priority={index === 0}
              />
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-14">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 whitespace-pre-line">
                  {slide.title}
                </h1>
                <Link 
                  href={slide.buttonLink}
                  className="bg-white text-black px-8 py-3 rounded-full w-fit
                           hover:bg-black hover:text-white transition-colors
                           text-lg font-semibold"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls - Bottom Right */}
        <div className="absolute bottom-[4vh] right-12 flex space-x-6 z-10">
          <button
            onClick={scrollPrev}
            className="w-16 h-16 bg-white/40 
                     hover:bg-white/60 transition-colors flex items-center justify-center text-white
                     cursor-pointer text-2xl font-bold"
            aria-label="Previous slide"
          >
            &lt;
          </button>
          <button
            onClick={scrollNext}
            className="w-16 h-16 bg-white/40 
                     hover:bg-white/60 cursor-pointer transition-colors flex items-center justify-center text-white
                    text-2xl font-bold"
            aria-label="Next slide"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Features Section - Curved White Background */}
      <div className="absolute w-[80%] bottom-[10vh] left-0 right-0 hidden md:block">
        <div className="bg-white rounded-tr-[3.5rem] py-8 pl-14">
          <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto">
            {/* Free Shipping */}
            <div className="flex items-center space-x-4 justify-self-start">
              <div className="flex-shrink-0">
                <div className="p-2 bg-orange-100 rounded-full">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-base text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-500">On purchases over $199</p>
              </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="flex items-center space-x-4 justify-self-start">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-base text-gray-900">99% Satisfied Customers</h3>
                <p className="text-sm text-gray-500">Our clients' opinions</p>
              </div>
            </div>

            {/* Originality Guarantee */}
            <div className="flex items-center space-x-4 justify-self-start">
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-100 rounded-full">
                  <Image
                    src="/globe.svg"
                    alt="Originality"
                    width={20}
                    height={20}
                    className="text-green-600"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-base text-gray-900">Originality Guaranteed</h3>
                <p className="text-sm text-gray-500">30 days warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home 