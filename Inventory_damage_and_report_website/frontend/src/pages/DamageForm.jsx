import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageWithFallback from '../components/ImageWithFallback';

function DamageForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [formData, setFormData] = useState({
        inventory_id: '',
        damage_description: '',
        damage_date: new Date().toISOString().split('T')[0],
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchInventory();
        if (isEdit) fetchReport();
    }, [id]);

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory', { params: { limit: 1000 } });
            setInventoryItems(res.data.data);
        } catch (error) {
            toast.error('Failed to load inventory items');
        }
    };

    const fetchReport = async () => {
        try {
            const res = await api.get(`/damages/${id}`);
            const report = res.data.data;
            setFormData({
                inventory_id: report.inventory_id?.toString() || '',
                damage_description: report.damage_description || '',
                damage_date: report.damage_date || '',
            });
            if (report.damage_image_path) {
                setImagePreview(report.damage_image_path);
            }
        } catch (error) {
            toast.error('Failed to load damage report');
            navigate('/damages');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.inventory_id) errs.inventory_id = 'Inventory item is required';
        if (!formData.damage_description.trim()) errs.damage_description = 'Description is required';
        if (!formData.damage_date) errs.damage_date = 'Damage date is required';
        if (!isEdit && !imageFile) errs.image = 'An image of the damage is required';
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
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('inventory_id', formData.inventory_id);
            data.append('damage_description', formData.damage_description);
            data.append('damage_date', formData.damage_date);
            if (imageFile) {
                data.append('damage_image', imageFile);
            }

            if (isEdit) {
                await api.put(`/damages/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Damage report updated');
            } else {
                await api.post('/damages', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Damage report created');
            }
            navigate('/damages');
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
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/damages')} style={{ marginBottom: '0.5rem' }}>
                        <HiOutlineArrowLeft /> Back to Damage Reports
                    </button>
                    <h1 className="page-title">{isEdit ? 'Edit Damage Report' : 'New Damage Report'}</h1>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {/* Inventory Item */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="inventory_id">Inventory Item *</label>
                        <select
                            id="inventory_id"
                            name="inventory_id"
                            className="form-select"
                            value={formData.inventory_id}
                            onChange={handleChange}
                        >
                            <option value="">Select an item</option>
                            {inventoryItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name} — {item.category} ({item.location})
                                </option>
                            ))}
                        </select>
                        {errors.inventory_id && <div className="form-error">{errors.inventory_id}</div>}
                    </div>

                    {/* Damage Description */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="damage_description">Damage Description *</label>
                        <textarea
                            id="damage_description"
                            name="damage_description"
                            className="form-textarea"
                            placeholder="Describe the damage in detail..."
                            value={formData.damage_description}
                            onChange={handleChange}
                        />
                        {errors.damage_description && <div className="form-error">{errors.damage_description}</div>}
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="damage_image">Damage Image *</label>
                        <div className="image-upload-area" style={{
                            border: '2px dashed var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-xl)',
                            textAlign: 'center',
                            background: 'var(--color-bg-secondary)',
                            cursor: 'pointer',
                            position: 'relative'
                        }} onClick={() => document.getElementById('damage_image').click()}>
                            {imagePreview ? (
                                <div style={{ position: 'relative' }}>
                                    <ImageWithFallback
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)' }}
                                        keyword="damaged item"
                                    />
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>Click to change image</p>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--color-text-tertiary)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                    <p>Click to upload damage photo</p>
                                    <p style={{ fontSize: '0.75rem' }}>PNG, JPG up to 5MB</p>
                                </div>
                            )}
                            <input
                                id="damage_image"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                        </div>
                        {errors.image && <div className="form-error">{errors.image}</div>}
                    </div>

                    {/* Damage Date */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="damage_date">Damage Date *</label>
                        <input
                            id="damage_date"
                            name="damage_date"
                            type="date"
                            className="form-input"
                            value={formData.damage_date}
                            onChange={handleChange}
                        />
                        {errors.damage_date && <div className="form-error">{errors.damage_date}</div>}
                    </div>

                    <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>
                        Status will be set to <strong>Pending</strong> and reviewed by a supervisor.
                    </p>

                    {/* Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/damages')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : isEdit ? 'Update Report' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DamageForm;
