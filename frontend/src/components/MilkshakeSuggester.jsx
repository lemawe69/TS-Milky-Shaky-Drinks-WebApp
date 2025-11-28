import React, { useState, useMemo } from 'react'

export default function MilkshakeSuggester({ lookups, onSuggestionsChange }) {
  const [allergies, setAllergies] = useState({
    dairy: false,
    nuts: false,
    gluten: false,
    vegan: false,
    vegetarian: false,
  })

  const suggestedOptions = useMemo(() => {
    const activeAllergies = Object.keys(allergies).filter(key => allergies[key])

    if (activeAllergies.length === 0) {
      return {
        flavours: lookups.flavours || [],
        toppings: lookups.toppings || [],
        consistency: lookups.consistency || [],
      }
    }

    const filterItems = (items) => {
      return items.filter(item => {
        const itemAllergies = item.allergies || []
        return !activeAllergies.some(allergy =>
          itemAllergies.includes(allergy)
        )
      })
    }

    return {
      flavours: filterItems(lookups.flavours || []),
      toppings: filterItems(lookups.toppings || []),
      consistency: lookups.consistency || [],
    }
  }, [allergies, lookups])

  const handleAllergyChange = (allergy) => {
    const updated = { ...allergies, [allergy]: !allergies[allergy] }
    setAllergies(updated)
    onSuggestionsChange(updated, suggestedOptions)
  }

  const activeAllergyCount = Object.values(allergies).filter(Boolean).length

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-primary">🥜 Allergy Assistant</h3>
        {activeAllergyCount > 0 && (
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {activeAllergyCount} selected
          </span>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4">
        Select allergies to get recommended milkshakes that are safe for you:
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {Object.entries({
          dairy: '🥛 Dairy-Free',
          nuts: '🥜 Nut-Free',
          gluten: '🌾 Gluten-Free',
          vegan: '🌱 Vegan',
          vegetarian: '🥬 Vegetarian',
        }).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleAllergyChange(key)}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
              allergies[key]
                ? 'bg-primary text-deep border border-primary'
                : 'bg-deep/50 text-gray-300 border border-primary/20 hover:border-primary/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeAllergyCount > 0 && (
        <div className="bg-deep/50 border border-primary/20 rounded p-3 text-sm text-gray-300">
          <p className="font-medium text-primary mb-2">
            ✓ Safe options available:
          </p>
          <ul className="space-y-1 text-xs">
            {suggestedOptions.flavours.length > 0 && (
              <li>• {suggestedOptions.flavours.length} safe flavour(s)</li>
            )}
            {suggestedOptions.toppings.length > 0 && (
              <li>• {suggestedOptions.toppings.length} safe topping(s)</li>
            )}
            {suggestedOptions.flavours.length === 0 && (
              <li className="text-red-400">⚠ No compatible flavours available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
