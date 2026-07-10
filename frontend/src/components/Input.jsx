import React from "react";
import clsx from "clsx";

export const Input = React.forwardRef(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 mb-4">
        {label && (
          <label className="text-sm font-semibold text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2",
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200",
            className,
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500 font-medium">
            {error.message}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
