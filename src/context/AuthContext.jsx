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
        };

        setUsers((prev) => [...prev, newUser]);
        setUser({ id: newUser.id, name: newUser.name, email: newUser.email, provider: 'email', avatar: newUser.avatar });
        return { success: true };
    }, [users]);

    const login = useCallback((email, password) => {
        const emailLower = email.toLowerCase().trim();
        const found = users.find((u) => u.email === emailLower && u.password === password);

        if (!found) {
            return { success: false, error: 'Invalid email or password' };
        }

        setUser({ id: found.id, name: found.name, email: found.email, provider: 'email', avatar: found.avatar });
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
        };

        // Add to users if not existing
        setUsers((prev) => {
            const exists = prev.find((u) => u.email === newUser.email);
            if (!exists) return [...prev, { ...newUser, password: null, createdAt: new Date().toISOString() }];
            return prev;
        });

        setUser(newUser);
        return { success: true };
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

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
