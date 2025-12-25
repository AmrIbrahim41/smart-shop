import React, { useEffect, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
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
                setProducts(data.slice(0, 5));
                setLoading(false);
            } catch (error) {
                console.error("Error", error);
                setLoading(false);
            }
        };
        fetchTopProducts();
    }, []);

    // Auto-play Logic
    useEffect(() => {
        if (products.length === 0) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(interval);
    }, [currentIndex, products.length]);

    const nextSlide = () => setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));

    if (loading || products.length === 0) {
        return <div className="w-full h-[400px] md:h-[550px] bg-gray-200 dark:bg-gray-800 rounded-[2.5rem] animate-pulse mb-12"></div>;
    }

    const product = products[currentIndex];

    return (
        <div className="relative w-full max-w-7xl mx-auto h-[450px] md:h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-16 shadow-2xl shadow-gray-200 dark:shadow-black/50 bg-black group">
            
            {/* 1. Background Image Layer */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={product._id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        loading={currentIndex === 0 ? "eager" : "lazy"}
                        className="w-full h-full object-cover opacity-80"
                    />
                    {/* Dark Gradient Overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
                </motion.div>
            </AnimatePresence>

            {/* 2. Text Content Layer */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 pb-12 md:pb-20 z-10">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={product._id}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -30, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="max-w-3xl"
                    >
                        {/* Rating Badge */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-white/20 backdrop-blur-md border border-white/10 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                Featured
                            </span>
                            <div className="flex items-center gap-1 text-yellow-400">
                                <FaStar size={14} />
                                <span className="text-white font-bold text-sm">{product.rating}</span>
                            </div>
                        </div>

                        {/* Title */}
                        <Link to={`/product/${product._id}`} className="group block w-fit">
                            <h2 className="text-4xl md:text-7xl font-black text-white mb-4 leading-[0.9] tracking-tight drop-shadow-lg">
                                {product.name}
                            </h2>
                        </Link>

                        {/* Description (Desktop) */}
                        <p className="text-gray-200 text-sm md:text-xl mb-8 line-clamp-2 md:line-clamp-2 max-w-xl font-medium opacity-90 hidden sm:block">
                            {product.description}
                        </p>

                        {/* Price & The New Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-2">
                            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">
                                ${product.price}
                            </span>
                            
                            {/* ⭐⭐⭐ THE NEW PREMIUM BUTTON ⭐⭐⭐ */}
                            <Link 
                                to={`/product/${product._id}`} 
                                className="relative overflow-hidden group/btn flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-base transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 w-fit"
                            >
                                <span className="relative z-10 uppercase tracking-wider text-sm">Shop Now</span>
                                <span className="relative z-10 bg-black text-white rounded-full p-1 group-hover/btn:translate-x-1 transition-transform duration-300">
                                    <FaArrowRight size={12} />
                                </span>
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 3. Navigation Arrows (Desktop Only) - Better UX */}
            <div className="absolute bottom-12 right-12 hidden md:flex gap-3 z-20">
                 <button 
                    onClick={prevSlide} 
                    className="w-14 h-14 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-black text-white flex items-center justify-center transition-all duration-300 group"
                 >
                    <FaChevronLeft className="group-hover:-translate-x-0.5 transition-transform"/>
                 </button>
                 <button 
                    onClick={nextSlide} 
                    className="w-14 h-14 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-black text-white flex items-center justify-center transition-all duration-300 group"
                 >
                    <FaChevronRight className="group-hover:translate-x-0.5 transition-transform"/>
                 </button>
            </div>

            {/* 4. Indicators (Mobile & Desktop) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:bottom-28 flex gap-2 z-20">
                {products.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                            index === currentIndex ? 'bg-white w-8 shadow-[0_0_10px_white]' : 'bg-white/20 w-2 hover:bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default memo(ProductCarousel);