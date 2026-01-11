import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { testimonials } from '@/constants';

export function TestimonialsSection() {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-heading" className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of happy customers who love shopping with us
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2 motion-reduce:transition-none"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Image
                    src={testimonial.avatar}
                    alt={`Photo of ${testimonial.name}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full border-4 border-primary/20 shadow-lg"
                    placeholder="empty"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
                
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-base md:text-lg mb-5 text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  <p>"{testimonial.quote}"</p>
                </blockquote>
                
                <footer className="mt-auto">
                  <cite className="not-italic">
                    <span className="font-bold text-base md:text-lg block text-gray-900 dark:text-white">{testimonial.name}</span>
                    <span className="text-sm text-muted-foreground">{testimonial.role}</span>
                  </cite>
                </footer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
