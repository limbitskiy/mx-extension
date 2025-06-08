import { CiBoxList } from "react-icons/ci";
import { GoPlus } from "react-icons/go";

interface LinkObject {
  url: string;
  html: string;
  title: string;
}

interface FloatingButtonProps {
  onTogglePopup: () => void;
  onAddLink: (link: LinkObject) => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onTogglePopup, onAddLink }) => {
  const addLink = () => {
    onAddLink({
      url: location?.href,
      html: document.body.innerHTML,
      title: document.title,
    });
  };
  return (
    <div className="" style={buttonCntStyles}>
      <button className="" onClick={onTogglePopup} style={{ ...buttonStyles, backgroundColor: "black" }}>
        <CiBoxList size={28} />
      </button>
      <button className="" onClick={addLink} style={{ ...buttonStyles, backgroundColor: "#3faf2a" }}>
        <GoPlus size={28} />
      </button>
    </div>
  );
};

const buttonStyles: React.CSSProperties = {
  backgroundColor: "#df4755",
  border: "none",
  borderRadius: ".5rem",
  padding: "0.2rem 0.3rem",
  color: "white",
  cursor: "pointer",
  outline: "none",
};

const buttonCntStyles: React.CSSProperties = {
  position: "fixed",
  right: 0,
  top: "50%",
  zIndex: 9999999,
  display: "flex",
  flexDirection: "column",
  gap: ".5rem",
  backgroundColor: "white",
  boxShadow: "0 0 10px 5px #0000001c",
  padding: "4px",
  borderRadius: ".5rem",
};

export default FloatingButton;
