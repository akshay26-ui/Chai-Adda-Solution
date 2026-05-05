import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

function loadUser() {
    try {
        const saved = localStorage.getItem('chai-adda-user');
        if (saved) return JSON.parse(saved);
    } catch {
        // ignore
    }
    return null;
}

function loadUsers() {
    try {
        const saved = localStorage.getItem('chai-adda-users');
        if (saved) return JSON.parse(saved);
    } catch {
        // ignore
    }
    return [];
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadUser);
    const [users, setUsers] = useState(loadUsers);

    // Persist user session
    useEffect(() => {
        if (user) {
            localStorage.setItem('chai-adda-user', JSON.stringify(user));
        } else {
            localStorage.removeItem('chai-adda-user');
        }
    }, [user]);

    // Persist registered users
    useEffect(() => {
        localStorage.setItem('chai-adda-users', JSON.stringify(users));
    }, [users]);

    const isAuthenticated = !!user;

    // Validate university email pattern
    const isValidUniversityEmail = (email) => {
        const emailLower = email.toLowerCase().trim();
        // Accept common university email patterns
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|edu\.[a-z]{2}|ac\.[a-z]{2,3}|university|college|inst|iit|nit|iiit|bits|vit|srmist|manipal|amity|lpu|sharda|galgotias|bennett|jiit|dtu|nsut|igdtuw|iiitd|ip|du|[a-z]+\.edu)$/i.test(emailLower)
            || emailLower.endsWith('.edu')
            || emailLower.endsWith('.edu.in')
            || emailLower.endsWith('.ac.in')
            || emailLower.includes('university')
            || emailLower.includes('college')
            || emailLower.includes('student');
    };

    const signup = useCallback((name, email, password) => {
        const emailLower = email.toLowerCase().trim();

        // Check if user already exists
        const existing = users.find((u) => u.email === emailLower);
        if (existing) {
            return { success: false, error: 'An account with this email already exists' };
        }

        // Validate email
        if (!isValidUniversityEmail(emailLower)) {
            return { success: false, error: 'Please use a valid university/college email address' };
        }

        // Validate password
        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        const newUser = {
            id: `user_${Date.now()}`,
            name: name.trim(),
            email: emailLower,
            password, // In a real app this would be hashed
            provider: 'email',
            avatar: name.trim().charAt(0).toUpperCase(),
            createdAt: new Date().toISOString(),
            favorites: [
                {
                    id: `fav_${Date.now()}`,
                    name: 'My Usual: 2 Chai + Momos',
                    items: [
                        { id: 'b1', name: 'Masala Tea', price: 20, emoji: '🍵', quantity: 2 },
                        { id: 'f2', name: 'Paneer Momo', price: 99, emoji: '🥟', quantity: 1 }
                    ]
                }
            ],
            favoriteItems: [],
            orderHistory: []
        };

        setUsers((prev) => [...prev, newUser]);
        setUser(newUser);
        return { success: true };
    }, [users]);

    const login = useCallback((email, password) => {
        const emailLower = email.toLowerCase().trim();
        const found = users.find((u) => u.email === emailLower && u.password === password);

        if (!found) {
            return { success: false, error: 'Invalid email or password' };
        }

        setUser({ 
            ...found, 
            favorites: found.favorites || [
                {
                    id: 'dummy_fav_1',
                    name: 'My Usual: 2 Chai + Momos',
                    items: [
                        { id: 'b1', name: 'Masala Tea', price: 20, emoji: '🍵', quantity: 2 },
                        { id: 'f2', name: 'Paneer Momo', price: 99, emoji: '🥟', quantity: 1 }
                    ]
                }
            ], 
            favoriteItems: found.favoriteItems || [],
            orderHistory: found.orderHistory || [] 
        });
        return { success: true };
    }, [users]);

    const loginWithGoogle = useCallback((googleUser) => {
        // Simulated Google sign-in
        const newUser = {
            id: `google_${Date.now()}`,
            name: googleUser.name,
            email: googleUser.email,
            provider: 'google',
            avatar: googleUser.name.charAt(0).toUpperCase(),
            favorites: [
                {
                    id: `fav_${Date.now()}`,
                    name: 'My Usual: 2 Chai + Momos',
                    items: [
                        { id: 'b1', name: 'Masala Tea', price: 20, emoji: '🍵', quantity: 2 },
                        { id: 'f2', name: 'Paneer Momo', price: 99, emoji: '🥟', quantity: 1 }
                    ]
                }
            ],
            favoriteItems: [],
            orderHistory: []
        };

        // Add to users if not existing
        setUsers((prev) => {
            const exists = prev.find((u) => u.email === newUser.email);
            if (!exists) return [...prev, { ...newUser, password: null, createdAt: new Date().toISOString() }];
            return prev;
        });

        setUser((prevUser) => {
            const existing = users.find((u) => u.email === newUser.email);
            return existing ? { ...existing, favorites: existing.favorites || [], favoriteItems: existing.favoriteItems || [], orderHistory: existing.orderHistory || [] } : newUser;
        });
        return { success: true };
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const updateUserProfile = useCallback((updates) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updates } : u));
    }, [user]);

    const addFavorite = useCallback((name, items) => {
        const newFav = { id: Date.now().toString(), name, items };
        const favorites = [...(user.favorites || []), newFav];
        updateUserProfile({ favorites });
    }, [user, updateUserProfile]);

    const removeFavorite = useCallback((id) => {
        const favorites = (user.favorites || []).filter(f => f.id !== id);
        updateUserProfile({ favorites });
    }, [user, updateUserProfile]);

    const toggleFavoriteItem = useCallback((item) => {
        if (!user) return;
        const currentItems = user.favoriteItems || [];
        const exists = currentItems.find(i => i.id === item.id);
        
        let newItems;
        if (exists) {
            newItems = currentItems.filter(i => i.id !== item.id);
        } else {
            newItems = [...currentItems, item];
        }
        updateUserProfile({ favoriteItems: newItems });
    }, [user, updateUserProfile]);

    const addToOrderHistory = useCallback((orderData) => {
        const orderHistory = [{ ...orderData, historyId: Date.now().toString(), orderDate: new Date().toISOString() }, ...(user.orderHistory || [])];
        updateUserProfile({ orderHistory });
    }, [user, updateUserProfile]);

    const getRecommendations = useCallback(() => {
        if (!user || !user.orderHistory || user.orderHistory.length === 0) return [];
        const itemFreq = {};
        const itemMap = {};
        user.orderHistory.forEach(order => {
            order.items.forEach(item => {
                itemFreq[item.id] = (itemFreq[item.id] || 0) + item.quantity;
                if (!itemMap[item.id]) itemMap[item.id] = item;
            });
        });
        const sortedIds = Object.entries(itemFreq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(entry => entry[0]);
        return sortedIds.map(id => itemMap[id]);
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                signup,
                login,
                loginWithGoogle,
                logout,
                isValidUniversityEmail,
                addFavorite,
                removeFavorite,
                toggleFavoriteItem,
                addToOrderHistory,
                getRecommendations,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
