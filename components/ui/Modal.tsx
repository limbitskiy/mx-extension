import { ReactNode } from "react";
import { IoIosClose } from "react-icons/io";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => {
  return (
    <div className="w-[300px] min-h-[200px] p-4 bg-[#EDF0F8] rounded relative">
      {onClose && (
        <div className="flex justify-end absolute top-2 right-2">
          <button className="bg-none border-0 cursor-pointer hover:bg-neutral-100 rounded" onClick={onClose}>
            <IoIosClose size={20} color="grey" />
          </button>
        </div>
      )}

      <h1 className="text-lg text-black font-semibold leading-6">{title}</h1>

      <div className="mt-4 flex flex-col gap-2">{children}</div>
    </div>
  );
};

export default Modal;
