import clsx from "clsx";

interface ButtonProps {
  children: string;
  secondary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, secondary, disabled, onClick }) => {
  return (
    <button
      className={clsx(
        `w-full rounded cursor-pointer h-8 text-sm`,
        secondary
          ? "border border-neutral-300 bg-[#454545] text-white hover:bg-[#555555]"
          : "bg-green-500 text-white hover:bg-green-400"
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
