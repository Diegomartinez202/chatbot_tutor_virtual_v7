import React from 'react';

const Input = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 p-2 w-full border rounded"
        />
    </div>
);

export default Input;
