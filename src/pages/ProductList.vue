<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { showSuccessToast } from 'vant';
import ProductSpecPicker from '../components/ProductSpecPicker.vue';
import { convertProduct, getOptionByItemIds } from '../util.js';
import { fetchProduct, fetchProductList } from '../api.js';

const props = defineProps({
  categoryId: {
    type: Number,
    default: 0
  },
  keyword: {
    type: String,
    default: ''
  },
  sort: {
    type: Number,
    default: 0
  }
});

const store = useStore();
const router = useRouter();
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const productList = ref([]);
const showSpecPicker = ref(false);
const currentRecord = ref({
  product: {},
  quantity: 1,
  option_id: 0,
  option: {},
  selectedItemIds: []
});
const sortOptions = ref([
  { text: '综合', value: 0 },
  { text: '销量', value: 1 },
  { text: '价格从高到低', value: 2 },
  { text: '价格从低到高', value: 3 },
]);
const displayStyle = computed(() => {
  return store.state.displayStyle.displayStyle;
});

async function onLoad() {
  const sortMap = {
    0: {sort: '', by: ''},
    1: {sort: 'sales_count', by: 'desc'},
    2: {sort: 'price', by: 'desc'},
    3: {sort: 'price', by: 'asc'},
  };
  const sort = sortMap[props.sort].sort;
  const by = sortMap[props.sort].by;
  const response = await fetchProductList(props.categoryId, props.keyword, page.value, sort, by);
  if (refreshing.value) {
    refreshing.value = false;
    productList.value = [];
  }
  productList.value = productList.value.concat(response.data.list);
  loading.value = false;
  if (page.value >= response.data.pageCount) {
    finished.value = true;
  } else {
    page.value++;
  }
}
function onRefresh() {
  finished.value = false;
  loading.value = true;
  page.value = 1;
  onLoad();
}
function toSearch() {
  router.replace({
    path: '/search',
    query: {
      keyword: props.keyword
    }
  });
}
function changeSort(sortValue) {
  router.replace({
    path: '/products',
    query: {
      categoryId: props.categoryId,
      keyword: props.keyword,
      sort: sortValue,
    }
  });
}
async function addCart(productId) {
  const response =  await fetchProduct(productId);
  showSpecPicker.value = true;
  currentRecord.value = {
    product: convertProduct(response.data.data),
    quantity: 1,
    option_id: 0,
    option: {},
    selectedItemIds: []
  };
}
function selectProductSpec(inputItemIds, inputQuantity, confirm) {
  if (!confirm) {
    return;
  }
  currentRecord.value.selectedItemIds = inputItemIds;
  currentRecord.value.quantity = inputQuantity;
  if (currentRecord.value.selectedItemIds.length === 0 || currentRecord.value.selectedItemIds.length !== currentRecord.value.product.specs.length) {
    vant.showToast('请选择完整规格');
    return;
  }
  const selectedOption = getOptionByItemIds(currentRecord.value.product.options, currentRecord.value.selectedItemIds);
  if (currentRecord.value.quantity > selectedOption.stock) {
    vant.showToast('库存不足');
    return;
  }
  store.dispatch('addCartRecord', {
    product: currentRecord.value.product,
    option_id: selectedOption.id,
    quantity: currentRecord.value.quantity
  });
  showSuccessToast('加购成功');
}
function toggleDisplayStyle() {
  store.dispatch('toggleDisplayStyle');
}

watch(
  () => ({
    categoryId: props.categoryId,
    keyword: props.keyword,
    sort: props.sort
  }),
  (newValue, oldValue) => {
    refreshing.value = false;
    loading.value = true;
    finished.value = false;
    page.value = 1;
    productList.value = [];
    showSpecPicker.value = false;
    onLoad();
  },
  { immediate: true }
);
</script>

