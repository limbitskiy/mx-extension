<template>
  <transition name="fade">
    <Dialog
      v-show="isDialogOpen"
      ref="dialogRef"
      :theme="theme"
      :folders="folders"
      :localization="locale"
      :isMatch="isMatch"
      @deleteItem="onDeleteItem"
      @deleteFolder="deleteFolder"
      @moveItem="onMoveItem"
      @close="closeDialog"
      @save-settings="onSaveSettings"
    />
  </transition>

  <transition name="fade">
    <div v-show="tooltip.visible" ref="tooltipRef" class="tooltip" :class="$style['tooltip']">
      <div class="tooltip-wrap">
        <span>{{ tooltip.text }}</span>
      </div>
    </div>
  </transition>

  <!-- button -->
  <transition name="slide-left" appear>
    <div ref="mainButton" v-show="isMatch" :class="$style['mx-button-cnt']" @mouseenter="onButtonHover" @mouseleave="onButtonMouseLeave">
      <div :class="[$style['mx-button'], $style['mx-button-toggle']]" @click="onToggleDialog">
        Mx
        <div v-if="badge" :class="$style['badge']">
          {{ badge }}
        </div>
      </div>
      <div class="folders-btn" style="display: grid; place-items: center; flex: 1">
        <div :class="[$style['mx-button'], $style['mx-button-save']]" @click="onToggleDialog">{{ locale?.["button_folders"] ?? "Folders" }}</div>
      </div>
      <div style="display: grid; place-items: center; flex: 1">
        <AnimatedTick v-if="isButtonCheckbox" style="width: 40px" />
        <div v-else :class="[$style['mx-button'], $style['mx-button-save']]" :style="{ cursor: isRegistered ? 'pointer' : 'not-allowed' }" @click="onAddItem">
          {{ locale?.["button_save"] ?? "Save" }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef, useTemplateRef, computed } from "vue";
import Dialog from "./Dialog.vue";
import AnimatedTick from "./ui/AnimatedTick.vue";
import { useElementBounding } from "@vueuse/core";

import { addItem, deleteItem, deleteFolder, saveSettings, getItems, getIcon, requestTabId } from "@/api/index";
import useStorage from "@/composables/useStorage";

const props = defineProps<{}>();

interface DialogSettings {
  [tabId: number]: boolean;
}

interface AppSettings {
  confirmed: boolean;
}

// const { state: matches } = useStorage<string[]>("local:url_icon", []);
const { state: settings } = useStorage<AppSettings>("local:settings");
const { state: folders } = useStorage<Folder[]>("local:folders", []);
const { state: locale } = useStorage<{ [key: string]: string }>("local:locale", {});
const { state: dialogSettings } = useStorage<DialogSettings>("local:dialogSettings", {});

const mainButton = useTemplateRef("mainButton");
const tooltipRef = useTemplateRef("tooltipRef");
const { top: buttonTop } = useElementBounding(mainButton);
const { height: tooltipHeight } = useElementBounding(tooltipRef);

const tooltipPosition = computed(() => buttonTop.value - tooltipHeight.value - 10 + "px");

const tabId = shallowRef();
const badge = shallowRef("");
const tooltip = ref({
  text: "",
  visible: false,
});
const isDialogOpen = ref(false);
const isMatch = ref(false);

watch(dialogSettings, async (val) => {
  const _settings = (await storage.getItem("local:settings")) ?? {};

  if (!_settings?.confirmed) {
    setDialogRoute("settings");
  }

  if (val && val[tabId.value]) {
    isDialogOpen.value = true;
  } else if (val && val[tabId.value] === false) {
    isDialogOpen.value = false;
  }
});

const isRegistered = computed(() => settings.value?.confirmed);

const theme = shallowRef({
  colors: {
    accent: "#19253D",
    accentHover: "#283a5d",
    secondary: "white",
    greyText: "#ACACAC",
    greyBg: "#F1F1F1",
    success: "#5EE036",
  },
  fonts: {
    title: "18px",
    subtitle: "16px",
    regular: "14px",
    small: "12px",
  },
  misc: {
    borderRadius: "12px",
    inputBorderRadius: "8px",
  },
});

const dialogRef = useTemplateRef("dialogRef");

