import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaBookOpen, FaUsers, FaChartPie, FaBell, FaSearch, FaUserCircle, FaBars, FaSignOutAlt, FaPalette } from 'react-icons/fa';
import { FaWandMagicSparkles, FaBookBookmark } from 'react-icons/fa6';

export default function AdminLayout({ onLogout }) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentRole = sessionStorage.getItem('adminRole') || localStorage.getItem('adminRole') || 'Admin';
  const roleDisplay = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
  const roleInitials = roleDisplay.substring(0, 2).toUpperCase();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0B4F35] text-white flex flex-col hidden md:flex shrink-0 shadow-xl z-20 transition-all duration-300`}>
        <div className={`p-6 flex items-center border-b border-white/10 ${isCollapsed ? 'justify-center px-4' : 'gap-3'}`}>
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/book.png" alt="BookGen Logo" className="w-full h-full object-contain p-1" />
          </div>
          {!isCollapsed && (
            <span className="text-2xl font-extrabold tracking-tight whitespace-nowrap overflow-hidden" style={{ fontFamily: "'Roboto', sans-serif" }}>
              BookGen <span className="text-emerald-300">AI</span>
            </span>
          )}
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          <NavLink 
            to="/" 
            end
            title="Dashboard"
            className={({ isActive }) => 
              `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl transition-all font-medium ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`
            }
          >
            <FaChartPie className="text-lg shrink-0" /> 
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Dashboard</span>}
          </NavLink>

          {(sessionStorage.getItem('adminRole') || localStorage.getItem('adminRole')) === 'client' && (
            <>
              <NavLink 
                to="/generator" 
                title="Book Generator"
                className={({ isActive }) => 
                  `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl transition-all font-medium ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`
                }
              >
                <FaWandMagicSparkles className="text-lg shrink-0" /> 
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Book Generator</span>}
              </NavLink>

              <NavLink 
                to="/templates" 
                title="Templates Preview"
                className={({ isActive }) => 
                  `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl transition-all font-medium ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`
                }
              >
                <FaPalette className="text-lg shrink-0" /> 
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Templates Preview</span>}
              </NavLink>

              <NavLink 
                to="/library" 
                title="My Library"
                className={({ isActive }) => 
                  `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl transition-all font-medium ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`
                }
              >
                <FaBookBookmark className="text-lg shrink-0" /> 
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">My Library</span>}
              </NavLink>
            </>
          )}
          
          {(sessionStorage.getItem('adminRole') || localStorage.getItem('adminRole')) === 'admin' && (
            <NavLink 
              to="/clients" 
              title="Clients"
              className={({ isActive }) => 
                `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl transition-all font-medium ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`
              }
            >
              <FaUsers className="text-lg shrink-0" /> 
              {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Clients</span>}
            </NavLink>
          )}
          
          <NavLink 
            to="/profile" 
            title="Profile"
            className={({ isActive }) => 
              `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl transition-all font-medium ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`
            }
          >
            <FaUserCircle className="text-lg shrink-0" /> 
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Profile</span>}
          </NavLink>
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-white/20 mt-2">
          <button 
            onClick={handleLogoutClick}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl transition-all font-medium text-red-200 hover:bg-red-500/20 hover:text-white cursor-pointer`}
            title="Logout"
          >
            <FaSignOutAlt className="text-lg shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0 shadow-sm transition-all">
          
          {/* Left Spacer / Mobile Menu Area & Toggle Button */}
          <div className="flex-1 flex items-center">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2.5 mr-4 text-gray-500 hover:text-[#0B4F35] bg-gray-50 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <FaBars className="text-lg" />
            </button>
          </div>

          {/* Right Section: Profile */}
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-3 cursor-pointer p-1.5 pr-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm" 
              onClick={() => navigate('/profile')}
            >
              <div className="w-9 h-9 bg-emerald-800 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-inner">
                {roleInitials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-bold text-gray-900 leading-none">{roleDisplay}</span>
                <span className="text-[11px] text-gray-500 mt-0.5 capitalize">{currentRole} Account</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#F4F7F6] p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
