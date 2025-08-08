
import React, { useEffect, useMemo, useState } from 'react'

const T = {
  en: {
    title: 'Maid Attendance Tracker',
    sub: 'Simple, offline-first tracker for daily wages.',
    tabAttendance: 'Attendance',
    tabReport: 'Report & Wages',
    tabStaff: 'Staff',
    lang: 'Language',
    name: 'Name',
    wage: 'Daily wage (₹)',
    add: 'Add',
    date: 'Date',
    markToday: 'Mark attendance',
    present: 'Present',
    absent: 'Absent',
    allPresent: 'Mark all present',
    clearAll: 'Clear all',
    selectPerson: 'Select person',
    startDate: 'Start date',
    endDate: 'End date',
    daysPresent: 'Days present',
    totalWage: 'Total wage',
    noStaff: 'No staff yet. Add someone to begin.',
    delete: 'Delete',
    confirmDelete: 'Delete this staff? Attendance will also be removed.',
    dataStay: 'Data stays on this device (local storage). Works offline.',
  },
  hi: {
    title: 'मेड उपस्थिति ट्रैकर',
    sub: 'दैनिक मजदूरी के लिए सरल, ऑफ़लाइन ट्रैकर।',
    tabAttendance: 'उपस्थिति',
    tabReport: 'रिपोर्ट और मजदूरी',
    tabStaff: 'स्टाफ',
    lang: 'भाषा',
    name: 'नाम',
    wage: 'दैनिक मजदूरी (₹)',
    add: 'जोड़ें',
    date: 'तारीख',
    markToday: 'उपस्थिति दर्ज करें',
    present: 'हाज़िर',
    absent: 'ग़ैरहाज़िर',
    allPresent: 'सभी को हाज़िर करें',
    clearAll: 'सभी साफ करें',
    selectPerson: 'व्यक्ति चुनें',
    startDate: 'प्रारंभ तिथि',
    endDate: 'समाप्ति तिथि',
    daysPresent: 'उपस्थित दिन',
    totalWage: 'कुल मजदूरी',
    noStaff: 'अभी कोई स्टाफ नहीं। शुरू करने के लिए किसी को जोड़ें।',
    delete: 'हटाएँ',
    confirmDelete: 'क्या आप इस स्टाफ को हटाना चाहते हैं? उनकी उपस्थिति भी हट जाएगी।',
    dataStay: 'डेटा इसी डिवाइस में रहता है (लोकल स्टोरेज)। ऑफ़लाइन काम करता है।',
  }
}

const fmt = (d) => new Date(d).toISOString().slice(0,10)
const todayStr = () => fmt(new Date())
const rangeDates = (start, end) => {
  const out = []
  const ds = new Date(start); const de = new Date(end)
  if (isNaN(ds) || isNaN(de) || ds > de) return out
  for (let t = new Date(ds); t <= de; t.setDate(t.getDate()+1)) out.push(fmt(t))
  return out
}
function useLocal(key, init) {
  const [state, set] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : init } catch { return init }
  })
  useEffect(()=>{ try { localStorage.setItem(key, JSON.stringify(state)) } catch {} }, [key, state])
  return [state, set]
}

