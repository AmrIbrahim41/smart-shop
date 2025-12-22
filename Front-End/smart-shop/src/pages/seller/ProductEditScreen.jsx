import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../../api'; // تأكد إن الاستدعاء كدة صح حسب ملف api.js
import { FaArrowLeft, FaSave, FaImage, FaImages, FaTrash, FaTimes } from 'react-icons/fa';
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ProductEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const isAdmin = userInfo?.isAdmin;
    // لو أدمن يرجع للوحة الأدمن، لو بائع يرجع للداشبورد بتاعته
    const goBackLink = isAdmin ? "/admin/productlist" : "/dashboard";

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

    const fetchData = async () => {
        if (!id) return;
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
            // التعامل بذكاء مع القسم سواء جاي كـ رقم أو كائن
            setCategory(data.category?.id || data.category || '');
            setDescription(data.description);
            setApprovalStatus(data.approval_status);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load product data");
        } finally {
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

        if (isAdmin) {
            formData.append('approval_status', approvalStatus);
        }

        if (image instanceof File) {
            formData.append('image', image);
        }

        if (subImages.length > 0) {
            subImages.forEach((file) => {
                formData.append('images', file);
            });
        }

        try {
            setLoading(true);
            let response;

            if (id) {
                response = await apiService.updateProduct(id, formData);
                alert(t('productUpdated') || 'Product Updated Successfully!');
            } else {
                response = await apiService.createProduct(formData);
                alert(t('productCreated') || 'Product Created Successfully!');
                navigate(goBackLink);
            }

            // تحديث الواجهة بعد الحفظ
            const { data } = response;
            setImage(data.image);
            setPreview(getImageUrl(data.image));
            setOldImages(data.images || []);
            setSubImages([]);
            setSubImagesPreview([]);

        } catch (error) {
            const message = error.response?.data?.detail || error.message || 'Error saving product';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-40 text-center text-gray-500 dark:text-white font-bold animate-pulse">Loading Product Data...</div>;

    if (error) return (
        <div className="min-h-screen pt-40 text-center px-6">
            <div className="bg-red-100 text-red-700 p-6 rounded-xl max-w-lg mx-auto border border-red-300">
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p className="mb-4">{error}</p>
                <Link to={goBackLink} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">Go Back</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
            <Meta title={id ? t('editProduct') : t('createProduct')} />

            <div className="max-w-4xl mx-auto">
                {/* زر الرجوع */}
                <button 
                    onClick={() => navigate(goBackLink)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-6 font-bold transition"
                >
                    <FaArrowLeft /> {t('goBack') || "Go Back"}
                </button>

                <form onSubmit={submitHandler} className="bg-white dark:bg-dark-accent rounded-3xl p-6 md:p-8 shadow-lg dark:shadow-none border border-gray-200 dark:border-white/10">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-white/10 pb-4">
                        {id ? (t('editProduct') || "Edit Product") : (t('createProduct') || "Create Product")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* ================= القسم الأيسر: الصور ================= */}
                        <div className="space-y-6">
                            {/* الصورة الأساسية */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t('mainImage') || "Main Image"}</label>
                                <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-dark hover:border-primary transition h-64 flex items-center justify-center">
                                    <img
                                        src={preview || getImageUrl(image)}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                        onError={(e) => e.target.src = '/images/placeholder.png'}
                                    />
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition duration-300">
                                        <FaImage size={30} className="mb-2" />
                                        <span className="font-bold text-sm">{t('changeImage') || "Change Image"}</span>
                                        <input type="file" onChange={uploadFileHandler} hidden />
                                    </label>
                                </div>
                            </div>

                            {/* صور المعرض (Sub Images) */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t('galleryImages') || "Gallery Images"}</label>
                                
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    {/* الصور القديمة */}
                                    {oldImages.map((img) => (
                                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group">
                                            <img src={getImageUrl(img.image)} alt="sub" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => deleteOldImageHandler(img.id)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                                            >
                                                <FaTrash size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* الصور الجديدة للمعاينة */}
                                    {subImagesPreview.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-green-500/50 group">
                                            <img src={url} alt="new-preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => removeSubImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* زر الإضافة */}
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:text-primary text-gray-400 transition bg-gray-50 dark:bg-dark">
                                        <FaImages size={20} className="mb-1" />
                                        <span className="text-[10px] font-bold">{t('add') || "Add"}</span>
                                        <input type="file" multiple onChange={uploadSubImagesHandler} hidden />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ================= القسم الأيمن: البيانات ================= */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2 text-sm">{t('productName') || "Product Name"}</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2 text-sm">{t('price') || "Price ($)"}</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2 text-sm text-red-500">{t('discountPrice') || "Sale Price"}</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-gray-900 dark:text-white transition"
                                        value={discountPrice}
                                        onChange={(e) => setDiscountPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2 text-sm">{t('brand') || "Brand"}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 focus:border-primary outline-none text-gray-900 dark:text-white transition"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2 text-sm">{t('stock') || "Count In Stock"}</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 focus:border-primary outline-none text-gray-900 dark:text-white transition"
                                        value={countInStock}
                                        onChange={(e) => setCountInStock(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2 text-sm">{t('category') || "Category"}</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 focus:border-primary outline-none text-gray-900 dark:text-white transition cursor-pointer"
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)} 
                                    required
                                >
                                    <option value="">{t('selectCategory') || "Select Category..."}</option>
                                    {categoriesList.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2 text-sm">{t('description') || "Description"}</label>
                                <textarea
                                    rows="5"
                                    className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 focus:border-primary outline-none text-gray-900 dark:text-white transition"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('processing') : <><FaSave /> {t('saveProduct') || "Save Product"}</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ProductEditScreen;