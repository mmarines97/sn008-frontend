import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#F5F4DF',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#fff',border:'1px solid #D8D7C0',borderRadius:12,padding:40,width:360,textAlign:'center'}}>
        <svg height="40" viewBox="-30 -20 390 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom:8}}>
          <path fill="#0E1620" d="M120.7,102.33C93.14,24.16,60.05,8.03,42.44,3.03-24.15-15.88-18.68,100.8,104.23,125.9c61.06,171.77,175.63,91.93,237.44-33.82,35.27-71.74,7.14-110.86-45.45-83.11-44.85,23.68-104.58,95.38-175.52,93.36h0ZM46.48,69.06c-28.23-34.41,12.77-75.97,52.13,32.19-11.6-3.12-32.51-8.26-52.13-32.19h0ZM128.34,126.69c84.18-3.24,150.62-93.48,179.04-87.31,43.65,9.48-114.71,279.75-179.04,87.31h0Z"/>
        </svg>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'#007AE5',letterSpacing:2,marginBottom:4}}>Margham</div>
        <div style={{fontSize:12,color:'#5A6072',letterSpacing:1,marginBottom:28}}>STOCK CONTROL</div>
        <div style={{width:40,height:3,background:'#007AE5',borderRadius:2,margin:'0 auto 28px'}}></div>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fca5a5',color:'#dc2626',borderRadius:6,padding:'10px 14px',marginBottom:16,fontSize:13}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:14,textAlign:'left'}}>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              style={{width:'100%',marginTop:5,padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}
              placeholder="your@email.com" required/>
          </div>
          <div style={{marginBottom:20,textAlign:'left'}}>
            <label style={{fontSize:11,color:'#5A6072',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              style={{width:'100%',marginTop:5,padding:'9px 12px',border:'1.5px solid #D8D7C0',borderRadius:6,fontSize:14,outline:'none',background:'#F5F4DF',boxSizing:'border-box'}}
              placeholder="••••••••" required/>
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%',background:'#007AE5',color:'#fff',border:'none',borderRadius:7,padding:'11px',fontSize:14,fontWeight:600,cursor:'pointer'}}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

