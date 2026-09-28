import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" replace />;
    
    // Normalize role string to uppercase without spaces
    const cleanRole = String(user.role || '').toUpperCase().trim();

    if (cleanRole === 'ADMIN') {
      return <AdminDashboard />;
    }
    if (cleanRole === 'STORE_OWNER') {
      return <OwnerDashboard />;
    }
    return <UserDashboard />;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600">RateHub</Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-slate-600">
                  {user.name} <span className="font-bold text-indigo-600">({user.role})</span>
                </span>
                <button 
                  onClick={handleLogout} 
                  className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-3">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Login</Link>
                <Link to="/signup" className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">Sign Up</Link>
              </div>
            )}
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />
            <Route path="/" element={getDashboard()} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}