import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function Log() {
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#5A6072'}}>Loading...</div>;

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <h2 style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'#083E6F',letterSpacing:2,textTransform:'uppercase'}}>Movement Log</h2>
        <span style={{color:'#5A6072',fontSize:13}}>{filtered.length} movements</span>
      </div>
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
                {['Date','Part number','Description','Qty','A/C Reg.','Logbook Ref.','Technician'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center',padding:28,color:'#5A6072'}}>No movements yet</td></tr>
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
                      <span style={{background:isIssue?'#FFF3CD':'#dcfce7',color:isIssue?'#92400e':'#15803d',fontWeight:700,fontSize:11,padding:'3px 9px',borderRadius:20}}>
                        {isIssue ? '-' : '+'}{m.quantity}
                      </span>
                    </td>
                    <td style={{padding:'10px 14px',fontSize:13,fontWeight:600}}>{m.aircraft_reg||'-'}</td>
                    <td style={{padding:'10px 14px',fontSize:11,color:'#007AE5'}}>{m.work_order||'-'}</td>
                    <td style={{padding:'10px 14px',fontSize:13}}>{m.technician||'-'}</td>
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
