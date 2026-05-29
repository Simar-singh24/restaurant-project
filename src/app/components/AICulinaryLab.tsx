import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';
import { Sparkles, ChefHat, Wine, Send, Coins, Lock, ShoppingCart, MessageSquare, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedDishType {
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  type: 'food' | 'cocktail';
  image: string;
}

export function AICulinaryLab() {
  const { user, token, setIsAuthModalOpen, deductCredit, rechargeCredits } = useAuth();
  const { addToCart } = useCart();

  // General States
  const [activeTab, setActiveTab] = useState<'chef' | 'sommelier'>('chef');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingLoading, setBillingLoading] = useState<string | null>(null);

  // Chef Lab States
  const [prompt, setPrompt] = useState('');
  const [dishType, setDishType] = useState<'food' | 'cocktail'>('food');
  const [generating, setGenerating] = useState(false);
  const [generatedDish, setGeneratedDish] = useState<GeneratedDishType | null>(null);
  const [chefLoadingMessage, setChefLoadingMessage] = useState('Dicing ingredients...');

  // Sommelier Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Salutations! I am your AI Sommelier and Chef Assistant. Ask me about food pairings, recipe tweaks, or cocktail custom matches!' }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Chef Loading Spinner Messages Cycle
  useEffect(() => {
    if (!generating) return;
    const messages = [
      'Dicing ingredients...',
      'Roasting whole spices...',
      'Simmering the secret curry sauce...',
      'Infusing natural hickory smoke...',
      'Shaving organic sugarcane...',
      'Chilling the crystal-clear ice cubes...',
      'Plating with micro-greens...'
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setChefLoadingMessage(messages[index]);
    }, 1800);
    return () => clearInterval(interval);
  }, [generating]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle Custom Dish Generation
  const handleGenerateDish = async () => {
    if (!prompt.trim()) {
      toast.error('Tell us what you are craving first!');
      return;
    }
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (user.aiCredits <= 0) {
      setShowBillingModal(true);
      toast.error('Out of credits! Choose a credit recharge option.');
      return;
    }

    setGenerating(true);
    setGeneratedDish(null);
    try {
      const response = await fetch('/api/ai/generate-dish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, type: dishType })
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.outOfCredits) {
          setShowBillingModal(true);
        }
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedDish({
        name: data.name,
        description: data.description,
        ingredients: data.ingredients,
        price: data.price,
        type: data.type,
        image: data.image
      });
      
      // Update credit balance locally
      deductCredit(data.aiCredits);
      toast.success('Your bespoke dish has been plated! 1 Credit deducted.');
    } catch (err: any) {
      toast.error(err.message || 'AI is currently offline. Plating fallback chef special.');
    } finally {
      setGenerating(false);
    }
  };

  // Handle Sommelier Chat Submission
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chat failed');

      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Apologies, my wine cellar is closed at this hour. I am unable to connect to the recommendation engine.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Credit Refill (Mock SaaS Subscription checkout)
  const handleBuyCredits = async (tier: string, credits: number, price: number) => {
    setBillingLoading(tier);
    try {
      // Simulate Payment gateway delay (Razorpay/Stripe checkout mockup)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await rechargeCredits(credits);
      if (result.success) {
        toast.success(`Payment Successful! Added ${credits} credits to your account.`);
        setShowBillingModal(false);
      } else {
        toast.error(result.error || 'Failed to update credits');
      }
    } catch (err) {
      toast.error('Payment gateway error. Please try again.');
    } finally {
      setBillingLoading(null);
    }
  };

  return (
    <section id="ai-lab" className="py-24 bg-gradient-to-b from-white to-amber-50/50 relative overflow-hidden">
      
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-5 py-2 rounded-full mb-4 shadow-md font-semibold text-sm">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            AI SaaS Kitchen Suite
          </div>
          <h2 className="text-5xl md:text-6xl text-amber-900 font-serif mb-4">
            AI Culinary Lab & Sommelier
          </h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create custom recipes tailored to your precise cravings or chat with our AI Sommelier to find the perfect pairing for your meal.
          </p>
        </div>

        {/* Outer Box containing tab buttons and body */}
        <div className="bg-white/80 backdrop-blur-md border border-amber-100/60 rounded-3xl shadow-2xl p-6 md:p-10 relative">
          
          {/* Main Grid: Locker overlay if guest */}
          {!user && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-full text-white shadow-xl mb-6">
                <Lock className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-serif text-amber-900 mb-2">Unlock the AI Culinary Lab</h3>
              <p className="text-gray-600 max-w-md mb-6">
                Register or log in to unleash your chef skills. Every new account receives 10 free AI credits instantly to construct custom plates.
              </p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign In or Register Now
              </button>
            </div>
          )}

          {/* User Credits & Navigation Control */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
            <div className="flex items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveTab('chef')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'chef' 
                    ? 'bg-white text-amber-800 shadow-md' 
                    : 'text-gray-500 hover:text-amber-800'
                }`}
              >
                <ChefHat className="w-4.5 h-4.5" />
                AI Custom Chef Lab
              </button>
              <button
                onClick={() => setActiveTab('sommelier')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'sommelier' 
                    ? 'bg-white text-amber-800 shadow-md' 
                    : 'text-gray-500 hover:text-amber-800'
                }`}
              >
                <Wine className="w-4.5 h-4.5" />
                AI Sommelier Chat
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100/70 px-4 py-2 rounded-2xl">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">
                    Credits: <strong className="text-base text-amber-700">{user.aiCredits}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setShowBillingModal(true)}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Buy Credits
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: AI CUSTOM CHEF LAB */}
          {activeTab === 'chef' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Dish Category
                  </label>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                      onClick={() => setDishType('food')}
                      className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                        dishType === 'food' 
                          ? 'bg-white text-amber-800 shadow-sm border border-gray-100' 
                          : 'text-gray-500'
                      }`}
                    >
                      Gourmet Plate
                    </button>
                    <button
                      onClick={() => setDishType('cocktail')}
                      className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                        dishType === 'cocktail' 
                          ? 'bg-white text-amber-800 shadow-sm border border-gray-100' 
                          : 'text-gray-500'
                      }`}
                    >
                      Bespoke Drink
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Describe your Cravings
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      dishType === 'food'
                        ? 'e.g., A spicy slow-simmered cottage cheese dish infused with fresh cardamom and rich garlic sauce'
                        : 'e.g., A smoky lime cocktail with tropical passion fruit extracts, elderflower syrup, and coarse sea salt'
                    }
                    className="w-full h-32 bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-2xl p-4 text-gray-900 placeholder-gray-400 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateDish}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {generating ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Create Recipe (-1 Credit)
                    </>
                  )}
                </button>
              </div>

              {/* Display Result Column */}
              <div className="lg:col-span-7 flex flex-col justify-center min-h-[350px] relative">
                
                {generating && (
                  <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-6 text-center rounded-2xl animate-fade-in">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin" />
                      <ChefHat className="w-8 h-8 text-amber-700 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <h4 className="text-xl font-serif text-amber-900 mb-2">Designing Your Recipe</h4>
                    <p className="text-sm text-gray-500 italic max-w-xs">{chefLoadingMessage}</p>
                  </div>
                )}

                {!generating && !generatedDish && (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-3xl h-full">
                    <ChefHat className="w-16 h-16 text-gray-300 mb-4" />
                    <h4 className="text-xl font-serif text-gray-800 mb-1">Kitchen is Standing By</h4>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Input your cravings on the left and cook them virtually using our gourmet AI.
                    </p>
                  </div>
                )}

                {!generating && generatedDish && (
                  <div className="bg-white rounded-3xl border border-amber-100 overflow-hidden shadow-xl animate-fade-in-up">
                    <div className="relative h-60 overflow-hidden">
                      <img 
                        src={generatedDish.image} 
                        alt={generatedDish.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                        <div>
                          <span className="bg-amber-500 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md mb-2 inline-block">
                            AI Custom {generatedDish.type}
                          </span>
                          <h3 className="text-2xl font-serif text-white">{generatedDish.name}</h3>
                        </div>
                        <span className="text-2xl font-bold text-amber-400">₹{generatedDish.price}</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Flavor Description
                        </label>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {generatedDish.description}
                        </p>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                          Gourmet Ingredients
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {generatedDish.ingredients.map((ing, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs bg-amber-55/70 text-amber-800 font-semibold px-2.5 py-1 rounded-lg border border-amber-100/50"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart({
                            id: `ai-${Date.now()}`,
                            originalId: Math.floor(Math.random() * 10000),
                            name: generatedDish.name,
                            price: generatedDish.price,
                            type: generatedDish.type,
                            image: generatedDish.image
                          });
                          toast.success(`${generatedDish.name} added to your cart!`);
                        }}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Order This Custom Dish
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 2: AI SOMMELIER CHAT */}
          {activeTab === 'sommelier' && (
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Info Column */}
              <div className="lg:col-span-4 bg-amber-50/50 border border-amber-100/60 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-900 mb-4">
                    <Wine className="w-6 h-6 text-amber-700" />
                    <h3 className="text-xl font-serif">Sommelier Lounge</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Pairing wine, drinks, or spices with food is a high art. Ask questions like:
                  </p>
                  <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
                    <li>"What cocktail goes best with Butter Chicken?"</li>
                    <li>"Suggest a beverage profile to match spicy Biryani"</li>
                    <li>"I am lactose-intolerant. How can I customize the Thali?"</li>
                    <li>"Recommend a smoky flavor palate starter"</li>
                  </ul>
                </div>
                <div className="text-[10px] text-gray-400 mt-6 border-t border-amber-100/60 pt-4 font-semibold tracking-wider uppercase">
                  Service is completely complimentary
                </div>
              </div>

              {/* Chat Column */}
              <div className="lg:col-span-8 flex flex-col border border-gray-100 rounded-3xl overflow-hidden h-[420px] bg-gray-50/30">
                
                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' 
                            : 'bg-white text-gray-800 border border-gray-100'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-2 text-sm text-gray-400">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        Sommelier is typing...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Panel */}
                <form onSubmit={handleSendChatMessage} className="bg-white border-t border-gray-100 p-4 flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about flavor notes, drink matches, recipe tweaks..."
                    className="flex-1 bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-xl shadow-md transition-all flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* BILLING MODAL (Mock SaaS credit top-up) */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBillingModal(false)} />
          
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in z-10 border border-amber-100">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />
            
            <button 
              onClick={() => setShowBillingModal(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-serif text-amber-900 flex items-center justify-center gap-2">
                  <Coins className="w-7 h-7 text-amber-600" />
                  Recharge AI credits
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Top up your credit balance instantly to keep inventing custom cuisines!
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { tier: 'Starter Pack', credits: 10, price: 99, popular: false },
                  { tier: 'Chef Pro', credits: 35, price: 249, popular: true },
                  { tier: 'Gourmet Unlimited', credits: 100, price: 499, popular: false }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className={`relative rounded-2xl border p-5 flex flex-col justify-between ${
                      item.popular 
                        ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20' 
                        : 'border-gray-200'
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm">
                        Best Value
                      </span>
                    )}

                    <div className="text-center">
                      <h4 className="font-semibold text-gray-800 text-sm">{item.tier}</h4>
                      <div className="my-4">
                        <span className="text-4xl font-extrabold text-amber-900">{item.credits}</span>
                        <span className="text-xs text-gray-500 block mt-1">AI Credits</span>
                      </div>
                    </div>

                    <div className="space-y-4 mt-2">
                      <div className="text-center text-lg font-bold text-gray-800">
                        ₹{item.price}
                      </div>
                      <button
                        onClick={() => handleBuyCredits(item.tier, item.credits, item.price)}
                        disabled={billingLoading !== null}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          item.popular
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {billingLoading === item.tier ? (
                          <div className="w-4 h-4 border-2 border-amber-900/20 border-t-amber-900 rounded-full animate-spin mx-auto" />
                        ) : (
                          'Choose Pack'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-[10px] text-gray-400">
                Secure SSL mock payments enabled. Instantly updates database logs.
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
