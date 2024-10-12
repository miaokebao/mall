import axios from 'axios';
import _ from 'lodash';
import { fetchProduct } from './api';

export function convertProduct(rawProduct) {
  return {
    id: Number(rawProduct.id),
    title: rawProduct.title,
    sub_title: rawProduct.sub_title,
    thumb: rawProduct.thumb,
    thumbs: rawProduct.thumbs,
    sales_count: Number(rawProduct.sales_count),
    specs: _.map(rawProduct.specs, spec => ({
      id: Number(spec.id),
      title: spec.title,
      items: _.map(spec.items, item => ({
        id: Number(item.id),
        title: item.title,
      }))
    })),
    options: _.map(_.values(rawProduct.options), option => {
      return {
        id: Number(option.id),
        stock: Number(option.stock),
        price: Number(option.price),
        item_ids: _.map(_.sortBy(option.specs.split(',')), itemId => Number(itemId)),
        title: option.option_title.join(','),
      };
    })
  };
}

export function getOptionByItemIds(options, itemIds) {
  return _.find(options, option => _.isEqual(_.sortBy(option.item_ids), _.sortBy(itemIds)));
}

export function formatOrderItems(orderItems) {
  return _.map(orderItems, item => {
    const record = _.cloneDeep(item);
    record.option = _.find(record.product.options, option => option.id === record.option_id);
    return record;
  });
}

export async function getBufferFromImageUrls(urls) {
  const promises = _.map(urls, url => axios.get(url, {
    responseType: 'arraybuffer',
  }));
  const results = await Promise.all(promises);
  return results.map(result => result.data);
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x'? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

export function isMobileBrowser() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getProductMap(productIds) {
  const promises = _.map(productIds, productId => fetchProduct(productId));
  return Promise.all(promises)
    .then(results => {
      const products = results.map(result => convertProduct(result.data.data));
      return _.fromPairs(_.map(products, item => [item.id, item]));
    });
}

export async function getOrderItems(params) {
  const productIds = _.map(params, param => param.split('_')[0]);
  const productMap = await getProductMap(productIds);
  return formatOrderItems(_.map(params, param => {
    const [productId, optionId, quantity] = param.split('_');
    const product = productMap[productId];
    return {
      product: product,
      option_id: Number(optionId),
      quantity: Number(quantity),
    };
  }));
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const upload = await axios.post('https://tmpfiles.org/api/v1/upload', formData);
  return upload.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
}

export function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function formatDatetime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    + ` ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}