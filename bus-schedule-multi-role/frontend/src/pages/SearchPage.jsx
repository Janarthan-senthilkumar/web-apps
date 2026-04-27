import { useState, useEffect } from 'react'
import { scheduleAPI, routeAPI } from '../services/api'
import { Search, MapPin, Clock, Bus, ArrowRight, Wifi, Wind, Zap, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function amenityIcon(a) {
  if (a === 'WiFi') return <Wifi size={12} />
  if (a === 'AC') return <Wind size={12} />
  if (a === 'Charging Port') return <Zap size={12} />
  return null
}

export default function SearchPage() {
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({
    from: '', to: '', time: '', day: DAYS[new Date().getDay()], maxFare: ''
  })
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    routeAPI.getLocations()
      .then(r => setLocations(r.data.allLocations))
      .catch(() => {})
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!form.from || !form.to) return toast.error('Please select source and destination')
    if (form.from === form.to) return toast.error('Source and destination cannot be same')
    setLoading(true)
    setSearched(false)
    try {
      const params = { from: form.from, to: form.to }
      if (form.time) params.time = form.time
      if (form.day) params.day = form.day
      if (form.maxFare) params.maxFare = form.maxFare
      const res = await scheduleAPI.search(params)
      setResults(res.data)
      setSearched(true)
      if (res.data.length === 0) toast('No buses found for this search', { icon: '🔍' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const swap = () => setForm(f => ({ ...f, from: f.to, to: f.from }))

  function durationLabel(mins) {
    const h = Math.floor(mins / 60), m = mins % 60
    return h ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div>
      {/* Hero Search */}
      <div className="search-hero">
        <h1>🔍 Find Your Bus</h1>
        <p>Search available buses by route and time. Get real-time schedule information.</p>

        <form onSubmit={handleSearch}>
          <div className="search-form">
            {/* From */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">From</label>
              <div className="input-group">
                <MapPin size={15} className="input-icon" />
                <select
                  className="form-control form-select"
                  style={{ paddingLeft: 38 }}
                  value={form.from}
                  onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                >
                  <option value="">Select source</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Swap + To */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                To
                <button type="button" onClick={swap}
                  style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
                  ⇄ Swap
                </button>
              </label>
              <div className="input-group">
                <Navigation size={15} className="input-icon" />
                <select
                  className="form-control form-select"
                  style={{ paddingLeft: 38 }}
                  value={form.to}
                  onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                >
                  <option value="">Select destination</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Time */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Depart After</label>
              <div className="input-group">
                <Clock size={15} className="input-icon" />
                <input
                  type="time"
                  className="form-control"
                  style={{ paddingLeft: 38 }}
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                />
              </div>
            </div>

            {/* Day */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Day</label>
              <select
                className="form-control form-select"
                value={form.day}
                onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
              >
                <option value="">Any Day</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <button type="submit" className="btn btn-lg"
              style={{ background: '#fff', color: '#1e40af', fontWeight: 700, height: 42 }}
              disabled={loading}
            >
              {loading ? <span className="loading-spinner" style={{ borderTopColor: '#1e40af', width: 16, height: 16 }} /> : <Search size={18} />}
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          Searching for buses...
        </div>
      )}

      {searched && !loading && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
              {results.length} bus{results.length !== 1 ? 'es' : ''} found
              {form.from && form.to && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 15 }}> · {form.from} → {form.to}</span>}
            </h2>
            {form.time && <span className="badge badge-blue"><Clock size={12} /> After {form.time}</span>}
          </div>

          {results.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🚌</div>
                <h3>No Buses Found</h3>
                <p>Try changing your search filters or selecting a different time.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {results.map((s) => (
                <div key={s._id} className="search-result-card">
                  <div className="result-header">
                    <div className="result-route">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 16 }}>{s.bus?.busNumber}</span>
                          <span className={`badge ${
                            s.bus?.type === 'AC' || s.bus?.type === 'Super Deluxe' ? 'badge-purple' :
                            s.bus?.type === 'Express' ? 'badge-blue' : 'badge-gray'
                          }`}>{s.bus?.type}</span>
                          <span className={`badge ${
                            s.status === 'On Time' ? 'badge-green' :
                            s.status === 'Delayed' ? 'badge-amber' : 'badge-red'
                          }`}>{s.status}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.bus?.busName} · {s.bus?.operator}</div>
                      </div>
                    </div>

                    <div className="result-times">
                      <div className="time-block">
                        <span className="time-label">Departs</span>
                        <span className="time-value" style={{ color: 'var(--primary)' }}>{s.departureTime}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.route?.source}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {s.route?.estimatedDuration ? durationLabel(s.route.estimatedDuration) : '—'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <div style={{ width: 30, height: 2, background: 'var(--border)' }} />
                          <ArrowRight size={14} color="var(--text-muted)" />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.route?.totalDistance} km</span>
                      </div>
                      <div className="time-block">
                        <span className="time-label">Arrives</span>
                        <span className="time-value">{s.arrivalTime}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.route?.destination}</span>
                      </div>
                    </div>
                  </div>

                  <div className="result-meta">
                    <div className="result-meta-item">
                      <Bus size={14} /> {s.bus?.capacity} seats
                    </div>
                    <div className="result-meta-item">
                      <MapPin size={14} /> Platform {s.platform}
                    </div>
                    <div className="result-meta-item">
                      <Clock size={14} /> {s.daysOfOperation?.join(', ')}
                    </div>
                    {s.bus?.amenities?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {s.bus.amenities.map(a => (
                          <span key={a} className="amenity-pill" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {amenityIcon(a)} {a}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="fare-badge">₹{s.fare}</div>
                  </div>

                  {s.route?.stops?.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>VIA STOPS</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{s.route.source}</span>
                        {s.route.stops.map((stop, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ArrowRight size={13} color="var(--text-muted)" />
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stop.name}</span>
                          </div>
                        ))}
                        <ArrowRight size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{s.route.destination}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!searched && !loading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🗺️</div>
            <h3>Plan Your Journey</h3>
            <p>Select your source, destination and preferred departure time to find available buses.</p>
          </div>
        </div>
      )}
    </div>
  )
}
