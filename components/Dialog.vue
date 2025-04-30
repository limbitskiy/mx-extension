<template>
  <div class="mx-dialog" :class="$style['mx-dialog']">
    <div :class="$style['handle-cnt']">
      <div></div>
    </div>
    <!-- header -->
    <div id="mx-header" style="display: flex; align-items: center; justify-content: space-between">
      <span :class="$style['title']">{{ localization["app_title"] ?? "Mx" }}</span>
      <div :class="$style['dialog-btns']">
        <div>
          <svg width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.313 5.726a4.86 4.86 0 0 1 0 1.549l1.638 1.574c.042.042.057.108.045.196a.695.695 0 0 1-.108.273l-.877 1.359a.721.721 0 0 1-.215.222c-.085.055-.153.078-.204.07l-2.095-.622a5.03 5.03 0 0 1-1.245.698l-.495 1.752c-.017.05-.072.097-.165.14a.76.76 0 0 1-.317.063h-1.74a.717.717 0 0 1-.311-.063c-.09-.043-.142-.09-.159-.14l-.457-1.803a5.22 5.22 0 0 1-1.105-.66l-2.083.635c-.059.008-.13-.015-.216-.07a.722.722 0 0 1-.215-.222L.112 9.318a.694.694 0 0 1-.108-.273c-.012-.088.003-.154.045-.196l1.638-1.575a4.857 4.857 0 0 1-.063-.774c0-.254.02-.512.063-.774L.049 4.15c-.042-.042-.057-.108-.045-.196a.694.694 0 0 1 .108-.273L.99 2.323a.723.723 0 0 1 .215-.222c.085-.055.157-.078.216-.07l2.083.635a4.558 4.558 0 0 1 1.245-.71L5.243.202c.017-.05.072-.097.165-.14A.76.76 0 0 1 5.725 0h1.74a.76.76 0 0 1 .318.063c.093.043.144.09.152.14l.457 1.803c.381.16.75.38 1.105.66l2.095-.635c.06-.008.13.015.21.07.08.055.15.13.21.222l.876 1.359c.059.093.095.184.108.273.012.088-.003.154-.045.196l-1.638 1.575ZM6.5 4.063c-.677 0-1.253.239-1.727.717a2.364 2.364 0 0 0-.711 1.726c0 .673.237 1.247.71 1.72.475.475 1.05.711 1.728.711.677 0 1.253-.236 1.727-.71a2.343 2.343 0 0 0 .711-1.72c0-.673-.237-1.249-.71-1.727A2.341 2.341 0 0 0 6.5 4.062Z"
              fill="#fff"
            />
          </svg>
        </div>
        <div>
          <svg width="14" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.727 0H1.273C.566 0 0 .593 0 1.333v8c0 .354.134.693.373.943.238.25.562.39.9.39h3.182V12h5.09v-1.333h3.182c.7 0 1.267-.6 1.267-1.334l.006-8c0-.353-.134-.692-.373-.942a1.244 1.244 0 0 0-.9-.391Zm0 9.333H1.273v-8h11.454v8ZM9.545 4.667V6H7.636v2H6.364V6h-1.91V4.667h1.91v-2h1.272v2h1.91Z"
              fill="#fff"
            />
          </svg>
        </div>
        <div @click="onClose">
          <svg width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.697 9.24 6.957 5.5l3.74-3.74a1.028 1.028 0 0 0 0-1.457 1.028 1.028 0 0 0-1.457 0L5.5 4.043 1.76.303a1.028 1.028 0 0 0-1.457 0 1.028 1.028 0 0 0 0 1.457l3.74 3.74-3.74 3.74a1.028 1.028 0 0 0 0 1.457 1.028 1.028 0 0 0 1.457 0l3.74-3.74 3.74 3.74a1.028 1.028 0 0 0 1.457 0c.401-.404.401-1.056 0-1.457Z"
              fill="#fff"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- unknown host -->
    <div v-if="!isMatch" :class="$style['unknown-host-cnt']">
      <i>⚠️ {{ localization["unknown_route_title"] ?? "Unknown host" }}</i>
      <b>{{ currentUrl }}</b>
      <span v-html="localization['unknown_route_message'] ?? 'Press button to suggest adding current service to our service'" />
      <div style="flex: 1"></div>
      <button :class="$style['success-button']" @click="onAddHost">{{ localization["unknown_route_button"] ?? "Suggest" }}</button>
    </div>

    <!-- content -->
    <div id="mx-content" :class="$style['content']">
      <!-- settings -->
      <template v-if="currentRoute === 'settings'">
        <div :class="$style['subtitle']">{{ localization["settings"] ?? "Settings" }}</div>
        <div style="flex: 1; display: flex">
          <form style="display: flex; flex-direction: column; flex: 1">
            <!-- city -->
            <label :class="$style['label']">
              {{ localization["settings_city_label"] ?? "Your city" }}
              <input v-model="settings.city" type="text" name="city" :class="$style['input']" :placeholder="localization['settings_city_placeholder']" />
            </label>

            <!-- confirmation contact -->
            <fieldset style="display: flex; flex-direction: column; gap: 0.2rem; margin-top: 0.5rem; border-radius: 8px; border: 1px solid #dfdfdf">
              <legend style="font-size: 14px; color: grey">{{ localization["settings_notifications_label"] ?? "Your city" }}</legend>

              <label>
                <input v-model="settings.contactType" type="radio" value="telegram" :class="$style['radio']" />
                Telegram
              </label>

              <label style="color: grey; cursor: not-allowed">
                <input v-model="settings.contactType" type="radio" value="whatsapp" :class="$style['radio']" disabled />
                WhatsApp
              </label>
            </fieldset>

            <div style="flex: 1"></div>

            <button :class="$style['success-button']" @click.prevent="onSaveSettings">{{ localization["save"] ?? "Save" }}</button>
          </form>
        </div>
      </template>

      <!-- links -->
      <template v-else-if="currentRoute === 'folder'">
        <div :class="$style['subtitle']" style="display: flex; align-items: center; justify-content: space-between">
          <div style="display: flex; align-items: center; gap: 0.5rem">
            <BackBtn @click="onBackBtnClick" />
            <span>{{ localization["links_title"] ?? "Links" }}</span>
          </div>
          <div style="display: flex; gap: 4px">
            <div :class="$style['timer']">
              <span>{{ currentFolder.timer?.split(":")?.[0] }}</span>
              <span :class="$style['blink']">:</span>
              <span>{{ currentFolder.timer?.split(":")?.[1] }}</span>
            </div>
            <InfoBtn />
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem">
          <div v-for="link in currentFolder.items" :key="link.id" :class="$style['folder']">
            <div style="display: flex; flex-direction: column; flex: 1">
              <div style="display: flex; flex-direction: column; font-size: 14px">
                <span :class="$style['two-line-clamp']">{{ link.name }}</span>
              </div>
              <div style="display: flex; justify-content: flex-end; color: #2ac22a; font-weight: 700; font-size: 16px">
                <span>{{ link.price.toLocaleString() }}</span>
              </div>
            </div>
            <div style="margin-top: 0.5rem">
              <OptionsBtn :menuItems="[{ name: localization['delete'] ?? 'Delete', action: 'deleteItem' }]" @menu-click="(data) => onMenuClick(data, link)" />
            </div>
          </div>
        </div>
      </template>

      <!-- folders -->
      <template v-else-if="currentRoute === 'folders'">
        <!-- folders exist -->
        <template v-if="folders?.length">
          <div :class="$style['subtitle']">{{ localization["folders_title"] ?? "Folders" }}</div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem">
            <div v-for="folder in folders" :key="folder.id" :class="[$style['folder'], $style['hoverable']]" @click="() => onFolderClick(folder)">
              <div style="display: flex; justify-content: space-between; flex: 1; gap: 0.5rem">
                <div style="display: flex; flex-direction: column; gap: 0.3rem">
                  <span :class="$style['two-line-clamp']">{{ folder.name }}</span>
                  <LinkBadge :count="folder.items.length" />
                </div>
                <div style="display: flex; gap: 4px">
                  <div
                    v-if="folder.timer"
                    class="folder-timer"
                    :class="$style['timer']"
                    @mouseenter="() => onTimerHover(folder.id)"
                    @mouseleave="() => onTimerMouseLeave(folder.id)"
                  >
                    <transition name="fade">
                      <div v-show="tooltip.visible[folder.id]" class="tooltip" :class="$style['tooltip']">
                        <div class="tooltip-wrap">
                          <span>{{ tooltip.text }}</span>
                        </div>
                      </div>
                    </transition>
                    <span>{{ folder.timer?.split(":")?.[0] }}</span>
                    <span :class="$style['blink']">:</span>
                    <span>{{ folder.timer?.split(":")?.[1] }}</span>
                  </div>
                  <InfoBtn />
                </div>
              </div>
              <div style="margin-top: 0.5rem">
                <OptionsBtn :menuItems="[{ name: localization['delete'] ?? 'Delete', action: 'deleteFolder' }]" @menu-click="(data) => onMenuClick(data, folder)" />
              </div>
            </div>
          </div>
        </template>

        <!-- no folders -->
        <template v-else>
          <div :class="$style['no-folders']">
            <div style="display: flex; flex-direction: column; gap: 0.5rem">
              <span v-html="localization['folders_no_folders'] ?? 'Nothing here yet <br /> Add items by pressing the Mx button on supported services'" />
            </div>
          </div>
        </template>
      </template>

      <!-- default route -->
      <template v-else
        ><span>{{ localization["404"] ?? "Oops. Wrong page" }}</span></template
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import InfoBtn from "./ui/InfoBtn.vue";
import BackBtn from "./ui/BackBtn.vue";
import OptionsBtn from "./ui/OptionsBtn.vue";
import LinkBadge from "./ui/LinkBadge.vue";
import { computed } from "vue";
import { addItem } from "@/api";

