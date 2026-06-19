// shell.jsx — App layout: sidebar, topbar, helpers
// Uses: I, USACHCrest from window

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────

function Sidebar({ current, onNav, counts, practicaActiva, onSelectPractica }) {
  const usaAutoeval = !!(window.USACH_DATA && window.USACH_DATA.PONDERACIONES &&
    window.USACH_DATA.PONDERACIONES.some(p => p.resolver === 'AUTO'));
  const navGroups = [
    { label: 'Curso', items: [
      { id: 'dashboard',   label: 'Inicio',                icon: 'home'      },
      { id: 'evaluaciones',label: 'Evaluaciones',           icon: 'clipboard', count: counts.evals },
      { id: 'notas',       label: 'Tabla de notas',         icon: 'table'      },
      { id: 'estudiantes', label: 'Estudiantes',            icon: 'users',     count: counts.students },
    ]},
    { label: 'Procesos', items: [
      { id: 'supervisor',  label: 'Eval. Supervisor',       icon: 'checkSquare' },
      ...(usaAutoeval ? [{ id: 'autoeval', label: 'Autoevaluación', icon: 'user' }] : []),
      { id: 'anexos',      label: 'Anexos administrativos', icon: 'archive' },
      { id: 'visitas',     label: 'Visitas en terreno',     icon: 'camera'  },
    ]},
  ];

  const _authUser = window.__authUser;
  const _asignadas = (_authUser && _authUser.rol !== 'coordinador' && _authUser.practicasAsignadas?.length)
    ? _authUser.practicasAsignadas : null;

  const practicas = (window.PRACTICAS_INDEX || []).map(p => {
    const asignada = !_asignadas || _asignadas.includes(p.codigo);
    return {
      codigo: p.codigo, nombre: p.nombre,
      activo: p.codigo === practicaActiva,
      disponible: p.disponible && asignada,
      bloqueada: p.disponible && !asignada,
    };
  });

  return (
    <aside className="sidebar" data-screen-label="Sidebar">
      <div className="sidebar-brand">
        <USACHCrest size={36} />
        <div className="brand-text">
          <div className="brand-name">Prácticas USACH</div>
          <div className="brand-sub">Entrenador Deportivo</div>
        </div>
      </div>

      <div className="practica-select">
        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px 4px' }}>
          Práctica
        </div>
        {practicas.map(p => (
          <div key={p.codigo} className={`practica-row ${p.activo ? 'active' : p.disponible ? '' : 'disabled'}`}
               title={p.disponible ? (p.activo ? 'Práctica activa' : 'Cambiar a esta práctica') : p.bloqueada ? 'No asignada por el coordinador' : 'Próximamente'}
               style={{ cursor: p.disponible && !p.activo ? 'pointer' : p.activo ? 'default' : 'not-allowed' }}
               onClick={() => { if (p.disponible && !p.activo) onSelectPractica(p.codigo); }}>
            <span className="pill">{p.codigo}</span>
            <span style={{ fontSize: 12.5 }}>{p.nombre}</span>
            {p.bloqueada && <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--ink-400)' }}>🔒</span>}
            {!p.disponible && !p.bloqueada && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--orange-300)', fontWeight: 600 }}>Pronto</span>}
          </div>
        ))}
      </div>

      <nav className="nav">
        {navGroups.map(g => (
          <React.Fragment key={g.label}>
            <div className="nav-group-label">{g.label}</div>
            {g.items.map(it => {
              const IconC = I[it.icon];
              return (
                <button key={it.id} className={`nav-item ${current === it.id ? 'active' : ''}`}
                        onClick={() => onNav(it.id)}>
                  <IconC className="icon" />
                  <span>{it.label}</span>
                  {it.count != null && <span className="count">{it.count}</span>}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">{(window.__authUser?.nombre||'AT').split(' ').slice(0,2).map(w=>w[0]).join('')}</div>
        <div className="user-meta">
          <div className="uname">{window.__authUser?.nombre?.split(' ').slice(1,3).join(' ') || 'Andrés Tapia'}</div>
          <div className="urole">Prof. Supervisor</div>
        </div>
        <button title="Cerrar sesión" onClick={() => { localStorage.removeItem('usach_auth_v2'); window.location.replace('Login.html'); }}
                style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.45)', fontSize:16, padding:'4px 6px', borderRadius:6, lineHeight:1 }}>⏻</button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────────────

function Topbar({ crumbs, actions, onSearch, onSettingsPick, breadcrumbRoot }) {
  const [openMenu, setOpenMenu] = useState(null); // 'notif' | 'settings'
  // close on outside click
  useEffect(() => {
    if (!openMenu) return;
    const close = (e) => { if (!e.target.closest('[data-topbar-menu]')) setOpenMenu(null); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openMenu]);

  return (
    <header className="topbar" data-screen-label="Topbar">
      <div className="breadcrumbs">
        <span>{breadcrumbRoot || 'Práctica I'}</span>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <I.chev size={14} stroke="var(--ink-300)" />
            <span className={i === crumbs.length - 1 ? 'crumb-current' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="search">
        <I.search size={16} />
        <input placeholder="Buscar estudiante, evaluación o anexo…" onChange={e => onSearch && onSearch(e.target.value)} />
      </div>
      <div className="topbar-right">
        {(window.__authUser && window.__authUser.rol === 'coordinador') && (
          <a href="Coordinador.html" className="btn btn-secondary btn-sm" title="Volver al panel de coordinación"
             style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', background: 'var(--orange-500)', color: '#fff', padding: '1px 6px', borderRadius: 6 }}>Coordinador</span>
            ← Panel
          </a>
        )}
        {actions}
        <div data-topbar-menu style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-sm" title="Notificaciones"
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'notif' ? null : 'notif'); }}
                  style={{ position: 'relative' }}>
            <I.bell />
            <span style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: 4, background: 'var(--orange-500)', border: '2px solid var(--bg)' }} />
          </button>
          {openMenu === 'notif' && <NotificationsPanel onClose={() => setOpenMenu(null)} />}
        </div>
        <div data-topbar-menu style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-sm" title="Configuración"
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'settings' ? null : 'settings'); }}>
            <I.settings />
          </button>
          {openMenu === 'settings' && <SettingsMenu onClose={() => setOpenMenu(null)} onPick={(id) => onSettingsPick && onSettingsPick(id)} />}
        </div>
      </div>
    </header>
  );
}

// ─── Notifications panel ────────────────────────────────────────
function NotificationsPanel({ onClose }) {
  const groups = [
    { label: 'Hoy', items: [
      { kind: 'submission', who: 'Antonia Pérez', msg: 'entregó Solemne 2: "Corporación de Deportes"', when: 'hace 14 min', icon: 'upload', color: 'teal' },
      { kind: 'late', who: 'Benjamín Soto', msg: 'entregó Taller 2 con 1 día de atraso · −0,5 pts', when: 'hace 1 h', icon: 'warn', color: 'warn' },
      { kind: 'reminder', who: 'Sistema', msg: 'Solemne 3 vence en 7 días — aún no calificada', when: 'hace 3 h', icon: 'clock', color: 'info' },
    ]},
    { label: 'Esta semana', items: [
      { kind: 'supervisor', who: 'Camila Riquelme', msg: 'subió documento de consentimiento informado', when: 'lun 24 may', icon: 'paperclip', color: 'ink' },
      { kind: 'system', who: 'Sistema', msg: 'Tabla de notas publicada a estudiantes', when: 'lun 24 may', icon: 'send', color: 'teal' },
      { kind: 'submission', who: 'Francisca Mella', msg: 'subió video de Solemne 1', when: 'vie 21 may', icon: 'video', color: 'teal' },
    ]},
  ];
  const colorMap = {
    teal: { bg: 'var(--teal-50)',  fg: 'var(--teal-700)' },
    warn: { bg: 'var(--warn-bg)',  fg: 'var(--warn)' },
    info: { bg: 'var(--info-bg)',  fg: 'var(--info)' },
    ink:  { bg: 'var(--ink-100)',  fg: 'var(--ink-600)' },
  };

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 380, maxHeight: 540, background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: 12,
      boxShadow: 'var(--shadow-lg)', zIndex: 50, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <strong style={{ fontSize: 14 }}>Notificaciones</strong>
        <span className="tag tag-teal" style={{ fontSize: 10 }}>3 nuevas</span>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: 11 }}>Marcar todas leídas</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groups.map(g => (
          <div key={g.label}>
            <div style={{ padding: '10px 16px 4px', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', background: 'var(--surface-1)' }}>
              {g.label}
            </div>
            {g.items.map((it, i) => {
              const IconC = I[it.icon] || I.bell;
              const c = colorMap[it.color] || colorMap.ink;
              return (
                <div key={i} style={{ padding: '12px 16px', display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                     onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                     onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: c.bg, color: c.fg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <IconC size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.45 }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{it.who}</span> <span style={{ color: 'var(--ink-700)' }}>{it.msg}</span>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{it.when}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', color: 'var(--teal-700)' }}>
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
}

// ─── Settings menu ──────────────────────────────────────────────
function SettingsMenu({ onClose, onPick }) {
  const items = [
    { id: 'profile',      icon: 'user',      label: 'Perfil',              desc: 'Andrés Tapia · Prof. Supervisor' },
    { id: 'course',       icon: 'settings',  label: 'Preferencias del curso', desc: 'Práctica I · Semestre 2025-2' },
    { id: 'disponibilidad', icon: 'clock',   label: 'Mi disponibilidad horaria', desc: 'Horarios para supervisión en terreno' },
    { id: 'notifications',icon: 'bell',      label: 'Notificaciones',      desc: 'Email, atrasos, recordatorios' },
    { id: 'integrations', icon: 'paperclip', label: 'Integraciones',       desc: 'Google Drive · Moodle' },
    { id: 'export',       icon: 'download',  label: 'Exportar datos',      desc: 'Backup completo del curso' },
    { divider: true },
    { id: 'help',         icon: 'doc',       label: 'Ayuda y documentación' },
    { id: 'logout',       icon: 'x',         label: 'Cerrar sesión',        danger: true },
  ];
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 280, background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: 12,
      boxShadow: 'var(--shadow-lg)', zIndex: 50, overflow: 'hidden',
      padding: 6,
    }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>AT</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-900)' }}>Andrés Tapia</div>
          <div className="muted" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>andres.tapia@usach.cl</div>
        </div>
      </div>
      {items.map((it, i) => {
        if (it.divider) return <div key={i} style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />;
        const IconC = I[it.icon] || I.settings;
        return (
          <button key={i}
                  className="nav-item"
                  onClick={() => { onPick && onPick(it.id); onClose(); }}
                  style={{
                    color: it.danger ? 'var(--danger)' : 'var(--ink-800)',
                    padding: '8px 10px', borderRadius: 6,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
            <IconC className="icon" />
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{it.label}</div>
              {it.desc && <div className="muted" style={{ fontSize: 11, fontWeight: 400 }}>{it.desc}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Toast (minimal)
// ─────────────────────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState(null);
  const t = useRef(null);
  const show = useCallback((m) => {
    setMsg(m);
    clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 2400);
  }, []);
  const node = msg ? (
    <div className="toast"><I.check size={16} className="check" /><span>{msg}</span></div>
  ) : null;
  return [show, node];
}

// ─────────────────────────────────────────────────────────────
// Helpers (compartidos)
// ─────────────────────────────────────────────────────────────

function notaClass(n) {
  if (n == null) return 'nota-empty';
  if (n >= 4.0) return n >= 5.5 ? 'nota-pass' : 'nota-borderline';
  return 'nota-fail';
}
function formatNota(n) {
  if (n == null) return '—';
  return n.toFixed(1).replace('.', ',');
}
function fechaFmt(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
}

// ─── Ponderación label: derived from current eval titles ────────────
function shortEvalTitle(ev) {
  if (!ev) return '';
  const t = ev.titulo || '';
  const colon = t.indexOf(':');
  return (colon > 0 ? t.substring(colon + 1) : t).trim();
}
function getPonderacionLabel(p, evaluaciones) {
  if (p?.resolver) return p?.label || '';
  if (!p?.componentes) return p?.label || '';
  if (p.componentes.length === 1) {
    const id = p.componentes[0];
    if (id === 'SUP')  return 'Evaluación del Profesor Supervisor';
    if (id === 'AUTO') return 'Autoevaluación del estudiante';
    const ev = (evaluaciones || []).find(e => e.id === id);
    if (!ev) return p.label || id;
    return `${window.grupoDef(ev.grupo).singular} ${ev.numero} · ${shortEvalTitle(ev)}`;
  }
  // Multi-component (e.g. S1 + T2)
  const prefixes = p.componentes.map(id => {
    const ev = (evaluaciones || []).find(e => e.id === id);
    return ev ? `${window.grupoDef(ev.grupo).singular} ${ev.numero}` : id;
  });
  const titles = p.componentes.map(id => {
    const ev = (evaluaciones || []).find(e => e.id === id);
    return ev ? shortEvalTitle(ev) : id;
  });
  return `${prefixes.join(' + ')} · ${titles.join(' + ')}`;
}

Object.assign(window, { Sidebar, Topbar, NotificationsPanel, SettingsMenu, useToast, notaClass, formatNota, fechaFmt, getPonderacionLabel, shortEvalTitle });
