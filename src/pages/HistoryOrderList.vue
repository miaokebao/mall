<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { getOrderItems } from '../util';
import _ from 'lodash';
import OrderItem from '../components/OrderItem.vue';

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
    historyOrderList.value.push(await getOrderItems(historyOrder.params.split(',')));
  }
  loading.value = false;
  if (index.value >= rawHistoryOrderList.value.length) {
    finished.value = true;
  } else {
    index.value++;
  }
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
      class="mt-10"
      v-model:loading="loading"
      :finished="finished"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <VanCellGroup
        v-for="(orderItems, ItemsIndex) in historyOrderList"
        :key="ItemsIndex"
        inset
        class="order-items"
      >
        <OrderItem
          v-for="(orderItem, itemIndex) in orderItems"
          :key="itemIndex"
          :data="orderItem"
        />
      </VanCellGroup>
    </VanList>
  </VanPullRefresh>
</template>

<style scoped>
.order-items + .order-items {
  margin-top: 10px;
}
</style>
