import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { menuData } from '../data/menuData';

const StockContext = createContext();

// Build initial stock from menu data — default 50 units each
function buildInitialStock() {
    const stock = {};
    Object.values(menuData).forEach((category) => {
        category.items.forEach((item) => {
            stock[item.id] = 50;
        });
    });
    return stock;
}

function loadStock() {
    try {
        const saved = localStorage.getItem('chai-adda-stock');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with initial stock so new menu items get a default
            const initial = buildInitialStock();
            return { ...initial, ...parsed };
        }
    } catch {
        // ignore
    }
    return buildInitialStock();
}

export function StockProvider({ children }) {
    const [stock, setStock] = useState(loadStock);

    // Persist to localStorage on every change
    useEffect(() => {
        localStorage.setItem('chai-adda-stock', JSON.stringify(stock));
    }, [stock]);

    const getStock = useCallback(
        (itemId) => stock[itemId] ?? 0,
        [stock]
    );

    const isInStock = useCallback(
        (itemId) => (stock[itemId] ?? 0) > 0,
        [stock]
    );

    const updateStock = useCallback((itemId, quantity) => {
        setStock((prev) => ({
            ...prev,
            [itemId]: Math.max(0, quantity),
        }));
    }, []);

    const decrementStock = useCallback((itemId, amount = 1) => {
        setStock((prev) => ({
            ...prev,
            [itemId]: Math.max(0, (prev[itemId] ?? 0) - amount),
        }));
    }, []);

    const incrementStock = useCallback((itemId, amount = 1) => {
        setStock((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] ?? 0) + amount,
        }));
    }, []);

    const resetAllStock = useCallback(() => {
        setStock(buildInitialStock());
    }, []);

    // Get items that are out of stock
    const outOfStockItems = Object.entries(stock)
        .filter(([, qty]) => qty === 0)
        .map(([id]) => id);

    // Get items that are low stock (≤ 5)
    const lowStockItems = Object.entries(stock)
        .filter(([, qty]) => qty > 0 && qty <= 5)
        .map(([id]) => id);

    return (
        <StockContext.Provider
            value={{
                stock,
                getStock,
                isInStock,
                updateStock,
                decrementStock,
                incrementStock,
                resetAllStock,
                outOfStockItems,
                lowStockItems,
            }}
        >
            {children}
        </StockContext.Provider>
    );
}

export function useStock() {
    const context = useContext(StockContext);
    if (!context) {
        throw new Error('useStock must be used within a StockProvider');
    }
    return context;
}
