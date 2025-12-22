import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../../api'; 
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaTrash, FaTimes, FaBoxOpen } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ProductEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const isAdmin = userInfo?.isAdmin;
    // توجيه المستخدم حسب صلاحيته
    const goBackLink = isAdmin ? "/admin/productlist" : "/dashboard";

    // --- State Variables (نفس المنطق البرمجي) ---
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [image, setImage] = useState('');
    const [preview, setPreview] = useState('');
    const [subImages, setSubImages] = useState([]);
    const [subImagesPreview, setSubImagesPreview] = useState([]);
    const [oldImages, setOldImages] = useState([]);
    const [brand, setBrand] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [category, setCategory] = useState('');
    const [categoriesList, setCategoriesList] = useState([]);
    const [description, setDescription] = useState('');
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Fetch Data ---
    const fetchData = async () => {
        if (!id) {
             // لو إنشاء منتج جديد، بنحمل الأقسام بس
             const { data: categories } = await apiService.getCategories();
             setCategoriesList(categories);
             setLoading(false);
             return;
        }
        try {
            const { data: categories } = await apiService.getCategories();
            setCategoriesList(categories);

            const { data } = await apiService.getProductDetails(id);

            setName(data.name);
            setPrice(data.price);
            setDiscountPrice(data.discount_price || 0);
            setImage(data.image);
            setPreview(getImageUrl(data.image));
            setOldImages(data.images || []);
            setBrand(data.brand);
            setCountInStock(data.countInStock);
            setCategory(data.category?.id || data.category || '');
            setDescription(data.description);
            setApprovalStatus(data.approval_status);
        } catch (err) {
            setError("Failed to load product data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // --- Handlers ---
    const uploadFileHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadSubImagesHandler = (e) => {
        const files = Array.from(e.target.files);
        setSubImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setSubImagesPreview(prev => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    const removeSubImage = (index) => {
        setSubImages(prev => prev.filter((_, i) => i !== index));
        setSubImagesPreview(prev => prev.filter((_, i) => i !== index));
    };

    const deleteOldImageHandler = async (imageId) => {
        if (window.confirm('Delete this image?')) {
            try {
                await apiService.deleteProductImage(imageId);
                setOldImages(prev => prev.filter(img => img.id !== imageId));
            } catch (error) {
                alert('Error deleting image');
            }
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('discount_price', discountPrice);
        formData.append('brand', brand);
        formData.append('countInStock', countInStock);
        formData.append('description', description);
        formData.append('category', category);

        if (isAdmin) formData.append('approval_status', approvalStatus);
        if (image instanceof File) formData.append('image', image);
        if (subImages.length > 0) {
            subImages.forEach((file) => formData.append('images', file));
        }

        try {
            setLoading(true);
            let response;
            if (id) {
                response = await apiService.updateProduct(id, formData);
                alert(t('productUpdated') || 'Updated Successfully!');
            } else {
                response = await apiService.createProduct(formData);
                alert(t('productCreated') || 'Created Successfully!');
                navigate(goBackLink);
            }
            // Refresh Data
            const { data } = response;
            setImage(data.image);
            setPreview(getImageUrl(data.image));
            setOldImages(data.images || []);
            setSubImages([]);
            setSubImagesPreview([]);
        } catch (error) {
            alert(error.response?.data?.detail || 'Error saving product');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-primary font-bold text-xl animate-pulse">Loading...</div>;

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-3xl text-center max-w-md border border-red-200 dark:border-red-800">
                <FaBoxOpen size={50} className="mx-auto mb-4 opacity-50"/>
                <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
                <p className="mb-6">{error}</p>
                <button onClick={() => navigate(goBackLink)} className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition w-full font-bold">
                    Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <Meta title={id ? t('editProduct') : t('createProduct')} />

            {/* Container */}
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                            {id ? (t('editProduct') || "Edit Product") : (t('createProduct') || "New Product")}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                            {id ? "Update your product details and images." : "Add a new product to your inventory."}
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate(goBackLink)}
                        className="group flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary bg-white dark:bg-gray-800 px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                        <span className="font-bold">{t('goBack') || "Cancel"}</span>
                    </button>
                </div>

                <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* === Left Column: Main Image === */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 sticky top-24">
                            <label className="block text-gray-700 dark:text-white font-bold mb-4 text-lg">{t('mainImage') || "Product Image"}</label>
                            
                            <div className="relative group w-full aspect-[4/5] bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                                <img
                                    src={preview || getImageUrl(image)}
                                    alt="Preview"
                                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40"
                                    onError={(e) => e.target.src = '/images/placeholder.png'}
                                />
                                <div className="z-10 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                                    <div className="bg-primary text-white p-4 rounded-full shadow-lg mb-3">
                                        <FaCloudUploadAlt size={30} />
                                    </div>
                                    <span className="text-gray-700 dark:text-white font-bold">{t('changeImage') || "Click to Upload"}</span>
                                </div>
                                <input type="file" onChange={uploadFileHandler} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-4">Supported formats: JPG, PNG, WEBP</p>
                        </div>
                    </div>

                    {/* === Right Column: Form Fields === */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. Basic Info Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Basic Information</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('productName')}</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Wireless Headphones"
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('price')}</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                className="w-full pl-8 px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-gray-900 dark:text-white"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-red-500 mb-2">{t('discountPrice')}</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300">$</span>
                                            <input
                                                type="number"
                                                className="w-full pl-8 px-5 py-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition text-red-600 dark:text-red-400 placeholder-red-300"
                                                value={discountPrice}
                                                onChange={(e) => setDiscountPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('description')}</label>
                                    <textarea
                                        rows="5"
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-gray-900 dark:text-white placeholder-gray-400"
                                        placeholder="Describe your product..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* 2. Details Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Product Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('category')}</label>
                                    <select 
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-gray-900 dark:text-white cursor-pointer appearance-none"
                                        value={category} 
                                        onChange={(e) => setCategory(e.target.value)} 
                                        required
                                    >
                                        <option value="">Select Category...</option>
                                        {categoriesList.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('brand')}</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-gray-900 dark:text-white"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('stock')}</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-gray-900 dark:text-white"
                                        value={countInStock}
                                        onChange={(e) => setCountInStock(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Gallery Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Image Gallery</h3>
                                <label className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2 font-bold text-sm">
                                    <FaCloudUploadAlt /> Add Images
                                    <input type="file" multiple onChange={uploadSubImagesHandler} hidden />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Existing Images */}
                                {oldImages.map((img) => (
                                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group">
                                        <img src={getImageUrl(img.image)} alt="gallery" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => deleteOldImageHandler(img.id)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                            <FaTrash size={20} className="hover:text-red-500 transition-colors" />
                                        </button>
                                    </div>
                                ))}
                                {/* New Uploads Preview */}
                                {subImagesPreview.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-green-500/50">
                                        <img src={url} alt="new-gallery" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeSubImage(index)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                            <FaTimes size={20} className="hover:text-red-500 transition-colors" />
                                        </button>
                                    </div>
                                ))}
                                {/* Empty State if no images */}
                                {oldImages.length === 0 && subImagesPreview.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-gray-400 italic">
                                        No additional images uploaded.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white font-bold py-5 rounded-2xl shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-3"
                        >
                            {loading ? "Processing..." : <><FaSave size={20} /> {id ? "Update Product" : "Publish Product"}</>}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditScreen;