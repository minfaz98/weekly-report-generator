import React, { useState } from "react";
import { Input } from "./Input";
import { HiEye, HiEyeOff } from "react-icons/hi";

export const PasswordInput = React.forwardRef(
  ({ label, error, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="relative w-full">
        <Input
          type={show ? "text" : "password"}
          label={label}
          error={error}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 transition-colors"
        >
          {show ? <HiEyeOff size={20} /> : <HiEye size={20} />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
