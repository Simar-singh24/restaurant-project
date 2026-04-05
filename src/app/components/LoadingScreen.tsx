import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2 }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 flex items-center justify-center"
      onAnimationComplete={() => {
        if (!isVisible) {
          document.body.style.overflow = 'auto';
        }
      }}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1, 
            ease: "backOut",
            delay: 0.2 
          }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-amber-400 rounded-full blur-3xl opacity-50 animate-pulse" />
          <Sparkles className="relative h-24 w-24 text-white mx-auto" />
        </motion.div>

        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-6xl font-serif text-white mb-4 tracking-wider"
        >
          ICE CUBE
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '200px' }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-amber-100 text-xl tracking-wide"
        >
          Authentic Indian Cuisine
        </motion.p>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex gap-2 justify-center mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 0 }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-amber-400 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
