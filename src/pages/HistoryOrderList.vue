<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { fetchProduct } from '../api';
import { convertProduct } from '../util';
import _ from 'lodash';
import OrderItems from '../components/OrderItems.vue';

const store = useStore();
const rawHistoryOrderList = computed(() => {
  return store.state.historyOrder.historyOrderList;
});
const historyOrderList = ref([]);
const index = ref(0);
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);

function onRefresh() {
  finished.value = false;
  loading.value = true;
  index.value = 0;
  onLoad();
}
async function onLoad() {
  if (index.value < rawHistoryOrderList.value.length) {
    const historyOrder = rawHistoryOrderList.value[index.value];
    const productMap = await getProductMap(historyOrder.params.split(','));
    historyOrderList.value.push(_.map(historyOrder.params.split(','), param => {
      const [productId, optionId, quantity] = param.split('_');
      const product = productMap[productId];
      return {
        product: product,
        option_id: Number(optionId),
        quantity: Number(quantity),
      };
    }));
  }
  loading.value = false;
  if (index.value >= rawHistoryOrderList.value.length) {
    finished.value = true;
  } else {
    index.value++;
  }
}
async function getProductMap(params) {
  const productIds = _.map(params, param => {
    const [productId, ] = param.split('_');
    return productId;
  });
  const promises = _.map(productIds, productId => fetchProduct(productId));
  const results = await Promise.all(promises);
  const products = results.map(result => convertProduct(result.data.data));
  return _.fromPairs(_.map(products, item => [item.id, item]));
}

onMounted(() => {
  onLoad();
});
</script>

<template>
  <VanEmpty
    v-if="!loading && finished && historyOrderList.length == 0"
    description="暂无订单历史"
  />
  <VanPullRefresh
    v-else
    v-model="refreshing"
    @refresh="onRefresh"
  >
    <VanList
      v-model:loading="loading"
      :finished="finished"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div
        v-for="(order, index) in historyOrderList"
        :key="index"
      >
        <OrderItems :data="order" />
      </div>
    </VanList>
  </VanPullRefresh>
</template>
