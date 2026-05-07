import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    API.get('/returns').then(r => {
      setRequests(r.data);
      setLoading(false);
    });
  };

  const approve = async (id) => {
    if (!window.confirm('Approve this return request?')) return;
    try {
      await API.put('/returns/' + id + '/approve');
      fetchRequests();
    } catch(e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const reject = async (id) => {
    if (!window.confirm('Reject this return request?')) return;
    try {
      await API.put('/returns/' + id + '/reject');
      fetchRequests();
    } catch(e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const reviewed = requests.filter(r => r.status !== 'pending');

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#5A6072'}}>Loading...</div>;

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <h2 style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'#083E6F',letterSpacing:2,textTransform:'uppercase'}}>Return Requests</h2>
        {pending.length > 0 && (
          <span style={{background:'#EB6110',color:'#fff',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>
            {pending.length} pending
          </span>
        )}
      </div>

      {pending.length === 0 && (
        <div style={{background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:6,padding:'10px 14px',fontSize:13,color:'#15803d',marginBottom:20}}>
          No pending return requests
        </div>
      )}

      {pending.length > 0 && (
        <div style={{marginBottom:28}}>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:12,fontWeight:700,color:'#EB6110',letterSpacing:1.5,textTransform:'uppercase',marginBottom:12}}>
            Pending approval
          </div>
          {pending.map(r => (
            <div key={r.id} style={{background:'#fff',border:'2px solid #FFB300',borderRadius:10,padding:20,marginBottom:12}}>
              <div style={{display:'flex',gap:16,flexWrap:'wrap',alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:18,fontWeight:700,color:'#007AE5'}}>{r.pn}</div>
                  <div style={{fontSize:13,color:'#5A6072',marginTop:2}}>{r.description}</div>
                  <div style={{marginTop:8,display:'flex',gap:16,flexWrap:'wrap',fontSize:12,color:'#5A6072'}}>
                    <span>Requested by: <strong style={{color:'#0E1620'}}>{r.requester_name}</strong></span>
                    <span>Qty: <strong style={{color:'#0E1620'}}>{r.quantity}</strong></span>
                    {r.aircraft_reg && <span>A/C: <strong style={{color:'#0E1620'}}>{r.aircraft_reg}</strong></span>}
                    {r.work_order && <span>Logbook: <strong style={{color:'#007AE5'}}>{r.work_order}</strong></span>}
                  </div>
                  {r.reason && <div style={{marginTop:8,fontSize:12,color:'#5A6072'}}>Reason: <em>{r.reason}</em></div>}
                  <div style={{marginTop:4,fontSize:11,color:'#aaa'}}>{new Date(r.created_at).toLocaleDateString('en-GB')} {new Date(r.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <button onClick={()=>approve(r.id)}
                    style={{background:'#007AE5',border:'none',borderRadius:6,color:'#fff',fontSize:13,fontWeight:600,padding:'8px 16px',cursor:'pointer'}}>
                    ✓ Approve
                  </button>
                  <button onClick={()=>reject(r.id)}
                    style={{background:'none',border:'1.5px solid #fca5a5',borderRadius:6,color:'#dc2626',fontSize:13,padding:'8px 16px',cursor:'pointer'}}>
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:12,fontWeight:700,color:'#5A6072',letterSpacing:1.5,textTransform:'uppercase',marginBottom:12}}>
            Reviewed
          </div>
          <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:8,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#F5F4DF'}}>
                    {['Date','Part','Requested by','Qty','Reason','Status'].map(h=>(
                      <th key={h} style={{textAlign:'left',padding:'9px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviewed.map((r,i) => (
                    <tr key={r.id} style={{borderBottom: i < reviewed.length-1 ? '1px solid #F0EFD8' : 'none'}}>
                      <td style={{padding:'9px 14px',fontSize:11,color:'#5A6072',whiteSpace:'nowrap'}}>{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                      <td style={{padding:'9px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,color:'#007AE5'}}>{r.pn}</td>
                      <td style={{padding:'9px 14px',fontSize:13}}>{r.requester_name}</td>
                      <td style={{padding:'9px 14px',fontSize:13}}>{r.quantity}</td>
                      <td style={{padding:'9px 14px',fontSize:12,color:'#5A6072'}}>{r.reason||'-'}</td>
                      <td style={{padding:'9px 14px'}}>
                        <span style={{
                          background:r.status==='approved'?'#dcfce7':'#fef2f2',
                          color:r.status==='approved'?'#15803d':'#dc2626',
                          fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20
                        }}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

