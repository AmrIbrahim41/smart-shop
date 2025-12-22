import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/productcard/ProductCard'; 
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const WishlistScreen = () => {
    const { wishlistItems } = useWishlist();
    const { t } = useSettings();

    return (
        <div className="min-h-screen pt-28 px-6 bg-gray-50 dark:bg-dark pb-10 transition-colors duration-300">
            <Meta title={t('myWishlist') || "My Wishlist"} />
            
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 border-l-4 border-primary pl-4 transition-colors">
                    {t('myWishlist') || "MY WISHLIST"} ({wishlistItems.length})
                </h1>
                
                {wishlistItems.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-20 bg-white dark:bg-dark-accent p-10 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm transition-colors">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('wishlistEmpty') || "Your wishlist is empty 💔"}</h2>
                        <p className="mb-6">{t('startExploring') || "Start exploring and save your favorite items here."}</p>
                        <Link to="/" className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition shadow-lg">
                            {t('goShopping') || "Go Shopping"}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlistItems.map(product => (
                            <div key={product.id} className="h-full">
                               {/* ProductCard هو اللي بيتولى عرض الصورة والتعامل مع الرابط */}
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