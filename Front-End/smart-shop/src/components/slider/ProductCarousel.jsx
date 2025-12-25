import React, { useEffect, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import api, { ENDPOINTS, getImageUrl } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCarousel = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const { data } = await api.get(ENDPOINTS.TOP_PRODUCTS);
                setProducts(data.slice(0, 5)); // الاكتفاء بأفضل 5 لتقليل حجم الـ DOM
                setLoading(false);
            } catch (error) {
                console.error("Error", error);
                setLoading(false);
            }
        };
        fetchTopProducts();
    }, []);

    useEffect(() => {
        if (products.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
        }, 7000);
        return () => clearInterval(interval);
    }, [currentIndex, products.length]);

    if (loading || products.length === 0) {
        // Skeleton Loading أنظف
        return <div className="w-full h-[400px] md:h-[550px] bg-gray-200 dark:bg-gray-800 rounded-[2.5rem] animate-pulse mb-12"></div>;
    }

    const product = products[currentIndex];

    return (
        <div className="relative w-full max-w-7xl mx-auto h-[400px] md:h-[550px] rounded-[2.5rem] overflow-hidden mb-16 bg-black">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }} // Fade أنعم وأطول
                    className="absolute inset-0"
                >
                    {/* الصورة - استخدام eager لأول صورة فقط للأداء */}
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        loading={currentIndex === 0 ? "eager" : "lazy"}
                        className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                </motion.div>
            </AnimatePresence>

            {/* المحتوى النصي بتصميم "مجلة" */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-10">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={product._id}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="max-w-3xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Featured</span>
                            <div className="flex items-center gap-1 text-yellow-400">
                                <FaStar size={14} /><span className="text-white font-bold text-sm">{product.rating}</span>
                            </div>
                        </div>

                        <Link to={`/product/${product._id}`} className="group block">
                            <h2 className="text-3xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight group-hover:underline underline-offset-8 decoration-4">
                                {product.name}
                            </h2>
                        </Link>

                        <p className="text-gray-300 text-lg mb-8 line-clamp-2 hidden md:block font-medium max-w-xl">
                            {product.description}
                        </p>

                        <div className="flex items-center gap-6">
                            <span className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                                ${product.price}
                            </span>
                            <Link to={`/product/${product._id}`} className="flex items-center gap-2 md:gap-3 bg-white text-black px-5 py-2.5 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg hover:bg-primary hover:text-white transition-all group shadow-lg shadow-white/10">
                                Shop Now
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-xs md:text-base" />
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* مؤشرات بسيطة جداً */}
            <div className="absolute bottom-8 right-8 flex gap-3 z-20">
                {products.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1 rounded-full transition-all duration-500 ${index === currentIndex ? 'bg-white w-8' : 'bg-white/30 w-4 hover:bg-white/70'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default memo(ProductCarousel);