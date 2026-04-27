import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { vendorAPI } from '../api/services';
import { Badge, Table, Pagination, PageHeader, ConfirmModal } from '../components/common';
import useAuthStore from '../app/authStore';
import { getErrMsg } from '../utils/helpers';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function VendorList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 10;

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await vendorAPI.getAll({ search, status, page, limit });
      setVendors(data.vendors);
      setTotal(data.total);
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await vendorAPI.delete(deleteId);
      toast.success('Vendor deleted');
      setDeleteId(null);
      fetchVendors();
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'vendorCode', label: 'Code' },
    { key: 'vendorName', label: 'Vendor Name', render: r => (
      <Link to={`/vendors/${r._id}`} className="font-medium text-blue-600 hover:underline">{r.vendorName}</Link>
    )},
    { key: 'contactPerson', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'paymentTerms', label: 'Terms' },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} /> },
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(`/vendors/${r._id}`)} className="btn btn-sm btn-secondary">View</button>
        {['admin','accountant'].includes(user?.role) && (
          <button onClick={() => navigate(`/vendors/${r._id}/edit`)} className="btn btn-sm btn-secondary">Edit</button>
        )}
        {user?.role === 'admin' && (
          <button onClick={() => setDeleteId(r._id)} className="btn btn-sm btn-danger">Delete</button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Vendors" subtitle={`${total} vendors total`}
        actions={['admin','accountant'].includes(user?.role) && (
          <Link to="/vendors/new" className="btn-primary"><PlusIcon className="w-4 h-4" />Add Vendor</Link>
        )} />

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search vendors…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input w-full sm:w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card">
        <Table columns={columns} data={vendors} loading={loading} emptyMsg="No vendors found" />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </div>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} message="This will permanently delete the vendor. This action cannot be undone." />
    </div>
  );
}
