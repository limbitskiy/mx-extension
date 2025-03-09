<template>
  <div class="options-btn" :class="$style['options-btn']" @click.stop="onBtnClick">
    <svg width="4" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M.778 1.444a1.444 1.444 0 1 1 2.889 0 1.444 1.444 0 0 1-2.89 0ZM.778 6.5a1.444 1.444 0 1 1 2.889 0 1.444 1.444 0 0 1-2.89 0ZM.778 11.556a1.444 1.444 0 1 1 2.889 0 1.444 1.444 0 0 1-2.89 0Z"
        fill="#989898"
      />
    </svg>

    <div v-show="menuVisible" class="menu" :class="$style['menu']">
      <ul style="list-style: none; padding: 0; margin: 0">
        <li v-for="item in menuItems" :key="item.name" :class="$style['list-item']" @click.stop="() => onMenuItemClick(item)">
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  menuItems: [];
}>();

const emit = defineEmits<{
  "menu-click": [item: {}];
}>();

const menuVisible = ref(false);

const onBtnClick = () => {
  menuVisible.value = !menuVisible.value;
};

const onMenuItemClick = (menuItem) => {
  menuVisible.value = false;
  emit("menu-click", menuItem);
};
</script>

<style lang="scss" module>
.options-btn {
  padding-inline: 0.5rem;
  cursor: pointer;
  position: relative;
}

.menu {
  position: absolute;
  right: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  padding-block: 0.5rem;
  box-shadow: 0 0 5px 0px #0000001f;
  user-select: none;
}

.list-item {
  padding: 0.1rem 1rem;

  &:hover {
    background-color: #efefef;
  }
}
</style>
