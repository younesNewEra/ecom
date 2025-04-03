// components/TestimonialSection.jsx
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: "dahman",
    role: "Fashion Blogger",
    image: "/person1.jpeg",
    content: "The quality of these clothes exceeded my expectations. The fabrics are luxurious and the fit is perfect. I've received so many compliments!",
    rating: 5
  },
  {
    id: 2,
    name: "said",
    role: "Regular Customer",
    image: "/person2.jpeg",
    content: "I've been shopping here for over a year now. The styles are always on trend and the customer service is exceptional. Shipping is always fast too!",
    rating: 5
  },
  {
    id: 3,
    name: "farid",
    role: "Stylist",
    image: "/person3.jpeg",
    content: "As a professional stylist, I'm very particular about the clothing I recommend. This store consistently delivers quality pieces that work for various body types.",
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover why fashion enthusiasts choose us for their wardrobe essentials</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 italic">&ldquo;{testimonial.content}&rdquo;</p>
                </div>
                
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;