interface ThemeConfig {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  misc: Record<string, string>;
}

interface DialogProps {
  theme: ThemeConfig;
  folders?: Folder[];
  localization: { [key: string]: string };
  isMatch?: boolean;
}

const props = defineProps<DialogProps>();

const emit = defineEmits<{
  deleteItem: [itemId: string];
  deleteFolder: [folderId: string];
  moveItem: [item: {}];
  close: [];
  "save-settings": [data: {}];
}>();

const tooltip = ref({
  text: "",
  visible: {},
});

const currentRoute = ref("folders");
const currentFolder = ref();
const settings = ref({
  city: "",
  contactType: "telegram",
});

const currentUrl = computed(() => location.hostname);

storage.getItem("local:settings").then((data) => {
  if (data?.region) {
    settings.value.city = data?.region;
  }
});

const setRoute = (route: string) => {
  currentRoute.value = route;
};

const onFolderClick = (folder: Folder) => {
  currentFolder.value = folder;
  setRoute("folder");
};

const onBackBtnClick = () => {
  currentFolder.value = null;
  setRoute("folders");
};

const onMenuClick = (data: { action: string }, item: Item) => {
  emit(data.action, item.id);
};

const onClose = () => {
  emit("close");
};

const onAddHost = async () => {
  const result = await addItem();
};

