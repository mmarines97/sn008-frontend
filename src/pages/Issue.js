import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';

export default function Issue() {
  const [scan, setScan] = useState('');
  const [part, setPart] = useState(null);
  const [parts, setParts] = useState([]);
  const [qty, setQty] = useState(1);
  const [reg, setReg] = useState('');
  const [logbook, setLogbook] = useState('');
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const scanRef = useRef();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    API.get('/parts').then(r => {
      setParts(r.data);
      const pnFromUrl = searchParams.get('pn');
      if (pnFromUrl) {
        const found = r.data.find(p => p.pn.toUpperCase() === pnFromUrl.toUpperCase());
        if (found) openIP(found);
        else setAlert({ type: 'error', msg: 'Part not found: ' + pnFromUrl });
      }
    });
    scanRef.current?.focus();
  }, []);

  const handleScan = (val) => {
    setScan(val);
    const pn = val.replace('SN008:', '').trim().toUpperCase();
    if (!pn) return;
    const found = parts.find(p => p.pn.toUpperCase() === pn);
    if (found) { setPart(found); setScan(''); setAlert(null); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const pn = scan.replace('SN008:', '').trim().toUpperCase();
      const found = parts.find(p => p.pn.toUpperCase() === pn);
      if (found) { setPart(found); setScan(''); setAlert(null); }
      else setAlert({ type: 'error', msg: 'Part not found: ' + pn });
    }
  };

  const openIP = (p) => {
    setPart(p);
    setQty(1);
    setReg('');
    setLogbook('');
    setNotes('');
    setAlert(null);
  };

  const cancel = () => {
    setPart(null); setScan(''); setReg(''); setLogbook(''); setNotes(''); setQty(1);
    setAlert(null); scanRef.current?.focus();
  };

  const confirm = async () => {
    if (!reg) { setAlert({ type: 'error', msg: 'Fill in A/C Registration.' }); return; }
    if (!logbook) { setAlert({ type: 'error', msg: 'Fill in Logbook Ref.' }); return; }
    if (qty <= 0 || qty > part.stock) { setAlert({ type: 'error', msg: 'Invalid quantity. Available: ' + part.stock }); return; }
    setLoading(true);
    try {
      await API.post('/movements', {
        part_id: part.id, type: 'issue', quantity: qty,
        aircraft_reg: reg.toUpperCase(), work_order: logbook, notes
      });
      setAlert({ type: 'success', msg: 'Issued ' + qty + ' x ' + part.pn + ' — Remaining: ' + (part.stock - qty) });
      cancel();
      API.get('/parts').then(r => setParts(r.data));
    } catch(e) {
      setAlert({ type: 'error', msg: e.response?.data?.error || 'Error' });
    } finally {
      setLoading(false);
    }
  };

  const alertStyle = (type) => ({
    background: type === 'error' ? '#fef2f2' : '#f0fdf4',
    border: '1.5px solid ' + (type === 'error' ? '#fca5a5' : '#86efac'),
    color: type === 'error' ? '#dc2626' : '#15803d',
    borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 14
  });

  return (
    <div style={{padding:24}}>
      <h2 style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'#083E6F',letterSpacing:2,textTransform:'uppercase',marginBottom:20}}>Issue Part</h2>
      <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:10,overflow:'hidden',marginBottom:20}}>
        <div style={{height:5,background:'#007AE5'}}></div>
        <div style={{padding:28,textAlign:'center'}}>
          <h3 style={{fontFamily:'Rajdhani,sans-serif',fontSize:18,fontWeight:700,color:'#083E6F',letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>Scan part</h3>
          <p style={{color:'#5A6072',fontSize:13,marginBottom:18}}>Point the scanner at the bin QR code or type the part number</p>
          <div style={{position:'relative',maxWidth:460,margin:'0 auto'}}>
            <input ref={scanRef} value={scan} onChange={e=>handleScan(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Scan QR or enter PN..."
              style={{width:'100%',padding:'12px 16px',border:'2px solid #007AE5',borderRadius:7,fontSize:16,fontFamily:'Rajdhani,sans-serif',fontWeight:700,outline:'none',background:'#F5F4DF',boxSizing:'border-box',letterSpacing:1}}/>
          </div>
        </div>
      </div>
      {alert && <div style={alertStyle(alert.type)}>{alert.msg}</div>}
      {part && (
        <div style={{background:'#fff',border:'2px solid #007AE5',borderRadius:10,padding:22}}>
          <div style={{display:'flex',gap:20,alignItems:'flex-start',paddingBottom:16,marginBottom:16,borderBottom:'1px solid #D8D7C0',flexWrap:'wrap'}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:22,fontWeight:700,color:'#007AE5',letterSpacing:1}}>{part.pn}</div>
              <div style={{color:'#5A6072',marginTop:4,fontSize:13}}>{part.description}</div>
              {part.location && <div style={{color:'#1C3F99',fontSize:12,marginTop:4,fontWeight:600}}>Bin: {part.location}</div>}
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:10,color:'#5A6072',textTransform:'uppercase',letterSpacing:1}}>Current stock</div>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:36,fontWeight:700,color:part.stock===0?'#EB6110':part.stock<=part.min_stock?'#d97706':'#007AE5'}}>{part.stock} {part.unit}</div>
              <div style={{fontSize:11,color:'#5A6072'}}>min: {part.min_stock}</div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div>
              <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>A/C Registration *</label>
              <input value={reg} onChange={e=>setReg(e.target.value)} placeholder="EC-XXX"
                style={{width:'100%',marginTop:5,padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box',textTransform:'uppercase'}}/>
            </div>
            <div>
              <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Logbook Ref. *</label>
              <input value={logbook} onChange={e=>setLogbook(e.target.value)} placeholder="LOG-2024-XXXX"
                style={{width:'100%',marginTop:5,padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Quantity *</label>
              <input type="number" value={qty} onChange={e=>setQty(parseInt(e.target.value)||1)} min={1} max={part.stock}
                style={{width:'100%',marginTop:5,padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Notes</label>
              <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional..."
                style={{width:'100%',marginTop:5,padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
            </div>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
            <button onClick={cancel} style={{background:'#fff',border:'1.5px solid #D8D7C0',borderRadius:6,color:'#0E1620',fontSize:13,padding:'8px 16px',cursor:'pointer'}}>Cancel</button>
            <button onClick={confirm} disabled={loading} style={{background:'#007AE5',border:'none',borderRadius:6,color:'#fff',fontSize:13,fontWeight:600,padding:'8px 16px',cursor:'pointer'}}>
              {loading ? 'Confirming...' : '✓ Confirm issue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

