import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { FaUsers, FaBook, FaUserCheck, FaWallet, FaPlus } from 'react-icons/fa';

const data = [
  { name: 'Jan', books: 30 },
  { name: 'Feb', books: 50 },
  { name: 'Mar', books: 70 },
  { name: 'Apr', books: 50 },
  { name: 'May', books: 100 },
  { name: 'Jun', books: 90 },
  { name: 'Jul', books: 140 },
  { name: 'Aug', books: 130 },
  { name: 'Sep', books: 170 },
];

const recentClients = [
  { id: 1, name: 'EduBooks', status: 'Active', date: 'Sep 20, 2026' },
  { id: 2, name: 'StoryMakers', status: 'Active', date: 'Sep 18, 2026' },
  { id: 3, name: 'Knowledge Hub', status: 'Trial', date: 'Sep 15, 2026' },
  { id: 4, name: 'Readify', status: 'Active', date: 'Sep 12, 2026' },
];

const recentActivity = [
  { id: 1, type: 'client', title: 'New client registered', desc: 'EduBooks joined the platform', time: '2 hours ago', icon: <FaUsers className="text-blue-500" />, bg: 'bg-blue-100' },
  { id: 2, type: 'book', title: 'Book generated', desc: '100 pages - Fantasy Book', time: '4 hours ago', icon: <FaBook className="text-emerald-500" />, bg: 'bg-emerald-100' },
  { id: 3, type: 'update', title: 'Client updated', desc: 'StoryMakers updated plan', time: '6 hours ago', icon: <FaUserCheck className="text-green-500" />, bg: 'bg-green-100' },
  { id: 4, type: 'client', title: 'New client registered', desc: 'Readify joined the platform', time: '1 day ago', icon: <FaUsers className="text-orange-500" />, bg: 'bg-orange-100' },
];

export default function Dashboard() {
  return (
    <div className="w-full space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Roboto', sans-serif" }}>Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm text-sm font-medium text-gray-700 flex items-center gap-2">
          <span>Sep 23, 2026</span>
          <span className="text-gray-400">▼</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FaUsers className="text-xl" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">↑ 12%</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Clients</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">24</h3>
            <p className="text-xs text-gray-400 mt-1">Active businesses</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FaBook className="text-xl" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">↑ 28%</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Books Generated</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">1,482</h3>
            <p className="text-xs text-gray-400 mt-1">Across all clients</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FaUserCheck className="text-xl" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">↑ 8%</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Active Clients</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">18</h3>
            <p className="text-xs text-gray-400 mt-1">Currently active</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <FaWallet className="text-xl" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">↑ 16%</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Revenue</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">$3,240</h3>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Book Generation Trend</h2>
            <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600">
              Last 9 Months ▼
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="books" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBooks)" activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="space-y-4 flex-1">
            <button className="w-full bg-[#18754b] hover:bg-[#0B4F35] text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
              <FaPlus /> Add New Client
            </button>
            
            <button className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-semibold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
              <FaUsers /> View All Clients
            </button>
            
            <button className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-semibold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
               Platform Settings
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Clients Table */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Clients</h2>
            <a href="#" className="text-sm font-semibold text-emerald-600 hover:underline">View All</a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">#</th>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg">Joined On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-gray-500">{client.id}</td>
                    <td className="px-4 py-4 font-semibold text-gray-900">{client.name}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        client.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{client.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <a href="#" className="text-sm font-semibold text-emerald-600 hover:underline">View All</a>
          </div>

          <div className="space-y-6">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.bg}`}>
                  {act.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-sm">{act.title}</h4>
                    <span className="text-xs text-gray-400">{act.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
