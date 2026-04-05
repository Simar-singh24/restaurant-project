import { useEffect, useRef } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import gsap from 'gsap';

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([titleRef.current, subtitleRef.current, buttonRef.current], {
        opacity: 0,
        y: 50
      });

      // Create animation timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(videoOverlayRef.current, {
        opacity: 1,
        duration: 1
      })
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'back.out(1.7)'
      }, '-=0.5')
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
      }, '-=0.8')
      .to(buttonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        onComplete: () => {
          // Add floating animation to button after initial animation
          gsap.to(buttonRef.current, {
            y: -10,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        }
      }, '-=0.6');

      // Animate title letters
      const titleChars = titleRef.current?.textContent?.split('') || [];
      if (titleRef.current) {
        titleRef.current.innerHTML = titleChars
          .map((char) => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
          .join('');
        
        gsap.from(titleRef.current.children, {
          opacity: 0,
          y: 50,
          rotateX: -90,
          stagger: 0.05,
          duration: 0.8,
          ease: 'back.out(1.7)',
          delay: 0.5
        });
      }

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleViewMenu = () => {
    const element = document.getElementById('menu');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" ref={heroRef} className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1598626141902-de09a01586d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY5ODAzNTU4fDA&ixlib=rb-4.1.0&q=80&w=1080"
        >
          <source src="https://player.vimeo.com/external/430802337.hd.mp4?s=6b3f3e5e8e5e4b3e4b3e4b3e4b3e4b3e4b3e4b3e&profile_id=174" type="video/mp4" />
        </video>
        {/* Fallback image if video doesn't load */}
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1598626141902-de09a01586d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY5ODAzNTU4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Restaurant interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Animated gradient overlay */}
      <div
        ref={videoOverlayRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(180,83,9,0.5) 50%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4 z-10">
        <div className="text-center text-white max-w-4xl">
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl mb-6 font-serif tracking-wider"
            style={{ textShadow: '2px 2px 20px rgba(0,0,0,0.8)' }}
          >
            Welcome to ICE   CUBE
          </h1>
          <p
            ref={subtitleRef}
            className="text-xl md:text-3xl mb-10 opacity-0 font-light tracking-wide"
            style={{ textShadow: '1px 1px 10px rgba(0,0,0,0.8)' }}
          >
            Experience the authentic flavors of India in a vibrant atmosphere
          </p>
          <button
            ref={buttonRef}
            onClick={handleViewMenu}
            className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-amber-500/50 hover:scale-105 opacity-0"
          >
            Explore Our Menu
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-40px) translateX(-10px);
          }
          75% {
            transform: translateY(-20px) translateX(5px);
          }
        }
      `}</style>
    </section>
  );
}
