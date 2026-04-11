import { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Upload, X, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Academic', 'Infrastructure', 'Administrative', 'Hostel', 'Library', 'Transport', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function SubmitComplaint() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'Medium' });
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFiles = (newFiles) => {
        const arr = Array.from(newFiles).slice(0, 3);
        setFiles(arr);
    };

    const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.category) {
            toast.error('Please fill all required fields');
            return;
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            files.forEach(f => fd.append('attachments', f));

            await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Complaint submitted successfully!');
            navigate('/user/complaints');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally { setSubmitting(false); }
    };

    const priorityColors = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };

    return (
        <Layout title="Submit Complaint">
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                {/* Info banner */}
                <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <AlertCircle size={18} color="#4f46e5" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: '0.85rem', color: '#3730a3', lineHeight: 1.6 }}>
                        Provide as much detail as possible. Attach screenshots or documents to help us resolve your complaint faster. You'll be notified by email when there's an update.
                    </div>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Title */}
                        <div>
                            <label className="label">Complaint Title <span style={{ color: '#ef4444' }}>*</span></label>
                            <input className="input" name="title" placeholder="Brief, descriptive title of your complaint" value={form.title} onChange={handleChange} required maxLength={120} />
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{form.title.length}/120</div>
                        </div>

                        {/* Category + Priority row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="label">Category <span style={{ color: '#ef4444' }}>*</span></label>
                                <select className="input" name="category" value={form.category} onChange={handleChange} required>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Priority Level</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {PRIORITIES.map(p => (
                                        <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })} style={{
                                            flex: 1, padding: '8px 4px', borderRadius: 8, border: `2px solid ${form.priority === p ? priorityColors[p] : 'var(--border)'}`,
                                            background: form.priority === p ? `${priorityColors[p]}18` : 'white',
                                            color: form.priority === p ? priorityColors[p] : 'var(--text-muted)',
                                            fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s'
                                        }}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="label">Detailed Description <span style={{ color: '#ef4444' }}>*</span></label>
                            <textarea className="input" name="description" placeholder="Describe the issue in detail. Include dates, locations, names of people involved, and any previous attempts to resolve it..." value={form.description} onChange={handleChange} required style={{ minHeight: 140 }} />
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{form.description.length} characters</div>
                        </div>

                        {/* File upload */}
                        <div>
                            <label className="label">Attachments <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional — max 3 files, 5MB each)</span></label>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                                style={{
                                    border: `2px dashed ${dragOver ? '#4f46e5' : 'var(--border)'}`,
                                    borderRadius: 12, padding: '28px 20px', textAlign: 'center',
                                    background: dragOver ? '#eef2ff' : '#f8fafc', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <Upload size={24} color={dragOver ? '#4f46e5' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>Drag & drop files here, or click to browse</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>PNG, JPG, PDF, Word documents accepted</p>
                                <input id="file-input" type="file" multiple accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx" onChange={e => handleFiles(e.target.files)} style={{ display: 'none' }} />
                            </div>

                            {/* File previews */}
                            {files.length > 0 && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                    {files.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', borderRadius: 8, padding: '6px 10px', fontSize: '0.78rem', color: 'var(--text)' }}>
                                            📎 {f.name} <span style={{ color: 'var(--text-muted)' }}>({(f.size / 1024).toFixed(0)}KB)</span>
                                            <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                                                <X size={13} color="var(--text-muted)" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/user')}>Cancel</button>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                                <Send size={17} />{submitting ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
