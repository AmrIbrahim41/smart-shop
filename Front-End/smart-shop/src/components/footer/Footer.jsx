import React from 'react';
import { FaFacebookF, FaInstagram, FaPaperPlane } from 'react-icons/fa';
import { links } from '../../api';

const Footer = () => {
  return (
    <footer className="bg-dark-accent border-t border-white/5 pt-20 pb-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="text-3xl font-extrabold tracking-tighter text-primary">
              SMART<span className="text-white">SHOP</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium products and tech store. We are the gateway to the future of technology and style.
            </p>
            <div className="flex space-x-4 text-white">
              <a href={links.facebook} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition">
                <FaFacebookF />
              </a>
              <a href={links.instagram} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase mb-6 border-b border-primary w-fit pb-2">Quick Links</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="/" className="hover:text-primary transition">Home</a></li>
              <li><a href="/categories" className="hover:text-primary transition">Categories</a></li>
              <li><a href="/shop" className="hover:text-primary transition">Shop</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold uppercase mb-6 border-b border-primary w-fit pb-2">Support</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
              <li><a href={links.whtasapp} className="hover:text-primary transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold uppercase mb-6 border-b border-primary w-fit pb-2">Newsletter</h4>
            <form className="relative">
              <input 
                type="email" 
                placeholder="Your Email" 
                className="w-full bg-dark border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-primary transition text-sm text-white"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary p-2 rounded-md text-white">
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-[10px] tracking-[0.2em]">© 2025 NOXSTORE Digital Experience.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;