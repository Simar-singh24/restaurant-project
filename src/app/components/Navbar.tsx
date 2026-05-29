import { useState, useEffect, useRef } from 'react';
import { Menu, X, Sparkles, ShoppingBag, User, LogOut, Receipt, Coins, History } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const { cartCount, setIsCartOpen } = useCart();
  const { user, orders, logout, setIsAuthModalOpen } = useAuth();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Detect active section
      const sections = ['home', 'about', 'menu', 'cocktails', 'ai-lab'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Most Selling Items', id: 'menu' },
    { label: 'Cocktails', id: 'cocktails' },
    { label: 'AI Culinary Lab', id: 'ai-lab' },
  ];

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogoutClick = () => {
    logout();
    setIsDropdownOpen(false);
    toast.success('Logged out successfully.');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white shadow-lg backdrop-blur-lg' 
            : 'bg-white/90 backdrop-blur-md shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="relative">
                <Sparkles className="h-6 w-6 text-amber-600 group-hover:text-amber-700 transition-colors" />
                <div className="absolute inset-0 bg-amber-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
              </div>
              <span className="text-3xl font-serif text-amber-800 group-hover:text-amber-900 transition-colors">
                ICE CUBE
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 text-gray-700 hover:text-amber-800 transition-all duration-300 group ${
                    activeSection === item.id ? 'text-amber-800' : ''
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 transform origin-left transition-transform duration-300 ${
                      activeSection === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              ))}
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 ml-2 text-gray-700 hover:text-amber-800 transition-colors"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User authentication states */}
              {user ? (
                <div className="relative ml-4" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-sm border-2 border-white shadow-md hover:shadow-lg hover:scale-105 transition-all outline-none"
                  >
                    {getUserInitials(user.name)}
                  </button>

                  {/* Profile Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-scale-in">
                      <div className="px-5 py-3 border-b border-gray-50">
                        <p className="font-semibold text-gray-900 leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-amber-600" />
                          AI Credits
                        </span>
                        <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                          {user.aiCredits}
                        </span>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowHistoryModal(true);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-5 py-2.5 text-left text-sm text-gray-700 hover:bg-amber-50/50 hover:text-amber-800 transition-colors flex items-center gap-3"
                        >
                          <History className="w-4.5 h-4.5 text-gray-400" />
                          Order History
                        </button>
                        
                        <button
                          onClick={() => {
                            scrollToSection('ai-lab');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-5 py-2.5 text-left text-sm text-gray-700 hover:bg-amber-50/50 hover:text-amber-800 transition-colors flex items-center gap-3"
                        >
                          <Sparkles className="w-4.5 h-4.5 text-gray-400" />
                          AI Culinary Suite
                        </button>

                        <button
                          onClick={handleLogoutClick}
                          className="w-full px-5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50/50 transition-colors flex items-center gap-3 border-t border-gray-50 mt-1"
                        >
                          <LogOut className="w-4.5 h-4.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="ml-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Actions: Cart + Menu */}
            <div className="flex md:hidden items-center gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-amber-800 transition-colors"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                className="relative group"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="absolute inset-0 bg-amber-100 rounded-lg transform scale-0 group-hover:scale-100 transition-transform" />
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700 relative z-10" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700 relative z-10" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top bg-white border-b border-gray-100 shadow-lg px-4">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-800 transition-all duration-200 ${
                  activeSection === item.id ? 'bg-amber-50 text-amber-800 border-l-4 border-amber-600' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </button>
            ))}
            <div className="px-4 mt-4 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">Credits: {user.aiCredits}</span>
                    <button 
                      onClick={() => {
                        setShowHistoryModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs text-amber-700 font-semibold"
                    >
                      View Orders
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      toast.success('Logged out successfully.');
                    }}
                    className="w-full border border-red-200 text-red-600 px-6 py-3 rounded-full text-center hover:bg-red-50 transition-all text-sm font-semibold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-full text-center hover:from-amber-700 hover:to-amber-800 transition-all shadow-md text-sm font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ORDER HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowHistoryModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-amber-100 shadow-2xl overflow-hidden animate-scale-in z-10 flex flex-col max-h-[80vh]">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-amber-50/50">
              <div className="flex items-center gap-2 text-amber-900">
                <Receipt className="w-5 h-5 text-amber-700" />
                <h3 className="text-2xl font-serif">Order History</h3>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                  <Receipt className="w-12 h-12 opacity-20 mb-3" />
                  <p className="text-sm">You haven't placed any orders yet.</p>
                  <p className="text-xs mt-1">Start shopping our delicious items or build your custom dish!</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm space-y-4 hover:border-amber-100 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-3">
                      <div>
                        <span className="text-xs text-gray-400">Order ID</span>
                        <p className="text-sm font-bold text-gray-900">#IC-00{order.id}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block text-right">Placed On</span>
                        <p className="text-xs text-gray-600 font-semibold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          order.status === 'COMPLETED' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <span className="font-semibold text-amber-700">{item.quantity}x</span>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-500">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400 font-semibold">Total Paid</span>
                      <span className="text-base font-bold text-amber-800">₹{order.totalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}