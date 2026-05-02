import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const docTypes = ['Certificate', 'Identity', 'Medical', 'Legal', 'Academic', 'Financial', 'Government', 'Other'];
const statusOptions = ['Active', 'Expired', 'Revoked', 'Pending'];
const ACCEPTED = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

const initForm = {
  title: '', documentType: 'Certificate', issuerName: '', issuerOrganization: '',
  holderName: '', holderEmail: '', description: '',
  issueDate: '', expiryDate: '', status: 'Active',
};

const fmtBytes = (b) => {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1024 / 1024).toFixed(1) + ' MB';
};

const fileExt = (name) => name.split('.').pop().toLowerCase();

const FileTypeTag = ({ name }) => {
  const ext = fileExt(name);
  const map = {
    pdf:  { bg: '#fef2f2', color: '#ef4444', label: 'PDF' },
    doc:  { bg: '#eff6ff', color: '#3b82f6', label: 'DOC' },
    docx: { bg: '#eff6ff', color: '#3b82f6', label: 'DOC' },
    jpg:  { bg: '#f0fdf4', color: '#22c55e', label: 'IMG' },
    jpeg: { bg: '#f0fdf4', color: '#22c55e', label: 'IMG' },
    png:  { bg: '#f0fdf4', color: '#22c55e', label: 'IMG' },
  };
  const style = map[ext] || { bg: 'var(--gray-100)', color: 'var(--gray-500)', label: ext.toUpperCase() };
  return (
    <span style={{
      background: style.bg, color: style.color,
      fontWeight: 700, fontSize: 11, padding: '2px 7px',
      borderRadius: 5, letterSpacing: '0.3px',
    }}>
      {style.label}
    </span>
  );
};

const DocumentForm = ({ isOpen, onClose, onSubmit, editData }) => {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);       // new file chosen by user
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        documentType: editData.documentType || 'Certificate',
        issuerName: editData.issuerName || '',
        issuerOrganization: editData.issuerOrganization || '',
        holderName: editData.holderName || '',
        holderEmail: editData.holderEmail || '',
        description: editData.description || '',
        issueDate: editData.issueDate ? editData.issueDate.split('T')[0] : '',
        expiryDate: editData.expiryDate ? editData.expiryDate.split('T')[0] : '',
        status: editData.status || 'Active',
      });
    } else {
      setForm(initForm);
    }
    setFile(null);
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.issuerName.trim()) e.issuerName = 'Issuer name is required';
    if (!form.issuerOrganization.trim()) e.issuerOrganization = 'Organization is required';
    if (!form.holderName.trim()) e.holderName = 'Holder name is required';
    if (!form.holderEmail.trim()) e.holderEmail = 'Holder email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.holderEmail)) e.holderEmail = 'Invalid email format';
    if (!form.issueDate) e.issueDate = 'Issue date is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const pickFile = (f) => {
    if (!f) return;
    const allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    if (!allowed.includes(fileExt(f.name))) {
      setErrors(prev => ({ ...prev, file: 'Only PDF, DOC, DOCX, JPG, PNG allowed' }));
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File must be under 10 MB' }));
      return;
    }
    setFile(f);
    setErrors(prev => ({ ...prev, file: '' }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      await onSubmit(fd);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const existingFile = editData?.fileName;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="card-title">{editData ? 'Edit Document' : 'Register New Document'}</div>
            <div className="card-subtitle">{editData ? 'Update the document information' : 'Add a new document to the blockchain ledger'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid" style={{ marginBottom: 20 }}>

              <div className="form-group form-full">
                <label className="form-label">Document Title <span>*</span></label>
                <input name="title" value={form.title} onChange={handleChange} className="form-input" placeholder="e.g. Bachelor of Science Certificate" />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Document Type <span>*</span></label>
                <select name="documentType" value={form.documentType} onChange={handleChange} className="form-select">
                  {docTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {editData && isAdmin && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="form-select">
                    {statusOptions.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Issuer Name <span>*</span></label>
                <input name="issuerName" value={form.issuerName} onChange={handleChange} className="form-input" placeholder="Dr. John Smith" />
                {errors.issuerName && <span className="form-error">{errors.issuerName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Issuer Organization <span>*</span></label>
                <input name="issuerOrganization" value={form.issuerOrganization} onChange={handleChange} className="form-input" placeholder="MIT University" />
                {errors.issuerOrganization && <span className="form-error">{errors.issuerOrganization}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Holder Name <span>*</span></label>
                <input name="holderName" value={form.holderName} onChange={handleChange} className="form-input" placeholder="Jane Doe" />
                {errors.holderName && <span className="form-error">{errors.holderName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Holder Email <span>*</span></label>
                <input name="holderEmail" value={form.holderEmail} onChange={handleChange} className="form-input" placeholder="jane@example.com" type="email" />
                {errors.holderEmail && <span className="form-error">{errors.holderEmail}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Issue Date <span>*</span></label>
                <input name="issueDate" value={form.issueDate} onChange={handleChange} className="form-input" type="date" />
                {errors.issueDate && <span className="form-error">{errors.issueDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input name="expiryDate" value={form.expiryDate} onChange={handleChange} className="form-input" type="date" />
              </div>

              <div className="form-group form-full">
                <label className="form-label">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-textarea" placeholder="Optional notes about the document..." />
              </div>

              {/* ── File Upload ────────────────────────────────────────── */}
              <div className="form-group form-full">
                <label className="form-label">
                  Attach Document File
                  <span style={{ color: 'var(--gray-400)', fontWeight: 400, marginLeft: 6 }}>(optional — PDF, DOC, DOCX, JPG, PNG · max 10 MB)</span>
                </label>

                {/* Show selected new file */}
                {file ? (
                  <div className="file-selected">
                    <div className="file-selected-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileTypeTag name={file.name} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{fmtBytes(file.size)}</div>
                    </div>
                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      title="Remove file"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : existingFile && !file ? (
                  /* Show existing file when editing */
                  <div className="file-existing">
                    <div className="file-selected-icon" style={{ background: 'var(--gray-100)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileTypeTag name={existingFile} />
                        <span>{existingFile}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                        {editData.fileSize ? fmtBytes(editData.fileSize) : 'Uploaded'} · Click below to replace
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </button>
                    <input ref={fileInputRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={(e) => pickFile(e.target.files[0])} />
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    className={`file-dropzone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED}
                      style={{ display: 'none' }}
                      onChange={(e) => pickFile(e.target.files[0])}
                    />
                    <div className="file-dropzone-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div className="file-dropzone-text">
                      <span>Drag & drop or <strong>click to browse</strong></span>
                      <span className="file-dropzone-hint">PDF, DOC, DOCX, JPG, PNG up to 10 MB</span>
                    </div>
                  </div>
                )}

                {errors.file && <span className="form-error">{errors.file}</span>}
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  {editData ? 'Updating...' : 'Registering...'}
                </>
              ) : (editData ? 'Update Document' : 'Register Document')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;
