import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserType {
  id: number;
  email: string;
  name: string;
  aiCredits: number;
}

export interface OrderItemType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: string;
}

export interface OrderHistoryType {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItemType[];
}

interface AuthContextType {
  user: UserType | null;
  orders: OrderHistoryType[];
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  rechargeCredits: (amount: number) => Promise<{ success: boolean; message?: string }>;
  deductCredit: (newCount: number) => void;
  refreshUserData: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<OrderHistoryType[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('icecube_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          aiCredits: data.aiCredits,
        });
        setOrders(data.orders || []);
      } else {
        // Token might have expired
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem('icecube_token', data.token);
      setToken(data.token);
      setUser(data.user);
      // Immediately fetch complete details including orders
      await fetchUserData(data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      localStorage.setItem('icecube_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setOrders([]);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('icecube_token');
    setToken(null);
    setUser(null);
    setOrders([]);
  };

  const rechargeCredits = async (amount: number) => {
    if (!token) return { success: false, error: 'Please log in' };

    try {
      const response = await fetch('/api/auth/add-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Credit top-up failed' };
      }

      if (user) {
        setUser({ ...user, aiCredits: data.aiCredits });
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: 'Network error. Credit top-up failed' };
    }
  };

  const deductCredit = (newCount: number) => {
    if (user) {
      setUser({ ...user, aiCredits: newCount });
    }
  };

  const refreshUserData = async () => {
    if (token) {
      await fetchUserData(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        token,
        loading,
        login,
        register,
        logout,
        rechargeCredits,
        deductCredit,
        refreshUserData,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
