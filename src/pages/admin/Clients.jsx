import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaSearch, FaTimes, FaEdit, FaTrash, FaPowerOff, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API } from '../../config';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'admin'
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client'
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken')}` }
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/users`, getAuthHeader());
      if (res.data.success) {
        setClients(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', email: '', password: '', role: 'client' });
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setIsEditing(true);
    setCurrentId(client._id);
    setFormData({ name: client.name, email: client.email, password: '', role: client.role });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password; // Don't update password if empty

        const res = await axios.put(`${API}/admin/users/${currentId}`, updateData, getAuthHeader());
        if (res.data.success) {
          toast.success('User updated successfully');
          fetchClients();
          closeModal();
        }
      } else {
        // Create user
        const res = await axios.post(`${API}/admin/register`, formData);
        if (res.data.success) {
          toast.success('User created successfully');
          fetchClients();
          closeModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await axios.delete(`${API}/admin/users/${id}`, getAuthHeader());
        if (res.data.success) {
          toast.success('User deleted successfully');
          setClients(clients.filter(c => c._id !== id));
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.patch(`${API}/admin/users/${id}/status`, {}, getAuthHeader());
      if (res.data.success) {
        toast.success(res.data.message);
        setClients(clients.map(c => c._id === id ? { ...c, status: res.data.data.status } : c));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleImpersonate = async (id) => {
    try {
      const res = await axios.get(`${API}/admin/users/${id}/impersonate`, getAuthHeader());
      if (res.data.success) {
        toast.success(`Logging in as ${res.data.message.split(' ')[1]}...`);
        const token = res.data.token;
        const role = res.data.role;
        // Open new tab with auto-login URL
        window.open(`/auto-login?token=${token}&role=${role}`, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to impersonate user');
    }
  };

  const filteredClients = clients.filter(client => 
    client.role === activeTab &&
    (client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full space-y-6 relative">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Roboto', sans-serif" }}>User Management</h1>
          <p className="text-gray-500 mt-1">View, add, edit, and manage system users and clients.</p>
        </div>
        <button onClick={openCreateModal} className="bg-[#18754b] hover:bg-[#0B4F35] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center gap-2">
          <FaPlus /> Add New User
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Tabs and Toolbar */}
        <div className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between">
          
          {/* Tabs */}
          <div className="flex px-4 pt-2">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'client' 
                  ? 'border-emerald-600 text-emerald-700' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'admin' 
                  ? 'border-emerald-600 text-emerald-700' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              Admins
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 sm:p-0 sm:py-3 sm:pr-6 flex items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Password</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined On</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">Loading users...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold overflow-hidden">
                          {client.profilePhoto ? (
                            <img src={API.replace('/api', '') + client.profilePhoto} alt={client.name} className="w-full h-full object-cover" />
                          ) : (
                            client.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className={`px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block ${
                          client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        {client.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                        {client.password || '******'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 uppercase text-xs">{client.role}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                      {client.role === 'client' && (
                        <button 
                          onClick={() => handleImpersonate(client._id)}
                          className="text-purple-600 hover:bg-purple-50 rounded-lg font-semibold p-2 transition-colors" 
                          title="Login as User (Impersonate)"
                        >
                          <FaSignInAlt />
                        </button>
                      )}
                      <button 
                        onClick={() => handleToggleStatus(client._id)} 
                        className={`font-semibold p-2 rounded-lg transition-colors ${
                          client.status === 'active' ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`} 
                        title={client.status === 'active' ? "Deactivate User" : "Activate User"}
                      >
                        <FaPowerOff />
                      </button>
                      <button onClick={() => openEditModal(client)} className="text-blue-600 hover:bg-blue-50 rounded-lg font-semibold p-2 transition-colors" title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(client._id)} className="text-red-500 hover:bg-red-50 rounded-lg font-semibold p-2 transition-colors" title="Delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">{isEditing ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors">
                <FaTimes size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Password {isEditing && <span className="text-xs font-normal text-gray-400">(Leave blank to keep current)</span>}</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required={!isEditing}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md transition-all">
                  {isEditing ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
