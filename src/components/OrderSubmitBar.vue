<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { closeToast, showLoadingToast, showSuccessToast } from 'vant';
import ExcelJS from 'exceljs';
import _ from 'lodash';
import { saveAs } from 'file-saver';
import copy from 'copy-to-clipboard';
import { downloadFile, formatOrderItems, generateUUID, getBufferFromImageUrls, isMobileBrowser, isWeChatBrowser, uploadFile } from '../util';

const router = useRouter();
const store = useStore();
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  fromCart: {
    type: Boolean,
    default: false,
  }
});
const orderItems = computed(() => {
  return formatOrderItems(props.data);
});
const totalPrice = computed(() => {
  return _.sum(_.map(orderItems.value, item => Number(item.quantity) * Number(item.option.price)));
});
const totalQuantity = computed(() => {
  return _.sum(_.map(orderItems.value, item => Number(item.quantity)));
});
const showShare = ref(false);
const shareOptions = [];
if (!isWeChatBrowser() && isMobileBrowser()) {
  shareOptions.push({ name: '微信', icon: 'wechat' });
}
shareOptions.push({ name: '复制链接', icon: 'link' });

async function exportOrder() {
  showLoadingToast({
    message: '导出中...',
    duration: 0,
    forbidClick: true,
  });
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('订单', {views:[{state: 'frozen', xSplit: 1, ySplit:1}]});
  worksheet.columns = [
    {
      header: '预览图',
      key: 'thumb',
      width: 30,
    },
    {
      header: '名称',
      key: 'title',
      width: 30,
    },
    {
      header: '规格',
      key: 'spec',
      width: 20,
    },
    {
      header: '单价（原价）',
      key: 'original_price',
      width: 20,
    },
    {
      header: '单价（折后价）',
      key: 'price',
      width: 20,
    },
    {
      header: '数量',
      key: 'quantity',
      width: 10,
    },
    {
      header: '小计（原价）',
      key: 'price',
      width: 20,
    },
    {
      header: '小计（折后价）',
      key: 'price',
      width: 20,
    },
  ];
  const totalSelectedQuantity = _.sum(_.map(orderItems.value, item => Number(item.quantity)));
  const totalSelectedPrice = _.sum(_.map(orderItems.value, orderItem => Number(orderItem.option.price) * Number(orderItem.quantity)));
  _.forEach(orderItems.value, orderItem => {
    const row = worksheet.addRow([
      '',
      orderItem.product.title,
      orderItem.option.title,
      Number(orderItem.option.price).toFixed(2),
      Number(orderItem.option.price * 0.3).toFixed(2),
      orderItem.quantity,
      Number(orderItem.option.price * orderItem.quantity).toFixed(2),
      Number(orderItem.option.price * 0.3 * orderItem.quantity).toFixed(2)
    ]);
    row.height = 200;
  });
  worksheet.addRow([
    '合计',
    '',
    '',
    '',
    '',
    totalSelectedQuantity,
    Number(totalSelectedPrice).toFixed(2),
    Number(totalSelectedPrice * 0.3).toFixed(2),
  ]);
  worksheet.mergeCells(orderItems.value.length + 2, 1, orderItems.value.length + 2, 5);
  const buffers = await getBufferFromImageUrls(_.map(orderItems.value, orderItem => orderItem.product.thumb));
  _.forEach(buffers, (buffer, index) => {
    const imageId = workbook.addImage({
      buffer: buffer,
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: index + 1 },
      br: { col: 1, row: index + 2 },
      editAs: 'undefined',
    });
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const file = new File([buffer], 'order.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = await uploadFile(file);
  downloadFile(url, 'order.xlsx');
  closeToast();
  store.dispatch('addHistoryOrder', {
    id: generateUUID(),
    params: getOrderParams().join(','),
    time: Date.now()
  });
  if (fromCart.value) {
    store.dispatch('clearSelectedCartRecords');
  }
}
function getOrderParams() {
  return _.reduce(orderItems.value, (params, orderItem) => {
    params.push(`${orderItem.product.id}_${orderItem.option_id}_${orderItem.quantity}`);
    return params;
  }, []);
}
function onShareSelect(option) {
  const params = getOrderParams();
  const baseUrl = `${window.location.origin}/mall/`;
  const href = router.resolve({ path: '/orderDetail', query: { params: params.join(',') } }).href;
  copy(`${baseUrl}${href}`);
  showSuccessToast('复制已链接');
  if (option.name == '微信') {
    window.location.href = 'weixin://';
  }
  showShare.value = false;
}
</script>

<template>
  <VanSubmitBar
    :price="totalPrice * 30"
    :button-text="`导出(${totalQuantity})`"
    @submit="exportOrder"
  >
    <template #default>
      <VanActionBarIcon
        icon="share-o"
        text="分享"
        @click="showShare = true"
      />
    </template>
  </VanSubmitBar>
  <VanShareSheet
    v-model:show="showShare"
    title="立即分享给好友"
    :options="shareOptions"
    @select="onShareSelect"
  />
</template>
