import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import API from '../services/api';

export default function QRCards() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/parts').then(r => { setParts(r.data); setLoading(false); });
  }, []);

  const handlePrint = (part) => {
    const url = 'https://sn008stock.netlify.app/issue?pn=' + part.pn;
    const win = window.open('', '_blank');
    const qrSvg = document.getElementById('qr-' + part.id)?.innerHTML || '';
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Card - ${part.pn}</title>
        <style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: white; font-family: Inter, sans-serif; }
          .card { width: 380px; background: #F5F4DF; border: 2px solid #007AE5; border-radius: 12px; padding: 40px; text-align: center; }
          .logo { font-size: 18px; font-weight: 700; color: #007AE5; letter-spacing: 2px; margin-bottom: 8px; }
          .divider { width: 40px; height: 3px; background: #007AE5; border-radius: 2px; margin: 0 auto 24px; }
          .pn { font-size: 28px; font-weight: 700; color: #0E1620; letter-spacing: 2px; margin-bottom: 8px; }
          .desc { font-size: 14px; color: #5A6072; margin-bottom: 20px; line-height: 1.4; }
          .bin { font-size: 13px; color: #1C3F99; font-weight: 600; margin-bottom: 20px; }
          .qr-wrap { display: flex; justify-content: center; margin-bottom: 20px; }
          .qr-box { background: white; padding: 10px; border-radius: 8px; border: 1px solid #D8D7C0; }
          .min { font-size: 12px; color: #5A6072; }
          .scan { font-size: 11px; color: #aaa; margin-top: 16px; letter-spacing: 1px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Margham Stock</div>
          <div class="divider"></div>
          <div class="pn">${part.pn}</div>
          <div class="desc">${part.description}</div>
          ${part.location ? `<div class="bin">Bin: ${part.location}</div>` : ''}
          <div class="qr-wrap">
            <div class="qr-box">${qrSvg}</div>
          </div>
          <div class="min">Min. stock: <strong>${part.min_stock} ${part.unit}</strong></div>
          <div class="scan">SCAN TO ISSUE PART</div>
        </div>
        <script>window.onload = function(){ window.print(); }</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const filtered = parts.filter(p =>
    (p.pn + p.description + (p.location || '')).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#5A6072'}}>Loading...</div>;

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <h2 style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'#083E6F',letterSpacing:2,textTransform:'uppercase'}}>QR Cards</h2>
        <span style={{color:'#5A6072',fontSize:13}}>{filtered.length} parts</span>
      </div>

      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search PN or description..."
          style={{width:'100%',padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#fff',boxSizing:'border-box'}}/>
      </div>

      <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:8,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F5F4DF'}}>
                {['Part number','Description','Bin','Preview','Print'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'10px 14px',fontSize:10,color:'#007AE5',letterSpacing:1,textTransform:'uppercase',fontWeight:700,borderBottom:'1.5px solid #D8D7C0'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p,i) => (
                <tr key={p.id} style={{borderBottom: i < filtered.length-1 ? '1px solid #F0EFD8' : 'none'}}>
                  <td style={{padding:'10px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,color:'#007AE5'}}>{p.pn}</td>
                  <td style={{padding:'10px 14px',fontSize:13,color:'#0E1620'}}>{p.description}</td>
                  <td style={{padding:'10px 14px',fontSize:12,color:'#5A6072'}}>{p.location||'-'}</td>
                  <td style={{padding:'10px 14px'}}>
                    <div id={'qr-' + p.id} style={{display:'inline-block'}}>
                      <QRCodeSVG value={'https://sn008stock.netlify.app/issue?pn=' + p.pn} size={40} level="M" />
                    </div>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <button onClick={()=>handlePrint(p)}
                      style={{background:'#007AE5',border:'none',borderRadius:6,color:'#fff',fontSize:12,fontWeight:600,padding:'6px 12px',cursor:'pointer'}}>
                      🖨 Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

