import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

function ReturnModal({ movement, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState(movement.quantity);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    try {
      await API.post('/returns', {
        movement_id: movement.id,
        part_id: movement.part_id,
        quantity: quantity,
        reason: reason
      });
      onSubmit();
    } catch(e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(8,62,111,.3)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:12,padding:26,width:'100%',maxWidth:440}}>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:16,fontWeight:700,color:'#083E6F',letterSpacing:1,textTransform:'uppercase',marginBottom:18,paddingBottom:12,borderBottom:'1px solid #D8D7C0'}}>
          Request Return
        </div>
        <div style={{marginBottom:12,padding:12,background:'#F5F4DF',borderRadius:6}}>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:15,fontWeight:700,color:'#007AE5'}}>{movement.pn}</div>
          <div style={{fontSize:12,color:'#5A6072',marginTop:2}}>{movement.description}</div>
          <div style={{fontSize:12,color:'#5A6072',marginTop:2}}>Original issue: {movement.quantity} units</div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600,display:'block',marginBottom:5}}>Quantity to return</label>
          <input type="number" value={quantity} onChange={e=>setQuantity(parseInt(e.target.value)||1)} min={1} max={movement.quantity}
            style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600,display:'block',marginBottom:5}}>Reason</label>
          <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Part not needed, wrong part issued..."
            style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{background:'#fff',border:'1.5px solid #D8D7C0',borderRadius:6,color:'#0E1620',fontSize:13,padding:'8px 16px',cursor:'pointer'}}>Cancel</button>
          <button onClick={handleSubmit} style={{background:'#007AE5',border:'none',borderRadius:6,color:'#fff',fontSize:13,fontWeight:600,padding:'8px 16px',cursor:'pointer'}}>Send request</button>
        </div>
      </div>
    </div>
  );
}

export default function Log() {
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    API.get('/movements').then(r => {
      setMovements(r.data);
      setLoading(false);
    });
  }, []);

  const filtered = movements.filter(m => {
    const txt = (m.pn + ' ' + (m.aircraft_reg||'') + ' ' + (m.work_order||'') + ' ' + (m.technician||'')).toLowerCase();
    return txt.includes(search.toLowerCase());
  });

  const handleReturnSubmit = () => {
    setReturning(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#5A6072'}}>Loading...</div>;

  return (
    <div style={{padding:24}}>
      {returning && <ReturnModal movement={returning} onClose={()=>setReturning(null)} onSubmit={handleReturnSubmit}/>}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <h2 style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'#083E6F',letterSpacing:2,textTransform:'uppercase'}}>Movement Log</h2>
        <span style={{color:'#5A6072',fontSize:13}}>{filtered.length} movements</span>
      </div>

      {success && (
        <div style={{background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:6,padding:'10px 14px',fontSize:13,color:'#15803d',marginBottom:16}}>
          ✓ Return request sent — waiting for admin approval
        </div>
      )}

      <div style={{marginBottom:14}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search PN, A/C, Logbook Ref..."
          style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#fff',boxSizing:'border-box'}}/>
      </div>

      <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:8,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F5F4DF'}}>
                {['Date','Part number','Description','Qty','A/C Reg.','Logbook Ref.','Technician','Return'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center',padding:28,color:'#5A6072'}}>No movements yet</td></tr>
              )}
              {filtered.map((m,i) => {
                const isIssue = m.type === 'issue';
                const date = new Date(m.created_at).toLocaleDateString('en-GB') + ' ' + new Date(m.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
                return (
                  <tr key={m.id} style={{borderBottom: i < filtered.length-1 ? '1px solid #F0EFD8' : 'none'}}>
                    <td style={{padding:'10px 14px',fontSize:11,color:'#5A6072',whiteSpace:'nowrap'}}>{date}</td>
                    <td style={{padding:'10px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,color:'#007AE5'}}>{m.pn}</td>
                    <td style={{padding:'10px 14px',fontSize:13,color:'#0E1620'}}>{m.description}</td>
                    <td style={{padding:'10px 14px'}}>
                      <span style={{background:isIssue?'#FFF3CD':m.type==='return'?'#dcfce7':'#EAF3FC',color:isIssue?'#92400e':m.type==='return'?'#15803d':'#1C3F99',fontWeight:700,fontSize:11,padding:'3px 9px',borderRadius:20}}>
                        {isIssue?'-':'+'}{ m.quantity}
                      </span>
                    </td>
                    <td style={{padding:'10px 14px',fontSize:13,fontWeight:600}}>{m.aircraft_reg||'-'}</td>
                    <td style={{padding:'10px 14px',fontSize:11,color:'#007AE5'}}>{m.work_order||'-'}</td>
                    <td style={{padding:'10px 14px',fontSize:13}}>{m.technician||'-'}</td>
                    <td style={{padding:'10px 14px'}}>
                      {isIssue && (
                        <button onClick={()=>setReturning(m)}
                          style={{background:'none',border:'1.5px solid #D8D7C0',borderRadius:6,color:'#5A6072',fontSize:11,padding:'4px 8px',cursor:'pointer'}}>
                          ↩ Return
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

