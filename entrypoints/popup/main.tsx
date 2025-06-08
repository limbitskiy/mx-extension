import "@/assets/styles/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import Popup from "@/components/Popup";
import Modal from "@/components/ui/Modal";

browser.runtime.sendMessage({ type: "closeUIPopup" });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Modal title="Discount Extension">
      <Popup />
    </Modal>
  </React.StrictMode>
);
