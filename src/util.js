import axios from 'axios';
import _ from 'lodash';

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
