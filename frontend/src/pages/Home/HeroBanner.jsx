import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

import desktopBanner from '../../assets/Banner.jpg';
import tabletBanner from '../../assets/TabletBanner.png';
import mobileBanner from '../../assets/MobileBanner.png';

/**
 * HeroBanner Component - Responsive Promotional Banners (Zero Padding / Margin)
 */
function HeroBanner() {
  return (
    <div className="space-y-4 my-2 p-0">
      
      {/* Device Responsive Promotional Banner (Zero Margin & Zero Padding) */}
      <div className="w-full m-0 p-0 rounded-2xl overflow-hidden shadow-2xs border-0 bg-white">
        <picture className="w-full block m-0 p-0">
          {/* Desktop Screen Banner (>= 1024px) */}
          <source media="(min-width: 1024px)" srcSet={desktopBanner} />

          {/* Tablet Screen Banner (>= 640px) */}
          <source media="(min-width: 640px)" srcSet={tabletBanner} />

          {/* Mobile Screen Banner (< 640px Fallback) */}
          <img
            src={mobileBanner}
            alt="Blinkit Store Discount Promotional Banner"
            className="w-full h-auto object-cover m-0 p-0 border-0 rounded-2xl block"
          />
        </picture>
      </div>

      {/* Quick Category Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Fresh Vegetables & Fruits */}
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-600 to-green-800 text-white p-6 sm:p-8 overflow-hidden shadow-xs flex flex-col justify-between min-h-[190px]">
          <div className="relative z-10 max-w-[65%]">
            <span className="inline-block bg-white/20 backdrop-blur-xs text-yellow-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full mb-3 tracking-wider">
              ⚡ 10 Min Delivery
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-tight mb-2">
              Farm Fresh Vegetables & Fruits
            </h2>
            <p className="text-xs text-emerald-100 font-medium mb-4">
              Up to 30% off on daily organic essentials
            </p>
            <Link
              to="/products?category=fruits-vegetables"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Shop Now <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <img
            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80"
            alt="Fresh Vegetables"
            className="absolute -right-4 -bottom-6 w-48 h-48 object-cover rounded-full opacity-90 border-4 border-white/20 pointer-events-none"
          />
        </div>

        {/* Card 2: Dairy, Milk & Breakfast */}
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-6 sm:p-8 overflow-hidden shadow-xs flex flex-col justify-between min-h-[190px]">
          <div className="relative z-10 max-w-[65%]">
            <span className="inline-block bg-black/20 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full mb-3 tracking-wider">
              🥛 Morning Essentials
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-tight mb-2">
              Fresh Milk, Butter & Paneer
            </h2>
            <p className="text-xs text-amber-100 font-medium mb-4">
              Delivered fresh every morning before 7 AM
            </p>
            <Link
              to="/products?category=dairy-breakfast"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Order Breakfast <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <img
            src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80"
            alt="Dairy Breakfast"
            className="absolute -right-4 -bottom-6 w-48 h-48 object-cover rounded-full opacity-90 border-4 border-white/20 pointer-events-none"
          />
        </div>

      </div>

    </div>
  );
}

export default HeroBanner;
