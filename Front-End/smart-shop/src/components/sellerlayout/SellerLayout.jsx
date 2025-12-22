import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaBoxOpen, FaPlusCircle, FaChartLine, FaClipboardList } from 'react-icons/fa';
// 1. استدعاء هوك الإعدادات للترجمة
import { useSettings } from '../../context/SettingsContext';

const SellerLayout = () => {
  const location = useLocation();
  // 2. استخراج دالة الترجمة
  const { t } = useSettings();

  // تحسين دالة التنشيط لتشمل الستايل الجديد
  const isActive = (path) => location.pathname === path 
    ? "bg-primary text-white shadow-md shadow-orange-500/20" 
    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary transition";

  return (
    // تعديل الخلفية العامة
    <div className="pt-24 pb-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8 min-h-screen bg-gray-50 dark:bg-dark transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/5 h-fit shadow-lg dark:shadow-none transition-colors duration-300">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200 dark:border-white/10">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">V</div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white transition-colors">{t('vendorPanel') || "Vendor Panel"}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('manageStore') || "Manage your store"}</p>
            </div>
        </div>

        <nav className="space-y-2">
            <Link to="/seller/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${isActive('/seller/dashboard')}`}>
                <FaChartLine /> {t('dashboard') || "Dashboard"}
            </Link>
            <Link to="/seller/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${isActive('/seller/products')}`}>
                <FaBoxOpen /> {t('myProducts') || "My Products"}
            </Link>
            <Link to="/seller/products/add" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${isActive('/seller/products/add')}`}>
                <FaPlusCircle /> {t('addNewProduct') || "Add New Product"}
            </Link>
            <Link to="/seller/orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${isActive('/seller/orders')}`}>
                <FaClipboardList /> {t('orders') || "Orders"}
            </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      {/* تعديل خلفية المحتوى الرئيسي */}
      <main className="flex-1 bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/5 shadow-lg dark:shadow-none transition-colors duration-300">
        <Outlet /> 
      </main>

    </div>
  );
};

export default SellerLayout;