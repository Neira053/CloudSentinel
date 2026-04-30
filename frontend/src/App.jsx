import React, { useState, useEffect, useCallback } from 'react'

// ─── Helpers ───────────────────────────────────────────────────────────────

const SEVERITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }

function sortResults(results) {
  return [...results].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'FAIL' ? -1 : 1
    return (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  })
}

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
  } catch { return iso }
}

// ─── Icons (inline SVG) ─────────────────────────────────────────────────────

const Icon = {
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Server: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  ),
  Filter: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Wifi: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  ),
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const isPass = status === 'PASS'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.06em', fontFamily: 'var(--font-mono)',
      background: isPass ? 'var(--pass-dim)' : 'var(--fail-dim)',
      color: isPass ? 'var(--pass)' : 'var(--fail)',
      border: `1px solid ${isPass ? 'rgba(0,229,160,0.25)' : 'rgba(255,63,91,0.25)'}`,
    }}>
      {isPass ? <Icon.Check /> : <Icon.X />}
      {status}
    </span>
  )
}

function SeverityBadge({ severity }) {
  const map = {
    HIGH:   { color: 'var(--high)',   bg: 'var(--high-dim)',   border: 'rgba(255,63,91,0.2)' },
    MEDIUM: { color: 'var(--medium)', bg: 'var(--medium-dim)', border: 'rgba(255,140,0,0.2)' },
    LOW:    { color: 'var(--low)',    bg: 'var(--low-dim)',    border: 'rgba(58,180,242,0.2)' },
  }
  const s = map[severity] || map.LOW
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      fontFamily: 'var(--font-mono)',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {severity}
    </span>
  )
}

function SummaryCard({ label, value, color, children, delay, icon }) {
  return (
    <div className={`animate-fade-delay-${delay}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px 28px',
      display: 'flex', flexDirection: 'column', gap: 8,
      position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s, transform 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color || 'var(--accent)'}, transparent)`,
        opacity: 0.7,
      }} />
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        {label}
      </span>
      {value !== undefined && (
        <span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, color: color || 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </span>
      )}
      {children}
    </div>
  )
}

function FilterButton({ label, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.15s',
      fontFamily: 'var(--font-sans)',
      background: active ? (color || 'var(--accent)') : 'transparent',
      color: active ? '#fff' : 'var(--text-secondary)',
      border: `1px solid ${active ? (color || 'var(--accent)') : 'var(--border)'}`,
    }}>
      {label}
    </button>
  )
}

