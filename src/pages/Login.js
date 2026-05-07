import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#F5F4DF',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:12,padding:40,width:360,textAlign:'center'}}>
        <div style={{marginBottom:8}}>
          <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:28,fontWeight:700,color:'#007AE5',letterSpacing:3}}>SN008</span>
        </div>
        <div style={{width:40,height:3,background:'#007AE5',borderRadius:2,margin:'12px auto 8px'}}></div>
        <p style={{color:'#5A6072',fontSize:12,marginBottom:28,letterSpacing:1}}>STOCK CONTROL SYSTEM</p>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fca5a5',color:'#dc2626',borderRadius:6,padding:'10px 14px',marginBottom:16,fontSize:13}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:14,textAlign:'left'}}>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              style={{width:'100%',marginTop:5,padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}
              placeholder="admin@sn008.com" required/>
          </div>
          <div style={{marginBottom:20,textAlign:'left'}}>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              style={{width:'100%',marginTop:5,padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}
              placeholder="••••••••" required/>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',background:'#007AE5',color:'#fff',border:'none',borderRadius:7,padding:'11px',fontSize:14,fontWeight:600,cursor:'pointer'}}>
            {loading ? 'Logging in...' : 'Enter'}
          </button>
        </form>
        <p style={{marginTop:16,fontSize:11,color:'#5A6072'}}>Default: admin@sn008.com / password</p>
      </div>
    </div>
  );
}
