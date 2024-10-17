<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCategoryList } from '../api.js';
import { showToast } from 'vant';

const router = useRouter();

const refreshing = ref(false);
const categoryGroupList = ref([]);
onMounted(() => {
  getCategoryList();
});

async function getCategoryList() {
  const response = await fetchCategoryList()
  refreshing.value = false;
  categoryGroupList.value = response.data.data;
}
function onRefresh() {
  getCategoryList();
}
function toSearch() {
  router.push(`/search`);
}
function onSearch() {
  showToast('请输入搜索内容');
}
</script>

<template>
  <VanSticky :offset-top="46">
    <VanSearch
      placeholder="请输入搜索内容"
      show-action
      @click-input="toSearch"
    >
      <template #action>
        <div @click="onSearch">搜索</div>
      </template>
    </VanSearch>
  </VanSticky>
  <div class="pt-20">
    <VanPullRefresh
      v-model="refreshing"
      @refresh="onRefresh"
    >
      <VanSpace
        direction="vertical"
        :size="20"
      >
        <div
          v-for="(categoryGroup, index) in categoryGroupList"
          :key="index"
        >
          <VanDivider class="divider">{{ categoryGroup.name }}</VanDivider>
          <VanGrid
            :border="false"
            clickable
          >
            <VanGridItem
              v-for="category in categoryGroup.childrens"
              :to="`/products?categoryId=${category.id}`"
              class="category-grid-item"
            >
              <VanImage
                round
                lazy-load
                :src="category.thumb"
                :width="60"
                :height="60"
              />
              <VanTextEllipsis :content="category.name" />
            </VanGridItem>
          </VanGrid>
        </div>
      </VanSpace>
    </VanPullRefresh>
  </div>
</template>

<style scoped>
.category-grid-item :deep(.van-grid-item__content) {
  background-color: transparent;
}
.divider {
  border-color: #666;
  width: 200px;
  margin: 0 auto;
}
</style>
