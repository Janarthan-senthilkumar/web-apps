import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlinePhotograph, HiOutlineX, HiOutlineArrowLeft } from 'react-icons/hi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageWithFallback from '../components/ImageWithFallback';

function InventoryForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        quantity: '',
        location: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const res = await api.get(`/inventory/${id}`);
            const item = res.data.data;
            setFormData({
                name: item.name || '',
                category: item.category || '',
                quantity: item.quantity?.toString() || '',
                location: item.location || '',
            });
            if (item.image_path) {
                setImagePreview(item.image_path);
            }
        } catch (error) {
            toast.error('Failed to load item');
            navigate('/inventory');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        if (!formData.category.trim()) errs.category = 'Category is required';
        if (!formData.quantity || parseInt(formData.quantity) < 0) errs.quantity = 'Valid quantity is required';
        if (!formData.location.trim()) errs.location = 'Location is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPG and PNG images are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('category', formData.category);
            data.append('quantity', formData.quantity);
            data.append('location', formData.location);
            if (imageFile) data.append('image', imageFile);

            if (isEdit) {
                await api.put(`/inventory/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Item updated successfully');
            } else {
                await api.post('/inventory', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Item created successfully');
            }
            navigate('/inventory');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inventory')} style={{ marginBottom: '0.5rem' }}>
                        <HiOutlineArrowLeft /> Back to Inventory
                    </button>
                    <h1 className="page-title">{isEdit ? 'Edit Item' : 'Add New Item'}</h1>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">Item Image</label>
                        <div
                            className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            {imagePreview ? (
                                <>
                                    <ImageWithFallback src={imagePreview} alt="Preview" className="image-preview" />
                                    <button type="button" className="image-preview-remove" onClick={removeImage}>
                                        <HiOutlineX />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="image-upload-icon"><HiOutlinePhotograph /></div>
                                    <div className="image-upload-text">
                                        <span>Click to upload</span> or drag and drop
                                    </div>
                                    <div className="image-upload-hint">JPG or PNG, max 5MB</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Item Name *</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="form-input"
                            placeholder="e.g., Office Chair"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="category">Category *</label>
                        <input
                            id="category"
                            name="category"
                            type="text"
                            className="form-input"
                            placeholder="e.g., Furniture, Electronics, Equipment"
                            value={formData.category}
                            onChange={handleChange}
                        />
                        {errors.category && <div className="form-error">{errors.category}</div>}
                    </div>

                    {/* Quantity */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="quantity">Quantity *</label>
                        <input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="0"
                            className="form-input"
                            placeholder="e.g., 10"
                            value={formData.quantity}
                            onChange={handleChange}
                        />
                        {errors.quantity && <div className="form-error">{errors.quantity}</div>}
                    </div>

                    {/* Location */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="location">Location *</label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            className="form-input"
                            placeholder="e.g., Warehouse A, Room 201"
                            value={formData.location}
                            onChange={handleChange}
                        />
                        {errors.location && <div className="form-error">{errors.location}</div>}
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/inventory')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InventoryForm;
