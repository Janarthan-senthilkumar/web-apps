import { useState, useEffect } from 'react'
import { busAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, Bus, LayoutGrid, List, Eye } from 'lucide-react'

const TYPES = ['Express', 'Ordinary', 'Super Deluxe', 'Sleeper', 'AC', 'Non-AC']
const STATUSES = ['Active', 'Maintenance', 'Inactive']
const AMENITIES = ['WiFi', 'AC', 'Charging Port', 'GPS', 'CCTV', 'Water Bottle']
const EMPTY = { busNumber: '', busName: '', type: 'Express', capacity: 52, operator: '', amenities: [], status: 'Active' }

function BusModal({ bus, onClose, onSave, readOnly }) {
  const [form, setForm] = useState(bus || EMPTY)
  const [saving, setSaving] = useState(false)
  const toggleAmenity = (a) => setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (bus?._id) { await busAPI.update(bus._id, form); toast.success('Bus updated!') }
      else { await busAPI.create(form); toast.success('Bus created!') }
      onSave()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{readOnly ? 'Bus Details' : bus ? 'Edit Bus' : 'Add New Bus'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={readOnly ? e => e.preventDefault() : handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Bus Number *</label>
                <input className="form-control" value={form.busNumber} onChange={e => setForm(f => ({ ...f, busNumber: e.target.value.toUpperCase() }))} placeholder="TN01A1234" required disabled={readOnly} /></div>
              <div className="form-group"><label className="form-label">Bus Name *</label>
                <input className="form-control" value={form.busName} onChange={e => setForm(f => ({ ...f, busName: e.target.value }))} placeholder="Chennai Express" required disabled={readOnly} /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Type *</label>
                <select className="form-control form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} disabled={readOnly}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Capacity *</label>
                <input type="number" className="form-control" value={form.capacity} min={10} max={100} onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))} required disabled={readOnly} /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Operator</label>
                <input className="form-control" value={form.operator} onChange={e => setForm(f => ({ ...f, operator: e.target.value }))} placeholder="TNSTC" disabled={readOnly} /></div>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-control form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} disabled={readOnly}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Amenities</label>
              <div className="checkbox-group">{AMENITIES.map(a => (
                <label key={a} className={`checkbox-pill ${form.amenities.includes(a) ? 'checked' : ''}`} style={readOnly ? { pointerEvents: 'none' } : {}}>
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => !readOnly && toggleAmenity(a)} /> {a}
                </label>))}</div></div>
          </div>
          {!readOnly && (
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{bus ? 'Update Bus' : 'Create Bus'}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cls = status === 'Active' ? 'badge-green' : status === 'Maintenance' ? 'badge-amber' : 'badge-red'
  return <span className={`badge ${cls}`}>{status}</span>
}

export default function BusesPage() {
  const { isHead, canManage, isCustomer } = useAuth()
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [modal, setModal] = useState(null)
  const [delId, setDelId] = useState(null)
  const [view, setView] = useState('grid')

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterStatus) params.status = filterStatus
      if (filterType) params.type = filterType
      const res = await busAPI.getAll(params)
      setBuses(res.data)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, filterStatus, filterType])

  const handleDelete = async () => {
    try { await busAPI.delete(delId); toast.success('Bus deleted'); setDelId(null); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Bus {isCustomer ? 'Directory' : 'Management'}</h1><p>{buses.length} buses registered</p></div>
        {isHead && <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Add Bus</button>}
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input placeholder="Search by bus number, name or operator..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control form-select" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-control form-select" style={{ width: 150 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>{TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <div className="view-toggle">
          <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}><LayoutGrid size={15} /></button>
          <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}><List size={15} /></button>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="loading-spinner" /> Loading buses...</div>
      ) : buses.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🚌</div><h3>No Buses Found</h3></div></div>
      ) : view === 'grid' ? (
        <div className="data-grid">
          {buses.map(b => (
            <div key={b._id} className="bus-card">
              <div className="bus-card-header">
                <div className="bus-number">{b.busNumber}</div>
                <div className="bus-name">{b.busName}</div>
                <div className="bus-type-pill">{b.type}</div>
              </div>
              <div className="bus-card-body">
                <div className="bus-detail-row"><span className="bus-detail-label">Operator</span><span className="bus-detail-value">{b.operator || '—'}</span></div>
                <div className="bus-detail-row"><span className="bus-detail-label">Capacity</span><span className="bus-detail-value">{b.capacity} seats</span></div>
                <div className="bus-detail-row"><span className="bus-detail-label">Status</span><StatusBadge status={b.status} /></div>
                {b.amenities?.length > 0 && <div className="amenities-list">{b.amenities.map(a => <span key={a} className="amenity-pill">{a}</span>)}</div>}
              </div>
              <div className="bus-card-actions">
                {isCustomer ? (
                  <button className="btn btn-outline btn-sm" onClick={() => setModal({ ...b, _readOnly: true })}><Eye size={13} /> View</button>
                ) : (
                  <>
                    <button className="btn btn-outline btn-sm" onClick={() => setModal(b)}><Edit2 size={13} /> Edit</button>
                    {isHead && <button className="btn btn-danger btn-sm" onClick={() => setDelId(b._id)}><Trash2 size={13} /> Delete</button>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Bus Number</th><th>Name</th><th>Type</th><th>Capacity</th><th>Operator</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {buses.map(b => (
                  <tr key={b._id}>
                    <td><strong>{b.busNumber}</strong></td>
                    <td>{b.busName}</td>
                    <td><span className="badge badge-blue">{b.type}</span></td>
                    <td>{b.capacity}</td>
                    <td>{b.operator || '—'}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div className="table-actions">
                        {isCustomer ? (
                          <button className="btn btn-outline btn-sm" onClick={() => setModal({ ...b, _readOnly: true })}><Eye size={13} /></button>
                        ) : (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => setModal(b)}><Edit2 size={13} /></button>
                            {isHead && <button className="btn btn-danger btn-sm" onClick={() => setDelId(b._id)}><Trash2 size={13} /></button>}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && <BusModal bus={modal === 'add' ? null : modal} readOnly={!!modal?._readOnly} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />}
      {delId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div>
            <div className="modal-body"><p>Delete this bus? This cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Bus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
