import { useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

interface CartOverlayProps {
  onClose: () => void;
}

const CartOverlay: React.FC<CartOverlayProps> = ({ onClose }) => {
  // Close cart when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    // Prevent scrolling on body when overlay is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  const { cartItems, updateQuantity, removeFromCart, cartTotal, shippingCost } = useCart();
  
  // Handle clicking outside the cart panel to close it
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-white shadow-lg p-6 overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-heading">Your Cart</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-neutral hover:text-secondary">
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <h4 className="text-lg font-bold mb-2">Your Cart is Empty</h4>
            <p className="text-neutral mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button className="bg-secondary hover:bg-red-700" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 max-h-[calc(100vh-220px)] overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center border-b border-gray-200 py-4">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    className="w-16 h-16 object-cover rounded-md mr-4" 
                  />
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">{item.product.name}</h4>
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-neutral hover:text-secondary p-0"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-neutral hover:text-secondary p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="font-bold">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-2 text-neutral hover:text-secondary"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-neutral">Subtotal:</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral">Shipping:</span>
                <span className="font-medium">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${(cartTotal + shippingCost).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link href="/checkout">
                <Button 
                  className="w-full bg-secondary hover:bg-red-700 text-white font-bold"
                  onClick={onClose}
                >
                  Checkout
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full text-primary border-2 border-primary font-bold"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartOverlay;
