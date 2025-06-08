import { ChangeEvent } from "react";

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ label, placeholder, value, disabled, required, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="block font-medium text-sm">{label}</label>
      <input
        className="border border-neutral-300 rounded h-8 focus:outline-0 focus:ring-1 ring-sky-300 px-2 w-full text-sm"
        type="text"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        required={required}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
