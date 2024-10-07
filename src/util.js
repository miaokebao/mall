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

