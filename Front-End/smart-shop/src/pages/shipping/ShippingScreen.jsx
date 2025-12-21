import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaShippingFast, FaArrowRight } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext'; // 1. Import Hook

const ShippingScreen = () => {
  const { shippingAddress, saveShippingAddress } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings(); // 2. Use Hook

  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');

  useEffect(() => {
    if (shippingAddress) {
        setAddress(shippingAddress.address || '');
        setCity(shippingAddress.city || '');
        setPostalCode(shippingAddress.postalCode || '');
        setCountry(shippingAddress.country || '');
    }
  }, [shippingAddress]);

  const submitHandler = (e) => {
    e.preventDefault();
    saveShippingAddress({ address, city, postalCode, country });
    navigate('/payment');
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-6 bg-gray-50 dark:bg-dark flex justify-center transition-colors duration-300">
        <Meta title={t('shipping') || "Shipping"} />
      <div className="w-full max-w-lg">
        
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 text-xs md:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            <span className="text-primary">{t('signIn') || "Sign In"}</span>
            <span className="h-1 flex-1 bg-primary mx-2 rounded"></span>
            <span className="text-gray-900 dark:text-white">{t('shipping') || "Shipping"}</span>
            <span className="h-1 flex-1 bg-gray-300 dark:bg-gray-700 mx-2 rounded"></span>
            <span>{t('payment') || "Payment"}</span>
            <span className="h-1 flex-1 bg-gray-300 dark:bg-gray-700 mx-2 rounded"></span>
            <span>{t('placeOrder') || "Place Order"}</span>
        </div>

        <div className="bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-none transition-colors duration-300">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase">
                <FaShippingFast className="text-primary" /> {t('shipping') || "SHIPPING"}
            </h1>
            
            <form onSubmit={submitHandler} className="space-y-6">
                
                {/* Address */}
                <div>
                    <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-2 tracking-wider">
                        {t('address') || "Address"}
                    </label>
                    <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={t('enterAddress') || "Enter your street address"}
                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                    />
                </div>

                {/* City */}
                <div>
                    <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-2 tracking-wider">
                        {t('city') || "City"}
                    </label>
                    <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t('enterCity') || "Enter city"}
                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                    />
                </div>

                {/* Postal Code & Country */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-2 tracking-wider">
                            {t('postalCode') || "Postal Code"}
                        </label>
                        <input
                            type="text"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder={t('zipCode') || "Zip code"}
                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-2 tracking-wider">
                            {t('country') || "Country"}
                        </label>
                        <input
                            type="text"
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder={t('enterCountry') || "Country"}
                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 mt-8 uppercase">
                    {t('continueToPayment') || "CONTINUE TO PAYMENT"} <FaArrowRight />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ShippingScreen;