const isButtonCheckbox = ref(false);
// const isButtonCheckbox = computed(() =>
//   folders.value?.some((folder) =>
//     folder.items.some((item) => {
//       const itemUrl = new URL(item.url);
//       return itemUrl.pathname === location.pathname;
//     })
//   )
// );

function onToggleDialog() {
  openDialog();
}

async function closeDialog() {
  const _dialogSettings = (await storage.getItem("local:dialogSettings")) ?? {};
  await storage.setItem("local:dialogSettings", { ..._dialogSettings, [tabId.value]: false });
}

async function openDialog() {
  const _dialogSettings = (await storage.getItem("local:dialogSettings")) ?? {};
  await storage.setItem("local:dialogSettings", { ..._dialogSettings, [tabId.value]: true });
}

async function onAddItem() {
  // if (!isRegistered.value) return;
  isButtonCheckbox.value = true;

  const result = await addItem();
  // console.log("🚀 ~ onSave ~ addItem:", result);
}

async function onDeleteItem(itemId: string) {
  const result = await deleteItem(itemId);
  // console.log("🚀 ~ onSave ~ deleteItem:", result);
}

async function onSaveSettings(_settings: object) {
  const result = await saveSettings(_settings);
  // console.log("🚀 ~ onSave ~ saveSettings:", result);
  settings.value = { ...settings.value, confirmed: true };
}

async function onMoveItem() {}

async function init() {
  // manually get settings because they could still be null in watcher
  const _settings = await storage.getItem("local:settings");
  const _matches = await storage.getItem("local:url_icon");

  isMatch.value = _matches?.some((host) => new RegExp(host).test(location.href));

  tabId.value = await requestTabId();
  console.log("🚀 ~ init ~ tabId.value:", tabId.value);

  if (!_settings?.confirmed) {
    console.log(`first entry`);
    openDialog();
  } else if (isMatch) {
    console.log(`regular entry`);
    await (<{ badge?: string; tooltip?: string }>getItems());
  }

  const { badge: _badge, tooltip: _tooltipText } = await (<{ badge?: string; tooltip?: string }>getIcon());

  if (_badge) {
    badge.value = _badge;
  }

  if (_tooltipText) {
    tooltip.value.text = _tooltipText;
  }
}

function onButtonHover() {
  if (tooltip.value.text) {
    tooltip.value.visible = true;
  }
}

function onButtonMouseLeave() {
  tooltip.value.visible = false;
}

function setDialogRoute(newRoute: string) {
  dialogRef.value?.setRoute(newRoute);
}

onMounted(async () => {
  init();
  // console.log(`mount`);
});

onUnmounted(() => {
  // console.log(`update`);
});
</script>

<style lang="scss" module>
.mx-button-cnt {
  position: fixed;
  top: 50%;
  right: -153px;
  width: 200px;
  height: 50px;
  padding: 3px 16px 3px 3px;
  background-color: v-bind("theme.colors.secondary");
  border-radius: v-bind("theme.misc.borderRadius") 0 0 v-bind("theme.misc.borderRadius");
  display: grid;
  grid-template-columns: auto 2fr 1fr;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s;
  box-shadow: 0px 0px 5px #00000070;
  z-index: 10;

  &:hover {
    transform: translateX(-140px);
  }
}

.mx-button {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  font-weight: 700;
  cursor: pointer;
  font-size: v-bind("theme.fonts.regular");
}

.mx-button-toggle {
  background-color: v-bind("theme.colors.accent");
  border-radius: v-bind("theme.misc.borderRadius");
  border-radius: v-bind("theme.misc.borderRadius");
  color: white;
  width: 58px;

  &:hover {
    background-color: v-bind("theme.colors.accentHover");
  }

  &:active {
    background-color: grey;
  }
}

.mx-button-save {
  color: #666;

  &:hover {
    color: #000;
  }
}

.tooltip {
  position: absolute;
  top: v-bind(tooltipPosition);
  right: 8px;
  max-width: 150px;
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
    bottom: -0.25rem;
    right: 30%;
    transform: translateX(50%) rotate(45deg);
    width: 0.5rem;
    height: 0.5rem;
  }
}

.badge {
  min-width: 12px;
  height: 12px;
  position: absolute;
  top: 2px;
  right: 4px;
  background-color: red;
  color: white;
  border-radius: 5px;
  font-size: 10px;
  display: grid;
  place-items: center;
  padding-inline: 2px;
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: 0.5s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
