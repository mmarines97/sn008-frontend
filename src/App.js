import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Issue from './pages/Issue';
import Log from './pages/Log';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navItem = (to, label) => (
    <Link to={to} style={{display:'flex',alignItems:'center',padding:'0 16px',color:location.pathname===to?'#007AE5':'#5A6072',textDecoration:'none',fontSize:13,fontWeight:location.pathname===to?600:500,borderBottom:location.pathname===to?'2px solid #007AE5':'2px solid transparent',height:'100%',whiteSpace:'nowrap'}}>
      {label}
    </Link>
  );
  return (
    <div style={{minHeight:'100vh',background:'#F5F4DF',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#F5F4DF',borderBottom:'1px solid #D8D7C0',height:54,display:'flex',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
        <div style={{padding:'0 20px',borderRight:'1px solid #D8D7C0',height:'100%',display:'flex',alignItems:'center'}}>
          <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:22,fontWeight:700,color:'#007AE5',letterSpacing:3}}>SN008</span>
        </div>
        <nav style={{display:'flex',height:'100%',flex:1,overflowX:'auto'}}>
          {navItem('/dashboard','Dashboard')}
          {navItem('/stock','Stock')}
          {navItem('/issue','Issue Part')}
          {navItem('/log','Log')}
        </nav>
        <div style={{padding:'0 16px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
          <span style={{fontSize:13,color:'#5A6072'}}>{user?.name}</span>
          <button onClick={logout} style={{background:'none',border:'1px solid #D8D7C0',borderRadius:6,color:'#5A6072',fontSize:12,padding:'5px 10px',cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/stock" element={<PrivateRoute><Layout><Stock /></Layout></PrivateRoute>} />
      <Route path="/issue" element={<PrivateRoute><Layout><Issue /></Layout></PrivateRoute>} />
      <Route path="/log" element={<PrivateRoute><Layout><Log /></Layout></PrivateRoute>} />
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
