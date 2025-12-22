import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api, { ENDPOINTS, apiService, getImageUrl } from '../../api';
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



    const fetchData = async () => {
        if (!id) return;
        try {
            // جلب الأقسام
            const { data: categories } = await apiService.getCategories();
            setCategoriesList(categories);

            // جلب المنتج
            const { data } = await apiService.getProductDetails(id);

            setName(data.name);
            setPrice(data.price);
            setDiscountPrice(data.discount_price || 0);
            setImage(data.image);
            setPreview(getImageUrl(data.image)); // استخدام الدالة المركزية
            setOldImages(data.images || []);
            setBrand(data.brand);
            setCountInStock(data.countInStock);
            setCategory(data.category?.id || data.category || '');
            setDescription(data.description);
            setApprovalStatus(data.approval_status);
        } catch (err) {
            console.error("Error fetching data:", err);
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
                alert('Image Deleted');
            } catch (error) {
                alert('Error deleting image');
            }
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // 1. تجهيز البيانات في FormData لإرسال الملفات (الصور)
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('discount_price', discountPrice);
        formData.append('brand', brand);
        formData.append('countInStock', countInStock);
        formData.append('description', description);
        formData.append('category', category);

        // إضافة حالة الموافقة (فقط للأدمن)
        if (isAdmin) {
            formData.append('approval_status', approvalStatus);
        }

        // إضافة الصورة الأساسية (فقط إذا كانت ملفاً جديداً)
        if (image instanceof File) {
            formData.append('image', image);
        }

        // إضافة الصور الفرعية المتعددة
        if (subImages.length > 0) {
            subImages.forEach((file) => {
                formData.append('images', file);
            });
        }

        try {
            setLoading(true);
            let response;

            if (id) {
                // حالة التعديل: نستخدم دالة updateProduct من الـ apiService
                response = await apiService.updateProduct(id, formData);
                alert(t('productUpdated') || 'Product Updated Successfully! ✅');
            } else {
                // حالة الإنشاء: نستخدم دالة createProduct من الـ apiService
                response = await apiService.createProduct(formData);
                alert(t('productCreated') || 'Product Created Successfully! ✅');
                // بعد الإنشاء ممكن توجه المستخدم لصفحة المنتجات
                navigate(goBackLink);
            }

            // تحديث البيانات في الصفحة بعد النجاح بالبيانات الراجعة من السيرفر
            const { data } = response;
            setImage(data.image);
            setPreview(getImageUrl(data.image)); // استخدام الدالة المركزية للصور
            setOldImages(data.images || []);
            setSubImages([]);
            setSubImagesPreview([]);

        } catch (error) {
            // عرض رسالة الخطأ القادمة من الباك إند
            const message = error.response?.data?.detail || error.message || 'Error saving product';
            alert(message);
        } finally {
            setLoading(false);
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
        <div className="product-edit-container">
            <Meta title={id ? t('editProduct') : t('createProduct')} />

            {/* زر الرجوع */}
            <button className="btn-back" onClick={() => navigate(goBackLink)}>
                <FaArrowLeft /> {t('goBack')}
            </button>

            <form onSubmit={submitHandler} className="edit-form">
                <h2>{id ? t('editProduct') : t('createProduct')}</h2>

                {/* الصورة الأساسية والمعاينة */}
                <div className="image-section">
                    <div className="main-image-preview">
                        {/* استخدام getImageUrl المركزية هنا */}
                        <img
                            src={preview || getImageUrl(image)}
                            alt="Preview"
                            onError={(e) => e.target.src = '/images/placeholder.png'}
                        />
                    </div>
                    <label className="upload-label">
                        <FaImage /> {t('uploadMainImage')}
                        <input type="file" onChange={uploadFileHandler} hidden />
                    </label>
                </div>

                {/* الحقول النصية */}
                <div className="form-group">
                    <label>{t('productName')}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="row">
                    <div className="form-group col">
                        <label>{t('price')}</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group col">
                        <label>{t('discountPrice')}</label>
                        <input
                            type="number"
                            value={discountPrice}
                            onChange={(e) => setDiscountPrice(e.target.value)}
                        />
                    </div>
                </div>

                {/* اختيار القسم (Category) */}
                <div className="form-group">
                    <label>{t('category')}</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        <option value="">{t('selectCategory')}</option>
                        {categoriesList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* صور المعرض (Sub Images) */}
                <div className="sub-images-section">
                    <h4>{t('subImages')}</h4>
                    <div className="images-grid">
                        {/* الصور القديمة من السيرفر */}
                        {oldImages.map((img) => (
                            <div key={img.id} className="image-item">
                                <img src={getImageUrl(img.image)} alt="sub" />
                                <button type="button" onClick={() => deleteOldImageHandler(img.id)} className="btn-delete">
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                        {/* معاينة الصور الجديدة المختارة */}
                        {subImagesPreview.map((url, index) => (
                            <div key={index} className="image-item preview">
                                <img src={url} alt="new-preview" />
                                <button type="button" onClick={() => removeSubImage(index)} className="btn-delete">
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                    <label className="upload-label secondary">
                        <FaImages /> {t('addMoreImages')}
                        <input type="file" multiple onChange={uploadSubImagesHandler} hidden />
                    </label>
                </div>

                <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? t('loading') : <><FaSave /> {t('saveProduct')}</>}
                </button>
            </form>
        </div>
    );
};

export default ProductEditScreen;