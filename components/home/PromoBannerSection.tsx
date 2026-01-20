import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PromoBannerSection() {
  return (
    <section className="py-8 md:py-12" aria-labelledby="promo-banner-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-secondary text-white p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-xl">
          <div className="md:w-2/3 lg:w-3/5 text-center md:text-left">
            <h2 
              id="promo-banner-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4"
            >
              Super Sale! Up to 50% Off
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-4 md:mb-6 leading-relaxed max-w-[50ch] mx-auto md:mx-0">
              Don't miss out on our biggest sale of the season. Shop now and save big on your favorite products!
            </p>
            <Button 
              asChild 
              size="lg" 
              variant="secondary" 
              className="text-primary font-bold"
            >
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
          <Image
            src="/promo-banner.png"
            alt=""
            width={256}
            height={256}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain drop-shadow-2xl"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
