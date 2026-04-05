interface CocktailType {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  isSpecial: boolean;
}

import { useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { useCart } from '@/app/context/CartContext';
import { Wine, Sparkles, ShoppingCart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Cocktails() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [cocktails, setCocktails] = useState<CocktailType[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/cocktails')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCocktails(data);
        } else {
          console.error('API returned non-array:', data);
          setCocktails([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch cocktails:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || cocktails.length === 0) return;

    // Animate the wine icon
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none',
      });

      gsap.to(iconRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // Stagger animation for cocktail cards
    const cards = sectionRef.current?.querySelectorAll('.cocktail-card');
    if (cards && cards.length > 0) {
      gsap.from(cards, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: 'back.out(1.7)',
      });
    }
  }, [loading, cocktails]);

  return (
    <section id="cocktails" ref={sectionRef} className="py-24 bg-gradient-to-b from-white via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-20 h-20 border-2 border-amber-300/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `bubble ${10 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal direction="fade" className="text-center mb-16">
          <div ref={iconRef} className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-full">
                <Wine className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 text-amber-800 font-serif">Signature Drinks</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-6" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Refreshing beverages and creative cocktails infused with authentic Indian flavors
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {loading ? (
            <div className="col-span-full py-12 text-center text-amber-800 text-xl font-semibold animate-pulse">
              Loading Cocktails...
            </div>
          ) : cocktails.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              No cocktails available.
            </div>
          ) : (
            cocktails.map((cocktail, index) => (
            <div key={cocktail.id} className="cocktail-card group">
              <div className="relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-lg" />
                <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col transform group-hover:-translate-y-2">
                  <div className="relative h-80 overflow-hidden">
                    <ImageWithFallback
                      src={cocktail.image}
                      alt={cocktail.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {cocktail.isSpecial && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg animate-pulse">
                        <Sparkles className="h-3 w-3" />
                        <span className="text-xs font-semibold">Special</span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <h3 className="text-xl font-serif mb-1">{cocktail.name}</h3>
                          <p className="text-sm text-gray-200 line-clamp-2">{cocktail.description}</p>
                        </div>
                        <span className="text-2xl font-semibold text-amber-300">{cocktail.price}</span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          const priceNum = parseInt(cocktail.price.replace(/\D/g, ''));
                          addToCart({
                            id: `cocktail-${cocktail.id}`,
                            originalId: cocktail.id,
                            name: cocktail.name,
                            price: priceNum,
                            type: 'cocktail',
                            image: cocktail.image,
                          });
                        }}
                        className="w-full bg-amber-500/90 hover:bg-amber-500 text-white py-2 rounded-xl text-sm font-semibold transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )))}
        </div>

        {/* Feature section */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/90 to-orange-600/90" />
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1742281257687-092746ad6021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZXN0YXVyYW50JTIwZGluaW5nJTIwYW1iaWVuY2V8ZW58MXx8fHwxNzY5OTcxNzkzfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Restaurant ambience"
              className="w-full h-96 object-cover opacity-40"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-8 max-w-2xl">
                <Wine className="h-16 w-16 mx-auto mb-6" />
                <h3 className="text-4xl font-serif mb-4">Explore Our Complete Drinks Menu</h3>
                <p className="text-xl mb-8 leading-relaxed">
                  From traditional Indian beverages to creative fusion cocktails, discover our full range of refreshing drinks
                </p>
                <button className="bg-white text-amber-800 px-10 py-4 rounded-full text-lg font-semibold hover:bg-amber-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 transform hover:scale-105">
                  View Full Drinks Menu
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Additional info cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            { title: 'Fresh Ingredients', desc: 'Made with premium fruits and authentic Indian spices' },
            { title: 'Expert Mixologists', desc: 'Crafted by experienced bartenders with passion' },
            { title: 'Unique Flavors', desc: 'Fusion of traditional Indian tastes with modern mixology' }
          ].map((item, index) => (
            <ScrollReveal key={item.title} direction="up" delay={0.2 + index * 0.1}>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-shadow duration-300">
                <h4 className="text-lg font-semibold text-amber-800 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bubble {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-50px) scale(1.1);
            opacity: 0.3;
          }
        }
      `}</style>
    </section>
  );
}
