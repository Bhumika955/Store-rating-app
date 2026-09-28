import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'

  // User Filter & Sort States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');

  // Form States
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', address: '', password: '', role: 'USER' });
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get(`/admin/users?search=${search}&role=${roleFilter}&sortBy=${sortBy}&order=${order}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [search, roleFilter, sortBy, order]);

  const fetchStores = useCallback(async () => {
    try {
      const res = await API.get(`/stores?search=${search}&sortBy=name&order=${order}`);
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [search, order]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else fetchStores();
  }, [activeTab, fetchUsers, fetchStores]);

  const handleAddStore = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    try {
      await API.post('/admin/stores', newStore);
      setMsg('Store added successfully!');
      setNewStore({ name: '', email: '', address: '' });
      fetchStats();
      if (activeTab === 'stores') fetchStores();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error creating store');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    try {
      await API.post('/admin/users', newUser);
      setMsg('User created successfully!');
      setNewUser({ name: '', email: '', address: '', password: '', role: 'USER' });
      fetchStats();
      fetchUsers();
    } catch (err) {
      const errList = err.response?.data?.errors;
      if (errList && errList.length > 0) {
        setErrorMsg(errList[0].msg);
      } else {
        setErrorMsg(err.response?.data?.message || 'Error creating user');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Users</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Stores</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">{stats.totalStores}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Ratings</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">{stats.totalRatings}</p>
        </div>
      </div>

      {/* Notifications */}
      {msg && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl font-medium">{msg}</div>}
      {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">{errorMsg}</div>}

      {/* Admin Action Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Store */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-3">Add New Store</h3>
          <form onSubmit={handleAddStore} className="space-y-3">
            <input
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="Store Name"
              required
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            />
            <input
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="Store Email"
              type="email"
              required
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
            />
            <input
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="Store Address"
              required
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
            />
            <button type="submit" className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800">
              Create Store
            </button>
          </form>
        </div>

        {/* Add User (Admin / Normal) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-3">Add New User</h3>
          <form onSubmit={handleAddUser} className="space-y-3">
            <input
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="Full Name (20-60 chars)"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full border rounded-lg p-2.5 text-sm"
                placeholder="Email"
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <select
                className="border rounded-lg p-2.5 text-sm"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="USER">Normal User</option>
                <option value="ADMIN">Admin</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
            <input
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="Password (8-16 chars, 1 uppercase, 1 special)"
              type="password"
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <input
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="Address (Max 400 chars)"
              required
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            />
            <button type="submit" className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700">
              Create User
            </button>
          </form>
        </div>
      </div>

      {/* Tabs & Listing */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-4 text-sm font-semibold rounded-t-lg transition ${
              activeTab === 'users' ? 'bg-white border-t-2 border-indigo-600 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`py-2 px-4 text-sm font-semibold rounded-t-lg transition ${
              activeTab === 'stores' ? 'bg-white border-t-2 border-indigo-600 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Registered Stores ({stores.length})
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <input
            type="text"
            placeholder={activeTab === 'users' ? "Search users by name, email, or address..." : "Search stores..."}
            className="border rounded-lg px-3 py-2 text-sm w-full sm:w-80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex gap-2">
            {activeTab === 'users' && (
              <select
                className="border rounded-lg px-3 py-2 text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
                <option value="STORE_OWNER">STORE_OWNER</option>
              </select>
            )}
            <button
              onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}
              className="border rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
            >
              Order: {order}
            </button>
          </div>
        </div>

        {/* Tables */}
        {activeTab === 'users' ? (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 uppercase text-xs">
              <tr>
                <th className="p-3.5 cursor-pointer" onClick={() => setSortBy('name')}>Name ↕</th>
                <th className="p-3.5 cursor-pointer" onClick={() => setSortBy('email')}>Email ↕</th>
                <th className="p-3.5 cursor-pointer" onClick={() => setSortBy('address')}>Address ↕</th>
                <th className="p-3.5 cursor-pointer" onClick={() => setSortBy('role')}>Role ↕</th>
                <th className="p-3.5">Store Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-medium text-slate-900">{u.name}</td>
                  <td className="p-3.5">{u.email}</td>
                  <td className="p-3.5">{u.address}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'STORE_OWNER' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {u.role === 'STORE_OWNER' ? (u.rating ? `⭐ ${u.rating}` : 'No ratings') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 uppercase text-xs">
              <tr>
                <th className="p-3.5">Store Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Address</th>
                <th className="p-3.5">Overall Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-medium text-slate-900">{s.name}</td>
                  <td className="p-3.5">{s.email}</td>
                  <td className="p-3.5">{s.address}</td>
                  <td className="p-3.5 font-bold text-amber-500">⭐ {s.overall_rating || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}