import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api';
import { FaShoppingCart, FaArrowLeft, FaHeart, FaRegHeart, FaPlus, FaMinus, FaUserCircle, FaEdit } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import Rating from '../../components/rating/Rating';
import Meta from '../../components/tapheader/Meta';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const { t } = useSettings();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [displayImage, setDisplayImage] = useState('');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`${ENDPOINTS.PRODUCTS}${id}/`);
      setProduct(data);
      setDisplayImage(data.image); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const increaseQty = () => {
    if (qty < product.countInStock) setQty(qty + 1);
    else alert("You've reached the maximum limit allowed per order.");
  };

  const decreaseQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  // 👇 التعديل هنا: فحص تسجيل الدخول قبل الإضافة
  const addToCartHandler = () => {
    // 1. لو مش مسجل، روح لصفحة الدخول فوراً
    if (!userInfo) {
        navigate('/login');
        return;
    }

    // 2. لو مسجل، كمل الإضافة
    if (product.countInStock > 0) {
      addToCart(product, qty);
      alert(`Added ${qty} item(s) to Cart 🛒`);
    }
  };

  const editReviewHandler = () => {
    const myReview = product.reviews.find(r => r.user === userInfo?.id);
    if (myReview) {
        setRating(myReview.rating);
        setComment(myReview.comment);
        setIsEditing(true);
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!rating || !comment) {
        alert("Please select a rating and write a comment");
        return;
    }

    try {
      setReviewLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      };
      
      if (isEditing) {
          await api.put(`products/${id}/reviews/update/`, { rating, comment }, config);
          alert('Review Updated Successfully! ✅');
      } else {
          await api.post(`products/${id}/reviews/create/`, { rating, comment }, config);
          alert('Review Submitted! Thank you.');
      }
      
      setRating(0);
      setComment('');
      setIsEditing(false);
      fetchProduct();
      
    } catch (error) {
      alert(error.response?.data?.detail || 'Error submitting review');
    } finally {
        setReviewLoading(false);
    }
  };

  if (loading) return <div className="text-gray-600 dark:text-white text-center pt-40 font-bold text-xl animate-pulse">{t('loading') || "Loading..."}</div>;
  if (!product) return <div className="text-red-500 text-center pt-40 font-bold text-xl">Product Not Found</div>;

  const userReview = product.reviews.find(r => r.user === userInfo?.id);
  const isWishlisted = isInWishlist(product.id);
  const allImages = [product.image, ...(product.images ? product.images.map(img => img.image) : [])];

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      {product && <Meta title={product.name} description={product.description} />}

      <div className="max-w-7xl mx-auto">
        <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white mb-6 inline-flex items-center gap-2 font-bold transition">
            <FaArrowLeft /> {t('backToProducts') || "BACK"}
        </Link>

        {/* --- Grid: الصور والتفاصيل --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          
          {/* قسم الصور */}
          <div className="flex flex-col gap-4">
             <div className="bg-white dark:bg-dark-accent rounded-3xl p-8 border border-gray-200 dark:border-white/5 flex items-center justify-center relative group h-[400px] md:h-[500px] shadow-sm transition-colors duration-300">
                <img 
                    src={`http://127.0.0.1:8000${displayImage}`} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain drop-shadow-xl transition duration-500" 
                />
                
                <button 
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-gray-100 dark:bg-dark/50 hover:bg-white dark:hover:bg-dark/80 text-gray-600 dark:text-white rounded-full backdrop-blur-md transition shadow-md z-10"
                >
                    {isWishlisted ? (
                        <FaHeart className="text-2xl text-primary animate-pulse" />
                    ) : (
                        <FaRegHeart className="text-2xl" />
                    )}
                </button>
             </div>

             {allImages.length > 1 && (
                 <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 custom-scrollbar">
                     {allImages.map((img, index) => (
                         <div 
                            key={index} 
                            onClick={() => setDisplayImage(img)}
                            className={`w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 cursor-pointer overflow-hidden flex-shrink-0 transition bg-white dark:bg-dark-accent ${
                                displayImage === img ? 'border-primary opacity-100' : 'border-gray-200 dark:border-white/10 opacity-60 hover:opacity-100'
                            }`}
                         >
                             <img 
                                src={`http://127.0.0.1:8000${img}`} 
                                alt={`thumb-${index}`} 
                                className="w-full h-full object-cover" 
                             />
                         </div>
                     ))}
                 </div>
             )}
          </div>

          {/* قسم التفاصيل */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight transition-colors duration-300">
                {product.name}
            </h1>
            
            <div className="flex items-center gap-4">
                <Rating value={product.rating} text={`${product.numReviews} ${t('reviews') || "reviews"}`} />
            </div>

            <div className="flex items-center gap-4">
                {product.discount_price && product.discount_price > 0 ? (
                    <>
                        <span className="text-3xl md:text-4xl font-black text-primary">${product.discount_price}</span>
                        <div className="flex flex-col">
                            <span className="text-gray-500 line-through text-lg">${product.price}</span>
                            <span className="text-red-500 bg-red-100 dark:bg-red-500/10 dark:text-red-400 text-xs font-bold px-2 py-1 rounded">
                                SAVE {Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                            </span>
                        </div>
                    </>
                ) : (
                    <p className="text-3xl font-bold text-primary">${product.price}</p>
                )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base transition-colors duration-300">
                {product.description}
            </p>

            <div className="border-t border-b border-gray-200 dark:border-white/10 py-6 space-y-6">
                <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
                    <span>{t('status') || "Status"}:</span>
                    <span className={product.countInStock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
                        {product.countInStock > 0 ? (t('inStock') || "In Stock") : (t('outOfStock') || "Out of Stock")}
                    </span>
                </div>

                {product.countInStock > 0 && (
                    <div className="flex items-center justify-between bg-white dark:bg-dark-accent p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm transition-colors duration-300">
                        <span className="text-gray-700 dark:text-gray-300 font-bold">{t('quantity') || "Quantity"}:</span>
                        <div className="flex items-center gap-4 bg-gray-100 dark:bg-dark rounded-full px-2 py-1 border border-gray-200 dark:border-white/10">
                            <button onClick={decreaseQty} disabled={qty === 1} className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-white/5 hover:bg-primary text-gray-700 dark:text-white hover:text-white transition disabled:opacity-50">
                                <FaMinus size={10} />
                            </button>
                            <span className="text-gray-900 dark:text-white font-bold w-4 text-center">{qty}</span>
                            <button onClick={increaseQty} className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-white/5 hover:bg-primary text-gray-700 dark:text-white hover:text-white transition">
                                <FaPlus size={10} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <button 
                onClick={addToCartHandler} 
                disabled={product.countInStock === 0} 
                className="w-full bg-dark dark:bg-white text-white dark:text-dark hover:bg-primary dark:hover:bg-primary hover:text-white font-black py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed uppercase"
            >
                <FaShoppingCart /> {product.countInStock > 0 ? (t('addToCart') || 'ADD TO CART') : (t('outOfStock') || 'SOLD OUT')}
            </button>
          </div>
        </div>

        {/* --- قسم المراجعات --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 border-t border-gray-200 dark:border-white/10 pt-10 transition-colors duration-300">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
                    {t('customerReviews') || "Customer Reviews"} ({product.reviews.length})
                </h2>
                
                {product.reviews.length === 0 && (
                    <div className="bg-white dark:bg-dark-accent p-6 rounded-2xl border border-gray-200 dark:border-white/5 text-center shadow-sm">
                        <p className="text-gray-500 dark:text-gray-400">{t('noReviews') || "No reviews yet."}</p>
                    </div>
                )}
                
                <div className="space-y-4">
                    {product.reviews.map((review) => (
                        <div key={review._id || review.id} className="bg-white dark:bg-dark-accent p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex gap-4 shadow-sm transition-colors duration-300">
                            <div className="mt-1">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-primary">
                                    <FaUserCircle size={24} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-gray-900 dark:text-white font-bold">{review.user_name || review.name}</h4>
                                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-black/20 px-2 py-1 rounded">{review.createdAt.substring(0, 10)}</span>
                                </div>
                                <div className="mb-2"><Rating value={review.rating} /></div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-black/20 p-3 rounded-lg rounded-tl-none">
                                    {review.comment}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
                    {isEditing ? 'Update Your Review' : (t('writeReview') || 'Write a Review')}
                </h2>
                
                {userInfo ? (
                    (userReview && !isEditing) ? (
                        <div className="bg-primary/10 border border-primary/20 p-8 rounded-3xl text-center">
                            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4"><FaHeart size={30} /></div>
                            <h3 className="text-gray-900 dark:text-white font-bold text-xl mb-2">You've reviewed this product</h3>
                            <h4 className="text-gray-500 dark:text-gray-400 font-bold text-l mb-2">thanks for sharing your experience</h4>
                            <button 
                                onClick={editReviewHandler} 
                                className="bg-white dark:bg-dark-accent hover:bg-dark hover:text-white dark:hover:bg-white dark:hover:text-dark text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 mx-auto mt-4 shadow-sm"
                            >
                                <FaEdit /> Edit My Review
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={submitReviewHandler} className="bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg transition-colors duration-300">
                            <div className="mb-4">
                                <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-2">Rating</label>
                                <select 
                                    value={rating} 
                                    onChange={(e) => setRating(e.target.value)} 
                                    className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-primary outline-none cursor-pointer transition-colors"
                                >
                                    <option value="">Select Rating...</option>
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-2">Comment</label>
                                <textarea 
                                    rows="4" 
                                    value={comment} 
                                    onChange={(e) => setComment(e.target.value)} 
                                    className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-primary outline-none resize-none transition-colors" 
                                    placeholder="Share your thoughts..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" disabled={reviewLoading} className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-lg flex justify-center items-center gap-2">
                                    {reviewLoading ? 'Saving...' : (isEditing ? 'UPDATE REVIEW' : (t('submitReview') || 'SUBMIT REVIEW'))}
                                </button>
                                
                                {isEditing && (
                                    <button type="button" onClick={() => { setIsEditing(false); setRating(0); setComment(''); }} className="bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-xl transition">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    )
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500 p-6 rounded-2xl dark:border-yellow-500/20 text-center">
                        Please <Link to="/login" className="font-bold underline hover:text-dark dark:hover:text-white">Login</Link> to write a review.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;