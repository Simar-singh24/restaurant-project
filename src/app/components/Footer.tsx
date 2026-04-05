import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube, ArrowUp } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-3xl font-serif text-amber-500 mb-4 flex items-center gap-2">
              ICE CUBE
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Experience authentic Indian cuisine in a vibrant atmosphere. From traditional recipes to modern fusion, we bring you the best of India's culinary heritage.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <button
                  key={index}
                  className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-amber-600 hover:to-orange-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl mb-6 font-serif text-amber-500">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group cursor-pointer">
                <MapPin className="h-5 w-5 text-amber-500 mt-1 group-hover:text-amber-400 transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  123 Spice Street, Mumbai, Maharashtra 400001
                </span>
              </div>
              <div className="flex items-start gap-3 group cursor-pointer">
                <Phone className="h-5 w-5 text-amber-500 mt-1 group-hover:text-amber-400 transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  +91 22 1234 5678
                </span>
              </div>
              <div className="flex items-start gap-3 group cursor-pointer">
                <Mail className="h-5 w-5 text-amber-500 mt-1 group-hover:text-amber-400 transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  info@icecuberestaurant.com
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl mb-6 font-serif text-amber-500">Opening Hours</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-500 mt-1" />
                <div className="text-gray-400 space-y-1">
                  <p className="text-white">Monday - Friday</p>
                  <p>11:00 AM - 11:00 PM</p>
                  <p className="text-white mt-2">Saturday - Sunday</p>
                  <p>10:00 AM - 12:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">
              &copy; 2026 ICE CUBE Restaurant. All rights reserved. | Crafted with passion and spices.
            </p>
            <button
              onClick={scrollToTop}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 p-3 rounded-full shadow-lg hover:shadow-amber-500/50 transition-all duration-300 transform hover:-translate-y-1"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}