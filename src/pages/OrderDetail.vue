<script setup>
import { ref, onMounted } from 'vue';
import { fetchProduct } from '../api';
import { convertProduct } from '../util';
import _ from 'lodash';
import OrderItems from '../components/OrderItems.vue';
import OrderSubmitBar from '../components/OrderSubmitBar.vue';

const props = defineProps({
  params: {
    type: String,
    default: ''
  }
});
const orderItems = ref([]);

onMounted(async () => {
  const productMap = await getProductMap();
  orderItems.value = _.map(props.params.split(','), param => {
    const [productId, optionId, quantity] = param.split('_');
    const product = productMap[productId];
    return {
      product: product,
      option_id: Number(optionId),
      quantity: Number(quantity),
    };
  });
});

async function getProductMap() {
  const productIds = _.map(props.params.split(','), param => {
    const [productId, ] = param.split('_');
    return productId;
  });
  const promises = _.map(productIds, productId => fetchProduct(productId));
  const results = await Promise.all(promises);
  const products = results.map(result => convertProduct(result.data.data));
  return _.fromPairs(_.map(products, item => [item.id, item]));
}
</script>

<template>
  <div style="padding-bottom: 50px;">
    <OrderItems :data="orderItems" />
    <OrderSubmitBar :data="orderItems" />
  </div>
</template>
