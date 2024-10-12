<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import OrderItem from '../components/OrderItem.vue';
import OrderSubmitBar from '../components/OrderSubmitBar.vue';
import { formatOrderItems } from '../util';

const store = useStore();
const orderItems = computed(() => {
  return formatOrderItems(store.getters.selectedCartList);
});
</script>

<template>
  <div class="pb-60 pt-10">
    <VanCellGroup inset>
      <OrderItem
        v-for="(orderItem, index) in orderItems"
        :key="index"
        :data="orderItem"
      />
    </VanCellGroup>
    <OrderSubmitBar :data="orderItems" from-cart />
  </div>
</template>
