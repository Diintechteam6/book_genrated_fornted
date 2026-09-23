import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { API } from '../config';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, {
        email,
        password
      });

      if (response.data.success) {
        toast.success("Login successful!");
        // Save token and role to localStorage for authenticated requests later
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminRole', response.data.role);
        onLogin(); // Proceed to app
        navigate('/'); // Force redirect to Dashboard
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Main Large Card */}
      <div className="w-full max-w-5xl bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-2xl flex flex-col md:flex-row z-10 overflow-hidden border border-emerald-100 relative">
        
        {/* Left Side Container (Inside Card) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-4 md:pl-12 md:pr-4 lg:pl-16 lg:pr-8 relative">
          
          {/* Top: Logo and Features */}
          <div className="z-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <img src="/book.png" alt="BookGen AI Logo" className="h-14 lg:h-16 object-contain mix-blend-darken" />
              <div className="flex flex-col">
                <span className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Roboto', sans-serif" }}>BookGen <span className="text-emerald-700">AI</span></span>
              </div>
            </div>
            
            <p className="text-xl text-gray-700 font-semibold max-w-md leading-snug mb-8" style={{ fontFamily: "'Roboto', sans-serif" }}>
              Turn Ideas Into Books With AI
            </p>

            <ul className="space-y-4 text-gray-700 text-sm lg:text-base font-medium">
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-emerald-600 text-lg lg:text-xl" />
                AI Powered Book Creation
              </li>
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-emerald-600 text-lg lg:text-xl" />
                Multiple Genres & Languages
              </li>
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-emerald-600 text-lg lg:text-xl" />
                Easy & Fast
              </li>
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-emerald-600 text-lg lg:text-xl" />
                For Individuals, Businesses & Educators
              </li>
            </ul>
          </div>

          {/* Middle: Text Image */}
          <div className="z-10 mb-6">
            <img src="/image.png" alt="Create Publish Inspire" className="h-20 lg:h-28 object-contain mix-blend-darken" />
          </div>

          {/* Bottom Left: Robot Image */}
          <div className="z-10 mt-auto flex justify-center md:justify-start">
             <img src="/booton .png" alt="Robot reading book" className="w-64 lg:w-80 h-auto object-contain mix-blend-darken drop-shadow-xl" />
          </div>

        </div>

        {/* Right Side Container: Login Form (Inside Card) */}
        <div className="w-full md:w-1/2 flex items-center justify-center py-2 px-4 md:pl-4 md:pr-12 lg:pl-8 lg:pr-16 relative z-10">
          
          {/* Absolute Plant Image on Bottom Right (Inside the right side) */}
          <img 
            src="/image copy.png" 
            alt="Plant Decoration" 
            className="absolute -bottom-8 right-0 h-48 md:h-64 object-contain opacity-80 z-0 pointer-events-none mix-blend-darken"
          />

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 md:p-12 border border-gray-100 z-10 relative">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2" style={{ fontFamily: "'Roboto', sans-serif" }}>Welcome Back</h2>
              <p className="text-gray-500 text-sm font-medium">Login to your Super Admin Panel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 text-sm transition-all"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 text-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-800/70 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
              
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs font-medium text-gray-400">© 2026 BookGen AI. All rights reserved.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
