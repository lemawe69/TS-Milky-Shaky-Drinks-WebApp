import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function LookupManager() {
  const [rows, setRows] = useState([]);
  const [type, setType] = useState("flavour");
  const [form, setForm] = useState({ key: "", value: "", active: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ key: "", value: "", active: true });

  async function load() {
    try {
      const res = await api.get(`/lookups?type=${type}`);
      setRows(res.data);
    } catch (err) {
      setError("Failed to load lookups");
    }
  }

  useEffect(() => {
    load();
  }, [type]);

  async function create() {
    try {
      setError("");
      setSuccess("");
      if (!form.key || form.value === "") {
        setError("All fields are required");
        return;
      }
      await api.post("/lookups", { ...form, type });
      setForm({ key: "", value: "", active: true });
      setSuccess("Item added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create item");
    }
  }

  function startEdit(row) {
    setEditingId(row.id);
    setEditForm({ key: row.key, value: row.value, active: row.active });
  }

  async function saveEdit(id) {
    try {
      setError("");
      setSuccess("");
      if (!editForm.key || editForm.value === "") {
        setError("All fields are required");
        return;
      }
      await api.put(`/lookups/${id}`, { 
        ...editForm, 
        type 
      });
      setEditingId(null);
      setSuccess("Item updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (err) {
      setError("Failed to update item");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ key: "", value: "", active: true });
  }

  async function remove(id) {
    if (!confirm("Delete this item? This action cannot be undone.")) return;
    try {
      setError("");
      setSuccess("");
      await api.delete(`/lookups/${id}`);
      setSuccess("Item deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (err) {
      setError("Failed to delete item");
    }
  }

  const getTypeLabel = (t) => {
    switch(t) {
      case 'flavour': return '🥤 Flavours';
      case 'consistency': return '🍶 Consistency';
      case 'topping': return '🍫 Toppings';
      case 'config': return '⚙️ Settings';
      default: return t;
    }
  };

  const getPlaceholders = () => {
    switch(type) {
      case 'flavour': return { key: 'e.g., Vanilla', value: 'Price' };
      case 'consistency': return { key: 'e.g., Thick', value: 'Price' };
      case 'topping': return { key: 'e.g., Whipped Cream', value: 'Price' };
      case 'config': return { key: 'Setting name', value: 'Value' };
      default: return { key: 'Key', value: 'Value' };
    }
  };

  const isConfig = type === 'config';
  const ph = getPlaceholders();

  return (
    <div className="space-y-6">
      
      <div className="bg-paper/80 rounded-xl border border-primary/30 p-6">
        <h3 className="text-2xl font-bold text-primary mb-4">📝 Product Manager</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500 text-green-400 rounded-lg">
            ✓ {success}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-gray-300">
            Select Category
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-deep border border-primary/30 rounded-lg text-white font-medium focus:outline-none focus:border-primary text-sm sm:text-base"
          >
            <option value="flavour">🥤 Flavours</option>
            <option value="consistency">🍶 Consistency</option>
            <option value="topping">🍫 Toppings</option>
            <option value="config">⚙️ Settings</option>
          </select>
        </div>

        <h4 className="text-lg font-bold text-primary mb-4">Add New {getTypeLabel(type).split(' ')[1]}</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <input
            placeholder={ph.key}
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            className="px-3 sm:px-4 py-2 bg-deep border border-primary/30 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-primary"
          />
          <div className="flex items-center gap-2">
            {!isConfig && <span className="text-gray-500">R</span>}
            <input
              placeholder={ph.value}
              type="number"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="px-3 sm:px-4 py-2 bg-deep border border-primary/30 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-primary flex-1"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-5 h-5 rounded cursor-pointer"
            />
            <span>Active (Available to users)</span>
          </label>
        </div>

        <button
          onClick={create}
          className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-deep rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition"
        >
          ➕ Add New Item
        </button>
      </div>

    
      <div className="bg-paper/80 rounded-xl border border-primary/30 p-6">
        <h4 className="text-xl font-bold text-primary mb-4">Current {getTypeLabel(type)}</h4>
        
        {rows.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-400">No items yet. Add your first one above!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-4 bg-deep/50 rounded-lg border border-primary/10 hover:border-primary/30 transition gap-2 sm:gap-3"
              >
                {editingId === row.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center w-full">
                    <input
                      type="text"
                      value={editForm.key}
                      onChange={(e) => setEditForm({ ...editForm, key: e.target.value })}
                      className="px-2 sm:px-3 py-1 sm:py-2 bg-deep border border-primary/30 rounded text-white text-xs sm:text-sm flex-1 focus:outline-none focus:border-primary"
                      placeholder="Item name"
                    />
                    <span className="text-gray-500 text-xs hidden sm:block">→</span>
                    <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
                      {!isConfig && <span className="text-gray-500 text-xs sm:text-sm">R</span>}
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.value}
                        onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                        className="px-2 sm:px-3 py-1 sm:py-2 bg-deep border border-primary/30 rounded text-white text-xs sm:text-sm w-full sm:w-24 focus:outline-none focus:border-primary"
                        placeholder="Value"
                      />
                    </div>
                    <label className="flex items-center gap-1 sm:gap-2 text-gray-300 text-xs sm:text-sm min-w-fit">
                      <input
                        type="checkbox"
                        checked={editForm.active}
                        onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                        className="w-3 sm:w-4 h-3 sm:h-4 rounded cursor-pointer"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-3">
                      <strong className="text-primary text-sm sm:text-lg">{row.key}</strong>
                      <span className="text-gray-500 text-xs hidden sm:block">→</span>
                      <span className="text-gray-300 font-mono text-xs sm:text-sm">{isConfig ? '' : 'R'} {parseFloat(row.value).toFixed(isConfig ? 0 : 2)}</span>
                      {!row.active && <span className="text-xs text-gray-500 bg-gray-600/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">(Inactive)</span>}
                    </div>
                  </div>
                )}
                <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                  {editingId === row.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(row.id)}
                        className="px-2 sm:px-3 py-1 bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 rounded text-xs sm:text-sm font-medium transition flex-1 sm:flex-none"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 sm:px-3 py-1 bg-gray-600/20 border border-gray-600 text-gray-400 hover:bg-gray-600/30 rounded text-xs sm:text-sm font-medium transition flex-1 sm:flex-none"
                      >
                        ✕ Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(row)}
                        className="px-2 sm:px-3 py-1 bg-blue-500/20 border border-blue-500 text-blue-400 hover:bg-blue-500/30 rounded text-xs sm:text-sm font-medium transition flex-1 sm:flex-none"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => remove(row.id)}
                        className="px-2 sm:px-3 py-1 bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30 rounded text-xs sm:text-sm font-medium transition flex-1 sm:flex-none"
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
