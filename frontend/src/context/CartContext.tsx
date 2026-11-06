/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { MenuItem } from '../data/menuData';

export interface CartAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  key: string;
  item: MenuItem;
  quantity: number;
  size?: string;
  sizePriceModifier?: number;
  stuffing?: string;
  cookingStyle?: string;
  addons?: CartAddon[];
  specialInstructions?: string;
  unitPrice: number;
}

interface AddCustomizedParams {
  item: MenuItem;
  quantity: number;
  size?: string;
  sizePriceModifier?: number;
  stuffing?: string;
  cookingStyle?: string;
  addons?: CartAddon[];
  specialInstructions?: string;
  unitPrice: number;
}

interface CartContextType {
  cart: { [key: string]: CartItem };
  addToCart: (item: MenuItem, quantity?: number) => void;
  addCustomizedToCart: (params: AddCustomizedParams) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  reorderItems: (items: Array<{ id?: number; name: string; price: number; quantity: number; size?: string; image?: string }>) => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addedToast: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<{ [key: string]: CartItem }>(() => {
    try {
      const saved = localStorage.getItem('loqma_cart_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // تفريغ السلة تلقائياً عند تسجيل خروج العميل
  useEffect(() => {
    const handleLogout = () => {
      setCart({});
      try {
        localStorage.removeItem('loqma_cart_v2');
      } catch {
        // ignore
      }
    };
    window.addEventListener('loqma:logout', handleLogout);
    return () => window.removeEventListener('loqma:logout', handleLogout);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('loqma_cart_v2', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // إضافة سريعة بدون تفاصيل
  const addToCart = (item: MenuItem, quantity: number = 1) => {
    const key = `item_${item.id}_standard`;
    setCart((prev) => {
      const existing = prev[key];
      const newQty = existing ? existing.quantity + quantity : quantity;
      return {
        ...prev,
        [key]: {
          key,
          item,
          quantity: newQty,
          unitPrice: item.price,
        },
      };
    });

    setAddedToast(item.name);
    setTimeout(() => {
      setAddedToast((current) => (current === item.name ? null : current));
    }, 2500);
  };

  // إضافة مخصصة مع الأحجام والإضافات
  const addCustomizedToCart = (params: AddCustomizedParams) => {
    const {
      item,
      quantity,
      size = 'عادي',
      sizePriceModifier = 0,
      stuffing = '',
      cookingStyle = '',
      addons = [],
      specialInstructions = '',
      unitPrice,
    } = params;

    const addonsSignature = addons.map((a) => a.id).sort().join('_');
    const key = `item_${item.id}_sz_${size}_st_${stuffing}_ck_${cookingStyle}_ad_${addonsSignature}_nt_${specialInstructions.trim().slice(0, 10)}`;

    setCart((prev) => {
      const existing = prev[key];
      const newQty = existing ? existing.quantity + quantity : quantity;
      return {
        ...prev,
        [key]: {
          key,
          item,
          quantity: newQty,
          size,
          sizePriceModifier,
          stuffing,
          cookingStyle,
          addons,
          specialInstructions,
          unitPrice,
        },
      };
    });

    setAddedToast(item.name);
    setTimeout(() => {
      setAddedToast((current) => (current === item.name ? null : current));
    }, 2500);
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setCart((prev) => {
      if (!prev[key]) return prev;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          quantity,
        },
      };
    });
  };

  const clearCart = () => {
    setCart({});
    try {
      localStorage.removeItem('loqma_cart_v2');
    } catch {
      // ignore
    }
  };

  const reorderItems = (
    items: Array<{ id?: number; name: string; price: number; quantity: number; size?: string; image?: string }>
  ) => {
    setCart((prev) => {
      const updated = { ...prev };
      items.forEach((it, idx) => {
        const id = it.id || 1000 + idx;
        const key = `reorder_${id}_${it.size || 'std'}_${Date.now()}_${idx}`;
        const menuItem: MenuItem = {
          id,
          name: it.name,
          categoryId: 'main',
          price: it.price,
          description: `إعادة طلب من وجبة سابقة: ${it.name}`,
          image: it.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
          calories: 650,
          tag: 'إعادة طلب ↺',
        };
        updated[key] = {
          key,
          item: menuItem,
          quantity: it.quantity || 1,
          size: it.size || 'عادي',
          unitPrice: it.price,
        };
      });
      return updated;
    });

    setAddedToast('تمت إعادة إضافة أصناف الطلب السابق إلى سلتك بنجاح!');
    setTimeout(() => setAddedToast(null), 3000);
    setIsCartOpen(true);
  };

  const totalItems = Object.values(cart).reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  const subtotal = Object.values(cart).reduce(
    (sum, cartItem) => sum + cartItem.unitPrice * cartItem.quantity,
    0
  );
  const deliveryFee = subtotal > 0 ? (subtotal >= 400 ? 0 : 30) : 0;
  const totalPrice = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addCustomizedToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        reorderItems,
        totalItems,
        subtotal,
        deliveryFee,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        addedToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
