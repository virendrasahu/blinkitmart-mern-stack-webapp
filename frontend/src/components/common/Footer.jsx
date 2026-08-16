import React from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiShield, FiClock, FiHeart } from 'react-icons/fi';
import { FaLinkedinIn, FaGithub, FaInstagram, FaYoutube } from 'react-icons/fa';

/**
 * Footer Component with Responsive Circular Dark Social Media Icons
 */
function Footer() {
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/virendra-sahu-14117121a/',
      icon: FaLinkedinIn,
      hoverBg: 'hover:bg-[#0A66C2]',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/virendrasahu',
      icon: FaGithub,
      hoverBg: 'hover:bg-gray-800',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/virendra_sahu2609/',
      icon: FaInstagram,
      hoverBg: 'hover:bg-[#E4405F]',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@DigiVirendra',
      icon: FaYoutube,
      hoverBg: 'hover:bg-[#FF0000]',
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8 mt-16 text-gray-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-gray-100 text-center md:text-left">
          <div className="flex items-center gap-4 bg-green-50/50 p-4 rounded-2xl border border-green-100/50">
            <div className="w-12 h-12 bg-[#53B128] text-white rounded-xl flex items-center justify-center text-xl shrink-0">
              <FiClock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Superfast 10-Min Delivery</h4>
              <p className="text-xs text-gray-500 mt-0.5">Fresh groceries delivered from dark stores near you.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100/50">
            <div className="w-12 h-12 bg-[#F8CB46] text-gray-900 rounded-xl flex items-center justify-center text-xl shrink-0 font-black">
              <FiZap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Best Prices & Offers</h4>
              <p className="text-xs text-gray-500 mt-0.5">Direct farm sourcing & daily discounts on top brands.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center text-xl shrink-0">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Secure Payments</h4>
              <p className="text-xs text-gray-500 mt-0.5">Razorpay Test Mode & Cash on Delivery supported.</p>
            </div>
          </div>
        </div>

        {/* Links & Social Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          <div>
            <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=fruits-vegetables" className="hover:text-primary transition-colors">Fruits & Vegetables</Link></li>
              <li><Link to="/products?category=dairy-breakfast" className="hover:text-primary transition-colors">Dairy & Breakfast</Link></li>
              <li><Link to="/products?category=munchies" className="hover:text-primary transition-colors">Munchies & Chips</Link></li>
              <li><Link to="/products?category=cold-drinks-juices" className="hover:text-primary transition-colors">Cold Drinks & Juices</Link></li>
              <li><Link to="/products?category=bakery-biscuits" className="hover:text-primary transition-colors">Bakery & Biscuits</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Customer Care</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-primary transition-colors">Track Orders</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">Manage Addresses</Link></li>
              <li><span className="cursor-pointer hover:text-primary">FAQ & Support</span></li>
              <li><span className="cursor-pointer hover:text-primary">Refund Policy</span></li>
              <li><span className="cursor-pointer hover:text-primary">Terms of Service</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Partner & Admin</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/admin" className="font-bold text-amber-700 hover:underline">Admin Dashboard</Link></li>
              <li><span className="cursor-pointer hover:text-primary">Partner with Us</span></li>
              <li><span className="cursor-pointer hover:text-primary">Warehouse Logistics</span></li>
              <li><span className="cursor-pointer hover:text-primary">Careers</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Connect With Us</h5>
            <p className="text-xs text-gray-500 mb-3 font-medium">Follow Virendra Sahu on social media:</p>
            
            {/* Dark Circular Social Icons (Matching User Reference Image) */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                    aria-label={social.name}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1c1c1c] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs shrink-0 ${social.hoverBg}`}
                  >
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </a>
                );
              })}
            </div>
            
            <div className="mt-6">
              <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Payment Methods</h5>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-700">Razorpay</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-700">UPI</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-700">Card</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-700">COD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Circular Social Icons */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} <span className="font-bold text-[#F8CB46]">blinkit</span><span className="font-bold text-[#53B128]">mart</span> Quick Commerce. Developed by Virendra Sahu.</p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={`bottom-${social.name}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                    aria-label={social.name}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1c1c1c] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shrink-0 ${social.hoverBg}`}
                  >
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </a>
                );
              })}
            </div>
            <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
              <span>Built with</span> <FiHeart className="w-3.5 h-3.5 text-red-500 fill-current" /> <span>using MERN Stack</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
