"use client";

import { forwardRef } from "react";
import { PhoneInput as IntlPhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

export const PhoneInput = forwardRef(
  (
    { label, required, error, value, onChange, name, onBlur, ...props },
    ref,
  ) => {
    return (
      <div className="w-full">
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="mt-1">
          <IntlPhoneInput
            defaultCountry="bd"
            value={value || ""}
            onChange={(phone) => {
              // FIX: send value manually to react-hook-form
              onChange({
                target: {
                  name,
                  value: phone,
                },
              });
            }}
            onBlur={onBlur}
            inputRef={ref}
            inputProps={{
              name,
            }}
            className="w-full"
            inputClassName={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              error
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-yellow-400"
            }`}
            countrySelectorStyleProps={{
              buttonClassName:
                "border border-gray-300 rounded-lg px-2 py-2 bg-gray-100",
            }}
            {...props}
          />
        </div>

        {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";
