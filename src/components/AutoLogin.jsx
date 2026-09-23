import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AutoLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role');

    if (token) {
      sessionStorage.setItem('adminToken', token);
      if (role) {
        sessionStorage.setItem('adminRole', role);
      }
      // Give a tiny delay for localStorage to settle before redirecting
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mb-4"></div>
      <h2 className="text-xl font-bold text-gray-700">Logging you in...</h2>
      <p className="text-gray-500">Please wait while we set up your session.</p>
    </div>
  );
}
