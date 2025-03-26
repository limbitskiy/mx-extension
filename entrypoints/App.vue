<script lang="ts" setup>
import vueLogo from "~/assets/vue.svg";
import { useTitle, useFavicon } from "@vueuse/core";

const title = useTitle();
const icon = useFavicon();

icon.value = vueLogo;
title.value = "Our title";
</script>

<template>
  <div class="container">
    <img :src="vueLogo" />
    <p>Hello World</p>
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: black;
  overflow: hidden;
}

img {
  width: 72px;
}
</style>
