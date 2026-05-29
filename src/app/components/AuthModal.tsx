import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          toast.success('Welcome back to Ice Cube!');
          setIsAuthModalOpen(false);
          // Reset form fields
          setEmail('');
          setPassword('');
        } else {
          toast.error(result.error || 'Invalid credentials');
        }
      } else {
        const result = await register(name, email, password);
        if (result.success) {
          toast.success('Account created successfully! 10 AI Credits added.');
          setIsAuthModalOpen(false);
          // Reset form fields
          setName('');
          setEmail('');
          setPassword('');
        } else {
          toast.error(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-amber-100 shadow-2xl overflow-hidden animate-scale-in z-10">
        
        {/* Shiny Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-700" />
        
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 pt-10 pb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-amber-50 p-3 rounded-2xl mb-3 border border-amber-100">
              <Sparkles className="w-6 h-6 text-amber-700 animate-pulse" />
            </div>
            <h2 className="text-3xl font-serif text-amber-900">
              {isLogin ? 'Welcome Back' : 'Join Ice Cube'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin ? 'Unlock your premium AI Culinary dashboard' : 'Sign up and get 10 free AI credits!'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 transition-all outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <button 
                  onClick={() => setIsLogin(false)} 
                  className="text-amber-700 hover:text-amber-800 font-semibold focus:outline-none"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => setIsLogin(true)} 
                  className="text-amber-700 hover:text-amber-800 font-semibold focus:outline-none"
                >
                  Log in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
