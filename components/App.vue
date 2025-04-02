<template>
  <div class="mx-cnt" :class="$style['mx-cnt']">
    <!-- <Teleport to="body"> -->
    <transition name="dialog-slide">
      <!-- popup -->
      <Dialog
        v-show="dialogVisible"
        ref="dialogRef"
        :theme="theme"
        :folders="folders"
        :localization="localization"
        @addItem="addItem"
        @deleteItem="deleteItem"
        @moveItem="moveItem"
        @deleteFolder="deleteFolder"
        @close="onCloseDialog"
        @save-settings="onSaveSettings"
      />
    </transition>
    <!-- </Teleport> -->

    <!-- button -->
    <div :class="$style['mx-button-cnt']">
      <div :class="[$style['mx-button'], $style['mx-button-toggle']]" @click="onToggleDialog">Mx</div>
      <div style="display: grid; place-items: center; flex: 1">
        <AnimatedTick v-if="isButtonCheckbox" style="width: 40px" />
        <div v-else :class="[$style['mx-button'], $style['mx-button-save']]" @click="onSave">Save</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef, useTemplateRef } from "vue";
import Dialog from "./Dialog.vue";
import AnimatedTick from "./ui/AnimatedTick.vue";

import type { Folder } from "./types";

const ALLOWED_HOSTS = new Set(["market.yandex.ru"]);

const props = defineProps<{
  addItem: () => void;
  deleteItem: (itemId: number) => void;
  deleteFolder: (folderId: number) => void;
  moveItem?: () => void;
  save: () => void;
  saveSettings: (settings: unknown) => void;
  folders?: Folder[];
}>();

const folders = shallowRef<Folder[]>([]);
const localization = shallowRef<{ [key: string]: string }>({});
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

const buttonOffset = shallowRef("120%");
const dialogVisible = shallowRef(false);
const isButtonCheckbox = shallowRef(false);

const onToggleDialog = () => {
  dialogVisible.value = !dialogVisible.value;
};

const onCloseDialog = () => {
  dialogVisible.value = false;
};

const onSave = () => {
  if (props.save) {
    props.save();
  }
  isButtonCheckbox.value = true;
};

const onSaveSettings = (settings: {}) => {
  if (props.saveSettings) {
    props.saveSettings(settings);
  }
};

const setDialogRoute = (newRoute: string) => {
  dialogRef.value?.setRoute(newRoute);
};

const setFolders = (newFolders: Folder[]) => {
  folders.value = newFolders;

  if (!folders.value) {
    setDialogRoute("folders");
  }
};

const setLocalization = (newLocalization: {}) => {
  localization.value = newLocalization;
};

defineExpose({ dialog: dialogRef, setFolders, setLocalization });

onMounted(() => {
  if (!ALLOWED_HOSTS.has(location.hostname)) {
    setDialogRoute("unknown-host");
  }

  setTimeout(() => {
    buttonOffset.value = "58px";
  }, 1000);
});
</script>

<style lang="scss" module>
.mx-cnt {
  position: absolute;
  z-index: 99999;
  font-family: Arial, Helvetica, sans-serif;
  user-select: none;
}

.mx-button-cnt {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateX(v-bind("buttonOffset"));
  width: 120px;
  height: 50px;
  padding: 3px;
  background-color: v-bind("theme.colors.secondary");
  border-radius: v-bind("theme.misc.borderRadius") 0 0 v-bind("theme.misc.borderRadius");
  display: flex;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s;
  box-shadow: 0px 0px 5px #00000070;

  &:hover {
    transform: translateX(5px);
  }
}

.mx-button {
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
</style>

<style>
.dialog-slide-enter-active,
.dialog-slide-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-slide-enter-from,
.dialog-slide-leave-to {
  opacity: 0;
}
</style>