const onSaveSettings = async () => {
  emit("save-settings", { ...settings.value });

  const _settings = await storage.getItem("local:settings");

  switch (settings.value.contactType) {
    case "telegram": {
      currentRoute.value = "confirm-telegram";

      setTimeout(() => {
        const link = document.createElement("a");
        link.href = _settings?.contactUrl;
        link.setAttribute("target", "_blank");
        link.click();
      }, 1000);
      break;
    }

    // case "email": {
    //   currentRoute.value = "confirm-email";
    //   break;
    // }
  }

  setRoute("folders");
};

function onTimerHover(folderId: string) {
  if (!tooltip.value.text) {
    tooltip.value.text = props.localization["timer_tooltip"] ?? "Timer";
  }

  tooltip.value.visible[folderId] = true;
}

function onTimerMouseLeave(folderId: string) {
  tooltip.value.visible[folderId] = false;
}

defineExpose({ setRoute });

onMounted(async () => {});
</script>

<style lang="scss" module>
.mx-dialog {
  z-index: 99999;
  width: min(90%, 300px);
  height: 45%;
  background-color: v-bind("theme.colors.accent");
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0 1rem 1rem;
  border-radius: v-bind("theme.misc.borderRadius");
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 14px;
}

.handle-cnt {
  padding-block: 0.5rem;
  cursor: move;

  div {
    height: 4px;
    border-radius: 4px;
    background-color: v-bind("theme.colors.greyBg");
    margin-inline: 40%;
  }
}

