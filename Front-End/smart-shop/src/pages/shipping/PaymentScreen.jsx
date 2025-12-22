import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Meta from '../../components/tapheader/Meta';
import CheckoutSteps from '../../components/checkout/CheckoutSteps';
import { useSettings } from '../../context/SettingsContext';
import { FaCreditCard, FaPaypal } from 'react-icons/fa';

const PaymentScreen = () => {
  const { shippingAddress, savePaymentMethod } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings();

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  // لو مفيش عنوان شحن، ارجع لصفحة الشحن
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    savePaymentMethod(paymentMethod);
    navigate('/placeorder');
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={t('paymentMethod') || "Payment Method"} />
      
      <CheckoutSteps step1 step2 step3 />

      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 uppercase text-center transition-colors">
            {t('paymentMethod') || "PAYMENT METHOD"}
        </h1>

        <form onSubmit={submitHandler} className="bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors">
          
          <div className="mb-6 space-y-4">
             <label className="flex items-center gap-4 p-4 border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary dark:hover:border-primary transition bg-gray-50 dark:bg-white/5">
                <input 
                    type="radio" 
                    id="PayPal" 
                    name="paymentMethod" 
                    value="PayPal" 
                    checked={paymentMethod === 'PayPal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary focus:ring-primary bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex items-center gap-2">
                    <FaPaypal className="text-blue-600 text-2xl" />
                    <span className="font-bold text-gray-900 dark:text-white">PayPal / Credit Card</span>
                </div>
             </label>

             {/* مثال لطريقة دفع أخرى (معطلة مؤقتاً أو يمكن تفعيلها) */}
             {/* <label className="flex items-center gap-4 p-4 border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary transition opacity-50">
                <input type="radio" disabled className="w-5 h-5" />
                <div className="flex items-center gap-2">
                    <FaCreditCard className="text-gray-400 text-2xl" />
                    <span className="font-bold text-gray-400">Stripe (Coming Soon)</span>
                </div>
             </label> 
             */}
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-orange-500/20 uppercase active:scale-95">
            {t('continue') || "CONTINUE"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;