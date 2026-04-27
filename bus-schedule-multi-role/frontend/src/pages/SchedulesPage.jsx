import { useState, useEffect } from 'react'
import { scheduleAPI, busAPI, routeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STATUSES = ['On Time', 'Delayed', 'Cancelled', 'Completed']
const EMPTY = { bus: '', route: '', departureTime: '', arrivalTime: '', daysOfOperation: [], fare: 0, platform: '', status: 'On Time' }

function ScheduleModal({ schedule, onClose, onSave, buses, routes, staffOnly }) {
  const [form, setForm] = useState(schedule ? {
    bus: schedule.bus?._id || '', route: schedule.route?._id || '',
    departureTime: schedule.departureTime, arrivalTime: schedule.arrivalTime,
    daysOfOperation: schedule.daysOfOperation, fare: schedule.fare,
    platform: schedule.platform, status: schedule.status,
  } : EMPTY)
  const [saving, setSaving] = useState(false)
  const toggleDay = (d) => setForm(f => ({ ...f, daysOfOperation: f.daysOfOperation.includes(d) ? f.daysOfOperation.filter(x => x !== d) : [...f.daysOfOperation, d] }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (staffOnly) {
        await scheduleAPI.update(schedule._id, { status: form.status }); toast.success('Status updated!')
      } else if (schedule?._id) {
        await scheduleAPI.update(schedule._id, form); toast.success('Schedule updated!')
      } else {
        await scheduleAPI.create(form); toast.success('Schedule created!')
      }
      onSave()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{staffOnly ? 'Update Status' : schedule ? 'Edit Schedule' : 'Add Schedule'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!staffOnly && (
              <>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Bus *</label>
                    <select className="form-control form-select" value={form.bus} onChange={e => setForm(f => ({ ...f, bus: e.target.value }))} required>
                      <option value="">Select Bus</option>
                      {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber} — {b.busName}</option>)}
                    </select></div>
                  <div className="form-group"><label className="form-label">Route *</label>
                    <select className="form-control form-select" value={form.route} onChange={e => setForm(f => ({ ...f, route: e.target.value }))} required>
                      <option value="">Select Route</option>
                      {routes.map(r => <option key={r._id} value={r._id}>{r.routeNumber} — {r.source} → {r.destination}</option>)}
                    </select></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Departure Time *</label>
                    <input type="time" className="form-control" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Arrival Time *</label>
                    <input type="time" className="form-control" value={form.arrivalTime} onChange={e => setForm(f => ({ ...f, arrivalTime: e.target.value }))} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Days of Operation *</label>
                  <div className="checkbox-group">{DAYS.map(d => (
                    <label key={d} className={`checkbox-pill ${form.daysOfOperation.includes(d) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={form.daysOfOperation.includes(d)} onChange={() => toggleDay(d)} /> {d}
                    </label>))}</div></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Fare (₹) *</label>
                    <input type="number" className="form-control" value={form.fare} min={0} onChange={e => setForm(f => ({ ...f, fare: +e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Platform</label>
                    <input className="form-control" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="P1" /></div>
                </div>
              </>
            )}
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const STATUS_META = {
  'On Time': { cls: 'badge-green', Icon: CheckCircle },
  'Delayed': { cls: 'badge-amber', Icon: Clock },
  'Cancelled': { cls: 'badge-red', Icon: XCircle },
  'Completed': { cls: 'badge-gray', Icon: AlertCircle },
}

export default function SchedulesPage() {
  const { isHead, isStaff, isCustomer } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [delId, setDelId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      const [sr, br, rr] = await Promise.all([scheduleAPI.getAll(params), busAPI.getAll(), routeAPI.getAll()])
      setSchedules(sr.data)
      setBuses(br.data)
      setRoutes(rr.data)
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filterStatus])

  const handleDelete = async () => {
    try { await scheduleAPI.delete(delId); toast.success('Schedule deleted'); setDelId(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const filtered = schedules.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return (s.bus?.busNumber || '').toLowerCase().includes(q) ||
      (s.route?.source || '').toLowerCase().includes(q) ||
      (s.route?.destination || '').toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="page-header">
        <div><h1>Schedule {isCustomer ? 'Listings' : 'Management'}</h1><p>{filtered.length} schedules</p></div>
        {isHead && <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Add Schedule</button>}
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input placeholder="Search by bus, source or destination..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control form-select" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="loading-spinner" /> Loading schedules...</div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📅</div><h3>No Schedules Found</h3></div></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Bus</th><th>Route</th><th>Departure</th><th>Arrival</th>
                <th>Days</th><th>Fare</th><th>Platform</th><th>Status</th>
                {!isCustomer && <th>Actions</th>}
              </tr></thead>
              <tbody>
                {filtered.map(s => {
                  const sm = STATUS_META[s.status] || STATUS_META['On Time']
                  return (
                    <tr key={s._id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{s.bus?.busNumber}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.bus?.type}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.route?.source} → {s.route?.destination}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.route?.routeNumber}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{s.departureTime}</td>
                      <td style={{ fontWeight: 600, fontSize: 14 }}>{s.arrivalTime}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 120 }}>
                          {s.daysOfOperation?.map(d => (
                            <span key={d} style={{ fontSize: 10, background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '2px 5px', borderRadius: 4, fontWeight: 600 }}>{d}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{s.fare}</td>
                      <td style={{ fontSize: 13 }}>{s.platform || '—'}</td>
                      <td>
                        <span className={`badge ${sm.cls}`}>
                          <sm.Icon size={11} />{s.status}
                        </span>
                      </td>
                      {!isCustomer && (
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-outline btn-sm" title={isStaff ? 'Update Status' : 'Edit'}
                              onClick={() => setModal({ ...s, _staffOnly: isStaff })}>
                              <Edit2 size={13} />
                            </button>
                            {isHead && (
                              <button className="btn btn-danger btn-sm" title="Delete" onClick={() => setDelId(s._id)}>
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <ScheduleModal
          schedule={modal === 'add' ? null : modal}
          staffOnly={!!modal?._staffOnly}
          buses={buses} routes={routes}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}
      {delId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div>
            <div className="modal-body"><p>Delete this schedule? This cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
