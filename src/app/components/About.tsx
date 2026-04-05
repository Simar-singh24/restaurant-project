import { useEffect, useRef } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { ChefHat, Award, Heart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scrollTrigger: {
          trigger: imageRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        y: -50,
        ease: 'none'
      });
    }
  }, []);

  const features = [
    {
      icon: ChefHat,
      title: 'Expert Chefs',
      description: 'Trained in traditional Indian cooking techniques, bringing authentic regional flavors'
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized for excellence in Indian cuisine and warm hospitality'
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Fresh spices and ingredients sourced daily for the perfect taste'
    }
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-white to-amber-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal direction="fade" className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl mb-6 text-amber-800 font-serif">About Us</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-6" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A celebration of authentic Indian cuisine and rich cultural heritage
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <ScrollReveal direction="left" delay={0.2}>
            <div ref={imageRef} className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity blur-xl" />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1757802261994-3c31584daafd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzcGljZXMlMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3Njk5NzE3OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Indian spices"
                className="relative w-full h-[500px] object-cover rounded-2xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="right" delay={0.3}>
            <div className="space-y-6">
              <h3 className="text-3xl font-serif text-amber-800 mb-4">Our Story</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Since 2010, ICE CUBE has been bringing the vibrant flavors and aromatic spices of India to food lovers. Our chefs use traditional recipes passed down through generations, combined with the freshest ingredients to create an unforgettable dining experience.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                From the streets of Delhi to the coastal cuisines of Kerala, we celebrate the diversity of Indian culinary traditions. Every dish tells a story of culture, passion, and authentic taste that transports you to the heart of India.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-700">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="w-px h-12 bg-gray-300" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-700">50K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="w-px h-12 bg-gray-300" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-700">200+</div>
                  <div className="text-sm text-gray-600">Dishes Served</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              direction="up"
              delay={0.2 + index * 0.1}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 blur-xl" />
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl mb-3 text-center font-serif text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
