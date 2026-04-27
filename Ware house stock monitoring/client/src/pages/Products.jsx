import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, suppliersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineFunnel } from 'react-icons/hi2';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '', name: '', description: '', category: '', supplier: '', costPrice: '', sellingPrice: '',
    reorderLevel: 10, reorderQuantity: 50, maxStockThreshold: 500, unitOfMeasure: 'pcs', barcode: '', leadTimeDays: 7,
  });

  useEffect(() => {
    fetchProducts();
    fetchMeta();
  }, [pagination.page, search, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productsAPI.getAll({ page: pagination.page, limit: pagination.limit, search, ...filters });
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (e) { toast.error('Failed to load products'); } finally { setLoading(false); }
  };

  const fetchMeta = async () => {
    try {
      const [catRes, supRes] = await Promise.all([categoriesAPI.getAll({ limit: 100 }), suppliersAPI.getAll({ limit: 100 })]);
      setCategories(catRes.data.data);
      setSuppliers(supRes.data.data);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await productsAPI.update(editProduct._id, formData);
        toast.success('Product updated');
      } else {
        await productsAPI.create(formData);
        toast.success('Product created');
      }
      setShowModal(false);
      setEditProduct(null);
      fetchProducts();
    } catch (e) { toast.error(e.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Discontinue this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product discontinued');
      fetchProducts();
    } catch (e) { toast.error('Delete failed'); }
  };

  const openEdit = (prod) => {
    setEditProduct(prod);
    setFormData({
      sku: prod.sku, name: prod.name, description: prod.description || '', category: prod.category?._id || prod.category,
      supplier: prod.supplier?._id || prod.supplier || '', costPrice: prod.costPrice, sellingPrice: prod.sellingPrice,
      reorderLevel: prod.reorderLevel, reorderQuantity: prod.reorderQuantity, maxStockThreshold: prod.maxStockThreshold,
      unitOfMeasure: prod.unitOfMeasure, barcode: prod.barcode || '', leadTimeDays: prod.leadTimeDays,
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditProduct(null);
    setFormData({ sku: '', name: '', description: '', category: '', supplier: '', costPrice: '', sellingPrice: '', reorderLevel: 10, reorderQuantity: 50, maxStockThreshold: 500, unitOfMeasure: 'pcs', barcode: '', leadTimeDays: 7 });
    setShowModal(true);
  };

  const statusBadge = (status) => {
    const colors = { active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', inactive: 'bg-surface-100 text-surface-600', discontinued: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.active}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Products</h1>
          <p className="text-surface-500 text-sm mt-1">Manage your product catalog and SKUs</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, SKU, barcode..."
              className="input-field pl-9" />
          </div>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="select-field w-auto min-w-[150px]">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="select-field w-auto min-w-[130px]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-50 dark:bg-surface-800/50">
              <tr>
                {['SKU', 'Name', 'Category', 'Cost', 'Selling', 'Reorder Lvl', 'UoM', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-surface-400">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-surface-400">No products found</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-primary-600 dark:text-primary-400">{p.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium text-surface-900 dark:text-white max-w-[200px] truncate">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{p.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">₹{p.costPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">₹{p.sellingPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{p.reorderLevel}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{p.unitOfMeasure}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-primary-600"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-500 hover:text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
            <p className="text-sm text-surface-500">Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPagination({ ...pagination, page: p })}
                  className={`px-3 py-1 text-sm rounded-lg ${p === pagination.page ? 'bg-primary-600 text-white' : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-surface-800 px-6 py-4 border-b border-surface-200 dark:border-surface-700 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{editProduct ? 'Edit Product' : 'New Product'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">SKU *</label>
                  <input required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} className="input-field" placeholder="ELEC-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name *</label>
                  <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Product name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Category *</label>
                  <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="select-field">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Supplier</label>
                  <select value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} className="select-field">
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cost Price *</label>
                  <input required type="number" min="0" step="0.01" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Selling Price *</label>
                  <input required type="number" min="0" step="0.01" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Reorder Level</label>
                  <input type="number" min="0" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Reorder Quantity</label>
                  <input type="number" min="0" value={formData.reorderQuantity} onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Max Threshold</label>
                  <input type="number" min="0" value={formData.maxStockThreshold} onChange={(e) => setFormData({ ...formData, maxStockThreshold: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Unit of Measure</label>
                  <select value={formData.unitOfMeasure} onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })} className="select-field">
                    {['pcs', 'kg', 'ltr', 'box', 'pack', 'carton', 'pallet', 'meter', 'sqft', 'units'].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Barcode</label>
                  <input value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} className="input-field" placeholder="8901234567890" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Lead Time (days)</label>
                  <input type="number" min="0" value={formData.leadTimeDays} onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows="2" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
