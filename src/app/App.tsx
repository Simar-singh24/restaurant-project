import { useEffect, useState } from 'react';
import { Navbar } from '@/app/components/Navbar';
import { Hero } from '@/app/components/Hero';
import { About } from '@/app/components/About';
import { Menu } from '@/app/components/Menu';
import { Cocktails } from '@/app/components/Cocktails';
import { AICulinaryLab } from '@/app/components/AICulinaryLab';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { Footer } from '@/app/components/Footer';
import { LoadingScreen } from '@/app/components/LoadingScreen';
import { CartProvider } from '@/app/context/CartContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { AuthModal } from '@/app/components/AuthModal';
import { Cart } from '@/app/components/Cart';
import { Toaster } from 'sonner';

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    // Add smooth scroll behavior to the whole document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Prevent scrolling during loading
    document.body.style.overflow = 'hidden';
    
    const timer = setTimeout(() => {
      setShowLoading(false);
      document.body.style.overflow = 'auto';
    }, 2500);
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      clearTimeout(timer);
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="size-full">
          {showLoading && <LoadingScreen />}
          <Navbar onAdminClick={() => setIsAdminOpen(true)} />
          <Hero />
          <About />
          <Menu />
          <Cocktails />
          <AICulinaryLab />
          <Footer />
          <Cart />
          <AuthModal />
          {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
          <Toaster position="bottom-right" richColors />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}