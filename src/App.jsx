import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { FaBookOpen, FaBookBookmark, FaWandMagicSparkles, FaCheck } from 'react-icons/fa6';
import Generator from './pages/admin/Generator';
import Library from './pages/admin/Library';
import Login from './components/Login';
import AutoLogin from './components/AutoLogin';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Clients from './pages/admin/Clients';
import Profile from './pages/admin/Profile';
import './App.css';
import { API } from './config';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!(sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken')));

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminRole');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    setIsLoggedIn(false);
  };



  if (window.location.pathname === '/auto-login') {
    return <AutoLogin />;
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout onLogout={handleLogout} />}>
        <Route index element={<Dashboard />} />
        <Route path="generator" element={<Generator />} />
        <Route path="library" element={<Library />} />
        {(sessionStorage.getItem('adminRole') || localStorage.getItem('adminRole')) === 'admin' && (
          <Route path="clients" element={<Clients />} />
        )}
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="/auto-login" element={<AutoLogin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

