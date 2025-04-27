import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Scissors, Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import CartOverlay from '@/components/shop/cart-overlay';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [location] = useLocation();
  const { cartItems } = useCart();
  
  // Close mobile menu when navigation occurs
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  
  return (
    <>
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-secondary" />
              <Link href="/">
                <h1 className="text-2xl md:text-3xl font-heading tracking-wider cursor-pointer">
                  THE HOUSE OF CUTS
                </h1>
              </Link>
            </div>
            
            <nav className={`md:flex md:space-x-8 md:items-center ${isMenuOpen ? 
              'absolute top-16 left-0 right-0 flex flex-col space-y-4 bg-primary p-4 shadow-md z-20' : 
              'hidden'}`}
            >
              <Link href="/booking">
                <a className={`hover:text-secondary transition-colors ${location === '/booking' ? 'text-secondary' : ''}`}>
                  Book Now
                </a>
              </Link>
              <Link href="/#services">
                <a className="hover:text-secondary transition-colors">Services</a>
              </Link>
              <Link href="/shop">
                <a className={`hover:text-secondary transition-colors ${location === '/shop' ? 'text-secondary' : ''}`}>
                  Shop
                </a>
              </Link>
              <Link href="/#about">
                <a className="hover:text-secondary transition-colors">About</a>
              </Link>
              <Link href="/#contact">
                <a className="hover:text-secondary transition-colors">Contact</a>
              </Link>
              <div className="relative md:hidden">
                <Button 
                  variant="ghost" 
                  className="flex items-center hover:text-secondary transition-colors p-0"
                  onClick={toggleCart}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="ml-1">Cart</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </div>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Button 
                  variant="ghost" 
                  className="flex items-center hover:text-secondary transition-colors"
                  onClick={toggleCart}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="ml-1">Cart</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-white focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {isCartOpen && <CartOverlay onClose={() => setIsCartOpen(false)} />}
    </>
  );
};

export default Header;
