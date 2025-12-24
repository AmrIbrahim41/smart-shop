import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Meta from '../../components/tapheader/Meta';
import CheckoutSteps from '../../components/checkout/CheckoutSteps';
import { useSettings } from '../../context/SettingsContext';
import { FaCreditCard, FaPaypal, FaLock } from 'react-icons/fa';

const PaymentScreen = () => {
  const { shippingAddress, savePaymentMethod } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings();

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

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
    <div className="min-h-screen pt-28 pb-10 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 flex flex-col items-center">
      <Meta title={t('paymentMethod') || "Payment Method"} />
      
      <div className="w-full max-w-4xl mb-8">
        <CheckoutSteps step1 step2 step3 />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl transition-all">
           
           <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                    {t('paymentMethod') || "Select Payment"}
                </h1>
                <p className="flex items-center justify-center gap-1 text-green-500 font-bold text-xs uppercase tracking-wide bg-green-50 dark:bg-green-500/10 py-1 px-3 rounded-full w-fit mx-auto">
                   <FaLock size={10} /> Secure SSL Payment
                </p>
           </div>

            <form onSubmit={submitHandler} className="space-y-4">
                
                {/* PayPal Option */}
                <label className={`relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${
                    paymentMethod === 'PayPal' 
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-900/50'
                }`}>
                    <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="PayPal" 
                        checked={paymentMethod === 'PayPal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="hidden"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === 'PayPal' ? 'border-primary' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                        {paymentMethod === 'PayPal' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">PayPal / Card</span>
                        <FaPaypal className="text-blue-600 text-3xl" />
                    </div>
                </label>

                {/* Example of Stripe (Visual Only for now) */}
                <div className="relative flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 opacity-60 cursor-not-allowed grayscale">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                    <div className="flex-1 flex items-center justify-between">
                        <span className="font-bold text-gray-500">Stripe (Soon)</span>
                        <FaCreditCard className="text-gray-400 text-3xl" />
                    </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-primary to-orange-600 hover:shadow-lg hover:shadow-primary/30 text-white font-black py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-6 uppercase">
                    {t('continue') || "CONTINUE"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;