function ResultRow({ item, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`animate-fade-delay-${Math.min(index + 1, 5)}`}
      style={{
        background: open ? 'var(--bg-elevated)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${item.status === 'FAIL'
          ? (item.severity === 'HIGH' ? 'var(--high)' : item.severity === 'MEDIUM' ? 'var(--medium)' : 'var(--low)')
          : 'var(--pass)'}`,
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        transition: 'background 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
      }}
      onClick={() => setOpen(o => !o)}
    >
      {/* Main row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 180px 90px 100px 24px',
        alignItems: 'center', gap: 16, padding: '14px 20px',
      }}>
        {/* Check name + resource */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.status === 'FAIL' && <Icon.AlertTriangle />}
            {item.check}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 12 }}>
            <Icon.Server />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{item.resourceId}</span>
          </div>
        </div>
        {/* Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-dim)', fontSize: 12 }}>
          <Icon.Clock />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatTime(item.timestamp)}</span>
        </div>
        {/* Severity */}
        <div><SeverityBadge severity={item.severity} /></div>
        {/* Status */}
        <div><StatusBadge status={item.status} /></div>
        {/* Chevron */}
        <div style={{ color: 'var(--text-dim)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', fontSize: 16 }}>›</div>
      </div>

      {/* Expanded reason */}
      {open && (
        <div style={{
          padding: '12px 20px 16px', borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Reason
          </span>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {item.reason}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Loading State ───────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 20 }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
        Scanning AWS resources...
      </p>
    </div>
  )
}

// ─── Error State ─────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 16, textAlign: 'center' }}>
      <div style={{ color: 'var(--fail)', opacity: 0.5 }}><Icon.Wifi /></div>
      <p style={{ color: 'var(--fail)', fontWeight: 700, fontSize: 16 }}>Failed to connect to backend</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, fontFamily: 'var(--font-mono)', maxWidth: 400 }}>{message}</p>
      <button onClick={onRetry} style={{
        marginTop: 8, display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
        background: 'var(--fail-dim)', color: 'var(--fail)',
        border: '1px solid rgba(255,63,91,0.3)', fontFamily: 'var(--font-sans)',
        fontWeight: 600, fontSize: 13, transition: 'background 0.15s',
      }}>
        <Icon.Refresh /> Retry
      </button>
    </div>
  )
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [statusFilter, setStatus] = useState('ALL')
  const [sevFilter, setSev]       = useState('ALL')
  const [lastScan, setLastScan]   = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cis-results')
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const json = await res.json()
      setData(json)
      setLastScan(new Date())
    } catch (err) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Filtered + sorted results
  const filtered = data
    ? sortResults(
        data.results.filter(r =>
          (statusFilter === 'ALL' || r.status === statusFilter) &&
          (sevFilter === 'ALL' || r.severity === sevFilter)
        )
      )
    : []

  const s = data?.summary || {}

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(79,142,247,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79,142,247,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>

        {/* ── Header ── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '28px 0 32px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Logo */}
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(79,142,247,0.05))',
              border: '1px solid rgba(79,142,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)',
            }}>
              <Icon.Shield />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
                Cloud<span style={{ color: 'var(--accent)' }}>Sentinel</span>
              </h1>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                CIS BENCHMARK SCANNER
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {lastScan && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                <Icon.Clock />
                Last scan: {lastScan.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 18px', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
                background: 'var(--bg-elevated)', color: loading ? 'var(--text-dim)' : 'var(--text-primary)',
                border: '1px solid var(--border)', fontFamily: 'var(--font-sans)',
                fontWeight: 600, fontSize: 13, transition: 'all 0.15s',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none', display: 'flex' }}>
                <Icon.Refresh />
              </span>
              Refresh Scan
            </button>
          </div>
        </header>

        {/* ── Summary Cards ── */}
        {data && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>

            <SummaryCard label="Total Checks" value={s.total} color="var(--accent)" delay={1} />

            <SummaryCard label="Passed" value={s.pass} color="var(--pass)" delay={2} />

            <SummaryCard label="Failed" value={s.fail} color="var(--fail)" delay={3} />

            <SummaryCard label="By Severity" delay={4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {[
                  { key: 'HIGH',   color: 'var(--high)',   label: 'HIGH' },
                  { key: 'MEDIUM', color: 'var(--medium)', label: 'MED' },
                  { key: 'LOW',    color: 'var(--low)',    label: 'LOW' },
                ].map(({ key, color, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', width: 32 }}>{label}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3, background: color,
                        width: s.total ? `${(s.bySeverity?.[key] || 0) / s.total * 100}%` : '0%',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color, minWidth: 20, textAlign: 'right' }}>
                      {s.bySeverity?.[key] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </SummaryCard>
          </section>
        )}

        {/* ── Findings Section ── */}
        <section>

          {/* Section header + filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Security Findings
                {data && (
                  <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    ({filtered.length} of {data.results.length})
                  </span>
                )}
              </h2>
            </div>
            {data && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon.Filter /> Filter:
                </span>
                {['ALL', 'FAIL', 'PASS'].map(s => (
                  <FilterButton key={s} label={s} active={statusFilter === s}
                    onClick={() => setStatus(s)}
                    color={s === 'FAIL' ? 'var(--fail)' : s === 'PASS' ? 'var(--pass)' : 'var(--accent)'}
                  />
                ))}
                <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(sv => (
                  <FilterButton key={sv} label={sv} active={sevFilter === sv}
                    onClick={() => setSev(sv)}
                    color={sv === 'HIGH' ? 'var(--high)' : sv === 'MEDIUM' ? 'var(--medium)' : sv === 'LOW' ? 'var(--low)' : 'var(--accent)'}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Table header */}
          {data && filtered.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 180px 90px 100px 24px',
              gap: 16, padding: '8px 20px 10px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}>
              <span>Check / Resource</span>
              <span>Timestamp</span>
              <span>Severity</span>
              <span>Status</span>
              <span />
            </div>
          )}

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loading && <LoadingState />}
            {!loading && error && <ErrorState message={error} onRetry={fetchData} />}
            {!loading && data && filtered.length === 0 && (
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
                No results match the current filters.
              </div>
            )}
            {!loading && filtered.map((item, i) => (
              <ResultRow key={`${item.resourceId}-${item.check}-${i}`} item={item} index={i} />
            ))}
          </div>

        </section>

        {/* ── Footer ── */}
        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            CloudSentinel v1.0 — AWS CIS Benchmark Scanner
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Built with Node.js + React · AWS SDK v3
          </p>
        </footer>

      </div>

      {/* Spin keyframe via style tag */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
