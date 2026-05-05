import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

export default function Cart() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
    const { addToast } = useToast();
    const { isAuthenticated, user, addFavorite } = useAuth();
    const navigate = useNavigate();
    const [isSavingFav, setIsSavingFav] = useState(false);
    const [favName, setFavName] = useState('');

    const estimatedPrepTime = totalItems > 0 
        ? items.reduce((total, item) => {
            const isBeverage = /^b\d+$/.test(item.id);
            return total + (isBeverage ? 1 : 2) * item.quantity;
        }, 5)
        : 0;

    const handleRemove = (item) => {
        removeItem(item.id);
        addToast(`${item.name} removed from cart`, 'info');
    };

    const handleSaveFavorite = () => {
        if (!favName.trim()) {
            addToast('Please enter a name for your favorite combo', 'warning');
            return;
        }
        addFavorite(favName, items);
        addToast('Favorite combo saved! You can quick-reorder from your profile.', 'success');
        setIsSavingFav(false);
        setFavName('');
    };

    const handleProceedToPayment = () => {
        if (!isAuthenticated) {
            addToast('Please login to place your order', 'warning');
            navigate('/auth', { state: { from: '/cart' } });
            return;
        }
        navigate('/payment');
    };

    return (
        <div className="cart-page page-enter">
            <div className="container">
                <motion.div
                    className="cart-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1>🛒 Your Cart</h1>
                    {items.length > 0 && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { clearCart(); addToast('Cart cleared', 'info'); }}
                        >
                            Clear All
                        </button>
                    )}
                </motion.div>

                {items.length === 0 ? (
                    <motion.div
                        className="cart-empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <span className="empty-emoji">🛒</span>
                        <h2>Your cart is empty</h2>
                        <p>Add some delicious items from our menu!</p>
                        <Link to="/menu" className="btn btn-primary cursor-target">
                            Browse Menu →
                        </Link>
                    </motion.div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            <AnimatePresence>
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        className="cart-item glass"
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20, height: 0, padding: 0, margin: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="cart-item-emoji">{item.emoji}</div>
                                        <div className="cart-item-info">
                                            <h3>{item.name}</h3>
                                            <span className="cart-item-price">₹{item.price} each</span>
                                        </div>
                                        <div className="cart-item-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                −
                                            </button>
                                            <motion.span
                                                className="qty-display"
                                                key={item.quantity}
                                                initial={{ scale: 1.3 }}
                                                animate={{ scale: 1 }}
                                            >
                                                {item.quantity}
                                            </motion.span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="cart-item-total">
                                            ₹{item.price * item.quantity}
                                        </div>
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => handleRemove(item)}
                                            aria-label="Remove item"
                                        >
                                            ✕
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <motion.div
                            className="cart-summary glass-strong"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2>Order Summary</h2>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Items</span>
                                    <span>{totalItems}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax</span>
                                    <span>₹0</span>
                                </div>
                                <div className="summary-row">
                                    <span>Est. Prep Time</span>
                                    <span>{estimatedPrepTime} mins</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                            </div>
                            <p className="summary-note">All prices include MRP as displayed</p>

                            {isAuthenticated && items.length > 0 && (
                                <div className="cart-favorite-section" style={{ marginBottom: '1.5rem' }}>
                                    {!isSavingFav ? (
                                        <button className="btn btn-secondary btn-sm cursor-target w-full" onClick={() => setIsSavingFav(true)}>
                                            ⭐ Save Cart as Favorite
                                        </button>
                                    ) : (
                                        <div className="favorite-input-group" style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. My Usual Chai" 
                                                value={favName} 
                                                onChange={(e) => setFavName(e.target.value)} 
                                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--clr-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-primary btn-sm cursor-target" onClick={handleSaveFavorite} style={{ flex: 1 }}>Save</button>
                                                <button className="btn btn-ghost btn-sm cursor-target" onClick={() => setIsSavingFav(false)} style={{ flex: 1 }}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isAuthenticated ? (
                                <button
                                    className="btn btn-primary btn-lg summary-btn cursor-target"
                                    onClick={handleProceedToPayment}
                                >
                                    Proceed to Payment →
                                </button>
                            ) : (
                                <div className="cart-auth-gate">
                                    <button
                                        className="btn btn-primary btn-lg summary-btn cursor-target"
                                        onClick={handleProceedToPayment}
                                    >
                                        Login to Place Order →
                                    </button>
                                    <p className="cart-auth-note">🔒 Login required to place orders</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

