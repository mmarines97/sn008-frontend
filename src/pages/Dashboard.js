import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function Dashboard() {
  const [parts, setParts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/parts'), API.get('/movements')]).then(([p, m]) => {
      setParts(p.data);
      setMovements(m.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#5A6072'}}>Loading...</div>;

  const ok  = parts.filter(p => p.stock > p.min_stock).length;
  const low = parts.filter(p => p.stock > 0 && p.stock <= p.min_stock).length;
  const out = parts.filter(p => p.stock === 0).length;
  const today = new Date().toISOString().slice(0,10);
  const todayIssues = movements.filter(m => m.type === 'issue' && m.created_at?.slice(0,10) === today).length;
  const totalIssues = movements.filter(m => m.type === 'issue').length;
  const recent = movements.slice(0, 10);

  const Stat = ({label, value, color, bottom}) => (
    <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:8,padding:16,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:3,background:bottom||'#007AE5'}}></div>
      <div style={{fontSize:10,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>{label}</div>
      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:30,fontWeight:700,color:color||'#083E6F',marginTop:4,lineHeight:1}}>{value}</div>
    </div>
  );

  return (
    <div style={{padding:24}}>
      <h2 style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'#083E6F',letterSpacing:2,textTransform:'uppercase',marginBottom:20}}>Dashboard</h2>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:24}}>
        <Stat label="Total PNs" value={parts.length} bottom="#083E6F"/>
        <Stat label="Stock OK" value={ok} color="#007AE5" bottom="#007AE5"/>
        <Stat label="Low stock" value={low} color="#EB6110" bottom="#FFB300"/>
        <Stat label="Out of stock" value={out} color="#EB6110" bottom="#EB6110"/>
        <Stat label="Issues today" value={todayIssues} color="#007AE5" bottom="#007AE5"/>
        <Stat label="Total issues" value={totalIssues} bottom="#083E6F"/>
      </div>

      {low > 0 && (
        <div style={{background:'#fffbeb',border:'1.5px solid #fcd34d',borderRadius:6,padding:'10px 14px',fontSize:13,color:'#92400e',marginBottom:20}}>
          ⚠ {low} part{low>1?'s':''} with low stock — check Stock list
        </div>
      )}
      {out > 0 && (
        <div style={{background:'#fef2f2',border:'1.5px solid #fca5a5',borderRadius:6,padding:'10px 14px',fontSize:13,color:'#dc2626',marginBottom:20}}>
          ⛔ {out} part{out>1?'s':''} out of stock
        </div>
      )}

      <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:8,overflow:'hidden'}}>
        <div style={{padding:'10px 16px',borderBottom:'1px solid #D8D7C0',background:'#F5F4DF'}}>
          <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,fontWeight:700,color:'#007AE5',letterSpacing:1.5,textTransform:'uppercase'}}>Recent movements</span>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F5F4DF'}}>
                {['Date','Part number','Description','Qty','A/C Reg.','Logbook Ref.','Technician'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'9px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center',padding:28,color:'#5A6072'}}>No movements yet</td></tr>
              )}
              {recent.map((m,i) => {
                const isIssue = m.type === 'issue';
                const date = new Date(m.created_at).toLocaleDateString('en-GB') + ' ' + new Date(m.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
                return (
                  <tr key={m.id} style={{borderBottom: i < recent.length-1 ? '1px solid #F0EFD8' : 'none'}}>
                    <td style={{padding:'9px 14px',fontSize:11,color:'#5A6072',whiteSpace:'nowrap'}}>{date}</td>
                    <td style={{padding:'9px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,color:'#007AE5'}}>{m.pn}</td>
                    <td style={{padding:'9px 14px',fontSize:13,color:'#0E1620'}}>{m.description}</td>
                    <td style={{padding:'9px 14px'}}>
                      <span style={{background:isIssue?'#FFF3CD':'#dcfce7',color:isIssue?'#92400e':'#15803d',fontWeight:700,fontSize:11,padding:'3px 9px',borderRadius:20}}>
                        {isIssue?'-':'+'}{m.quantity}
                      </span>
                    </td>
                    <td style={{padding:'9px 14px',fontSize:13,fontWeight:600}}>{m.aircraft_reg||'-'}</td>
                    <td style={{padding:'9px 14px',fontSize:11,color:'#007AE5'}}>{m.work_order||'-'}</td>
                    <td style={{padding:'9px 14px',fontSize:13}}>{m.technician||'-'}</td>
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
