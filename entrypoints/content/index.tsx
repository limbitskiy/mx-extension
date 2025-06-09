import "@/assets/styles/styles.css";
import "sonner/dist/styles.css";

import { ContentScriptContext } from "#imports";

import React from "react";
import ReactDOM, { Root } from "react-dom/client";
import { toast, Toaster } from "sonner";

import { addItem, isParserTab } from "./api";
import { isMatch } from "./utils";
import { changeSetting, settingsStore } from "@/store";

import WelcomePopup from "@/components/WelcomePopup";
import Popup from "@/components/Popup";
import Modal from "@/components/ui/Modal";

let floatingButton: globalThis.IntegratedContentScriptUi<ReactDOM.Root>;
let popup: ShadowRootContentScriptUi<Root> | null;
let welcomePopup: ShadowRootContentScriptUi<Root> | null;
let toaster: ShadowRootContentScriptUi<Root> | null;

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const parserTab = await isParserTab();
    const settings = await settingsStore.getValue();

    if (settings.welcomePopup && !welcomePopup) {
      mountWelcomePopup(ctx);
    }

    if (parserTab) return;

    if (!toaster) {
      mountToaster(ctx);
    }

    ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
      console.log(`location change`);

      const match = await isMatch(newUrl.href);

      if (!match) return;

      if (!floatingButton) {
        mountFloatingButton(ctx);
      }
    });

    ctx.addEventListener(window, "contextlost", () => {
      console.error(`Houston, we just lost context`);
    });

    const currentUrl = window.location.href;
    const match = await isMatch(currentUrl);

    if (!match) return;

    if (!floatingButton) {
      mountFloatingButton(ctx);
    }
  },
});

function mountFloatingButton(ctx: ContentScriptContext) {
  console.log(`mounting floating button`);

  floatingButton = createIntegratedUi(ctx, {
    position: "overlay",
    anchor: "body",
    onMount: (container) => {
      const root = ReactDOM.createRoot(container);
      root.render(
        <React.StrictMode>
          <FloatingButton
            onTogglePopup={() => {
              if (popup) {
                closePopup();
                return;
              }
              closeWelcomePopup();
              showPopup(ctx);
            }}
            onAddLink={(link) => onAddLink(link)}
          />
        </React.StrictMode>
      );
      return root;
    },
    onRemove: (root) => {
      root?.unmount();
    },
  });

  floatingButton.mount();
}

async function mountWelcomePopup(ctx: ContentScriptContext) {
  console.log(`mounting welcome screen`);

  welcomePopup = await createShadowRootUi(ctx, {
    name: "welcome-popup",
    anchor: "body",
    position: "overlay",
    onMount: (container) => {
      const root = ReactDOM.createRoot(container);
      root.render(
        <div className="fixed top-1 right-1 z-[999999] border border-neutral-400 rounded">
          <Modal onClose={closeWelcomePopup} title="Welcome to the Discount extension!">
            <WelcomePopup onClose={closeWelcomePopup} />
          </Modal>
        </div>
      );
      return root;
    },
    onRemove: (root) => root?.unmount(),
  });

  welcomePopup.mount();
}

async function mountToaster(ctx: ContentScriptContext) {
  console.log(`mounting toaster`);

  toaster = await createShadowRootUi(ctx, {
    name: "toaster-overlay",
    anchor: "body",
    position: "overlay",
    onMount: (container) => {
      const root = ReactDOM.createRoot(container);
      root.render(
        <div className="fixed inset-0 pointer-events-none z-[9999999]">
          <Toaster position="top-center" richColors={true} />
        </div>
      );
      return root;
    },
    onRemove: (root) => root?.unmount(),
  });

  toaster.mount();
}

async function showPopup(ctx: ContentScriptContext) {
  popup = await createShadowRootUi(ctx, {
    name: "inline-popup",
    anchor: "body",
    position: "overlay",
    onMount: (container) => {
      const root = ReactDOM.createRoot(container);
      root.render(
        <div className="fixed top-1 right-1 z-[999999] border border-neutral-400 rounded">
          <Modal onClose={closePopup} title="Discount Extension">
            <Popup embedded={true} />
          </Modal>
        </div>
      );
      return root;
    },
    onRemove: (root) => root?.unmount(),
  });

  popup.mount();
}

browser.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "closeUIPopup": {
      try {
        closePopup();
        closeWelcomePopup();
      } catch (error) {
        console.error(error);
      }
      break;
    }
    case "showToast": {
      const { text, type } = message.payload;

      if (!text || !type) {
        console.warn(`Toast needs a text and a type`);
        return;
      }

      if (type === "success") {
        toast.success("Discount Extension", { description: text });
      } else if (type === "error") {
        toast.error("Discount Extension", { description: text });
      }
      break;
    }
  }
});

function closePopup() {
  if (popup) {
    popup.remove();
    popup = null;
  }
}

async function closeWelcomePopup() {
  if (welcomePopup) {
    welcomePopup.remove();
    welcomePopup = null;
  }
}

interface AddLinkProps {
  html: string;
  url: string;
  title: string;
}

function onAddLink(link: AddLinkProps) {
  toast.promise(addItem(link), {
    loading: "Adding link...",
    success: "Link added",
    error: "Error adding link",
  });
}
