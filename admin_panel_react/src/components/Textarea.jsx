// src/components/Textarea.jsx
import React from 'react'

const Textarea = ({ label, value, onChange, rows = 3, placeholder = '', required = false }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea
            className="mt-1 p-2 w-full border rounded"
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            required={required}
        />
    </div>
)

export default Textarea
