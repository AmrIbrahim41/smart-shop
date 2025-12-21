import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaBoxOpen, FaPlusCircle, FaChartLine, FaClipboardList } from 'react-icons/fa';

const SellerLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "bg-primary text-white" : "text-gray-400 hover:bg-white/5 hover:text-white";

  return (
    <div className="pt-24 pb-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8 min-h-screen">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 bg-dark-accent p-6 rounded-3xl border border-white/5 h-fit">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">V</div>
            <div>
                <h3 className="font-bold">Vendor Panel</h3>
                <p className="text-xs text-gray-500">Manage your store</p>
            </div>
        </div>

        <nav className="space-y-2">
            <Link to="/seller/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive('/seller/dashboard')}`}>
                <FaChartLine /> Dashboard
            </Link>
            <Link to="/seller/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive('/seller/products')}`}>
                <FaBoxOpen /> My Products
            </Link>
            <Link to="/seller/products/add" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive('/seller/products/add')}`}>
                <FaPlusCircle /> Add New Product
            </Link>
            <Link to="/seller/orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive('/seller/orders')}`}>
                <FaClipboardList /> Orders
            </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-dark-accent p-8 rounded-3xl border border-white/5">
        <Outlet /> {/* هنا هيظهر محتوى الصفحات الفرعية */}
      </main>

    </div>
  );
};

export default SellerLayout;