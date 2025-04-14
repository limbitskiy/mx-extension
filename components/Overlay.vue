<template>
  <div class="overlay" :class="$style['overlay']">
    <h1>Hello there!</h1>
    <p>Please do not close this tab if you want to use MxExtension - we use it for monitoring prices</p>
  </div>
</template>

<script setup lang="ts">
import { useTitle, useFavicon } from "@vueuse/core";

let pageHtml = "";

onMounted(() => {
  const title = useTitle();
  const icon = useFavicon();

  title.value = "MxExtension";
  setTimeout(() => {
    icon.value = "/assets/vue.svg";
  }, 1000);

  pageHtml = document.documentElement.outerHTML;
  sendMessage("sendParsedPage", { url: location.href, html: pageHtml });
});
</script>

<style lang="scss" module>
.overlay {
  position: fixed;
  inset: 0;
  background-color: white;
  z-index: 999999;
  font-size: 20px;
}
</style>
