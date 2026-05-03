import { forwardRef } from "react";

export const Select = forwardRef(
  ({ label, required, options = [], error, placeholder, ...props }, ref) => {
    return (
      <div>
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <select
          ref={ref}
          {...props}
          className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
            ${
              error
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-yellow-400"
            }`}
        >
          <option value="">{placeholder || "Choose option"}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
