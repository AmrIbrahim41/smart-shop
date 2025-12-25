import React, { useState, useEffect } from 'react';
import api from '../../api'; // تأكد من مسار api عندك
import ProductCard from '../../components/productcard/ProductCard'; // تأكد من مسار ProductCard
import { FaStore } from 'react-icons/fa';

const ShopScreen = () => {
    const [shopData, setShopData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                // استبدل الرابط حسب ما كتبته في urls.py
                const { data } = await api.get('/api/products/shop-view/');
                setShopData(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching shop data", error);
                setLoading(false);
            }
        };
        fetchShopData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center items-start">
                 <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full px-10">
                        {[...Array(4)].map((_, i) => (
                             <div key={i} className="h-64 w-full bg-gray-200 rounded-2xl"></div>
                        ))}
                    </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4 md:px-8 transition-colors">
            
            {/* Header */}
            <div className="max-w-[1400px] mx-auto mb-10 text-center">
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center justify-center gap-3">
                    <FaStore className="text-primary" /> Shop By Category
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Explore our collection organized for you</p>
            </div>

            {/* Categories Loop */}
            <div className="max-w-[1400px] mx-auto flex flex-col gap-16">
                {shopData.map((category) => (
                    <div key={category.id} className="flex flex-col gap-6">
                        
                        {/* Category Title */}
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white border-l-4 border-primary pl-4">
                                {category.name}
                            </h2>
                            <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/10"></div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {category.products.map((product) => (
                                <ProductCard key={product.id || product._id} product={product} />
                            ))}
                        </div>
                    </div>
                ))}

                {shopData.length === 0 && (
                    <div className="text-center text-gray-500 py-20">No products found.</div>
                )}
            </div>
        </div>
    );
};

export default ShopScreen;