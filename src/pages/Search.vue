<script setup>
import { ref, watch, useTemplateRef, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';
import { showToast } from 'vant';

const props = defineProps({
  keyword: {
    type: String,
    default: ''
  }
});

const route = useRoute();
const router = useRouter();
const search = useTemplateRef('search');

const rawHistoryKeywords = JSON.parse(window.localStorage.getItem('historyKeywords'));
const historyKeywords = ref(_.isArray(rawHistoryKeywords) ? rawHistoryKeywords : []);
const currentKeyword = ref('');
const deleting = ref(false);

function onSearch(value) {
  if (value === '') {
    showToast('请输入搜索内容');
    return;
  }
  addHistoryKeyword(value);
  router.replace(`/products?keyword=${value}`);
}
function onClickSearch() {
  onSearch(currentKeyword.value);
}
function addHistoryKeyword(historyKeyword) {
  if (historyKeyword === '') {
    return;
  }
  historyKeywords.value = _.take(_.concat([historyKeyword], _.without(historyKeywords.value, historyKeyword)), 20);
}
function deleteHistoryKeyword(historyKeyword) {
  if (historyKeyword === '') {
    return;
  }
  historyKeywords.value = _.without(historyKeywords.value, historyKeyword);
}
function deleteAllHistoryKeywords() {
  historyKeywords.value = [];
  deleting.value = false;
}

watch(
  () => historyKeywords.value,
  (value) => {
    localStorage.setItem('historyKeywords', JSON.stringify(value));
  },
  { deep: true }
);

watch(
  () => route,
  async (newValue) => {
    if (newValue.name !== 'search') {
      return;
    }
    await nextTick();
    search.value.focus();
    currentKeyword.value = props.keyword;
    await nextTick();
    const searchInput = search.value.$el.querySelector('input');
    if (searchInput) {
      searchInput.setSelectionRange(-1, -1);
    }
  },
  { immediate: true }
)
</script>

<template>
  <VanSticky :offset-top="46">
    <VanSearch
      v-model="currentKeyword"
      placeholder="请输入搜索内容"
      show-action
      ref="search"
      @search="onSearch"
    >
      <template #action>
        <div @click="onClickSearch">搜索</div>
      </template>
    </VanSearch>
  </VanSticky>
  <div style="height: calc(100vh - 100px); background-color: #fff;">
    <div
      v-if="historyKeywords.length > 0"
      style="padding: 10px;"
    >
      <VanRow style="margin-bottom: 10px;">
        <VanCol span="12">
          <span style="font-size: var(--van-font-size-lg); font-weight: var(--van-font-bold);">搜索历史</span>
        </VanCol>
        <VanCol
          span="12"
          style="text-align: right;"
        >
          <div v-if="deleting">
            <span
              style="color: var(--van-red);"
              @click="deleteAllHistoryKeywords"
            >
              清空
            </span>
            <VanDivider vertical />
            <span @click="deleting = false">完成</span>
          </div>
          <span
            v-else
            @click="deleting = true"
          >
            管理
          </span>
        </VanCol>
      </VanRow>
      <VanSpace>
        <VanTag
          v-for="historyKeyword in historyKeywords"
          :key="historyKeyword"
          :closeable="deleting"
          size="large"
          style="background-color: var(--van-gray-2); color: #666;"
          @click="deleting ? deleteHistoryKeyword(historyKeyword) : onSearch(historyKeyword)"
          @close="deleteHistoryKeyword(historyKeyword)"
        >
          {{ historyKeyword }}
        </VanTag>
      </VanSpace>
    </div>
  </div>
</template>
