import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { ENDPOINTS, setAuthToken } from '../../api';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext'; // 👈 1. استدعاء هوك الإعدادات

const LoginScreen = () => {
  const navigate = useNavigate();
  const { t } = useSettings(); // 👈 2. استخراج دالة الترجمة

  // 1. الحالة (State)
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(ENDPOINTS.LOGIN, {
        "username": formData.email,
        "password": formData.password
      });

      const data = response.data;
      const access = data.access;

      localStorage.setItem('token', access);
      setAuthToken(access);
      localStorage.setItem('userInfo', JSON.stringify(data));

      if (data.isAdmin || data.profile?.type === 'vendor') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid Email or Password");
      setLoading(false);
    }
  };

  return (
    // 👇 3. الخلفية متغيرة حسب الوضع (gray-50 للفاتح، dark للغامق)
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={`${t('login') || 'Login'} | SmartShop`} />
      
      {/* الكارت (أبيض في الفاتح، غامق في الليلي) */}
      <div className="bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/10 w-full max-w-md shadow-lg dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
        
        {/* خلفية جمالية خفيفة */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-orange-600"></div>

        <h2 className="text-3xl font-black text-center mb-2 text-gray-900 dark:text-white tracking-wide transition-colors">
            {t('welcomeBack') || "WELCOME BACK"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm transition-colors">
            {t('loginSubtitle') || "Login to manage your orders & profile"}
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-500/10 dark:text-red-400 p-4 rounded-xl text-sm mb-6 text-center dark:border-red-500/20 flex items-center justify-center gap-2 animate-pulse transition-colors">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email Input */}
          <div className="relative group">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors duration-300" />
            <input
              type="email"
              name="email"
              placeholder={t('emailPlaceholder') || "Email Address"}
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors duration-300" />
            <input
              type="password"
              name="password"
              placeholder={t('passwordPlaceholder') || "Password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors duration-200">
              {t('forgotPasswordLink') || "Forgot Password?"}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-orange-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('loggingIn') || "LOGGING IN..."}
              </span>
            ) : (t('loginNow') || 'LOGIN NOW')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5 text-center transition-colors">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('dontHaveAccount') || "Don't have an account?"} <Link to="/register" className="text-primary font-bold hover:text-dark dark:hover:text-white transition-colors duration-200 ml-1">{t('registerHere') || "Register Here"}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;