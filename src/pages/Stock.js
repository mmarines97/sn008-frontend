import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function Stock() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const res = await API.get('/parts');
      setParts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
    if (p.stock === 0) return {background:'#FFE8DC',color:'#EB6110',label: p.stock + ' ' + p.unit};
    if (p.stock <= p.min_stock) return {background:'#FFF3CD',color:'#92400e',label: p.stock + ' ' + p.unit};
    return {background:'#EAF3FC',color:'#1C3F99',label: p.stock + ' ' + p.unit};
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#5A6072'}}>Loading...</div>;

  return (
    <div style={{padding:24}}>
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((p,i) => {
                const b = badge(p);
                return (
                  <tr key={p.id} style={{borderBottom: i < filtered.length-1 ? '1px solid #F0EFD8' : 'none'}}>
                    <td style={{padding:'10px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,color:'#007AE5'}}>{p.pn}</td>
                    <td style={{padding:'10px 14px',fontSize:13,color:'#0E1620'}}>{p.description}</td>
                    <td style={{padding:'10px 14px',fontSize:12,color:'#5A6072'}}>{p.location || '-'}</td>
                    <td style={{padding:'10px 14px'}}>
                      <span style={{background:b.background,color:b.color,fontWeight:700,fontSize:11,padding:'3px 9px',borderRadius:20}}>{b.label}</span>
                    </td>
                    <td style={{padding:'10px 14px',fontSize:12,color:'#5A6072'}}>{p.min_stock}</td>
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
