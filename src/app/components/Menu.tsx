interface MenuItemType {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  rating: number;
  trending: boolean;
}

import { useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { useCart } from '@/app/context/CartContext';
import { Star, TrendingUp, ShoppingCart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Menu() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          console.error('API returned non-array:', data);
          setMenuItems([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch menu items:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || menuItems.length === 0) return;

    const cards = sectionRef.current?.querySelectorAll('.menu-card');
    
    if (cards && cards.length > 0) {
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          {
            rotateY: -15,
            opacity: 0.8,
          },
          {
            rotateY: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }
  }, [loading, menuItems]);

  return (
    <section id="menu" ref={sectionRef} className="py-24 bg-gradient-to-b from-amber-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-amber-300/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal direction="fade" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Customer Favorites</span>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 text-amber-800 font-serif">Most Selling Items</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-6" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our customers' favorites, prepared with the finest ingredients and traditional techniques
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          {loading ? (
            <div className="col-span-full py-12 text-center text-amber-800 text-xl font-semibold animate-pulse">
              Loading Menu...
            </div>
          ) : menuItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              No menu items available.
            </div>
          ) : (
            menuItems.map((item, index) => (
            <ScrollReveal
              key={item.id}
              direction="up"
              delay={0.1 + index * 0.15}
            >
              <div className="menu-card group relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform group-hover:scale-[1.02] transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-72 overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Rating badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-1 shadow-lg">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-semibold">{item.rating}</span>
                    </div>
                    
                    {/* Trending badge */}
                    {item.trending && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs font-semibold">Trending</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-2xl text-gray-900 font-serif">{item.name}</h3>
                      <span className="text-2xl text-amber-700 font-semibold">{item.price}</span>
                    </div>
                    <p className="text-gray-600 mb-6 flex-1 leading-relaxed">{item.description}</p>
                    <button 
                      onClick={() => {
                        const priceNum = parseInt(item.price.replace(/\D/g, ''));
                        addToCart({
                          id: `food-${item.id}`,
                          originalId: item.id,
                          name: item.name,
                          price: priceNum,
                          type: 'food',
                          image: item.image,
                        });
                      }}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )))}
        </div>

        {/* Additional image section */}
        <ScrollReveal direction="fade" delay={0.5} className="mt-20">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb29kJTIwcGxhdHRlciUyMHRoYWxpfGVufDF8fHx8MTc2OTk3MTc5M3ww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Indian thali platter"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
              <div className="px-12 text-white max-w-2xl">
                <h3 className="text-4xl font-serif mb-4">Experience the Complete Thali</h3>
                <p className="text-lg mb-6">A traditional Indian platter featuring a variety of curries, breads, rice, and desserts</p>
                <button className="bg-white text-amber-800 px-8 py-3 rounded-full font-semibold hover:bg-amber-50 transition-colors duration-300 shadow-xl">
                  View Full Menu
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
}
