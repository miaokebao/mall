<script setup>
import { ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { showImagePreview, showSuccessToast } from 'vant';
import ProductSpecPicker from '../components/ProductSpecPicker.vue';
import { convertProduct, getOptionByItemIds, isMobileBrowser, isWeChatBrowser } from '../util.js';
import { fetchProduct } from '../api.js';
import _ from 'lodash';
import copy from 'copy-to-clipboard';

const store = useStore();
const props = defineProps({
  productId: {
    type: Number,
    default: 0
  }
});
const loading = ref(false);
const product = ref({
  id: 0,
  title: '',
  sub_title: '',
  thumb: '',
  thumbs: [],
  sales_count: 0,
  specs: [],
  options: []
});
const quantity = ref(1);
const selectedItemIds = ref([]);
const showSpecPicker = ref(false);
const optionCount = computed(() => {
  return product.value.options.length;
});
const showPrice = computed(() => {
  return product.value.options.length === 0 ? 0 : _.min(_.map(product.value.options, 'price'));
});
const showStock = computed(() => {
  return product.value.options.length === 0 ? 0 : _.sum(_.map(product.value.options, 'stock'));
});
const selectedOption = computed(() => {
  return getOptionByItemIds(product.value.options, selectedItemIds.value);
});
const showShare = ref(false);
const shareOptions = [];
if (!isWeChatBrowser() && isMobileBrowser()) {
  shareOptions.push({ name: '微信', icon: 'wechat' });
}
shareOptions.push({ name: '复制链接', icon: 'link' });

async function getProduct() {
  loading.value = true;
  const response = await fetchProduct(props.productId);
  loading.value = false;
  product.value = convertProduct(response.data.data);
  store.dispatch('addHistoryView', {
    id: product.value.id,
    thumb: product.value.thumb,
    price: _.min(_.map(product.value.options, 'price')),
    view_time: Date.now()
  });
}
function previewImage(startPosition) {
  showImagePreview({
    images: product.value.thumbs,
    startPosition: startPosition,
    closeable: true
  });
}
function selectProductSpec(inputItemIds, inputQuantity, confirm) {
  selectedItemIds.value = inputItemIds;
  quantity.value = inputQuantity;
  if (confirm) {
    store.dispatch('addCartRecord', {
      product: product.value,
      option_id: selectedOption.value.id,
      quantity: quantity.value
    });
    showSuccessToast('加购成功');
  }
}
function onShareSelect(option) {
  copy(window.location.href);
  showSuccessToast('链接已复制');
  if (option.name == '微信') {
    window.location.href = 'weixin://';
  }
  showShare.value = false;
}

watch(
  () => props.productId,
  (newValue) => {
    product.value = {
      id: 0,
      title: '',
      sub_title: '',
      thumb: '',
      thumbs: [],
      sales_count: 0,
      specs: [],
      options: []
    },
    quantity.value = 1;
    selectedItemIds.value = [];
    showSpecPicker.value = false;
    getProduct();
  },
  { immediate: true }
);
</script>

<template>
  <VanSpace
    direction="vertical"
    style="width: 100%; padding-bottom: 65px;"
    :size="16"
  >
    <VanSwipe
      class="product-swipe"
      :autoplay="3000"
    >
      <VanSwipeItem
        v-for="(thumb, index) in product.thumbs"
        :key="index"
        @click="previewImage(index)"
      >
        <img :src="thumb" />
      </VanSwipeItem>
    </VanSwipe>
    <VanCellGroup inset>
      <VanCell>
        <template #title>
          <div>
            <span style="color: var(--van-card-price-color);">
              ¥ <span style="font-size: 22px;">{{ Number(showPrice * 0.3).toFixed(2) }}</span>
            </span>
            <span class="van-card__origin-price">{{ Number(showPrice).toFixed(2) }}</span>
          </div>
          <div style="font-size: 18px; margin-top: 10px;">
            {{ product.title }}
          </div>
          <div
            v-if="!!product.sub_title"
            style="color: var(--van-card-desc-color); margin-top: 10px;"
          >
            {{ product.sub_title }}
          </div>
        </template>
      </VanCell>
      <VanCell>
        <template #title>
          <VanRow>
            <VanCol span="12">
              销量：{{ product.sales_count }}
            </VanCol>
            <VanCol span="12" style="text-align: right;">
              库存：{{ showStock }}
            </VanCol>
          </VanRow>
        </template>
      </VanCell>
    </VanCellGroup>
    <VanCellGroup inset>
      <VanCell
        :value="`共${optionCount}种规格可选`"
        is-link
        clickable
        @click="showSpecPicker = true"
      >
        <template #title>
          <template v-if="selectedOption">
            已选择 {{ selectedOption.title }} × {{ quantity }}
          </template>
          <template v-else>
            请选择
          </template>
        </template>
      </VanCell>
    </VanCellGroup>
  </VanSpace>
  <VanNotify
    :show="product.options.length > 0 && showStock == 0"
    type="warning"
    style="top: 46px;"
  >
    <span>已售罄</span>
  </VanNotify>
  <VanActionBar>
    <VanActionBarIcon
      icon="cart-o"
      text="购物车"
      replace
      to="/cart"
      :badge="store.getters.totalQuantity > 0 ? store.getters.totalQuantity : ''"
    />
    <VanActionBarIcon
      icon="share-o"
      text="分享"
      @click="showShare = true"
    />
    <VanActionBarButton
      type="danger"
      @click="showSpecPicker = true"
      :disabled="showStock == 0"
    >
      加入购物车
    </VanActionBarButton>
  </VanActionBar>
  <ProductSpecPicker
    v-model:show="showSpecPicker"
    :product="product"
    :default-item-ids="selectedItemIds"
    :default-quantity="quantity"
    button-text="加入购物车"
    @select="selectProductSpec"
  />
  <VanShareSheet
    v-model:show="showShare"
    title="立即分享给好友"
    :options="shareOptions"
    @select="onShareSelect"
  />
</template>

<style scoped>
.product-swipe img {
  width: 100%;
  display: block;
}
</style>
