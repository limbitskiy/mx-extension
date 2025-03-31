<template>
  <div class="link-badge" :class="$style['link-badge']">
    <svg width="19" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.052 1.064a3.618 3.618 0 0 0-5.125 0l.856.856a2.418 2.418 0 0 1 3.419 3.42l-4.824 4.823A2.416 2.416 0 0 1 7.96 6.75l.85-.856-.85-.856-.856.856a3.618 3.618 0 0 0 0 5.125 3.617 3.617 0 0 0 2.563 1.043 3.617 3.617 0 0 0 2.574-1.06l4.824-4.825a3.618 3.618 0 0 0-.012-5.113Z"
        fill="#555"
      />
      <path
        d="M1.941 11.954a2.412 2.412 0 0 1 0-3.419l4.824-4.824a2.412 2.412 0 0 1 3.42 0 2.375 2.375 0 0 1 .687 1.719 2.41 2.41 0 0 1-.706 1.718L8.888 8.445l.856.856 1.278-1.279a3.629 3.629 0 0 0-5.131-5.13L1.067 7.714a3.618 3.618 0 0 0 0 5.131 3.618 3.618 0 0 0 2.569 1.025 3.66 3.66 0 0 0 2.58-1.06l-.856-.857a2.411 2.411 0 0 1-3.419 0Z"
        fill="#555"
      />
    </svg>
    <span>{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number;
}>();
</script>

<style lang="scss" module>
.link-badge {
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
  scale: 0.9;
}
</style>
