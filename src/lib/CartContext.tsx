import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './hygraphClient';

type CartItem = {
    product: Product;
    quantity: number;
    selectedVariantId?: string;
};

type CartContextType = {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number, variantId?: string) => void;
    removeFromCart: (productId: string, variantId?: string) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (product: Product, quantity: number = 1, variantId?: string) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(
                (item) => item.product.id === product.id && item.selectedVariantId === variantId
            );

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            }

            return [...prevCart, { product, quantity, selectedVariantId: variantId }];
        });
    };

    const removeFromCart = (productId: string, variantId?: string) => {
        setCart((prevCart) =>
            prevCart.filter(
                (item) => !(item.product.id === productId && item.selectedVariantId === variantId)
            )
        );
    };

    const clearCart = () => setCart([]);

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
    const cartTotal = cart.reduce(
        (total, item) => total + (item.product.price || 0) * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount }}
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
