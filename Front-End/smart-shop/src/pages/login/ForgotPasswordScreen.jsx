import React, { useState } from 'react';
// تعديل: استدعاء api بدلاً من axios المباشر
import api from '../../api'; 
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isError, setIsError] = useState(false); // حالة لمعرفة نوع الرسالة (خطأ أم نجاح)

    const { t } = useSettings();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            // استخدام api مع المسار النسبي فقط
            const { data } = await api.post(
                '/api/users/forgot-password/', 
                { email }
            );

            setMessage(data.details || 'Check your email for a reset link!');
            setIsError(false);
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Error sending email. Please check the address.');
            setIsError(true);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pt-28 px-6 bg-gray-50 dark:bg-dark flex justify-center transition-colors duration-300">
            <Meta title={t('forgotPassword') || "Forgot Password"} />
            
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase text-center">
                    {t('forgotPassword') || "FORGOT PASSWORD"}
                </h1>
                
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">
                    {t('resetInstructions') || "No worries! Enter your email and we'll send you a link to reset your password."}
                </p>

                {message && (
                    <div className={`p-4 rounded-xl text-sm mb-6 text-center border animate-pulse ${
                        isError 
                        ? 'bg-red-100 border-red-400 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' 
                        : 'bg-green-100 border-green-400 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                    }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={submitHandler} className="bg-white dark:bg-dark-accent p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
                    
                    <label className="text-gray-600 dark:text-gray-400 block mb-2 font-bold text-sm">
                        {t('enterEmail') || "Enter your email address"}
                    </label>
                    
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 rounded-xl text-gray-900 dark:text-white mb-6 focus:border-primary outline-none transition-all duration-300 focus:ring-1 focus:ring-primary shadow-inner" 
                        placeholder="example@mail.com"
                        required 
                    />
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-primary/30 disabled:bg-gray-400 disabled:cursor-not-allowed uppercase active:scale-95"
                    >
                        {loading ? (t('sending') || 'Sending...') : (t('sendResetLink') || 'SEND RESET LINK')}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        <a href="/login" className="text-primary font-bold hover:underline">
                            &larr; {t('backToLogin') || "Back to Login"}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;