import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// التأكد من استدعاء api من الملف المركزي
import api from '../../api';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ResetPasswordScreen = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            // التعديل: إضافة /api في بداية الرابط لضمان الوصول للمسار الصحيح
            const { data } = await api.post(`/api/users/reset-password/${uid}/${token}/`, {
                password, confirmPassword
            });

            setMessage(t('passwordResetSuccess') || data.details || 'Password reset successful');

            // توجيه لصفحة الدخول بعد 3 ثواني
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || t('invalidToken') || 'Invalid or Expired Token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-28 px-6 bg-gray-50 dark:bg-dark flex justify-center transition-colors duration-300">
            <Meta title={t('setNewPassword') || "Set New Password"} />

            <div className="w-full max-w-md">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6 uppercase transition-colors text-center">
                    {t('newPasswordTitle') || "NEW PASSWORD"}
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 p-4 rounded-xl mb-6 text-sm font-bold text-center animate-pulse">
                        ⚠️ {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 p-4 rounded-xl mb-6 text-sm font-bold text-center">
                        ✅ {message}
                    </div>
                )}

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
                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 rounded-xl text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-inner"
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
                            className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 rounded-xl text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 shadow-inner"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-primary/30 disabled:bg-gray-400 disabled:cursor-not-allowed uppercase active:scale-95"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('processing') || 'Processing...'}
                            </span>
                        ) : (t('resetPasswordBtn') || 'RESET PASSWORD')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordScreen;