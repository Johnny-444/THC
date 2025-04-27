import { Link } from 'wouter';
import { Facebook, Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-heading mb-4">THE HOUSE OF CUTS</h3>
            <p className="mb-4">Premium barbershop services for the modern gentleman. Quality haircuts, beard trims, and grooming products.</p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:text-secondary transition-colors p-2 h-auto">
                <Facebook className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-secondary transition-colors p-2 h-auto">
                <Instagram className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-secondary transition-colors p-2 h-auto">
                <Twitter className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-secondary transition-colors p-2 h-auto">
                <Youtube className="h-6 w-6" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-heading mb-4">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/booking">
                  <a className="hover:text-secondary transition-colors">Book Appointment</a>
                </Link>
              </li>
              <li>
                <Link href="/#services">
                  <a className="hover:text-secondary transition-colors">Services</a>
                </Link>
              </li>
              <li>
                <Link href="/shop">
                  <a className="hover:text-secondary transition-colors">Shop</a>
                </Link>
              </li>
              <li>
                <Link href="/#about">
                  <a className="hover:text-secondary transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/#contact">
                  <a className="hover:text-secondary transition-colors">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-heading mb-4">SERVICES</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-secondary transition-colors">Haircuts</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Beard Trims</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Hot Towel Shaves</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Hair Styling</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Full Service Packages</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-heading mb-4">NEWSLETTER</h3>
            <p className="mb-4">Subscribe to our newsletter for the latest updates, promotions, and grooming tips.</p>
            <form className="flex mb-2" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder="Your email" 
                className="p-2 w-full bg-gray-800 text-white border border-gray-700 rounded-r-none focus:outline-none focus:ring-1 focus:ring-secondary" 
              />
              <Button type="submit" className="bg-secondary hover:bg-red-700 text-white p-2 rounded-l-none">
                <ArrowRight className="h-6 w-6" />
              </Button>
            </form>
            <p className="text-xs text-gray-400">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} The House of Cuts. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
