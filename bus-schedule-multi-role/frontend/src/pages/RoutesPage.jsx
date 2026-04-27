import { useState, useEffect } from 'react'
import { routeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, MapPin, ArrowRight, Eye } from 'lucide-react'

const ROUTE_TYPES = ['City', 'Interstate', 'Local', 'Express Highway']
const STATUSES = ['Active', 'Suspended', 'Under Review']
const EMPTY = { routeNumber: '', routeName: '', source: '', destination: '', stops: [], totalDistance: '', estimatedDuration: '', routeType: 'Interstate', status: 'Active' }

function StopEditor({ stops, onChange, readOnly }) {
  const add = () => onChange([...stops, { name: '', arrivalOffset: 0, distanceFromSource: 0 }])
  const remove = (i) => onChange(stops.filter((_, idx) => idx !== i))
  const update = (i, field, val) => {
    const copy = [...stops]
    copy[i] = { ...copy[i], [field]: field === 'name' ? val : +val }
    onChange(copy)
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>Intermediate Stops</span>
        {!readOnly && <button type="button" className="btn btn-outline btn-sm" onClick={add}><Plus size={12} /> Add Stop</button>}
      </div>
      {stops.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No stops (direct route)</p>}
      {stops.map((s, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 32px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
          <div>{i === 0 && <label className="form-label" style={{ fontSize: 11 }}>Stop Name</label>}
            <input className="form-control" placeholder="Stop name" value={s.name} disabled={readOnly} onChange={e => update(i, 'name', e.target.value)} /></div>
          <div>{i === 0 && <label className="form-label" style={{ fontSize: 11 }}>Offset (min)</label>}
            <input type="number" className="form-control" value={s.arrivalOffset} disabled={readOnly} onChange={e => update(i, 'arrivalOffset', e.target.value)} /></div>
          <div>{i === 0 && <label className="form-label" style={{ fontSize: 11 }}>Dist (km)</label>}
            <input type="number" className="form-control" value={s.distanceFromSource} disabled={readOnly} onChange={e => update(i, 'distanceFromSource', e.target.value)} /></div>
          {!readOnly && <button type="button" className="btn btn-danger btn-icon btn-sm" style={{ marginTop: i === 0 ? 22 : 0 }} onClick={() => remove(i)}>✕</button>}
        </div>
      ))}
    </div>
  )
}

function RouteModal({ route, onClose, onSave, readOnly }) {
  const [form, setForm] = useState(route || EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (route?._id) { await routeAPI.update(route._id, form); toast.success('Route updated!') }
      else { await routeAPI.create(form); toast.success('Route created!') }
      onSave()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h2 className="modal-title">{readOnly ? 'Route Details' : route ? 'Edit Route' : 'Add Route'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={readOnly ? e => e.preventDefault() : handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Route Number *</label>
                <input className="form-control" value={form.routeNumber} onChange={e => set('routeNumber', e.target.value.toUpperCase())} required disabled={readOnly} /></div>
              <div className="form-group"><label className="form-label">Route Name *</label>
                <input className="form-control" value={form.routeName} onChange={e => set('routeName', e.target.value)} required disabled={readOnly} /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Source *</label>
                <input className="form-control" value={form.source} onChange={e => set('source', e.target.value)} required disabled={readOnly} /></div>
              <div className="form-group"><label className="form-label">Destination *</label>
                <input className="form-control" value={form.destination} onChange={e => set('destination', e.target.value)} required disabled={readOnly} /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Total Distance (km) *</label>
                <input type="number" className="form-control" value={form.totalDistance} onChange={e => set('totalDistance', +e.target.value)} required disabled={readOnly} /></div>
              <div className="form-group"><label className="form-label">Duration (mins) *</label>
                <input type="number" className="form-control" value={form.estimatedDuration} onChange={e => set('estimatedDuration', +e.target.value)} required disabled={readOnly} /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Route Type</label>
                <select className="form-control form-select" value={form.routeType} onChange={e => set('routeType', e.target.value)} disabled={readOnly}>
                  {ROUTE_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-control form-select" value={form.status} onChange={e => set('status', e.target.value)} disabled={readOnly}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <StopEditor stops={form.stops} onChange={v => set('stops', v)} readOnly={readOnly} />
          </div>
          {!readOnly && (
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{route ? 'Update Route' : 'Create Route'}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function RouteBadge({ status }) {
  const cls = status === 'Active' ? 'badge-green' : status === 'Suspended' ? 'badge-red' : 'badge-amber'
  return <span className={`badge ${cls}`}>{status}</span>
}

export default function RoutesPage() {
  const { isHead, isCustomer } = useAuth()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [delId, setDelId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterType) params.routeType = filterType
      if (filterStatus) params.status = filterStatus
      const res = await routeAPI.getAll(params)
      setRoutes(res.data)
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filterType, filterStatus])

  const handleDelete = async () => {
    try { await routeAPI.delete(delId); toast.success('Route deleted'); setDelId(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const filtered = routes.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.routeName?.toLowerCase().includes(q) || r.source?.toLowerCase().includes(q) || r.destination?.toLowerCase().includes(q) || r.routeNumber?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="page-header">
        <div><h1>Route {isCustomer ? 'Directory' : 'Management'}</h1><p>{filtered.length} routes</p></div>
        {isHead && <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Add Route</button>}
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input placeholder="Search routes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control form-select" style={{ width: 160 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>{ROUTE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="form-control form-select" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="loading-spinner" /> Loading routes...</div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🗺️</div><h3>No Routes Found</h3></div></div>
      ) : (
        <div className="data-grid">
          {filtered.map(r => (
            <div key={r._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e40af08, #0ea5e908)', borderBottom: '1px solid var(--border)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: 4 }}>{r.routeNumber}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{r.routeName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                      <MapPin size={12} />{r.source} <ArrowRight size={12} /> {r.destination}
                    </div>
                  </div>
                  <RouteBadge status={r.status} />
                </div>
              </div>
              <div style={{ padding: '14px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  {[['Distance', `${r.totalDistance} km`], ['Duration', `${Math.floor(r.estimatedDuration / 60)}h ${r.estimatedDuration % 60}m`], ['Type', r.routeType], ['Stops', r.stops?.length || 0]].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {r.stops?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                    {r.stops.map((s, i) => <span key={i} style={{ fontSize: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 20 }}>{s.name}</span>)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  {isCustomer ? (
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setModal({ ...r, _readOnly: true })}><Eye size={13} /> View Details</button>
                  ) : (
                    <>
                      <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setModal(r)}><Edit2 size={13} /> Edit</button>
                      {isHead && <button className="btn btn-danger btn-sm" onClick={() => setDelId(r._id)}><Trash2 size={13} /></button>}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <RouteModal route={modal === 'add' ? null : modal} readOnly={!!modal?._readOnly} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />}
      {delId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div>
            <div className="modal-body"><p>Delete this route? This cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Route</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
