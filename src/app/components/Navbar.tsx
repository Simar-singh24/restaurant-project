import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Detect active section
      const sections = ['home', 'about', 'menu', 'cocktails'];
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
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

            <button className="ml-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Reserve Table
            </button>
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top">
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
            <div className="px-4 mt-4">
              <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-md">
                Reserve Table
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}