import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
  cartId: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  shippingCost: number;
  cartId: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string>('');
  const shippingCost = cartItems.length > 0 ? 5.99 : 0;
  
  // Initialize cart ID from local storage or create a new one
  useEffect(() => {
    const storedCartId = localStorage.getItem('cartId');
    if (storedCartId) {
      setCartId(storedCartId);
    } else {
      const newCartId = uuidv4();
      localStorage.setItem('cartId', newCartId);
      setCartId(newCartId);
    }
  }, []);
  
  // Fetch cart items when cartId is available
  useEffect(() => {
    if (cartId) {
      const fetchCartItems = async () => {
        try {
          const response = await fetch(`/api/cart/${cartId}`);
          if (response.ok) {
            const items = await response.json();
            setCartItems(items);
          }
        } catch (error) {
          console.error('Error fetching cart items:', error);
        }
      };
      
      fetchCartItems();
    }
  }, [cartId]);
  
  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity, 
    0
  );
  
  // Count total items in cart
  const itemCount = cartItems.reduce(
    (count, item) => count + item.quantity, 
    0
  );
  
  // Add a product to the cart
  const addToCart = async (product: Product, quantity: number) => {
    try {
      const response = await apiRequest('POST', '/api/cart', {
        cartId,
        productId: product.id,
        quantity
      });
      
      if (response.ok) {
        const newItem = await response.json();
        
        // Check if the item already exists in the cart
        const existingItemIndex = cartItems.findIndex(
          item => item.productId === product.id
        );
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex] = {
            ...newItem,
            product
          };
          setCartItems(updatedItems);
        } else {
          // Add new item
          setCartItems([...cartItems, {
            ...newItem,
            product
          }]);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  
  // Update item quantity
  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      const response = await apiRequest('PUT', `/api/cart/${itemId}`, { quantity });
      
      if (response.ok) {
        const updatedItem = await response.json();
        setCartItems(cartItems.map(item => 
          item.id === itemId ? { ...item, quantity: updatedItem.quantity } : item
        ));
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (itemId: number) => {
    try {
      const response = await apiRequest('DELETE', `/api/cart/${itemId}`);
      
      if (response.status === 204) {
        setCartItems(cartItems.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };
  
  // Clear the entire cart
  const clearCart = async () => {
    try {
      const response = await apiRequest('DELETE', `/api/cart/clear/${cartId}`);
      
      if (response.status === 204) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        itemCount,
        shippingCost,
        cartId
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
