import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext'; // 👈 1. استدعاء هوك الإعدادات

const ResetPasswordScreen = () => {
    const { uid, token } = useParams(); 
    const navigate = useNavigate();
    
    // 👇 2. استخراج دالة الترجمة
    const { t } = useSettings();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // حالة التحميل

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError(t('passwordsDoNotMatch') || 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post(`/users/reset-password/${uid}/${token}/`, { 
                password, confirmPassword 
            });
            setMessage(t('passwordResetSuccess') || data.details || 'Password reset successful');
            
            // تحويل لصفحة الدخول بعد 3 ثواني
            setTimeout(() => navigate('/login'), 3000); 
        } catch (err) {
            setError(err.response?.data?.detail || t('invalidToken') || 'Invalid Token');
        }
        setLoading(false);
    };

    return (
        // 👇 3. الخلفية متغيرة (gray-50 للفاتح، dark للغامق)
        <div className="min-h-screen pt-28 px-6 bg-gray-50 dark:bg-dark flex justify-center transition-colors duration-300">
            <Meta title={t('setNewPassword') || "Set New Password"} />
            
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6 uppercase transition-colors">
                    {t('newPasswordTitle') || "NEW PASSWORD"}
                </h1>

                {/* رسائل الخطأ والنجاح */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-500/20 dark:border-none dark:text-red-400 p-4 rounded-xl mb-4 font-bold transition-colors">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-500/20 dark:border-none dark:text-green-400 p-4 rounded-xl mb-4 font-bold transition-colors">
                        {message}
                    </div>
                )}
                
                {/* 👇 4. الكارت والفورم */}
                <form onSubmit={submitHandler} className="bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
                    
                    <div className="mb-4">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">
                            {t('newPasswordPlaceholder') || "New Password"}
                        </label>
                        <input 
                            type="password" 
                            placeholder="********" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 rounded-xl text-gray-900 dark:text-white outline-none focus:border-primary transition-colors" 
                            required 
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">
                            {t('confirmPasswordPlaceholder') || "Confirm Password"}
                        </label>
                        <input 
                            type="password" 
                            placeholder="********" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 rounded-xl text-gray-900 dark:text-white outline-none focus:border-primary transition-colors" 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed uppercase"
                    >
                        {loading ? (t('processing') || 'Processing...') : (t('resetPasswordBtn') || 'RESET PASSWORD')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordScreen;