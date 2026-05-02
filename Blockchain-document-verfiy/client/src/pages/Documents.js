import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '../utils/api';
import DocumentForm from '../components/DocumentForm';
import DocumentDetail from '../components/DocumentDetail';
import ConfirmDelete from '../components/ConfirmDelete';

const getBadgeClass = (s) => ({ Active: 'badge-active', Revoked: 'badge-revoked', Expired: 'badge-expired', Pending: 'badge-pending' }[s] || 'badge-pending');
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const DOC_TYPES = ['All', 'Certificate', 'Identity', 'Medical', 'Legal', 'Academic', 'Financial', 'Government', 'Other'];
const STATUSES = ['All', 'Active', 'Expired', 'Revoked', 'Pending'];

const Documents = ({ showAddModal, setShowAddModal }) => {
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editDoc, setEditDoc] = useState(null);
  const [deleteDoc, setDeleteDocState] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (filterType !== 'All') params.documentType = filterType;
      if (filterStatus !== 'All') params.status = filterStatus;
      const res = await getAllDocuments(params);
      setDocs(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterType, filterStatus]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async (formData) => {
    try {
      await createDocument(formData);
      toast.success('Document registered on blockchain!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create document');
      throw err;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateDocument(editDoc._id, formData);
      toast.success('Document updated successfully');
      setSelectedDoc(null);
      setEditDoc(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update document');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await deleteDocument(id);
      toast.success('Document deleted successfully');
      setDeleteDocState(null);
      setSelectedDoc(null);
      load();
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (doc) => { setSelectedDoc(null); setEditDoc(doc); };

  return (
    <div className="page-content">
      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="search-input" placeholder="Search by title, holder, org or ID..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
          {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 13, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{pagination.total} documents</span>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : docs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            <h3>No documents found</h3>
            <p>Try adjusting filters or register a new document</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Document</th><th>Type</th><th>Issuer</th><th>Holder</th><th>Issue Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)' }}>{doc.title}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{doc.documentId}</div>
                    </td>
                    <td><span style={{ fontSize: 13 }}>{doc.documentType}</span></td>
                    <td>
                      <div style={{ fontSize: 13 }}>{doc.issuerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.issuerOrganization}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{doc.holderName}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{doc.holderEmail}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{fmt(doc.issueDate)}</td>
                    <td><span className={`badge ${getBadgeClass(doc.status)}`}>{doc.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDoc(doc)} title="View">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(doc)} title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteDocState(doc)} title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <DocumentForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleCreate} editData={null} />
      <DocumentForm isOpen={!!editDoc} onClose={() => setEditDoc(null)} onSubmit={handleUpdate} editData={editDoc} />
      {selectedDoc && <DocumentDetail doc={selectedDoc} onClose={() => setSelectedDoc(null)} onEdit={openEdit} onDelete={setDeleteDocState} />}
      <ConfirmDelete doc={deleteDoc} onConfirm={handleDelete} onCancel={() => setDeleteDocState(null)} loading={deleteLoading} />
    </div>
  );
};

export default Documents;
