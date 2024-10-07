<script setup>
import { ref, computed, watch } from 'vue';
import _ from 'lodash';
import { getOptionByItemIds } from '../util';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: {}
  },
  defaultItemIds: {
    type: Array,
    default: []
  },
  defaultQuantity: {
    type: Number,
    default: 0
  },
  buttonText: {
    type: String,
    default: '确定'
  }
});
const emit = defineEmits(['update:show', 'select']);

const selectedItemIds = ref([]);
const quantity = ref(1);
const allItems = computed(() => {
  return _.flatten(_.map(props.product.specs, spec => {
    return _.map(_.cloneDeep(spec.items), item => {
      item.spec_id = spec.id;
      return item;
    });
  }));
});
const filteredOptionPrice = computed(() => {
  const options = filteredOptions(selectedItemIds.value);
  return options.length === 0 ? 0 : _.min(_.map(options, 'price'));
});
const filteredOptionStock = computed(() => {
  const options = filteredOptions(selectedItemIds.value);
  return options.length === 0 ? 0 : _.sum(_.map(options, 'stock'));
});
function filteredOptions(itemIds) {
  let options = props.product.options;
  for (var i = 0; i < itemIds.length; i++) {
    options = _.filter(options, option => _.includes(option.item_ids, itemIds[i]));
  }
  return options;
}
function getSpecIdByItemId(itemId) {
  return _.find(allItems.value, item => item.id == itemId).spec_id;
};
function getItemIdsBySpecId(specId) {
  return _.map(_.filter(allItems.value, item => item.spec_id == specId), 'id');
};
function isDisabledItemId(itemId) {
  const sameSpecItemIds = getItemIdsBySpecId(getSpecIdByItemId(itemId));
  const itemIds = _.concat(_.filter(selectedItemIds.value, itemId => !_.includes(sameSpecItemIds, itemId)), itemId);
  const options = filteredOptions(itemIds);
  return !_.some(options, option => option.stock != 0);
};
function isSelectedItemId(itemId) {
  return _.includes(selectedItemIds.value, itemId);
};
function toggleSelectItemId(itemId) {
  if (_.includes(selectedItemIds.value, itemId)) {
    selectedItemIds.value = _.without(selectedItemIds.value, itemId);
  } else {
    if (isDisabledItemId(itemId)) {
      return;
    }
    const sameSpecItemIds = getItemIdsBySpecId(getSpecIdByItemId(itemId));
    selectedItemIds.value = _.concat(_.without(selectedItemIds.value, ...sameSpecItemIds), itemId);
  }
};
function onClose() {
  emit('select', selectedItemIds.value, quantity.value, false);
  emit('update:show', false);
};
function onConfirm() {
  if (selectedItemIds.value.length === 0 || selectedItemIds.value.length != props.product.specs.length) {
    vant.showToast('请选择完整规格');
    return;
  }
  const selectedOption = getOptionByItemIds(props.product.options, selectedItemIds.value);
  if (quantity.value > selectedOption.stock) {
    vant.showToast('库存不足');
    return;
  }
  emit('select', selectedItemIds.value, quantity.value, true);
  emit('update:show', false);
}

watch(
  () => props.defaultItemIds,
  (value) => {
    selectedItemIds.value = value;
  },
  { immediate: true }
);
watch(
  () => props.defaultQuantity,
  (value) => {
    quantity.value = value;
  },
  { immediate: true }
);
</script>

<template>
  <VanPopup
    :show="show"
    :style="{ height: '80%' }"
    closeable
    position="bottom"
    @close="onClose"
  >
    <div style="height: 100%; overflow-y: auto; padding: 20px 10px 70px 10px; box-sizing: border-box;">
      <VanSpace
        direction="vertical"
        style="width: 100%;"
        :size="20"
      >
        <div style="display: flex;">
          <VanImage
            width="100"
            height="100"
            radius="10"
            :src="product.thumb"
          />
          <div style="margin-left: 15px;">
            <div>
              <span style="color: var(--van-card-price-color);">
                ¥ <span style="font-size: var(--van-font-size-lg);">{{ Number(filteredOptionPrice * 0.3).toFixed(2) }}</span>
              </span>
              <span class="van-card__origin-price">{{ Number(filteredOptionPrice).toFixed(2) }}</span>
            </div>
            <div style="color: var(--van-card-desc-color); margin-top: 15px; margin-bottom: 15px;">
              库存 {{ filteredOptionStock }} 件
            </div>
            <VanStepper
              v-model="quantity"
              :max="filteredOptionStock"
            />
          </div>
        </div>
        <template v-for="(spec, index) in product.specs" :key="index">
          <div>
            <div style="margin-bottom: 10px; font-weight: var(--van-font-bold);">{{ spec.title }}</div>
            <VanSpace wrap>
              <VanTag
                v-for="item in spec.items"
                type="danger"
                size="large"
                round
                :plain="isSelectedItemId(item.id)"
                style="padding: 6px 12px; cursor: pointer;"
                :style="isDisabledItemId(item.id)
                  ? { backgroundColor: 'var(--van-gray-2)', color: '#ccc' }
                  : (isSelectedItemId(item.id) ? { backgroundColor: '#ffe1e1' } : { backgroundColor: 'var(--van-gray-2)', color: '#666' })"
                @click="toggleSelectItemId(item.id)"
              >
                {{ item.title }}
              </VanTag>
            </VanSpace>
          </div>
        </template>
      </VanSpace>
    </div>
    <VanActionBar>
      <VanActionBarButton
        type="danger"
        @click="onConfirm"
      >
        {{ buttonText }}
      </VanActionBarButton>
    </VanActionBar>
  </VanPopup>
</template>