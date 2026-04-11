import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh } from 'react-icons/hi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatINR } from '../utils/currency';

function ReplacementList() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, [page]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await api.get('/replacements', { params: { page, limit: 10 } });
            setRecords(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            toast.error('Failed to load replacement records');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/replacements/${deleteId}`);
            toast.success('Replacement record deleted');
            setDeleteId(null);
            fetchRecords();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Replacement Records</h1>
                    <p className="page-subtitle">Track replacement status and costs</p>
                </div>
                <Link to="/replacements/add" className="btn btn-primary">
                    <HiOutlinePlus /> New Record
                </Link>
            </div>

            <div className="table-container">
                {loading ? (
                    <LoadingSpinner />
                ) : records.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><HiOutlineRefresh /></div>
                        <h3 className="empty-state-title">No replacement records found</h3>
                        <p className="empty-state-text">Create a replacement record for a damage report</p>
                        <Link to="/replacements/add" className="btn btn-primary">
                            <HiOutlinePlus /> New Record
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Damaged Item</th>
                                        <th>Damage Description</th>
                                        <th>Replacement Date</th>
                                        <th>Cost</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record.id}>
                                            <td style={{ fontWeight: 600 }}>
                                                {record.damageReport?.inventory?.name || '—'}
                                            </td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {record.damageReport?.damage_description || '—'}
                                            </td>
                                            <td>{new Date(record.replacement_date).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                                                {formatINR(record.replacement_cost)}
                                            </td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {record.notes || '—'}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => navigate(`/replacements/edit/${record.id}`)}>
                                                        <HiOutlinePencil />
                                                    </button>
                                                    <button className="btn btn-ghost btn-icon btn-sm" title="Delete" onClick={() => setDeleteId(record.id)} style={{ color: 'var(--color-danger)' }}>
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

            <ConfirmDialog
                isOpen={deleteId !== null}
                title="Delete Replacement Record"
                message="This will permanently delete this replacement record."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}

export default ReplacementList;
