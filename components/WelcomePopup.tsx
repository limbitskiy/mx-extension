import { changeSetting, settingsStore } from "@/store";
import Button from "./ui/Button";
import RegisterBlock from "./ui/RegisterBlock";

interface WelcomePopupProps {
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  const [noWelcome, setNoWelcome] = useState(false);

  const handleSubmit = async () => {
    if (noWelcome) {
      await changeSetting({ welcomePopup: false });
    }
    onClose();
  };

  return (
    <>
      <p className="text-sm font-normal text-neutral-500">
        This extension lets you track prices on any websites and get notifications on price changes
      </p>
      <RegisterBlock />
      <div className="flex gap-2">
        <input
          className="cursor-pointer"
          type="checkbox"
          checked={noWelcome}
          onChange={(e) => setNoWelcome(e.target.checked)}
        />
        <label className="text-xs text-normal text-neutral-500">Do not show welcome screen again</label>
      </div>
      <Button onClick={handleSubmit}>Got It!</Button>
    </>
  );
};

export default WelcomePopup;
