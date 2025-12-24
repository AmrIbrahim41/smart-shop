import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/productcard/ProductCard'; 
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';
import { FaHeartBroken } from 'react-icons/fa';

const WishlistScreen = () => {
    const { wishlistItems } = useWishlist();
    const { t } = useSettings();

    return (
        <div className="min-h-screen pt-28 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 pb-10 transition-colors duration-500">
            <Meta title={t('myWishlist') || "My Wishlist"} />
            
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {t('myWishlist') || "MY WISHLIST"} <span className="text-gray-400 text-lg ml-2">({wishlistItems.length})</span>
                    </h1>
                </div>
                
                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center mt-20 bg-white dark:bg-gray-800 p-12 rounded-[3rem] border border-dashed border-gray-300 dark:border-gray-700 shadow-sm transition-colors max-w-2xl mx-auto">
                        <FaHeartBroken className="text-6xl text-gray-300 dark:text-gray-600 mb-6" />
                        <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">{t('wishlistEmpty') || "Your wishlist is empty"}</h2>
                        <p className="mb-8 text-gray-500 dark:text-gray-400">{t('startExploring') || "Save items you love here for later."}</p>
                        <Link to="/" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition shadow-lg shadow-primary/30 uppercase tracking-wide transform hover:scale-105">
                            {t('goShopping') || "EXPLORE PRODUCTS"}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlistItems.map(product => (
                            <div key={product.id} className="h-full">
                               <ProductCard product={product} /> 
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistScreen;