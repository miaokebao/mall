<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import OrderItems from '../components/OrderItems.vue';
import OrderSubmitBar from '../components/OrderSubmitBar.vue';

const store = useStore();
const selectedCartList = computed(() => {
  return store.getters.selectedCartList;
});
</script>

<template>
  <div style="padding-bottom: 50px;">
    <OrderItems :data="selectedCartList" />
    <OrderSubmitBar :data="selectedCartList" />
  </div>
</template>
