import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

function ReplacementForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [damageReports, setDamageReports] = useState([]);
    const [formData, setFormData] = useState({
        damage_id: '',
        replacement_date: new Date().toISOString().split('T')[0],
        replacement_cost: '',
        notes: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDamageReports();
        if (isEdit) fetchRecord();
    }, [id]);

    const fetchDamageReports = async () => {
        try {
            const res = await api.get('/damages', { params: { limit: 1000 } });
            setDamageReports(res.data.data);
        } catch (error) {
            toast.error('Failed to load damage reports');
        }
    };

    const fetchRecord = async () => {
        try {
            const res = await api.get(`/replacements/${id}`);
            const record = res.data.data;
            setFormData({
                damage_id: record.damage_id?.toString() || '',
                replacement_date: record.replacement_date || '',
                replacement_cost: record.replacement_cost?.toString() || '',
                notes: record.notes || '',
            });
        } catch (error) {
            toast.error('Failed to load replacement record');
            navigate('/replacements');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.damage_id) errs.damage_id = 'Damage report is required';
        if (!formData.replacement_date) errs.replacement_date = 'Replacement date is required';
        if (!formData.replacement_cost || parseFloat(formData.replacement_cost) < 0) errs.replacement_cost = 'Valid cost is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                damage_id: parseInt(formData.damage_id),
                replacement_cost: parseFloat(formData.replacement_cost),
            };

            if (isEdit) {
                await api.put(`/replacements/${id}`, payload);
                toast.success('Replacement record updated');
            } else {
                await api.post('/replacements', payload);
                toast.success('Replacement record created');
            }
            navigate('/replacements');
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
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/replacements')} style={{ marginBottom: '0.5rem' }}>
                        <HiOutlineArrowLeft /> Back to Replacements
                    </button>
                    <h1 className="page-title">{isEdit ? 'Edit Replacement' : 'New Replacement Record'}</h1>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {/* Damage Report */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="damage_id">Damage Report *</label>
                        <select
                            id="damage_id"
                            name="damage_id"
                            className="form-select"
                            value={formData.damage_id}
                            onChange={handleChange}
                        >
                            <option value="">Select a damage report</option>
                            {damageReports.map((report) => (
                                <option key={report.id} value={report.id}>
                                    {report.inventory?.name || 'Item'} — {report.damage_description?.substring(0, 50)} ({report.status})
                                </option>
                            ))}
                        </select>
                        {errors.damage_id && <div className="form-error">{errors.damage_id}</div>}
                    </div>

                    {/* Replacement Date */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="replacement_date">Replacement Date *</label>
                        <input
                            id="replacement_date"
                            name="replacement_date"
                            type="date"
                            className="form-input"
                            value={formData.replacement_date}
                            onChange={handleChange}
                        />
                        {errors.replacement_date && <div className="form-error">{errors.replacement_date}</div>}
                    </div>

                    {/* Replacement Cost */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="replacement_cost">Replacement Cost (₹) *</label>
                        <input
                            id="replacement_cost"
                            name="replacement_cost"
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-input"
                            placeholder="e.g., 150.00"
                            value={formData.replacement_cost}
                            onChange={handleChange}
                        />
                        {errors.replacement_cost && <div className="form-error">{errors.replacement_cost}</div>}
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            className="form-textarea"
                            placeholder="Additional notes about the replacement..."
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/replacements')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : isEdit ? 'Update Record' : 'Create Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReplacementForm;
