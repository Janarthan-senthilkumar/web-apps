import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
    HiOutlineExclamationCircle, HiOutlineCheck, HiOutlineX, HiOutlinePhotograph
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import ImageWithFallback from '../components/ImageWithFallback';
import { generateDynamicDescription } from '../utils/descriptionGenerator';

function DamageList() {
    const navigate = useNavigate();
    const { isSupervisor, isStaff } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState(null);

    // Review modal state
    const [reviewModal, setReviewModal] = useState({ open: false, reportId: null, action: null });
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    // Replace modal state
    const [replaceModal, setReplaceModal] = useState({ open: false, reportId: null });
    const [replaceData, setReplaceData] = useState({
        replacement_date: new Date().toISOString().split('T')[0],
        replacement_cost: '',
        notes: '',
    });
    const [replaceLoading, setReplaceLoading] = useState(false);

    // Image viewer state
    const [viewImage, setViewImage] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [page, search, status]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (status) params.status = status;
            const res = await api.get('/damages', { params });
            setReports(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            toast.error('Failed to load damage reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/damages/${deleteId}`);
            toast.success('Damage report deleted');
            setDeleteId(null);
            fetchReports();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openReviewModal = (reportId, action) => {
        setReviewModal({ open: true, reportId, action });
        setReviewNotes('');
    };

    const handleReview = async () => {
        setReviewLoading(true);
        try {
            const endpoint = reviewModal.action === 'approve'
                ? `/damages/${reviewModal.reportId}/approve`
                : `/damages/${reviewModal.reportId}/reject`;

            await api.patch(endpoint, { review_notes: reviewNotes });
            toast.success(`Report ${reviewModal.action === 'approve' ? 'approved' : 'rejected'} successfully`);
            setReviewModal({ open: false, reportId: null, action: null });
            fetchReports();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const openReplaceModal = (reportId) => {
        setReplaceModal({ open: true, reportId });
        setReplaceData({
            replacement_date: new Date().toISOString().split('T')[0],
            replacement_cost: '',
            notes: '',
        });
    };

    const handleReplace = async () => {
        if (!replaceData.replacement_cost || parseFloat(replaceData.replacement_cost) < 0) {
            toast.error('Please enter a valid replacement cost');
            return;
        }
        setReplaceLoading(true);
        try {
            await api.post('/replacements', {
                damage_id: replaceModal.reportId,
                replacement_date: replaceData.replacement_date,
                replacement_cost: parseFloat(replaceData.replacement_cost),
                notes: replaceData.notes,
            });
            toast.success('Replacement created & inventory updated');
            setReplaceModal({ open: false, reportId: null });
            fetchReports();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setReplaceLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Damage Reports</h1>
                    <p className="page-subtitle">
                        {isStaff ? 'Your submitted damage reports' : 'Review and manage all damage reports'}
                    </p>
                </div>
                {isStaff && (
                    <Link to="/damages/add" className="btn btn-primary">
                        <HiOutlinePlus /> New Report
                    </Link>
                )}
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <div className="search-input">
                        <HiOutlineSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by description..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Replaced">Replaced</option>
                    </select>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : reports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><HiOutlineExclamationCircle /></div>
                        <h3 className="empty-state-title">No damage reports found</h3>
                        <p className="empty-state-text">
                            {isStaff ? 'Create a new damage report to get started' : 'No reports match your filters'}
                        </p>
                        {isStaff && (
                            <Link to="/damages/add" className="btn btn-primary">
                                <HiOutlinePlus /> New Report
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Item</th>
                                        <th>Description</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        {isSupervisor && <th>Reported By</th>}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id}>
                                            <td>
                                                {report.damage_image_path ? (
                                                    <ImageWithFallback
                                                        src={report.damage_image_path}
                                                        alt="Damage"
                                                        className="table-image"
                                                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                                        onClick={() => setViewImage(report.damage_image_path)}
                                                        keyword={`${report.inventory?.name} damaged`}
                                                    />
                                                ) : (
                                                    <div className="table-image-placeholder"><HiOutlinePhotograph /></div>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{report.inventory?.name || '—'}</td>
                                            <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={generateDynamicDescription(report.inventory?.name, report.damage_description)}>
                                                {generateDynamicDescription(report.inventory?.name, report.damage_description)}
                                            </td>
                                            <td>{new Date(report.damage_date).toLocaleDateString()}</td>
                                            <td><StatusBadge status={report.status} /></td>
                                            {isSupervisor && (
                                                <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                                                    {report.reporter?.name || '—'}
                                                </td>
                                            )}
                                            <td>
                                                <div className="table-actions">
                                                    {/* Supervisor actions on pending reports */}
                                                    {isSupervisor && report.status === 'Pending' && (
                                                        <>
                                                            <button className="btn btn-ghost btn-icon btn-sm" title="Approve" onClick={() => openReviewModal(report.id, 'approve')} style={{ color: 'var(--color-success)' }}>
                                                                <HiOutlineCheck />
                                                            </button>
                                                            <button className="btn btn-ghost btn-icon btn-sm" title="Reject" onClick={() => openReviewModal(report.id, 'reject')} style={{ color: 'var(--color-danger)' }}>
                                                                <HiOutlineX />
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* Approve & Replace for approved reports */}
                                                    {isSupervisor && report.status === 'Approved' && (
                                                        <button className="btn btn-ghost btn-sm" title="Create Replacement" onClick={() => openReplaceModal(report.id)} style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }}>
                                                            Replace
                                                        </button>
                                                    )}
                                                    <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => navigate(`/damages/edit/${report.id}`)}>
                                                        <HiOutlinePencil />
                                                    </button>
                                                    <button className="btn btn-ghost btn-icon btn-sm" title="Delete" onClick={() => setDeleteId(report.id)} style={{ color: 'var(--color-danger)' }}>
                                                        <HiOutlineTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination pagination={pagination} onPageChange={setPage} />
                    </>
                )}
            </div>

            {/* Image Viewer Modal */}
            {viewImage && (
                <div className="modal-overlay" onClick={() => setViewImage(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', padding: '1rem' }}>
                        <ImageWithFallback src={viewImage} alt="Damage Full size" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} keyword="damaged item" />
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button className="btn btn-secondary" onClick={() => setViewImage(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                isOpen={deleteId !== null}
                title="Delete Damage Report"
                message="This will permanently delete this damage report and all associated replacement records."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />

            {/* Review Modal (Approve/Reject) */}
            {reviewModal.open && (
                <div className="modal-overlay" onClick={() => setReviewModal({ open: false, reportId: null, action: null })}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <h3 className="modal-title">
                            {reviewModal.action === 'approve' ? '✅ Approve Report' : '❌ Reject Report'}
                        </h3>
                        <p className="modal-message">
                            {reviewModal.action === 'approve'
                                ? 'Are you sure you want to approve this damage report?'
                                : 'Are you sure you want to reject this damage report?'
                            }
                        </p>
                        <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                            <label className="form-label">Review Notes (optional)</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Add notes about your decision..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                style={{ minHeight: '80px' }}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setReviewModal({ open: false, reportId: null, action: null })}>
                                Cancel
                            </button>
                            <button
                                className={`btn ${reviewModal.action === 'approve' ? 'btn-primary' : 'btn-danger'}`}
                                onClick={handleReview}
                                disabled={reviewLoading}
                            >
                                {reviewLoading ? 'Processing...' : reviewModal.action === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Replace Modal */}
            {replaceModal.open && (
                <div className="modal-overlay" onClick={() => setReplaceModal({ open: false, reportId: null })}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h3 className="modal-title">🔄 Create Replacement</h3>
                        <p className="modal-message" style={{ marginBottom: 'var(--space-md)' }}>
                            Create a replacement record. Inventory quantity will be automatically reduced.
                        </p>
                        <div className="form-group">
                            <label className="form-label">Replacement Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={replaceData.replacement_date}
                                onChange={(e) => setReplaceData({ ...replaceData, replacement_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Replacement Cost (₹) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-input"
                                placeholder="e.g., 150.00"
                                value={replaceData.replacement_cost}
                                onChange={(e) => setReplaceData({ ...replaceData, replacement_cost: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Additional notes..."
                                value={replaceData.notes}
                                onChange={(e) => setReplaceData({ ...replaceData, notes: e.target.value })}
                                style={{ minHeight: '70px' }}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setReplaceModal({ open: false, reportId: null })}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleReplace} disabled={replaceLoading}>
                                {replaceLoading ? 'Creating...' : 'Create Replacement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DamageList;
