import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Meta from '../../components/tapheader/Meta';
import CheckoutSteps from '../../components/checkout/CheckoutSteps'; // تأكد إن المكون ده موجود
import { useSettings } from '../../context/SettingsContext';

const ShippingScreen = () => {
  const { shippingAddress, saveShippingAddress } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings();

  // ملء البيانات لو كانت موجودة مسبقاً في الـ LocalStorage
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  const submitHandler = (e) => {
    e.preventDefault();
    // حفظ العنوان في الـ Context (واللي بدوره بيحفظه في LocalStorage)
    saveShippingAddress({ address, city, postalCode, country });
    // الانتقال لصفحة الدفع
    navigate('/payment');
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={t('shipping') || "Shipping"} />
      
      {/* شريط خطوات الشراء */}
      <CheckoutSteps step1 step2 />

      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 uppercase text-center transition-colors">
            {t('shippingAddress') || "SHIPPING ADDRESS"}
        </h1>

        <form onSubmit={submitHandler} className="bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors">
          
          <div className="mb-4">
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 uppercase ml-1">
                {t('address') || "Address"}
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
              placeholder="123 Main St"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 uppercase ml-1">
                {t('city') || "City"}
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
              placeholder="New York"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 uppercase ml-1">
                {t('postalCode') || "Postal Code"}
            </label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
              placeholder="10001"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 uppercase ml-1">
                {t('country') || "Country"}
            </label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
              placeholder="USA"
            />
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-orange-500/20 uppercase active:scale-95">
            {t('continue') || "CONTINUE"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingScreen;