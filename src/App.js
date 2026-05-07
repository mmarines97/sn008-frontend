import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Stock from './pages/Stock';

function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div style={{minHeight:'100vh',background:'#F5F4DF',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#F5F4DF',borderBottom:'1px solid #D8D7C0',height:54,display:'flex',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
        <div style={{padding:'0 20px',borderRight:'1px solid #D8D7C0',height:'100%',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:22,fontWeight:700,color:'#007AE5',letterSpacing:3}}>SN008</span>
        </div>
        <nav style={{display:'flex',height:'100%',flex:1}}>
          <Link to="/stock" style={{display:'flex',alignItems:'center',padding:'0 16px',color:'#5A6072',textDecoration:'none',fontSize:13,fontWeight:500,borderBottom:'2px solid transparent'}}>
            Stock
          </Link>
        </nav>
        <div style={{padding:'0 16px',display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:13,color:'#5A6072'}}>{user?.name}</span>
          <button onClick={logout} style={{background:'none',border:'1px solid #D8D7C0',borderRadius:6,color:'#5A6072',fontSize:12,padding:'5px 10px',cursor:'pointer'}}>
            Logout
          </button>
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
      <Route path="/login" element={user ? <Navigate to="/stock" /> : <Login />} />
      <Route path="/stock" element={<PrivateRoute><Layout><Stock /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to={user ? "/stock" : "/login"} />} />
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
