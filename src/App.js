import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Issue from './pages/Issue';
import Log from './pages/Log';
import QRCards from './pages/QRCards';
import Requests from './pages/Requests';
import API from './services/api';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'admin') {
      API.get('/returns').then(r => {
        setPendingCount(r.data.filter(x => x.status === 'pending').length);
      }).catch(()=>{});
    }
  }, [user, location.pathname]);

  const navItem = (to, label, badge) => (
    <Link to={to} style={{display:'flex',alignItems:'center',gap:6,padding:'0 16px',color:location.pathname===to?'#007AE5':'#5A6072',textDecoration:'none',fontSize:13,fontWeight:location.pathname===to?600:500,borderBottom:location.pathname===to?'2px solid #007AE5':'2px solid transparent',height:'100%',whiteSpace:'nowrap'}}>
      {label}
      {badge > 0 && <span style={{background:'#EB6110',color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:20,lineHeight:'16px'}}>{badge}</span>}
    </Link>
  );

  return (
    <div style={{minHeight:'100vh',background:'#F5F4DF',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#F5F4DF',borderBottom:'1px solid #D8D7C0',height:54,display:'flex',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
        <div style={{padding:'0 20px',borderRight:'1px solid #D8D7C0',height:'100%',display:'flex',alignItems:'center',gap:8}}>
          <svg height="28" viewBox="-30 -20 390 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#0E1620" d="M120.7,102.33C93.14,24.16,60.05,8.03,42.44,3.03-24.15-15.88-18.68,100.8,104.23,125.9c61.06,171.77,175.63,91.93,237.44-33.82,35.27-71.74,7.14-110.86-45.45-83.11-44.85,23.68-104.58,95.38-175.52,93.36h0ZM46.48,69.06c-28.23-34.41,12.77-75.97,52.13,32.19-11.6-3.12-32.51-8.26-52.13-32.19h0ZM128.34,126.69c84.18-3.24,150.62-93.48,179.04-87.31,43.65,9.48-114.71,279.75-179.04,87.31h0Z"/>
          </svg>
          <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:15,fontWeight:700,color:'#007AE5',letterSpacing:2}}>Margham</span>
        </div>
        <nav style={{display:'flex',height:'100%',flex:1,overflowX:'auto'}}>
          {navItem('/dashboard','Dashboard')}
          {navItem('/stock','Stock')}
          {navItem('/issue','Issue Part')}
          {navItem('/log','Log')}
          {navItem('/qrcards','QR Cards')}
          {user && user.role === 'admin' && navItem('/requests','Requests', pendingCount)}
        </nav>
        <div style={{padding:'0 16px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
          <span style={{fontSize:13,color:'#5A6072'}}>{user && user.name}</span>
          <span style={{fontSize:11,background:user&&user.role==='admin'?'#EAF3FC':'#F0EFD8',color:user&&user.role==='admin'?'#1C3F99':'#5A6072',padding:'2px 8px',borderRadius:20,fontWeight:600}}>{user && user.role}</span>
          <button onClick={logout} style={{background:'none',border:'1px solid #D8D7C0',borderRadius:6,color:'#5A6072',fontSize:12,padding:'5px 10px',cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div style={{minHeight:'100vh',background:'#F5F4DF',display:'flex',alignItems:'center',justifyContent:'center',color:'#5A6072'}}>Loading...</div>;
  return user ? children : <Navigate to="/login" state={{ from: location.pathname + location.search }} />;
}

function AppRoutes() {
  const { user, ready } = useAuth();
  if (!ready) return <div style={{minHeight:'100vh',background:'#F5F4DF',display:'flex',alignItems:'center',justifyContent:'center',color:'#5A6072'}}>Loading...</div>;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/stock" element={<PrivateRoute><Layout><Stock /></Layout></PrivateRoute>} />
      <Route path="/issue" element={<PrivateRoute><Layout><Issue /></Layout></PrivateRoute>} />
      <Route path="/log" element={<PrivateRoute><Layout><Log /></Layout></PrivateRoute>} />
      <Route path="/qrcards" element={<PrivateRoute><Layout><QRCards /></Layout></PrivateRoute>} />
      <Route path="/requests" element={<PrivateRoute><Layout><Requests /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

