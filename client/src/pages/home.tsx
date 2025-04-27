import Hero from '@/components/home/hero';
import Features from '@/components/home/features';
import Testimonials from '@/components/home/testimonials';
import AboutContact from '@/components/home/about-contact';
import { useQuery } from '@tanstack/react-query';
import { Service } from '@shared/schema';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  // Fetch featured services for the home page
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });
  
  return (
    <>
      <Hero />
      <Features />
      
      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading text-center mb-12">OUR SERVICES</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {services?.slice(0, 3).map((service) => (
                <Card key={service.id} className="service-card overflow-hidden">
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold mb-2">{service.name}</h4>
                    <p className="text-neutral mb-4">{service.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">${service.price.toString()}</span>
                      <span className="text-sm text-neutral">{service.duration} min</span>
                    </div>
                  </CardContent>
                  <Link href="/booking">
                    <div className="bg-primary hover:bg-secondary transition-colors px-6 py-3 text-white text-center cursor-pointer">
                      Book Now
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Link href="/booking">
              <Button className="bg-secondary hover:bg-red-700 text-white">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Testimonials />
      <AboutContact />
    </>
  );
};

export default Home;
