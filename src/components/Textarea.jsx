import { forwardRef } from "react";

export const Textarea = forwardRef(
  ({ label, required, error, ...props }, ref) => {
    return (
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <textarea
          ref={ref}
          rows="3"
          {...props}
          className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2
            ${
              error
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-yellow-400"
            }`}
        />

        {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
