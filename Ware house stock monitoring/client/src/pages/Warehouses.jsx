import { useState, useEffect } from 'react';
import { warehousesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineBuildingOffice2 } from 'react-icons/hi2';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', capacity: '', contactPhone: '', contactEmail: '', description: '', address: { street: '', city: '', state: '', zipCode: '', country: 'India' } });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await warehousesAPI.getAll({ limit: 50 });
      setWarehouses(data.data);
    } catch (e) { toast.error('Failed to load warehouses'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) { await warehousesAPI.update(editItem._id, formData); toast.success('Warehouse updated'); }
      else { await warehousesAPI.create(formData); toast.success('Warehouse created'); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this warehouse?')) return;
    try { await warehousesAPI.delete(id); toast.success('Warehouse deactivated'); fetchData(); } catch (e) { toast.error('Failed'); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({ name: item.name, code: item.code, capacity: item.capacity, contactPhone: item.contactPhone || '', contactEmail: item.contactEmail || '', description: item.description || '', address: item.address || { street: '', city: '', state: '', zipCode: '', country: 'India' } });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setFormData({ name: '', code: '', capacity: '', contactPhone: '', contactEmail: '', description: '', address: { street: '', city: '', state: '', zipCode: '', country: 'India' } });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Warehouses</h1>
          <p className="text-surface-500 text-sm mt-1">Manage warehouse locations</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-5 h-5" /> Add Warehouse</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : warehouses.length === 0 ? (
        <div className="card p-12 text-center">
          <HiOutlineBuildingOffice2 className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">No warehouses yet. Create your first warehouse.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <div key={wh._id} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center"><HiOutlineBuildingOffice2 className="w-5 h-5 text-white" /></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(wh)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(wh._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-surface-900 dark:text-white">{wh.name}</h3>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-mono mb-2">{wh.code}</p>
              <p className="text-sm text-surface-500 mb-3">{wh.address?.city ? `${wh.address.city}, ${wh.address.state}` : 'No address'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-700">
                <div><p className="text-xs text-surface-400">Capacity</p><p className="font-semibold text-surface-900 dark:text-white">{(wh.capacity || 0).toLocaleString()}</p></div>
                <div><p className="text-xs text-surface-400">Manager</p><p className="text-sm text-surface-700 dark:text-surface-300">{wh.manager?.name || 'Unassigned'}</p></div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${wh.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>{wh.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700"><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{editItem ? 'Edit Warehouse' : 'New Warehouse'}</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name *</label><input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Code *</label><input required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="input-field" placeholder="WH-XXX" /></div>
                <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Capacity</label><input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label><input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">City</label><input value={formData.address.city} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">State</label><input value={formData.address.state} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} className="input-field" /></div>
              </div>
              <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows="2" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
