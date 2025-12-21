import React, { useState } from 'react';
import axios from 'axios'; 
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext'; // 👈 1. استدعاء هوك الإعدادات

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // 👇 2. استخراج دالة الترجمة
    const { t } = useSettings();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const { data } = await axios.post(
                'http://127.0.0.1:8000/api/users/forgot-password/', 
                { email },
                config
            );

            setMessage(data.details);
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Error sending email');
        }
        setLoading(false);
    };

    return (
        // 👇 3. ضبط الخلفية للوضع الفاتح والغامق
        <div className="min-h-screen pt-28 px-6 bg-gray-50 dark:bg-dark flex justify-center transition-colors duration-300">
            <Meta title={t('forgotPassword') || "Forgot Password"} />
            
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6 uppercase transition-colors">
                    {t('resetPassword') || "RESET PASSWORD"}
                </h1>

                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-500/20 dark:border-none dark:text-green-400 p-4 rounded-xl mb-4 font-bold">
                        {message}
                    </div>
                )}
                
                {/* 👇 4. الكارت (أبيض في الفاتح، غامق في الليلي) */}
                <form onSubmit={submitHandler} className="bg-white dark:bg-dark-accent p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
                    
                    <label className="text-gray-600 dark:text-gray-400 block mb-2 font-bold text-sm">
                        {t('enterEmail') || "Enter your email address"}
                    </label>
                    
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 rounded-xl text-gray-900 dark:text-white mb-6 focus:border-primary outline-none transition-colors" 
                        required 
                    />
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (t('sending') || 'Sending...') : (t('sendResetLink') || 'SEND RESET LINK')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;