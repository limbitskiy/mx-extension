import { changeSetting, settingsStore } from "@/store";
import Button from "./Button";
import { toast } from "sonner";

interface RegisterBlockProps {
  //   onClose?: () => void;
}

interface Settings {
  registered: boolean;
}

const RegisterBlock: React.FC<RegisterBlockProps> = () => {
  const [settings, setSettings] = useState<Settings>();

  useEffect(() => {
    (async () => {
      const settings = await settingsStore.getValue();
      setSettings(settings);
    })();
  }, []);

  const unwatch = settingsStore.watch((settings) => {
    setSettings(settings);
  });

  const onRegister = async () => {
    await changeSetting({ registered: true });
    toast.success("Discount Extension", { description: "You have successfuly registered" });
  };

  return (
    <>
      {!settings?.registered && (
        <div className="flex flex-col gap-2 mt-2 border border-[#f7b3b5] p-4 rounded bg-[#ff000014]">
          <span className="text-xs text-black">
            You are not registered yet. It's free. Please register to unlock all features.
          </span>
          <Button secondary onClick={onRegister}>
            Register
          </Button>
        </div>
      )}
    </>
  );
};

export default RegisterBlock;
