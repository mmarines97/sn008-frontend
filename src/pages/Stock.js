import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

function EditModal({ part, onSave, onClose }) {
  const [form, setForm] = useState({
    pn: part.pn,
    description: part.description,
    location: part.location || '',
    stock: part.stock,
    min_stock: part.min_stock,
    unit: part.unit,
    notes: part.notes || ''
  });

  const handleSave = async () => {
    try {
      await API.put('/parts/' + part.id, form);
      onSave();
    } catch(e) {
      alert('Error saving: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(8,62,111,.3)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:12,padding:26,width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:16,fontWeight:700,color:'#083E6F',letterSpacing:1,textTransform:'uppercase',marginBottom:18,paddingBottom:12,borderBottom:'1px solid #D8D7C0'}}>
          Edit Part
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div style={{gridColumn:'1/-1'}}>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600,display:'block',marginBottom:5}}>Part Number</label>
            <input value={form.pn} disabled style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,background:'#F0EFD8',boxSizing:'border-box',color:'#5A6072'}}/>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600,display:'block',marginBottom:5}}>Description</label>
            <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600,display:'block',marginBottom:5}}>Location / Bin</label>
            <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. A-12"
              style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600,display:'block',marginBottom:5}}>Unit</label>
            <select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}
              style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}>
              <option>units</option><option>metres</option><option>litres</option><option>kg</option><option>boxes</option><option>pairs</option>
            </select>
          </div>
          <div>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600,display:'block',marginBottom:5}}>Current stock</label>
            <input type="number" value={form.stock} onChange={e=>setForm({...form,stock:parseInt(e.target.value)||0})}
              style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600,display:'block',marginBottom:5}}>Min. stock</label>
            <input type="number" value={form.min_stock} onChange={e=>setForm({...form,min_stock:parseInt(e.target.value)||0})}
              style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600,display:'block',marginBottom:5}}>Notes</label>
            <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Optional..."
              style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}/>
          </div>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20,paddingTop:16,borderTop:'1px solid #D8D7C0'}}>
          <button onClick={onClose} style={{background:'#fff',border:'1.5px solid #D8D7C0',borderRadius:6,color:'#0E1620',fontSize:13,padding:'8px 16px',cursor:'pointer'}}>Cancel</button>
          <button onClick={handleSave} style={{background:'#007AE5',border:'none',borderRadius:6,color:'#fff',fontSize:13,fontWeight:600,padding:'8px 16px',cursor:'pointer'}}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

export default function Stock() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = () => {
    API.get('/parts').then(r => { setParts(r.data); setLoading(false); });
  };

  const filtered = parts.filter(p => {
    const match = (p.pn + p.description + (p.location || '')).toLowerCase().includes(search.toLowerCase());
    if (!match) return false;
    if (filter === 'ok') return p.stock > p.min_stock;
    if (filter === 'low') return p.stock > 0 && p.stock <= p.min_stock;
    if (filter === 'out') return p.stock === 0;
    return true;
  });

  const badge = (p) => {
    if (p.stock === 0) return {background:'#FFE8DC',color:'#EB6110',label:p.stock+' '+p.unit};
    if (p.stock <= p.min_stock) return {background:'#FFF3CD',color:'#92400e',label:p.stock+' '+p.unit};
    return {background:'#EAF3FC',color:'#1C3F99',label:p.stock+' '+p.unit};
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#5A6072'}}>Loading...</div>;

  return (
    <div style={{padding:24}}>
      {editing && <EditModal part={editing} onSave={()=>{setEditing(null);fetchParts();}} onClose={()=>setEditing(null)}/>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <h2 style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'#083E6F',letterSpacing:2,textTransform:'uppercase'}}>Stock List</h2>
        <span style={{color:'#5A6072',fontSize:13}}>{filtered.length} parts</span>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search PN or description..."
          style={{flex:1,minWidth:200,padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#fff'}}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          style={{padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#fff'}}>
          <option value="all">All</option>
          <option value="ok">Stock OK</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>
      <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:8,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F5F4DF'}}>
                <th style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0'}}>Part Number</th>
                <th style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0'}}>Description</th>
                <th style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0'}}>Location</th>
                <th style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0'}}>Stock</th>
                <th style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0'}}>Min.</th>
                {isAdmin && <th style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0'}}>Edit</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p,i) => {
                const b = badge(p);
                return (
                  <tr key={p.id} style={{borderBottom: i < filtered.length-1 ? '1px solid #F0EFD8' : 'none'}}>
                    <td style={{padding:'10px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,color:'#007AE5'}}>{p.pn}</td>
                    <td style={{padding:'10px 14px',fontSize:13,color:'#0E1620'}}>{p.description}</td>
                    <td style={{padding:'10px 14px',fontSize:12,color:'#5A6072'}}>{p.location||'-'}</td>
                    <td style={{padding:'10px 14px'}}><span style={{background:b.background,color:b.color,fontWeight:700,fontSize:11,padding:'3px 9px',borderRadius:20}}>{b.label}</span></td>
                    <td style={{padding:'10px 14px',fontSize:12,color:'#5A6072'}}>{p.min_stock}</td>
                    {isAdmin && (
                      <td style={{padding:'10px 14px'}}>
                        <button onClick={()=>setEditing(p)}
                          style={{background:'none',border:'1.5px solid #D8D7C0',borderRadius:6,color:'#0E1620',fontSize:12,padding:'5px 10px',cursor:'pointer'}}>
                          ✎ Edit
                        </button>
                      </td>
                    )}
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

