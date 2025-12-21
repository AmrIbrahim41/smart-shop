import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../../api';
import { FaArrowLeft, FaSave, FaImage, FaImages, FaCheckCircle, FaClock, FaTimesCircle, FaTimes, FaTrash } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ProductEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const isAdmin = userInfo?.isAdmin;
    const goBackLink = isAdmin ? "/admin/productlist" : "/dashboard";

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);

    // 1. الصورة الأساسية
    const [image, setImage] = useState('');
    const [preview, setPreview] = useState('');

    // 2. صور المعرض الجديدة (للمعاينة والرفع)
    const [subImages, setSubImages] = useState([]);
    const [subImagesPreview, setSubImagesPreview] = useState([]);

    // 3. صور المعرض القديمة (القادمة من الداتابيز)
    const [oldImages, setOldImages] = useState([]);

    const [brand, setBrand] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [category, setCategory] = useState('');
    const [categoriesList, setCategoriesList] = useState([]);
    const [description, setDescription] = useState('');
    const [approvalStatus, setApprovalStatus] = useState('pending');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 👇👇 دي الدالة اللي كانت ناقصة وبتسبب المشكلة 👇👇
    const getImageUrl = (imgPath) => {
        if (!imgPath) return '';
        if (typeof imgPath === 'string' && imgPath.startsWith('http')) {
            return imgPath;
        }
        return `https://Amr41.pythonanywhere.com${imgPath}`;
    };

    const fetchData = async () => {
        if (!id) return;

        try {
            // جلب الأقسام
            try {
                const { data: categories } = await api.get('categories/');
                setCategoriesList(categories);
            } catch (e) { console.log("No categories found"); }

            console.log(`Fetching product with ID: ${id}`);

            // جلب المنتج
            const { data } = await api.get(`${ENDPOINTS.PRODUCTS}${id}/`);

            setName(data.name);
            setPrice(data.price);
            setDiscountPrice(data.discount_price || 0);

            // الصورة الأساسية
            setImage(data.image);
            setPreview(getImageUrl(data.image)); // هنا بنستخدم الدالة المساعدة

            setOldImages(data.images || []);
            setBrand(data.brand);
            setCountInStock(data.countInStock);

            // التعامل مع القسم (لو جاي كـ Object بناخد الـ ID)
            if (data.category && typeof data.category === 'object') {
                setCategory(data.category.id);
            } else {
                setCategory(data.category || '');
            }

            setDescription(data.description);
            setApprovalStatus(data.approval_status);

        } catch (err) {
            console.error("Error fetching product:", err);
            setError(err.response && err.response.status === 404
                ? "Product not found (404)"
                : "Could not load data.");
        } finally {
            // 👇 مهم جداً: إيقاف التحميل في كل الأحوال
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

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
        if (window.confirm(t('confirmDeleteImage') || "Delete this image?")) {
            try {
                await api.delete(`products/delete-image/${imageId}/`);
                setOldImages(prev => prev.filter(img => img.id !== imageId));
                alert("Image Deleted");
            } catch (error) {
                alert("Error deleting image");
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

        if (isAdmin) {
            formData.append('approval_status', approvalStatus);
        }

        if (image instanceof File) {
            formData.append('image', image);
        }

        if (subImages.length > 0) {
            subImages.forEach(file => {
                formData.append('images', file);
            });
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            // 👇 غير السطر ده في الـ submitHandler
            const { data } = await api.put(`${ENDPOINTS.UPDATE_PRODUCT}${id}/`, formData, config);

            alert(t('productUpdated') || 'Product Updated Successfully! ✅');

            // تحديث الواجهة بالبيانات الجديدة فوراً
            setPreview(getImageUrl(data.image));
            setImage(data.image);
            setOldImages(data.images || []);
            setSubImages([]);
            setSubImagesPreview([]);

        } catch (error) {
            console.error(error.response?.data);
            alert(error.response?.data?.detail || 'Error updating product');
        }
    };

    if (loading) return <div className="min-h-screen pt-40 text-center bg-dark text-white font-bold animate-pulse">Loading Product Data...</div>;

    if (error) return (
        <div className="min-h-screen pt-40 text-center bg-dark text-red-500">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="mb-4">{error}</p>
            <Link to={goBackLink} className="bg-primary px-4 py-2 rounded text-white">Go Back</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark pt-28 pb-10 px-6 transition-colors duration-300">
            <Meta title={t('editProduct') || "Edit Product"} />
            <div className="max-w-6xl mx-auto">

                <Link to={goBackLink} className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white mb-6 transition font-bold">
                    <FaArrowLeft /> {t('goBack') || "GO BACK"}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* العمود الأيسر: الصور */}
                    <div className="space-y-6">

                        {/* 1. الصورة الأساسية */}
                        <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none text-center">
                            <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">{t('mainImage') || "Main Image"}</label>
                            <div className="relative group w-full h-64 bg-gray-100 dark:bg-dark rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 mb-4 flex items-center justify-center">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <FaImage className="text-6xl text-gray-400 dark:text-gray-600" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                                    <span className="text-white font-bold">{t('changeImage') || "Change Image"}</span>
                                </div>
                                <input type="file" onChange={uploadFileHandler} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        {/* 2. معرض الصور */}
                        <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none text-center">
                            <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider flex items-center justify-center gap-2">
                                <FaImages /> {t('galleryImages') || "Gallery Images"}
                            </label>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {oldImages.map((img) => (
                                    <div key={img.id} className="h-20 rounded-lg overflow-hidden border border-green-500/50 relative group shadow-sm">
                                        <img src={getImageUrl(img.image)} alt="Old" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => deleteOldImageHandler(img.id)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-md z-10"
                                        >
                                            <FaTrash size={10} />
                                        </button>
                                        <div className="absolute bottom-0 w-full bg-green-600/80 text-[8px] text-white text-center">SAVED</div>
                                    </div>
                                ))}

                                {subImagesPreview.map((src, index) => (
                                    <div key={index} className="h-20 rounded-lg overflow-hidden border border-yellow-500/50 relative group shadow-sm">
                                        <img src={src} alt="New" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeSubImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                                            <FaTimes />
                                        </button>
                                        <div className="absolute bottom-0 w-full bg-yellow-600/80 text-[8px] text-white text-center">NEW</div>
                                    </div>
                                ))}

                                <div className="h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:border-primary hover:text-primary text-gray-400 dark:text-gray-500 transition relative">
                                    <span className="text-2xl font-bold">+</span>
                                    <input type="file" multiple onChange={uploadSubImagesHandler} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        {/* الحالة (للأدمن) */}
                        {isAdmin && (
                            <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none">
                                <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">{t('status') || "Status"}</label>
                                <div className="flex flex-col gap-3">
                                    <button type="button" onClick={() => setApprovalStatus('approved')} className={`flex items-center justify-between p-4 rounded-xl border transition ${approvalStatus === 'approved' ? 'bg-green-100 border-green-500 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-50 dark:bg-dark border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                                        <span className="font-bold">{t('approved') || "Approved"}</span><FaCheckCircle />
                                    </button>
                                    <button type="button" onClick={() => setApprovalStatus('pending')} className={`flex items-center justify-between p-4 rounded-xl border transition ${approvalStatus === 'pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' : 'bg-gray-50 dark:bg-dark border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                                        <span className="font-bold">{t('pending') || "Pending"}</span><FaClock />
                                    </button>
                                    <button type="button" onClick={() => setApprovalStatus('rejected')} className={`flex items-center justify-between p-4 rounded-xl border transition ${approvalStatus === 'rejected' ? 'bg-red-100 border-red-500 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-gray-50 dark:bg-dark border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                                        <span className="font-bold">{t('rejected') || "Rejected"}</span><FaTimesCircle />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* العمود الأيمن: الفورم */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-dark-accent p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-2xl h-full">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
                                {t('productDetails') || "PRODUCT DETAILS"} <span className="text-primary">#{id}</span>
                            </h1>

                            <form onSubmit={submitHandler} className="space-y-6">
                                <div>
                                    <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-2 uppercase">{t('productName') || "Product Name"}</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary outline-none transition" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-2 uppercase">{t('originalPrice') || "Original Price ($)"}</label>
                                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-green-600 dark:text-green-400 text-sm font-bold mb-2 uppercase">{t('discountPrice') || "Discount Price ($)"}</label>
                                        <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="w-full bg-green-50 dark:bg-dark border border-green-500/30 rounded-xl p-4 text-green-600 dark:text-green-400 focus:border-green-500 outline-none transition placeholder-green-700/50" placeholder="0 if no discount" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-2 uppercase">{t('stock') || "Stock"}</label>
                                        <input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-2 uppercase">{t('brand') || "Brand"}</label>
                                        <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary outline-none transition" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-2 uppercase">{t('category') || "Category"}</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary outline-none transition appearance-none cursor-pointer">
                                        <option value="">{t('selectCategory') || "Select Category"}</option>
                                        {categoriesList.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-500 dark:text-gray-400 text-sm font-bold mb-2 uppercase">{t('description') || "Description"}</label>
                                    <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:border-primary outline-none transition"></textarea>
                                </div>

                                <button type="submit" className="w-full bg-primary hover:bg-orange-600 text-white font-black py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 text-lg mt-4 uppercase">
                                    <FaSave /> {t('saveChanges') || "SAVE CHANGES"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductEditScreen;