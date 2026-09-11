import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: any[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
  addToCart: (batchId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setCartItems([]);
      setSubtotal(0);
      setDeliveryFee(0);
      setTotal(0);
      return;
    }
    try {
      const res = await api.getCart();
      setCartItems(res.items || []);
      setSubtotal(res.subtotal || 0);
      setDeliveryFee(res.deliveryFee || 0);
      setTotal(res.total || 0);
    } catch (e) {
      // Cart might not exist or error, set empty
      setCartItems([]);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const addToCart = async (batchId: string, quantity: number = 1): Promise<boolean> => {
    try {
      await api.addToCart(batchId, quantity);
      await refreshCart();
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart');
      return false;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await api.updateCartItem(cartItemId, quantity);
      await refreshCart();
    } catch (err: any) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      await api.removeFromCart(cartItemId);
      await refreshCart();
    } catch (err: any) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      await refreshCart();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.length,
        subtotal,
        deliveryFee,
        total,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
