import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Meta from '../../components/tapheader/Meta';
import { FaPhone, FaUserTag, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext'; // 👈 1. استدعاء هوك الإعدادات

const RegisterScreen = () => {
    const { t } = useSettings(); // 👈 2. استخراج دالة الترجمة
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState('customer');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) { navigate('/'); }
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('passwordsDoNotMatch') || 'Passwords do not match');
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            
            const { data } = await axios.post(
                'http://127.0.0.1:8000/api/users/register/',
                { name, email, password, phone, type },
                config
            );

            setMessage(data.details);
            setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setPhone('');
            
        } catch (err) {
            setError(err.response?.data?.detail || t('registrationError') || 'Registration Error');
        }
        setLoading(false);
    };

    return (
        // 👇 3. الخلفية متغيرة (gray-50 للفاتح، dark للغامق)
        <div className="min-h-screen pt-28 px-6 bg-gray-50 dark:bg-dark flex justify-center transition-colors duration-300">
            <Meta title={t('registerTitle') || "Register"} />
            
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6 uppercase text-center transition-colors">
                    {t('registerTitle') || "REGISTER"}
                </h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-500/10 dark:text-red-400 p-4 rounded-xl mb-4 text-center dark:border-red-500/20 animate-pulse transition-colors">
                        {error}
                    </div>
                )}
                
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-500/10 dark:text-green-400 p-6 rounded-2xl mb-6 dark:border-green-500/30 text-center transition-colors">
                        <h3 className="font-bold text-xl mb-2">🎉 {t('successRegister') || "Almost there!"}</h3>
                        <p>{message}</p>
                    </div>
                )}

                {!message && (
                    // 👇 4. الكارت والفورم
                    <form onSubmit={submitHandler} className="bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/10 space-y-4 shadow-lg dark:shadow-none transition-colors duration-300">
                        
                        {/* Name */}
                        <div className="relative group">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder={t('namePlaceholder') || "Full Name"} 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 pl-12 rounded-xl text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                                required 
                            />
                        </div>

                        {/* Phone */}
                        <div className="relative group">
                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder={t('phonePlaceholder') || "Phone Number"} 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 pl-12 rounded-xl text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                                required 
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="email" 
                                placeholder={t('emailPlaceholder') || "Email Address"} 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 pl-12 rounded-xl text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                                required 
                            />
                        </div>
                        
                        {/* Account Type */}
                        <div className="flex gap-4 items-center bg-gray-50 dark:bg-dark p-3 rounded-xl border border-gray-300 dark:border-white/10 transition-colors">
                            <FaUserTag className="text-gray-400 dark:text-gray-500" />
                            <label className="text-gray-600 dark:text-gray-400 text-sm font-bold whitespace-nowrap">{t('iAmA') || "I am a"}:</label>
                            <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value)} 
                                className="bg-transparent text-gray-900 dark:text-white outline-none flex-1 cursor-pointer font-bold"
                            >
                                <option value="customer" className="bg-white dark:bg-dark text-gray-900 dark:text-white">{t('buyer') || "Buyer (Customer)"}</option>
                                <option value="vendor" className="bg-white dark:bg-dark text-gray-900 dark:text-white">{t('seller') || "Seller (Vendor)"}</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="password" 
                                placeholder={t('passwordPlaceholder') || "Password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 pl-12 rounded-xl text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                                required 
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="relative group">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="password" 
                                placeholder={t('confirmPasswordPlaceholder') || "Confirm Password"} 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 p-3 pl-12 rounded-xl text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                                required 
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-gradient-to-r from-primary to-orange-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                        >
                            {loading ? (t('processing') || 'Processing...') : (t('registerBtn') || 'REGISTER')}
                        </button>

                        <div className="text-gray-600 dark:text-gray-400 text-sm text-center transition-colors">
                            {t('haveAccount') || "Have an Account?"} <Link to="/login" className="text-primary font-bold hover:text-dark dark:hover:text-white transition-colors ml-1">{t('login') || "Login"}</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RegisterScreen;