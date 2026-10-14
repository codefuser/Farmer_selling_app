import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartProductItem {
  id: string; // product id or cart item id
  productId: string;
  name: string;
  nameTamil?: string;
  category?: string;
  price: number;
  unit: string;
  quantity: number;
  imageUrl?: string;
  stockQuantity: number;
}

interface CartContextType {
  cartItems: CartProductItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
  addToCart: (productIdOrItem: any, quantity?: number) => Promise<boolean>;
  addStoreProduct: (product: any, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('ulavar_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ulavar_cart_v2', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const subtotal = Math.round(
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
  ) / 100;

  // Delivery fee rule: Free if subtotal >= 500 or cart is empty, else ₹30
  const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 30;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const refreshCart = async () => {
    // Local persistence is authoritative for immediate client responsiveness
  };

  const addStoreProduct = (product: any, quantity: number = 1): boolean => {
    if (!product || !product.id) return false;

    const availableStock = product.stockQuantity !== undefined ? product.stockQuantity : 999;
    if (availableStock <= 0) {
      alert(`Sorry, "${product.name}" is currently out of stock.`);
      return false;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, availableStock);
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const newItem: CartProductItem = {
          id: product.id,
          productId: product.id,
          name: product.name,
          nameTamil: product.nameTamil || product.name,
          category: product.category,
          price: product.sellingPrice || product.pricePerKg || product.price || 30,
          unit: product.unit || 'kg',
          quantity: Math.min(quantity, availableStock),
          imageUrl: product.imageUrl,
          stockQuantity: availableStock,
        };
        return [...prev, newItem];
      }
    });

    setIsOpen(true);
    return true;
  };

  const addToCart = async (productIdOrItem: any, quantity: number = 1): Promise<boolean> => {
    if (typeof productIdOrItem === 'object') {
      return addStoreProduct(productIdOrItem, quantity);
    }
    // If string ID is passed, create placeholder or handle gracefully
    addStoreProduct({ id: productIdOrItem, name: 'Produce Item', sellingPrice: 30, stockQuantity: 50 }, quantity);
    return true;
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId || item.id === productId) {
          const maxAllowed = item.stockQuantity || 999;
          return { ...item, quantity: Math.min(quantity, maxAllowed) };
        }
        return item;
      })
    );
  };

  const removeItem = async (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId && item.id !== productId));
  };

  const clearCart = async () => {
    setCartItems([]);
    try {
      localStorage.removeItem('ulavar_cart_v2');
    } catch (e) {
      // ignore
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        deliveryFee,
        total,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        refreshCart,
        addToCart,
        addStoreProduct,
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
