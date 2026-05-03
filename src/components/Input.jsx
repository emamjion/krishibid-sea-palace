const Input = ({ label, error, required, suffix, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          {...props}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 pr-14
          ${
            error
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-yellow-300"
          }
          ${props.readOnly ? "bg-gray-100 cursor-not-allowed" : ""}
          `}
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-medium">
            {suffix}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};

export { Input };
