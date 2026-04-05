import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  duration?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  duration = 1,
  className = ''
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const getInitialPosition = () => {
      switch (direction) {
        case 'up':
          return { y: 100, x: 0 };
        case 'down':
          return { y: -100, x: 0 };
        case 'left':
          return { x: 100, y: 0 };
        case 'right':
          return { x: -100, y: 0 };
        case 'fade':
        default:
          return { x: 0, y: 0 };
      }
    };

    const initialPos = getInitialPosition();

    gsap.set(element, {
      opacity: 0,
      ...initialPos
    });

    const animation = gsap.to(element, {
      opacity: 1,
      x: 0,
      y: 0,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      }
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [delay, direction, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
