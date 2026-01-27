import React from 'react';
import { useCart } from '../lib/CartContext';
import '../styles/CartDrawer.css';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, cartTotal, clearCart } = useCart();

    if (!isOpen) return null;

    return (
        <div className="cart-drawer-overlay" onClick={onClose}>
            <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="cart-drawer-header">
                    <h2>Your Cart</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <p className="empty-msg">Your cart is empty.</p>
                    ) : (
                        cart.map((item) => (
                            <div key={`${item.product.id}-${item.selectedVariantId}`} className="cart-item">
                                <img src={item.product.gallery?.[0]?.url} alt={item.product.title} />
                                <div className="cart-item-details">
                                    <span className="cart-item-title">{item.product.title}</span>
                                    <span className="cart-item-price">
                                        {item.quantity} x ${item.product.price || '0.00'}
                                    </span>
                                    {item.selectedVariantId && (
                                        <span className="cart-item-variant">Variant ID: {item.selectedVariantId}</span>
                                    )}
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.product.id, item.selectedVariantId)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="cart-total">
                            <span>Total:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button className="btn btn-primary btn-full">Checkout (Demo)</button>
                        <button className="btn btn-text" onClick={clearCart}>Clear All</button>
                    </div>
                )}
            </div>
        </div>
    );
};
