<script setup>
import { ref, onMounted } from 'vue';
import { getOrderItems } from '../util';
import _ from 'lodash';
import OrderItem from '../components/OrderItem.vue';
import OrderSubmitBar from '../components/OrderSubmitBar.vue';

const props = defineProps({
  params: {
    type: String,
    default: ''
  }
});
const orderItems = ref([]);

onMounted(async () => {
  orderItems.value = await getOrderItems(props.params.split(','));
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
    <OrderSubmitBar :data="orderItems" />
  </div>
</template>