export default function App(){
  const [lang, setLang] = useLocal('maid.lang','en')
  const t = T[lang] || T.en

  const [tab, setTab] = useLocal('maid.tab','attendance')

  const [staff, setStaff] = useLocal('maid.staff', []) // [{id,name,wage}]
  const [att, setAtt] = useLocal('maid.att', {}) // { [id]: { [date]: true } }

  const [name, setName] = useState('')
  const [wage, setWage] = useState('')

  const [date, setDate] = useState(todayStr())

  const [rpId, setRpId] = useState('')
  const [start, setStart] = useState(fmt(new Date(Date.now()-6*24*3600*1000)))
  const [end, setEnd] = useState(todayStr())

  function addStaff(){
    const n = name.trim(); const w = Number(wage)
    if(!n || !w || w<=0) return
    const id = Date.now().toString(36)
    setStaff([...staff, {id, name:n, wage:w}])
    setName(''); setWage('')
    setTab('attendance')
  }
  function removeStaff(id){
    if(!confirm(t.confirmDelete)) return
    setStaff(staff.filter(s=>s.id!==id))
    const copy = {...att}; delete copy[id]; setAtt(copy)
  }

  function setPresent(id, date, present){
    setAtt(prev => ({ ...prev, [id]: { ...(prev[id]||{}), [date]: present || undefined } }))
  }
  function markAll(date){
    const copy = {...att}
    for(const s of staff){ copy[s.id] = { ...(copy[s.id]||{}), [date]: true } }
    setAtt(copy)
  }
  function clearAll(date){
    const copy = {...att}
    for(const s of staff){ if(copy[s.id]) delete copy[s.id][date] }
    setAtt(copy)
  }

  const report = useMemo(()=>{
    const s = staff.find(x=>x.id===rpId)
    if(!s) return null
    const days = rangeDates(start, end)
    const rec = att[s.id] || {}
    const presentDays = days.filter(d=>!!rec[d])
    const total = presentDays.length * s.wage
    return {staff:s, days, presentDays, total}
  },[rpId, start, end, att, staff])

  return (
    <div className="container">
      <header>
        <div>
          <h1>{t.title}</h1>
          <div className="muted">{t.sub}</div>
        </div>
        <div className="row" style={{gap:8}}>
          <span className="muted">{t.lang}</span>
          <div className="bar">
            <button className={"btn " + (lang==='en'?'primary':'')} onClick={()=>setLang('en')}>EN</button>
            <button className={"btn " + (lang==='hi'?'primary':'')} onClick={()=>setLang('hi')}>हिं</button>
          </div>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Main Tabs">
        <button className={"tab-btn " + (tab==='attendance'?'active':'')} onClick={()=>setTab('attendance')}>{t.tabAttendance}</button>
        <button className={"tab-btn " + (tab==='report'?'active':'')} onClick={()=>setTab('report')}>{t.tabReport}</button>
        <button className={"tab-btn " + (tab==='staff'?'active':'')} onClick={()=>setTab('staff')}>{t.tabStaff}</button>
      </div>

      {tab==='attendance' && (
        <section style={{marginTop:10}}>
          <div className="card" style={{marginBottom:10}}>
            <div className="row" style={{marginBottom:10}}>
              <label htmlFor="date">{t.date}</label>
              <input id="date" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            </div>
            {staff.length===0 ? (
              <div className="muted">{t.noStaff}</div>
            ) : (
              <div className="list">
                {staff.map(s=>{
                  const present = !!(att[s.id] && att[s.id][date])
                  return (
                    <div key={s.id} className="item">
                      <div>
                        <div style={{fontWeight:700}}>{s.name}</div>
                        <div className="muted">₹{s.wage} / day</div>
                      </div>
                      <div className="actions">
                        <span className={"pill " + (present?'ok':'no')}>{present?t.present:t.absent}</span>
                        <button className="btn"
                          onClick={()=>setPresent(s.id, date, !present)}>{present?t.absent:t.present}</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {staff.length>0 && (
              <div className="bar" style={{marginTop:10}}>
                <button className="btn primary" onClick={()=>markAll(date)}>{t.allPresent}</button>
                <button className="btn secondary" onClick={()=>clearAll(date)}>{t.clearAll}</button>
              </div>
            )}
          </div>
          <div className="footer">{t.dataStay}</div>
        </section>
      )}

      {tab==='report' && (
        <section style={{marginTop:10}}>
          <div className="card">
            <div className="row">
              <label>{t.selectPerson}</label>
              <select value={rpId} onChange={e=>setRpId(e.target.value)}>
                <option value="">—</option>
                {staff.map(s=>(<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div className="row" style={{marginTop:8}}>
              <label>{t.startDate}</label>
              <input type="date" value={start} onChange={e=>setStart(e.target.value)}/>
            </div>
            <div className="row" style={{marginTop:8}}>
              <label>{t.endDate}</label>
              <input type="date" value={end} onChange={e=>setEnd(e.target.value)}/>
            </div>
            {report && (
              <div style={{marginTop:10}}>
                <div className="item">
                  <div>
                    <div style={{fontWeight:700}}>{report.staff.name}</div>
                    <div className="muted">₹{report.staff.wage} / day</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div>{t.daysPresent}: <b>{report.presentDays.length}</b></div>
                    <div>{t.totalWage}: <b>₹{report.total}</b></div>
                  </div>
                </div>
                <div className="card" style={{marginTop:10, maxHeight:240, overflow:'auto'}}>
                  {report.presentDays.length===0
                    ? <div className="muted">—</div>
                    : report.presentDays.map(d => (
                        <div key={d} className="row" style={{justifyContent:'space-between'}}>
                          <div>{d}</div><div className="pill ok">{t.present}</div>
                        </div>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {tab==='staff' && (
        <section style={{marginTop:10}}>
          <div className="card">
            <div className="row">
              <label>{t.name}</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder={t.name}/>
            </div>
            <div className="row" style={{marginTop:8}}>
              <label>{t.wage}</label>
              <input type="number" inputMode="numeric" min="0" step="1" value={wage} onChange={e=>setWage(e.target.value)} placeholder="₹"/>
            </div>
            <div style={{marginTop:10}}>
              <button className="btn primary" onClick={addStaff}>{t.add}</button>
            </div>
          </div>

          <div className="card" style={{marginTop:10}}>
            {staff.length===0 ? (
              <div className="muted">{t.noStaff}</div>
            ) : (
              <div className="list">
                {staff.map(s=> (
                  <div key={s.id} className="item">
                    <div>
                      <div style={{fontWeight:700}}>{s.name}</div>
                      <div className="muted">₹{s.wage} / day</div>
                    </div>
                    <button className="btn danger" onClick={()=>removeStaff(s.id)}>{t.delete}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
