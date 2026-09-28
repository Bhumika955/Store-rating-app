import React, { useState } from 'react';
import API from '../api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {err && <p className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{err}</p>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="w-full border rounded-lg p-2.5 mt-1" type="email" required onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input className="w-full border rounded-lg p-2.5 mt-1" type="password" required onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition">Log In</button>
      </form>
    </div>
  );
}