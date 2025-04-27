import { Clock, Shield, ShoppingBag } from 'lucide-react';

const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6">
            <div className="bg-primary rounded-full p-4 mb-4">
              <Clock className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-2xl font-heading mb-2">QUICK BOOKING</h3>
            <p className="text-neutral">Book your appointment online in minutes with our easy-to-use system.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="bg-primary rounded-full p-4 mb-4">
              <Shield className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-2xl font-heading mb-2">EXPERT BARBERS</h3>
            <p className="text-neutral">Our team of skilled professionals deliver consistent quality with every cut.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="bg-primary rounded-full p-4 mb-4">
              <ShoppingBag className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-2xl font-heading mb-2">PREMIUM PRODUCTS</h3>
            <p className="text-neutral">Shop our selection of high-quality grooming products to maintain your style.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
