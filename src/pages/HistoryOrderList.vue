<script setup>
import { ref, computed, onMounted, useTemplateRef, watch } from 'vue';
import { useStore } from 'vuex';
import { formatDatetime, getOrderItems } from '../util';
import _ from 'lodash';
import OrderItem from '../components/OrderItem.vue';
import { showSuccessToast } from 'vant';

const store = useStore();
const listRef = useTemplateRef('listRef');
const rawHistoryOrderList = computed(() => {
  return store.state.historyOrder.historyOrderList;
});
const historyOrderList = ref([]);
const index = ref(0);
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);

function onRefresh() {
  historyOrderList.value = [];
  finished.value = false;
  loading.value = false;
  index.value = 0;
  listRef.value.check();
}
async function onLoad() {
  if (index.value < rawHistoryOrderList.value.length) {
    const historyOrder = rawHistoryOrderList.value[index.value];
    const orderItems = await getOrderItems(historyOrder.params.split(','));
    historyOrderList.value.push({
      orderId: historyOrder.id,
      orderItems: orderItems,
      orderTime: historyOrder.time,
      orderPice: _.sum(_.map(orderItems, item => Number(item.quantity) * Number(item.option.price))),
    });
  }
  loading.value = false;
  if (index.value >= rawHistoryOrderList.value.length) {
    finished.value = true;
  } else {
    index.value++;
  }
}
function deleteOrder(id) {
  store.dispatch('deleteHistoryOrder', id);
  onRefresh();
}
function addCart(id) {
  const order = _.find(historyOrderList.value, order => order.orderId === id);
  if (order) {
    _.forEach(order.orderItems, item => {
      store.dispatch('addCartRecord', {
        product: item.product,
        option_id: item.option_id,
        quantity: item.quantity,
      });
    });
    showSuccessToast('加购成功');
  }
}

onMounted(() => {
  listRef.value.check();
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
      ref="listRef"
      class="mt-10"
      v-model:loading="loading"
      :finished="finished"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <VanCellGroup
        v-for="(order, ItemsIndex) in historyOrderList"
        :key="ItemsIndex"
        inset
        :title="formatDatetime(order.orderTime)"
        class="order-items"
      >
        <OrderItem
          v-for="(orderItem, itemIndex) in order.orderItems"
          :key="itemIndex"
          :data="orderItem"
        />
        <VanCell>
          <template #value>
            <VanSpace>
              <VanButton
                icon="delete-o"
                plain
                round
                size="small"
                @click="deleteOrder(order.orderId)"
              >
                删除
              </VanButton>
              <VanButton
                icon="cart-o"
                plain
                round
                type="danger"
                size="small"
                @click="addCart(order.orderId)"
              >
                再次加购
              </VanButton>
            </VanSpace>
          </template>
        </VanCell>
      </VanCellGroup>
    </VanList>
  </VanPullRefresh>
</template>

<style scoped>
.order-items + .order-items {
  margin-top: 10px;
}
</style>
