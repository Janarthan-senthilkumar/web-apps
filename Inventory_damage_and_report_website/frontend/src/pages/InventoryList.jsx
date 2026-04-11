import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineCube, HiOutlinePhotograph } from 'react-icons/hi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageWithFallback from '../components/ImageWithFallback';
import { useAuth } from '../context/AuthContext';

function InventoryList() {
    const navigate = useNavigate();
    const { isSupervisor } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchItems();
    }, [page, search, category]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/inventory/categories');
            setCategories(res.data.data);
        } catch (err) { /* ignore */ }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (category) params.category = category;
            const res = await api.get('/inventory', { params });
            setItems(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/inventory/${deleteId}`);
            toast.success('Item deleted successfully');
            setDeleteId(null);
            fetchItems();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleCategoryFilter = (e) => {
        setCategory(e.target.value);
        setPage(1);
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventory</h1>
                    <p className="page-subtitle">Manage your inventory items</p>
                </div>
                {isSupervisor && (
                    <Link to="/inventory/add" className="btn btn-primary">
                        <HiOutlinePlus /> Add Item
                    </Link>
                )}
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <div className="search-input">
                        <HiOutlineSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or location..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <select className="filter-select" value={category} onChange={handleCategoryFilter}>
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><HiOutlineCube /></div>
                        <h3 className="empty-state-title">No inventory items found</h3>
                        <p className="empty-state-text">
                            {isSupervisor ? 'Add your first item to get started' : 'No items match your filters'}
                        </p>
                        {isSupervisor && (
                            <Link to="/inventory/add" className="btn btn-primary">
                                <HiOutlinePlus /> Add Item
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
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Location</th>
                                        <th>Damages</th>
                                        {isSupervisor && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {item.image_path ? (
                                                    <ImageWithFallback src={item.image_path} alt={item.name} className="table-image" keyword={item.name} />
                                                ) : (
                                                    <div className="table-image-placeholder"><HiOutlinePhotograph /></div>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                                            <td>{item.category}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.location}</td>
                                            <td>{item.damageReports?.length || 0}</td>
                                            {isSupervisor && (
                                                <td>
                                                    <div className="table-actions">
                                                        <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => navigate(`/inventory/edit/${item.id}`)}>
                                                            <HiOutlinePencil />
                                                        </button>
                                                        <button className="btn btn-ghost btn-icon btn-sm" title="Delete" onClick={() => setDeleteId(item.id)} style={{ color: 'var(--color-danger)' }}>
                                                            <HiOutlineTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
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
                title="Delete Inventory Item"
                message="This will permanently delete this item and all its associated damage reports and replacement records."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}

export default InventoryList;
