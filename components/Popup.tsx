import Button from "./ui/Button";
import Input from "./ui/Input";
import { changeSetting, folderStore, settingsStore } from "@/store";
import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { useEffect } from "react";
import { Folder } from "@/types";
import ListItem from "./ui/ListItem";
import { isMatch } from "@/entrypoints/content/utils";
import { addItem } from "@/entrypoints/content/api";
import RegisterBlock from "./ui/RegisterBlock";

interface PopupProps {
  onClose?: () => void;
  embedded?: boolean;
}

interface Settings {
  registered: boolean;
}

const Popup: React.FC<PopupProps> = ({ onClose, embedded }) => {
  const [input, setInput] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [settings, setSettings] = useState<Settings>();
  const [match, setMatch] = useState(false);

  useEffect(() => {
    (async () => {
      const folders = await folderStore.getValue();
      setFolders(folders);

      const settings = await settingsStore.getValue();
      setSettings(settings);

      let href = location.href;

      if (!embedded) {
        href = await browser.runtime.sendMessage({ type: "getActiveTabUrl" });
      }

      const match = await isMatch(href);
      setMatch(match);
    })();
  }, []);

  const unwatchFolders = folderStore.watch((value) => {
    setFolders(value);
  });

  const unwatchSettings = settingsStore.watch((value) => {
    setSettings(value);
  });

  const addLink = () => {
    if (!embedded) {
      browser.runtime.sendMessage({ type: "addItem" });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!match && (
        <div>
          <span>⚠️ Domain is not registered. But you can track it anyway.</span>
        </div>
      )}

      {/* {!embedded && <Button onClick={addLink}>Start Tracking</Button>} */}
      {!embedded && match && <Button onClick={addLink}>Track Product</Button>}
      {!embedded && !match && <Button onClick={addLink}>Start Tracking Anyway</Button>}

      <div className="flex flex-col gap-2 max-h-[300px] overflow-auto">
        {folders.map((folder) => (
          <ListItem key={folder.id} text={folder.name} />
        ))}

        {!folders.length && (
          <span className="text-neutral-400 text-sm font-normal mt-4">
            Your tracked links will be here. Press 'Start Tracking' on a product page that you want to track
          </span>
        )}
      </div>
      {/* <Input
          label="Label"
          placeholder="Please enter a value"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        /> */}

      {!settings?.registered && <RegisterBlock />}
    </div>
  );
};

export default Popup;
