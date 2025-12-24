import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Meta from '../../components/tapheader/Meta';
import CheckoutSteps from '../../components/checkout/CheckoutSteps';
import { useSettings } from '../../context/SettingsContext';
import { FaMapMarkerAlt, FaCity, FaGlobe, FaMailBulk } from 'react-icons/fa';

const ShippingScreen = () => {
  const { shippingAddress, saveShippingAddress } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings();

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  const submitHandler = (e) => {
    e.preventDefault();
    saveShippingAddress({ address, city, postalCode, country });
    navigate('/payment');
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 flex flex-col items-center">
      <Meta title={t('shipping') || "Shipping"} />
      
      {/* Steps Indicator */}
      <div className="w-full max-w-4xl mb-8">
         <CheckoutSteps step1 step2 />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl transition-all">
            
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                    {t('shippingAddress') || "Shipping Details"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Where should we deliver your order?
                </p>
            </div>

            <form onSubmit={submitHandler} className="space-y-5">
            
            {/* Address */}
            <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">{t('address') || "Address"}</label>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                        placeholder="123 Main St"
                    />
                </div>
            </div>

            {/* City */}
            <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">{t('city') || "City"}</label>
                <div className="relative">
                    <FaCity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                        placeholder="New York"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                {/* Postal Code */}
                <div className="flex-1 space-y-2 group">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">{t('postalCode') || "Postal Code"}</label>
                    <div className="relative">
                        <FaMailBulk className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                            placeholder="10001"
                        />
                    </div>
                </div>

                {/* Country */}
                <div className="flex-1 space-y-2 group">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">{t('country') || "Country"}</label>
                    <div className="relative">
                        <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                            placeholder="USA"
                        />
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-orange-600 hover:shadow-lg hover:shadow-primary/30 text-white font-black py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-6 uppercase"
            >
                {t('continue') || "CONTINUE TO PAYMENT"}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ShippingScreen;