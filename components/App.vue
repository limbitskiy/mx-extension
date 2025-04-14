<template>
  <!-- <Teleport to="body"> -->
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
      @close="onCloseDialog"
      @save-settings="onSaveSettings"
    />
  </transition>
  <!-- </Teleport> -->

  <transition name="fade">
    <div v-if="tooltip.visible" class="tooltip" :class="$style['tooltip']">
      <div class="tooltip-wrap">
        <span>{{ tooltip.text }}</span>
      </div>
    </div>
  </transition>

  <!-- button -->
  <transition name="slide-left" appear>
    <div v-if="isMatch" :class="$style['mx-button-cnt']" @mouseenter="onButtonHover" @mouseleave="onButtonMouseLeave">
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
import { onMounted, ref, shallowRef, useTemplateRef } from "vue";
import Dialog from "./Dialog.vue";
import AnimatedTick from "./ui/AnimatedTick.vue";

import { addItem, deleteItem, deleteFolder, saveSettings, getItems, getIcon } from "@/api/index";
import useStorage from "@/composables/useStorage";

const props = defineProps<{}>();

const { state: matches } = useStorage<string[]>("local:url_icon");
const { state: settings } = useStorage<object>("local:settings");
const { state: folders } = useStorage<Folder[]>("local:folders", []);
const { state: locale } = useStorage<{ [key: string]: string }>("local:locale", {});
const { state: isDialogOpen } = useStorage<boolean>("local:isDialogOpen", false);

const badge = shallowRef("");
const tooltip = ref({
  text: "",
  visible: false,
});

const isMatch = computed(() => matches.value?.some((host) => new RegExp(host).test(location.href)));
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

watch(isMatch, (val) => {
  if (val) {
    init();
  }
});

function onToggleDialog() {
  // dialogVisible.value = !dialogVisible.value;
  isDialogOpen.value = !isDialogOpen.value;
}

function onCloseDialog() {
  // dialogVisible.value = false;
  isDialogOpen.value = false;
}

async function onAddItem() {
  // if (!isRegistered.value) return;
  isButtonCheckbox.value = true;

  const result = await addItem();
  console.log("🚀 ~ onSave ~ addItem:", result);
}

async function onDeleteItem(itemId: string) {
  const result = await deleteItem(itemId);
  console.log("🚀 ~ onSave ~ deleteItem:", result);
}

async function onSaveSettings(_settings: object) {
  const result = await saveSettings(_settings);
  console.log("🚀 ~ onSave ~ saveSettings:", result);
  settings.value = { confirmed: true };
}

async function onMoveItem() {}

async function init() {
  // manually get settings because they could still be null in watcher
  const _settings = await storage.getItem("local:settings");

  if (!_settings?.confirmed) {
    console.log(`first entry`);
    setDialogRoute("settings");
  } else {
    console.log(`regular entry`);
    const result = await (<{ badge?: string; tooltip?: string }>getItems());
    console.log("🚀 ~ init ~ getItems:", result);
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

onMounted(() => {
  isDialogOpen.value = false;
});

onUnmounted(() => {});
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
  top: 42%;
  right: 8px;
  max-width: 150px;
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  z-index: 999;
  box-shadow: 2px 2px 4px 2px #00000030;
  color: #222;

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
