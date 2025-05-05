import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  restaurant_id: string;
  special_instructions?: string;
};

type CartContextType = {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartEmpty: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      setItems(parsedCart.items || []);
      setRestaurantId(parsedCart.restaurantId || null);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items, restaurantId }));
  }, [items, restaurantId]);
  
  const addItem = (item: CartItem) => {
    // If adding from a different restaurant, clear the cart first
    if (restaurantId && item.restaurant_id !== restaurantId) {
      setItems([{ ...item, quantity: 1 }]);
      setRestaurantId(item.restaurant_id);
      return;
    }
    
    setRestaurantId(item.restaurant_id);
    
    // Check if item already exists
    const existingItem = items.find(i => i.id === item.id);
    
    if (existingItem) {
      // Update quantity if item exists
      setItems(
        items.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        )
      );
    } else {
      // Add new item
      setItems([...items, { ...item, quantity: 1 }]);
    }
  };
  
  const removeItem = (itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    setItems(newItems);
    
    if (newItems.length === 0) {
      setRestaurantId(null);
    }
  };
  
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(
      items.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  const updateInstructions = (itemId: string, instructions: string) => {
    setItems(
      items.map(item => 
        item.id === itemId 
          ? { ...item, special_instructions: instructions } 
          : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
  };
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  
  const isCartEmpty = items.length === 0;
  
  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        addItem,
        removeItem,
        updateQuantity,
        updateInstructions,
        clearCart,
        totalItems,
        totalPrice,
        isCartEmpty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}