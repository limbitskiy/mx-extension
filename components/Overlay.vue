<template>
  <div class="overlay">
    <h1>Hello there!</h1>
    <p>Please do not close this tab if you want to use MxExtension - we use it for monitoring prices</p>
  </div>
</template>

<script setup lang="ts">
console.log(`poop`);
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
