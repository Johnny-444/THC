import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Scissors, Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/hooks/use-auth';
import CartOverlay from '@/components/shop/cart-overlay';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [location] = useLocation();
  const { cartItems } = useCart();
  const { user, logoutMutation } = useAuth();
  
  // Close mobile menu when navigation occurs
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  
  const scrollToSection = (sectionId: string) => {
    // First navigate to home page if not already there
    if (location !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
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
                <span className={`hover:text-secondary transition-colors cursor-pointer ${location === '/booking' ? 'text-secondary' : ''}`}>
                  Book Now
                </span>
              </Link>
              <span 
                onClick={() => scrollToSection('services')}
                className="hover:text-secondary transition-colors cursor-pointer"
              >
                Services
              </span>
              <Link href="/shop">
                <span className={`hover:text-secondary transition-colors cursor-pointer ${location === '/shop' ? 'text-secondary' : ''}`}>
                  Shop
                </span>
              </Link>
              <span 
                onClick={() => scrollToSection('about')}
                className="hover:text-secondary transition-colors cursor-pointer"
              >
                About
              </span>
              <span 
                onClick={() => scrollToSection('contact')}
                className="hover:text-secondary transition-colors cursor-pointer"
              >
                Contact
              </span>
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
              
              {user ? (
                <div className="flex items-center space-x-2">
                  {user.isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost" className="flex items-center hover:text-secondary transition-colors">
                        <User className="h-5 w-5 mr-1" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    className="flex items-center hover:text-secondary transition-colors"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" className="flex items-center hover:text-secondary transition-colors">
                    <User className="h-5 w-5 mr-1" />
                    Login
                  </Button>
                </Link>
              )}
              
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
