import { Fragment, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

export function Cart() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    setOrderStatus('idle');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            type: item.type,
          })),
          totalAmount: cartTotal,
        }),
      });

      if (!response.ok) throw new Error('Checkout failed');
      
      setOrderStatus('success');
      clearCart();
      setTimeout(() => {
        setIsCartOpen(false);
        setOrderStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error during checkout:', error);
      setOrderStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out slide-in-from-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-amber-50">
          <div className="flex items-center gap-2 text-amber-800">
            <ShoppingBag className="w-6 h-6" />
            <h2 className="text-2xl font-serif">Your Order</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {orderStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif text-gray-900">Order Placed Successfully!</h3>
              <p className="text-gray-500">Your delicious food is being prepared.</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p className="text-lg">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <span className="font-semibold text-amber-700">₹{item.price * item.quantity}</span>
                      </div>
                      <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 shadow-inner border border-gray-100">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-amber-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-gray-900 min-w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-amber-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-500 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && orderStatus !== 'success' && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-gray-600 font-medium">Subtotal</span>
              <span className="text-2xl font-semibold text-gray-900">₹{cartTotal}</span>
            </div>
            
            {orderStatus === 'error' && (
              <p className="text-red-500 text-sm mb-4 text-center">Failed to place order. Please try again.</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
                isSubmitting 
                  ? 'bg-amber-400 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hover:-translate-y-0.5'
              } text-white`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        )}
      </div>
    </Fragment>
  );
}
