import { useState, useEffect } from 'react';
import Hero from '@/components/home/hero';
import Features from '@/components/home/features';
import Testimonials from '@/components/home/testimonials';
import AboutContact from '@/components/home/about-contact';
import { useQuery } from '@tanstack/react-query';
import { Service, Category } from '@shared/schema';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Home = () => {
  const [showAllServices, setShowAllServices] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Fetch all services for the home page
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });
  
  // Fetch service categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories/service'],
  });
  
  const [location] = useLocation();
  
  // Handle scrolling to section based on URL hash
  useEffect(() => {
    // Get the hash from the URL (e.g., "#about", "#contact", "#services")
    const hash = window.location.hash;
    if (hash) {
      // Remove the "#" symbol to get the section ID
      const sectionId = hash.substring(1);
      const section = document.getElementById(sectionId);
      
      if (section) {
        // Add a small delay to ensure the page is fully rendered
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);
  
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
            <Button 
              className="bg-secondary hover:bg-red-700 text-white"
              onClick={() => setShowAllServices(!showAllServices)}
            >
              {showAllServices ? 'Hide Services' : 'View All Services'}
            </Button>
          </div>
          
          {/* All Services Section - Only appears when "View All Services" is clicked */}
          {showAllServices && (
            <div className="mt-12">
              <h3 className="text-2xl font-heading text-center mb-8">ALL OUR SERVICES</h3>
              
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full flex flex-wrap justify-center mb-6">
                  <TabsTrigger 
                    value="all" 
                    className="px-4 py-2 m-1"
                    onClick={() => setActiveCategory(null)}
                  >
                    All
                  </TabsTrigger>
                  {categories?.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id.toString()}
                      className="px-4 py-2 m-1"
                      onClick={() => setActiveCategory(category.id.toString())}
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services?.map((service) => (
                      <Card key={service.id} className="service-card">
                        <CardContent className="p-4">
                          <h4 className="text-lg font-bold mb-2">{service.name}</h4>
                          <p className="text-neutral text-sm mb-3">{service.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">${service.price.toString()}</span>
                            <span className="text-sm text-neutral">{service.duration} min</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                {categories?.map((category) => (
                  <TabsContent key={category.id} value={category.id.toString()} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services?.filter(service => 
                        service.categoryId === category.id
                      ).map((service) => (
                        <Card key={service.id} className="service-card">
                          <CardContent className="p-4">
                            <h4 className="text-lg font-bold mb-2">{service.name}</h4>
                            <p className="text-neutral text-sm mb-3">{service.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold">${service.price.toString()}</span>
                              <span className="text-sm text-neutral">{service.duration} min</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              
              <div className="text-center mt-8">
                <Link href="/booking">
                  <Button className="bg-primary hover:bg-secondary text-white">
                    Book An Appointment
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <Testimonials />
      <AboutContact />
    </>
  );
};

export default Home;
