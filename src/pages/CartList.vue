<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { showSuccessToast } from 'vant';
import _ from 'lodash';
import ProductSpecPicker from '../components/ProductSpecPicker.vue';
import { formatOrderItems, getOptionByItemIds } from '../util';

const route = useRoute();
const router = useRouter();
const store = useStore();

const deleting = ref(false);
const deletingIds = ref([]);
const showSpecPicker = ref(false);
const editingCartRecord = ref({
  product: {},
  quantity: 1,
  option_id: 0,
  option: {},
  selectedItemIds: []
});
const cartList = computed(() => {
  return formatOrderItems(store.state.cart.cartList);
});
const isCheckAll = computed(() => {
  return _.every(cartList.value, item => item.selected);
});
const isDeletingCheckAll = computed(() => {
  return _.isEqual(_.sortBy(deletingIds.value), _.sortBy(_.map(cartList.value, 'id')));
});
watch(
  () => route,
  (newValue) => {
    if (newValue.name !== 'cart') {
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
  deletingIds.value = isDeletingCheckAll.value ? [] : _.map(cartList.value, 'id');
}
function toggleDeletingCheck(id, selected) {
  deletingIds.value = selected ? _.concat(deletingIds.value, id) : _.without(deletingIds.value, id);
}
function deleteSelectedCartRecord() {
  if (deletingIds.value.length === 0) {
    return;
  }
  _.forEach(deletingIds.value, id => {
    store.dispatch('deleteCartRecord', id);
  });
}
function deleteCartRecord(id) {
  store.dispatch('deleteCartRecord', id);
}
function toggleCartCheckAll() {
  store.dispatch('toggleCartCheckAll', !isCheckAll.value);
}
function updateQuantity(id, quantity) {
  store.dispatch('updateCartRecord', {
    id: id,
    quantity: quantity,
  });
}
function updateSelected(id, selected) {
  store.dispatch('updateCartRecord', {
    id: id,
    selected: selected,
  });
}
function editProductSpec(cartRecord) {
  editingCartRecord.value = cartRecord;
  editingCartRecord.value.selectedItemIds = cartRecord.option.item_ids;
  showSpecPicker.value = true;
}
function selectProductSpec(inputItemIds, inputQuantity, confirm) {
  if (!confirm) {
    return;
  }
  editingCartRecord.value.selectedItemIds = inputItemIds;
  editingCartRecord.value.quantity = inputQuantity;
  if (editingCartRecord.value.selectedItemIds.length === 0 || editingCartRecord.value.selectedItemIds.length !== editingCartRecord.value.product.specs.length) {
    vant.showToast('请选择完整规格');
    return;
  }
  const selectedOption = getOptionByItemIds(editingCartRecord.value.product.options, editingCartRecord.value.selectedItemIds);
  if (editingCartRecord.value.quantity > selectedOption.stock) {
    vant.showToast('库存不足');
    return;
  }
  store.dispatch('updateCartRecord', {
    id: editingCartRecord.value.id,
    quantity: editingCartRecord.value.quantity,
    option_id: selectedOption.id,
  });
  showSuccessToast('修改成功');
}
</script>

<template>
  <VanEmpty v-if="cartList.length == 0">
    <template #description>
      <div style="text-align: center;">
        购物车为空
        <br />
        赶紧去逛逛，挑选心仪的商品吧
      </div>
    </template>
    <VanButton
      plain
      type="danger"
      @click="router.replace('/')"
    >
      去逛逛
    </VanButton>
  </VanEmpty>
  <div
    v-else
    style="padding-bottom: 50px;"
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
    <template v-if="deleting">
      <div class="product-list product-list-inset">
        <div
          v-for="(cartRecord, index) in cartList"
          :key="index"
          class="product-list-item"
        >
          <div style="display: flex;">
            <VanCheckbox
              :model-value="isSelectedDeleting(cartRecord.id)"
              @update:model-value="(selected) => toggleDeletingCheck(cartRecord.id, selected)"
              style="margin-left: 16px;"
            />
            <VanCard
              :title="cartRecord.product.title"
              :price="Number(cartRecord.option.price * 0.3).toFixed(2)"
              :origin-price="Number(cartRecord.option.price).toFixed(2)"
              :thumb="cartRecord.product.thumb"
              :num="orderItem.quantity"
              lazy-load
              style="flex: 1 1 0; margin: 0;"
            >
              <template #tags>
                <VanTag
                  round
                  style="margin-top: 10px; padding: 3px 6px; background-color: var(--van-gray-2); color: #666;"
                >
                  {{ cartRecord.option.title }}
                </VanTag>
              </template>
            </VanCard>
          </div>
        </div>
      </div>
      <VanSubmitBar style="bottom: 50px;">
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
            @click="deleteSelectedCartRecord"
          >
            删除
          </VanButton>
        </template>
      </VanSubmitBar>
    </template>
    <template v-else>
      <div class="product-list product-list-inset">
        <VanSwipeCell
          v-for="(cartRecord, index) in cartList"
          :key="index"
          class="product-list-item"
        >
          <div style="display: flex;">
            <VanCheckbox
              :model-value="cartRecord.selected"
              @update:model-value="(selected) => updateSelected(cartRecord.id, selected)"
              style="margin-left: 16px;"
            />
            <VanCard
              :title="cartRecord.product.title"
              :price="Number(cartRecord.option.price * 0.3).toFixed(2)"
              :origin-price="Number(cartRecord.option.price).toFixed(2)"
              :thumb="cartRecord.product.thumb"
              @click="router.push(`/products/${cartRecord.product.id}`)"
              lazy-load
              style="flex: 1 1 0; margin: 0;"
            >
              <template #tags>
                <VanTag
                  round
                  style="margin-top: 10px; padding: 3px 6px; background-color: var(--van-gray-2); color: #666;"
                  @click.stop="editProductSpec(cartRecord)"
                >
                  {{ cartRecord.option.title }}
                  <VanIcon name="arrow-down" />
                </VanTag>
              </template>
              <template #num>
                <VanStepper
                  :model-value="cartRecord.quantity"
                  @change="(value) => updateQuantity(cartRecord.id, value)"
                  :max="cartRecord.option.stock"
                  button-size="20px"
                  @click.stop
                />
              </template>
            </VanCard>
          </div>
          <template #right>
            <VanButton
              square
              text="删除"
              type="danger"
              @click="deleteCartRecord(cartRecord.id)"
              style="height: 100%;"
            />
          </template>
        </VanSwipeCell>
      </div>
      <VanSubmitBar
        :price="store.getters.totalSelectedPrice * 30"
        :button-text="`确认(${store.getters.totalSelectedQuantity})`"
        style="bottom: 50px;"
        @submit="router.push('/orderConfirm')"
      >
        <template #default>
          <VanCheckbox
            :model-value="isCheckAll"
            @click="toggleCartCheckAll"
          >
            全选
          </VanCheckbox>
        </template>
      </VanSubmitBar>
    </template>
    <ProductSpecPicker
      v-model:show="showSpecPicker"
      :product="editingCartRecord.product"
      :default-item-ids="editingCartRecord.selectedItemIds"
      :default-quantity="editingCartRecord.quantity"
      button-text="确认"
      @select="selectProductSpec"
    />
  </div>
</template>