.folder {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background-color: v-bind("theme.colors.greyBg");
  border-radius: v-bind("theme.misc.borderRadius");
  padding: 0.5rem 0.2rem 0.5rem 0.8rem;
}

.hoverable {
  &:hover {
    background-color: #e4e4e4;
    cursor: pointer;
  }
}

.two-line-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.title {
  font-size: v-bind("theme.fonts.title");
  color: white;
}

.timer {
  color: v-bind("theme.colors.greyText");
  font-weight: 300;
  font-size: v-bind("theme.fonts.regular");
  position: relative;
}

.subtitle {
  font-size: v-bind("theme.fonts.subtitle");
  color: #222;
  font-weight: 700;
}

.content {
  background-color: white;
  flex: 1;
  border-radius: v-bind("theme.misc.borderRadius");
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  overflow: auto;
  scrollbar-width: thin;
}

.dialog-btns {
  display: flex;
  gap: 0.8rem;

  > div {
    cursor: pointer;
  }
}

.no-folders {
  flex: 1;
  display: grid;
  place-items: center;
  text-align: center;
  color: grey;
  padding-inline: 1rem;
}

.input {
  background-color: v-bind("theme.colors.greyBg");
  padding: 0.5rem;
  border-radius: v-bind("theme.misc.inputBorderRadius");
  outline-color: #d3d3d3;
  color: #222;
  outline: none;
  border: none;
  font-size: 14px;
  font-family: Arial, Helvetica, sans-serif;
}

.success-button {
  background-color: v-bind("theme.colors.success");
  color: white;
  padding-block: 10px;
  border-radius: v-bind("theme.misc.inputBorderRadius");
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  outline: none;
  border: none;
  font-family: Arial, Helvetica, sans-serif;
  cursor: pointer;
  width: 100%;

  &:hover {
    filter: brightness(105%);
  }
}

.radio {
  appearance: auto;
  width: auto;
}

.label {
  font-size: 14px;
  color: grey;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.blink {
  animation: blink 3s infinite;
}

.tooltip {
  position: absolute;
  // top: v-bind(tooltipPosition);
  top: 20px;
  right: 8px;
  width: 150px;
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  z-index: 999;
  box-shadow: 2px 2px 4px 2px #00000030;
  color: #222;
  pointer-events: none;

  &::after {
    background-color: #fff;
    content: "";
    position: absolute;
    top: -0.25rem;
    right: 10%;
    transform: translateX(50%) rotate(45deg);
    width: 0.5rem;
    height: 0.5rem;
  }
}

.unknown-host-cnt {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: #efe9ce;
  border-radius: 0.5rem;
  padding: 0.5rem;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  49% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  99% {
    opacity: 0;
  }
}
</style>
