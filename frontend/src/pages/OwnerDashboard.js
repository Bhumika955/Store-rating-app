import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('ASC');

  const fetchStores = useCallback(async () => {
    const res = await API.get(`/stores?search=${search}&sortBy=name&order=${sortOrder}`);
    setStores(res.data);
  }, [search, sortOrder]);

  useEffect(() => { 
    fetchStores(); 
  }, [fetchStores]);

  const handleRate = async (storeId, rating) => {
    await API.post(`/stores/${storeId}/rating`, { rating });
    fetchStores();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search by store name or address..."
          className="border rounded-lg px-4 py-2 w-full max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
          className="text-sm border rounded-lg px-4 py-2 hover:bg-slate-50"
        >
          Sort: Name ({sortOrder})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map(store => (
          <div key={store.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{store.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{store.address}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Overall Rating:</span>
                <span className="font-bold text-amber-500">⭐ {store.overall_rating || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <span className="text-xs text-slate-500 block mb-2">
                {store.my_rating ? `Your Rating: ${store.my_rating} / 5 (Click to change)` : 'Submit your rating:'}
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(store.id, star)}
                    className={`px-3 py-1 rounded text-sm font-semibold border ${
                      store.my_rating === star ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {star} ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}