<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import _ from 'lodash';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const store = useStore();
const cartList = computed(() => {
  return store.getters.selectedCartList;
});
async function getBufferFromImageUrls(urls) {
  const promises = _.map(urls, url => axios.get(url, {
    responseType: 'arraybuffer',
  }));
  const results = await Promise.all(promises);
  return results.map(result => result.data);
}
async function exportOrder() {
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
  const selectedCartList = _.filter(cartList.value, cartRecord => cartRecord.selected);
  const totalSelectedQuantity = _.sum(_.map(selectedCartList, item => Number(item.quantity)));
  const totalSelectedPrice = _.sum(_.map(selectedCartList, cartRecord => Number(cartRecord.option.price) * Number(cartRecord.quantity)));
  _.forEach(selectedCartList, cartRecord => {
    const row = worksheet.addRow([
      '',
      cartRecord.product.title,
      cartRecord.option.title,
      Number(cartRecord.option.price).toFixed(2),
      Number(cartRecord.option.price * 0.3).toFixed(2),
      cartRecord.quantity,
      Number(cartRecord.option.price * cartRecord.quantity).toFixed(2),
      Number(cartRecord.option.price * 0.3 * cartRecord.quantity).toFixed(2)
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
  worksheet.mergeCells(selectedCartList.length + 2, 1, selectedCartList.length + 2, 5);
  const buffers = await getBufferFromImageUrls(_.map(selectedCartList, cartRecord => cartRecord.product.thumb));
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
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, '订单.xlsx');
  });
}
</script>

<template>
  <div style="padding-bottom: 50px;">
    <VanCard
      v-for="(cartRecord, index) in cartList"
      :key="index"
      class="product-card"
      :title="cartRecord.product.title"
      :price="Number(cartRecord.option.price * 0.3).toFixed(2)"
      :origin-price="Number(cartRecord.option.price).toFixed(2)"
      :thumb="cartRecord.product.thumb"
      lazy-load
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
    <VanSubmitBar
      :price="$store.getters.totalSelectedPrice * 30"
      :button-text="`生成清单(${$store.getters.totalSelectedQuantity})`"
      @submit="exportOrder"
    >
    </VanSubmitBar>
  </div>
</template>