<template>
  <VanSticky :offset-top="46">
    <VanSearch
      :model-value="keyword"
      placeholder="请输入搜索内容"
      @focus="toSearch"
    />
  </VanSticky>
  <VanEmpty
    v-if="!loading && finished && productList.length == 0"
    image="search"
    description="暂无商品"
  >
  </VanEmpty>
  <template v-else>
    <VanSticky :offset-top="54">
      <div class="sort-bar">
        <VanDropdownMenu style="flex: 1 1 0;">
          <VanDropdownItem
            :model-value="sort"
            :options="sortOptions"
            @update:model-value="(value) => changeSort(value)"
          />
        </VanDropdownMenu>
        <div class="sort-icon" @click="toggleDisplayStyle">
          <VanIcon
            v-if="displayStyle == 'list'"
            name="list-switch"
          />
          <VanIcon
            v-else
            name="list-switching"
          />
        </div>
      </div>
    </VanSticky>
    <VanPullRefresh
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
        <template v-if="displayStyle === 'list'">
          <VanCellGroup
            v-for="(product, index) in productList"
            :key="index"
            inset
            style="margin-top: 10px;"
          >
            <VanCard
              class="product-list-item"
              :title="product.title"
              :desc="product.sub_title"
              :price="Number(product.price * 0.3).toFixed(2)"
              :origin-price="Number(product.price).toFixed(2)"
              :thumb="product.thumb"
              :tag="product.stock == 0 ? '售罄' : ''"
              @click="router.push(`/products/${product.id}`)"
            >
              <template #bottom>
                <div style="color: var(--van-card-desc-color);">已售 {{ product.sales_count }}</div>
              </template>
              <template #num>
                <VanButton
                  type="danger"
                  size="mini"
                  icon="cart-o"
                  round
                  plain
                  @click.stop="addCart(product.id)"
                />
              </template>
            </VanCard>
          </VanCellGroup>
        </template>
        <template v-else>
          <VanGrid
            :border="false"
            :column-num="2"
            :gutter="10"
            class="product-grid mt-10"
          >
            <VanGridItem
              v-for="(product, index) in productList"
              :key="index"
              :to="`/products/${product.id}`"
            >
              <VanImage
                lazy-load
                :src="product.thumb"
                fit="cover"
              />
              <div style="width: 100%; padding: 10px; box-sizing: border-box;">
                <div style="font-size: 16px;">
                  <VanTextEllipsis :content="product.title" />
                </div>
                <div>
                  <span style="color: var(--van-card-price-color);">
                    ¥ <span style="font-size: 16px;">{{ Number(product.price * 0.3).toFixed(2) }}</span>
                  </span>
                  <span class="van-card__origin-price">{{ Number(product.price).toFixed(2) }}</span>
                </div>
                <VanRow>
                  <VanCol span="12" style="color: var(--van-card-desc-color); line-height: 24px;">已售 {{ product.sales_count }}</VanCol>
                  <VanCol span="12" style="text-align: right;">
                    <VanButton
                      type="danger"
                      size="mini"
                      icon="cart-o"
                      round
                      plain
                      @click.stop="addCart(product.id)"
                    />
                  </VanCol>
                </VanRow>
              </div>
            </VanGridItem>
          </VanGrid>
        </template>
      </VanList>
    </VanPullRefresh>
  </template>
  <ProductSpecPicker
    v-model:show="showSpecPicker"
    :product="currentRecord.product"
    :default-item-ids="currentRecord.selectedItemIds"
    :default-quantity="currentRecord.quantity"
    button-text="加入购物车"
    @select="selectProductSpec"
  />
</template>

<style scoped>
.sort-bar {
  display: flex;
}
.sort-bar :deep(.van-dropdown-menu__bar) {
  box-shadow: none;
}
.sort-bar .sort-icon {
  min-width: var(--van-action-bar-icon-width);
  color: var(--van-action-bar-icon-text-color);
  font-size: var(--van-action-bar-icon-font-size);
  text-align: center;
  background: var(--van-action-bar-icon-background);
  cursor: pointer;
  font-size: 18px;
  line-height: var(--van-dropdown-menu-height);
}
.sort-bar .sort-icon:active {
  background-color: var(--van-action-bar-icon-active-color);
}
</style>
