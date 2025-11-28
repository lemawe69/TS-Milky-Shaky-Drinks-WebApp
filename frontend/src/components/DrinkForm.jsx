import React from 'react'

export default function DrinkForm({ item, index, lookups, onUpdate, onRemove }) {
  return (
    <div className="p-6 bg-paper rounded-xl border border-primary/20 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-primary">Drink #{index + 1}</h3>
        {onRemove && (
          <button 
            onClick={onRemove} 
            className="text-red-400 hover:text-red-300 transition"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Flavour</label>
          <select
            value={item.flavour}
            onChange={(e) => onUpdate('flavour', e.target.value)}
            className="w-full px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="">Select flavour</option>
            {lookups.flavours?.map(f => (
              <option key={f.id} value={f.key}>{f.key}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Consistency</label>
          <select
            value={item.consistency}
            onChange={(e) => onUpdate('consistency', e.target.value)}
            className="w-full px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="">Select consistency</option>
            {lookups.consistencies?.map(c => (
              <option key={c.id} value={c.key}>{c.key}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Topping</label>
          <select
            value={item.topping}
            onChange={(e) => onUpdate('topping', e.target.value)}
            className="w-full px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="">Select topping</option>
            {lookups.toppings?.map(t => (
              <option key={t.id} value={t.key}>{t.key}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Quantity</label>
          <input
            type="number"
            min="1"
            max="10"
            value={item.qty}
            onChange={(e) => onUpdate('qty', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-deep border border-primary/30 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  )
}
