import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative h-[80vh] bg-primary">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <img 
        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
        alt="Barbershop interior" 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <h1 className="text-5xl md:text-7xl font-heading text-white leading-tight mb-4">
          PRECISION CUTS.<br/>EXCEPTIONAL SERVICE.
        </h1>
        <p className="text-xl text-white mb-8 max-w-xl">
          Experience the art of traditional barbering with a modern twist at The House of Cuts.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/booking">
            <Button className="bg-secondary hover:bg-red-700 text-white font-bold py-3 px-6">
              Book Appointment
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="bg-white hover:bg-gray-100 text-primary border-white font-bold py-3 px-6">
              Shop Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
