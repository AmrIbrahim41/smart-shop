import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaCreditCard, FaPaypal, FaArrowRight } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext'; // 1. Import Hook

const PaymentScreen = () => {
  const { shippingAddress, savePaymentMethod } = useCart();
  const navigate = useNavigate();
  const { t } = useSettings(); // 2. Use Hook

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  useEffect(() => {
    // لو مفيش عنوان شحن، رجعه خطوة لورا
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
    <div className="min-h-screen pt-28 pb-10 px-6 bg-gray-50 dark:bg-dark flex justify-center transition-colors duration-300">
      <Meta title={t('paymentTitle') || "Payment"} />
      <div className="w-full max-w-lg">
        
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 text-xs md:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            <span className="text-primary">{t('signIn') || "Sign In"}</span>
            <span className="h-1 flex-1 bg-primary mx-2 rounded"></span>
            <span className="text-primary">{t('shipping') || "Shipping"}</span>
            <span className="h-1 flex-1 bg-primary mx-2 rounded"></span>
            <span className="text-gray-900 dark:text-white">{t('payment') || "Payment"}</span>
            <span className="h-1 flex-1 bg-gray-300 dark:bg-gray-700 mx-2 rounded"></span>
            <span>{t('placeOrder') || "Place Order"}</span>
        </div>

        <div className="bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-none transition-colors duration-300">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase">
                <FaCreditCard className="text-primary" /> {t('paymentMethod') || "PAYMENT METHOD"}
            </h1>
            
            <form onSubmit={submitHandler} className="space-y-6">
                
                <div className="space-y-4">
                    <label className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase block mb-4 tracking-wider">
                        {t('selectMethod') || "Select Method"}
                    </label>
                    
                    <div 
                        onClick={() => setPaymentMethod('PayPal')}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center gap-4 transition shadow-sm ${
                            paymentMethod === 'PayPal' 
                            ? 'bg-primary/10 border-primary ring-1 ring-primary' 
                            : 'bg-gray-50 dark:bg-dark border-gray-200 dark:border-white/10 hover:border-primary/50'
                        }`}
                    >
                        <input 
                            type="radio" 
                            checked={paymentMethod === 'PayPal'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            value="PayPal"
                            className="text-primary focus:ring-primary bg-gray-100 dark:bg-dark border-gray-300 dark:border-white/20"
                        />
                        <FaPaypal className="text-2xl text-blue-500" />
                        <span className="text-gray-900 dark:text-white font-bold">{t('paypalOrCreditCard') || "PayPal or Credit Card"}</span>
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 mt-8 uppercase">
                    {t('continue') || "CONTINUE"} <FaArrowRight />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;