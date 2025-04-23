<template>
  <transition name="fade">
    <div v-show="tooltipObject.visible" ref="tooltipRef" class="tooltip" :class="$style['tooltip']">
      <div class="tooltip-wrap">
        <span>{{ tooltipObject.text }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useElementBounding } from "@vueuse/core";

const props = defineProps<{}>();

const tooltipRef = useTemplateRef("tooltipRef");

const { height: tooltipHeight } = useElementBounding(tooltipRef);

const tooltipPosition = ref(0);

const tooltipObject = ref({
  text: "",
  visible: false,
});

watch(
  tooltipObject,
  async (val) => {
    if (val.visible) {
      await nextTick();

      if (tooltipHeight.value) {
        tooltipPosition.value = -tooltipHeight.value - 10 + "px";
      }
    }
  },
  {
    deep: true,
  }
);

defineExpose({ tooltipObject });

onMounted(() => {});

onUpdated(() => {});
</script>

<style lang="scss" module>
.tooltip {
  position: absolute;
  top: v-bind(tooltipPosition);
  //   top: 50%;
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
</style>
