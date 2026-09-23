import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUserCircle, FaSave, FaLock, FaEnvelope, FaShieldAlt, FaCalendarAlt, 
  FaMapMarkerAlt, FaCircle, FaCamera, FaBook, FaShoppingCart, FaUsers, 
  FaChartLine, FaCheckCircle, FaEye, FaEyeSlash 
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API } from '../../config';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: 'Super Admin',
    email: 'admin@bookgen.com',
    role: 'ADMIN',
    joinedDate: 'Joined 12 Jan 2024',
    location: 'India',
    status: 'Active',
    phone: '+91 98765 43210',
    photo: ''
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef(null);

  const getAuthHeader = () => {
    return {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken')}` }
    };
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/admin/profile`, getAuthHeader());
      if (res.data.success) {
        const data = res.data.data;
        const joinedDate = new Date(data.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
        
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'client',
          joinedDate: `Joined ${joinedDate}`,
          location: data.location || '',
          status: data.status || 'active',
          phone: data.phone || '',
          photo: data.profilePhoto || ''
        });
      }
    } catch (err) {
      toast.error('Failed to load profile data');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API}/admin/profile`, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location
      }, getAuthHeader());
      
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        if (res.data.token) {
           localStorage.setItem('adminToken', res.data.token);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if(passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match!");
      return;
    }
    try {
      const res = await axios.put(`${API}/admin/change-password`, {
        oldPassword: passwords.current,
        newPassword: passwords.new
      }, getAuthHeader());

      if (res.data.success) {
        toast.success('Password changed successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await axios.post(`${API}/admin/profile/upload`, formData, {
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        toast.success('Profile photo updated!');
        setProfileData({ ...profileData, photo: res.data.photoUrl });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    }
  };

  return (
    <div className="w-full">
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>Admin Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and keep your information up to date.</p>
        </div>
        <div className="mt-4 md:mt-0 text-sm font-medium text-gray-500 flex items-center gap-2">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-semibold">Profile</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden">
            {/* Top Green Background */}
            <div className="h-32 bg-[#128C5E] w-full relative"></div>
            
            <div className="px-6 pb-6 relative -mt-16 text-center">
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/*" 
              />
              {/* Profile Image */}
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-[#128C5E] border-4 border-white shadow-md mx-auto overflow-hidden">
                  {profileData.photo ? (
                    <img src={API.replace('/api', '') + profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-[100px]" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-1 right-2 bg-[#128C5E] text-white p-2 rounded-full border-2 border-white shadow hover:bg-[#0B4F35] transition-colors"
                >
                  <FaCamera className="text-xs" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-3">{profileData.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{profileData.email}</p>
              
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-extrabold px-6 py-1.5 rounded-full uppercase tracking-widest inline-block mb-6">
                {profileData.role}
              </span>

              {/* Details List */}
              <div className="text-left space-y-3.5 mb-6 px-2">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <FaEnvelope className="text-gray-400 text-lg w-5" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <FaShieldAlt className="text-gray-400 text-lg w-5" />
                  <span className="capitalize">{profileData.role === 'admin' ? 'Super Admin' : 'Client'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <FaCalendarAlt className="text-gray-400 text-lg w-5" />
                  <span>{profileData.joinedDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <FaMapMarkerAlt className="text-gray-400 text-lg w-5" />
                  <span>{profileData.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <FaCircle className={`text-[10px] w-5 ${profileData.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`} />
                  <span className="capitalize">{profileData.status}</span>
                </div>
              </div>

              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full py-2.5 border border-gray-200 text-[#128C5E] font-bold rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 text-sm bg-gray-50"
              >
                <FaCamera /> Change Photo
              </button>
            </div>
          </div>

          {/* Account Stats Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/40 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                <FaChartLine className="text-[#128C5E]" /> Account Stats
              </div>
              <button className="text-[#128C5E] text-sm font-bold hover:underline">View All</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-50 text-[#128C5E] rounded-lg">
                  <FaBook />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-lg leading-none">12</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">Books Added</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-50 text-[#128C5E] rounded-lg">
                  <FaShoppingCart />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-lg leading-none">245</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">Total Orders</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-2">
                <div className="p-2.5 bg-emerald-50 text-[#128C5E] rounded-lg">
                  <FaUsers />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-lg leading-none">8,450</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">Total Users</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-2">
                <div className="p-2.5 bg-emerald-50 text-[#128C5E] rounded-lg">
                  <FaChartLine />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-lg leading-none">18</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">Active Today</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Forms) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 bg-white flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-[#128C5E]">
                <FaUserCircle className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Personal Information</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Update your basic profile details.</p>
              </div>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-800">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#128C5E] focus:border-transparent bg-white text-sm font-medium transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-800">Email Address</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#128C5E] focus:border-transparent bg-white text-sm font-medium transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-800">Phone Number</label>
                  <input 
                    type="text" 
                    value={profileData.phone}
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#128C5E] focus:border-transparent bg-white text-sm font-medium transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-800">Location</label>
                  <input 
                    type="text" 
                    value={profileData.location}
                    onChange={e => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#128C5E] focus:border-transparent bg-white text-sm font-medium transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="pt-6 flex justify-end">
                <button type="submit" className="bg-[#128C5E] hover:bg-[#0B4F35] text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md flex items-center gap-2 text-sm">
                  <FaSave /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg text-red-500">
                  <FaLock className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Security Settings</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Ensure your account is using a strong password.</p>
                </div>
              </div>
              <button className="bg-emerald-50 text-[#128C5E] border border-emerald-100 font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm">
                <FaLock /> Change Password
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Form Side */}
              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-bold text-gray-800">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      value={passwords.current}
                      onChange={e => setPasswords({...passwords, current: e.target.value})}
                      className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#128C5E] bg-white text-sm font-medium shadow-sm"
                      placeholder="Enter current password"
                      required
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-bold text-gray-800">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                      className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#128C5E] bg-white text-sm font-medium shadow-sm"
                      placeholder="Enter new password"
                      required
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-bold text-gray-800">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#128C5E] bg-white text-sm font-medium shadow-sm"
                      placeholder="Confirm new password"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="pt-2 flex justify-start">
                  <button type="submit" className="bg-[#128C5E] hover:bg-[#0B4F35] text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                    <FaLock /> Update Password
                  </button>
                </div>
              </form>

              {/* Requirements Side */}
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex flex-col justify-center">
                <div className="flex items-center gap-2 font-bold text-[#128C5E] mb-4">
                  <FaShieldAlt className="text-lg" /> Password Requirements
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <FaCheckCircle className="text-[#128C5E]" /> At least 8 characters
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <FaCheckCircle className="text-[#128C5E]" /> One uppercase letter (A-Z)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <FaCheckCircle className="text-[#128C5E]" /> One lowercase letter (a-z)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <FaCheckCircle className="text-[#128C5E]" /> One number (0-9)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <FaCheckCircle className="text-[#128C5E]" /> One special character (!@#$%)
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
