<template>
  <svg id="check" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" xml:space="preserve">
    <polyline id="mx-tick" :class="{ animate: tickReady }" points="25,55 45,70 75,33" fill="transparent" />
  </svg>
</template>

<script setup lang="ts">
import { shallowRef, onMounted } from "vue";

const tickReady = shallowRef(false);

onMounted(() => {
  tickReady.value = true;
});
</script>

<style lang="scss">
#mx-tick {
  stroke: #63bc01;
  stroke-width: 6;
  transition: all 1s;

  &.animate {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: animated-tick-draw 8s ease-out forwards;
  }
}

@keyframes animated-tick-draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
