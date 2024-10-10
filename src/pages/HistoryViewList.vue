<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import _ from 'lodash';

const deleting = ref(false);
const deletingIds = ref([]);
const route = useRoute();
const store = useStore();
const historyViewList = computed(() => {
  return store.state.historyView.historyViewList;
});
const isDeletingCheckAll = computed(() => {
  return _.isEqual(_.sortBy(deletingIds.value), _.sortBy(_.map(historyViewList.value, 'id')));
});

watch(
  () => route,
  (newValue) => {
    if (newValue.name !== 'history') {
      return;
    }
    quitDeleting();
  }
);
function enterDeleting() {
  deleting.value = true;
  deletingIds.value = [];
}
function quitDeleting() {
  deleting.value = false;
}
function isSelectedDeleting(id) {
  return _.includes(deletingIds.value, id);
}
function toggleDeletingCheckAll() {
  deletingIds.value = isDeletingCheckAll.value ? [] : _.map(historyViewList.value, 'id');
}
function toggleDeletingCheck(id, selected) {
  deletingIds.value = selected ? _.concat(deletingIds.value, id) : _.without(deletingIds.value, id);
}
function deleteSelectedHistoryView() {
  if (deletingIds.value.length === 0) {
    return;
  }
  _.forEach(deletingIds.value, id => {
    store.dispatch('deleteHistoryView', id);
  });
}
</script>

<template>
  <VanEmpty
    v-if="historyViewList.length == 0"
    image="search"
    description="暂无浏览历史"
  >
  </VanEmpty>
  <div
    v-else
    :style="deleting ? { paddingBottom: '60px' } : { paddingBottom: '10px' }"
  >
    <div style="text-align: right; margin: 10px;">
      <span
        v-if="deleting"
        @click="quitDeleting"
      >
        完成
      </span>
      <span
        v-else
        @click="enterDeleting"
      >
        编辑
      </span>
    </div>
    <VanGrid
      :border="false"
      :column-num="3"
      :gutter="10"
      :clickable="!deleting"
      class="product-grid"
    >
      <VanGridItem
        v-for="(product, index) in historyViewList"
        :key="index"
        :to="deleting ? '' : `/products/${product.id}`"
        style="position: relative;"
      >
        <VanImage
          lazy-load
          :src="product.thumb"
          fit="cover"
        />
        <div style="width: 100%; padding: 10px; box-sizing: border-box;">
          <div>
            <span style="color: var(--van-card-price-color);">
              ¥ <span style="font-size: 16px;">{{ Number(product.price * 0.3).toFixed(2) }}</span>
            </span>
            <span class="van-card__origin-price">{{ Number(product.price).toFixed(2) }}</span>
          </div>
        </div>
        <VanCheckbox
          v-if="deleting"
          :model-value="isSelectedDeleting(product.id)"
          @update:model-value="(selected) => toggleDeletingCheck(product.id, selected)"
          class="history-checkbox"
          @click.stop
        />
      </VanGridItem>
    </VanGrid>
    <VanSubmitBar v-if="deleting">
      <template #default>
        <VanCheckbox
          :model-value="isDeletingCheckAll"
          @click="toggleDeletingCheckAll"
        >
          全选
        </VanCheckbox>
        <div class="van-submit-bar__text"></div>
      </template>
      <template #button>
        <VanButton
          round
          style="width: var(--van-submit-bar-button-width); height: var(--van-submit-bar-button-height); font-weight: var(--van-font-bold);"
          @click="deleteSelectedHistoryView"
        >
          删除
        </VanButton>
      </template>
    </VanSubmitBar>
  </div>
</template>

<style scoped>
.history-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
}
.history-checkbox :deep(:not(.van-checkbox__icon--checked) .van-icon) {
  background-color: #fff;
}
</style>
