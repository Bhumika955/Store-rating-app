import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState([]);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMsg('');
    try {
      await API.post('/auth/signup', form);
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMsg(err.response?.data?.message || 'Signup failed');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>
      
      {msg && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{msg}</p>}
      {errors.length > 0 && (
        <ul className="mb-4 text-xs text-red-600 bg-red-50 p-3 rounded list-disc pl-5 space-y-1">
          {errors.map((e, idx) => (
            <li key={idx}>{e.msg}</li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600">Full Name (20–60 chars)</label>
          <input
            className="w-full border rounded-lg p-2.5 mt-1 text-sm"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Email Address</label>
          <input
            className="w-full border rounded-lg p-2.5 mt-1 text-sm"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Address (Max 400 chars)</label>
          <textarea
            className="w-full border rounded-lg p-2.5 mt-1 text-sm"
            rows="2"
            maxLength={400}
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Password (8-16 chars, 1 uppercase, 1 special)</label>
          <input
            className="w-full border rounded-lg p-2.5 mt-1 text-sm"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition">
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-500">
        Already registered? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}