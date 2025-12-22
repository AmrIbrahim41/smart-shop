import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// تعديل: استبدال axios بـ api من الملف المركزي
import api from '../../api'; 
import Meta from '../../components/tapheader/Meta';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';

const ActivationScreen = () => {
    const { uid, token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    
    const { t } = useSettings();

    useEffect(() => {
        const activateAccount = async () => {
            try {
                // تعديل: استخدام api.post والمسار النسبي
                await api.post(`/api/users/activate/${uid}/${token}/`);
                setStatus('success');
            } catch (error) {
                setStatus('error');
            }
        };
        activateAccount();
    }, [uid, token]);

    return (
        <div className="min-h-screen pt-40 px-6 bg-gray-50 dark:bg-dark flex justify-center text-center transition-colors duration-300">
            <Meta title={t('activationTitle') || "Account Activation"} />
            
            <div className="max-w-md w-full">
                
                {status === 'loading' && (
                    <h2 className="text-gray-900 dark:text-white text-2xl font-bold animate-pulse transition-colors">
                        {t('activating') || "Activating your account..."}
                    </h2>
                )}

                {status === 'success' && (
                    <div className="bg-green-50 border border-green-200 dark:bg-green-500/10 dark:border-green-500/30 p-8 rounded-3xl shadow-lg dark:shadow-none transition-colors duration-300">
                        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 transition-colors">
                            {t('accountActivated') || "ACCOUNT ACTIVATED!"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">
                            {t('accountActivatedMsg') || "Your email has been verified successfully. You can now login to your account."}
                        </p>
                        <Link to="/login" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition inline-block shadow-md">
                            {t('loginNow') || "LOGIN NOW"}
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 p-8 rounded-3xl shadow-lg dark:shadow-none transition-colors duration-300">
                        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 transition-colors">
                            {t('activationFailed') || "ACTIVATION FAILED"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">
                            {t('activationFailedMsg') || "The activation link is invalid or has expired."}
                        </p>
                        <Link to="/register" className="bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-800 dark:text-white border border-gray-300 dark:border-transparent font-bold py-3 px-8 rounded-xl transition inline-block shadow-sm">
                            {t('tryRegisterAgain') || "TRY REGISTER AGAIN"}
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ActivationScreen;