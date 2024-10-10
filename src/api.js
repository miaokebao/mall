import request from './request.js';

export function fetchCategoryList() {
  return request.get('/category/list?child_shop_id=');
}

const productMap = {};
export function fetchProduct(productId) {
  if (productMap[productId]) {
    return new Promise(resolve => {
      resolve(productMap[productId]);
    });
  }
  return request.get(`/details-new?id=${productId}`)
    .then(res => {
      productMap[productId] = res;
      return res;
    });
}

export function fetchProductList(categoryId, keyword, page, sort, by) {
  return request.get(`/list?title=${keyword}&category_ids=${categoryId}&group_ids=&page=${page}&page_size=20&sort=${sort}&by=${by}&lat=&lng=&coupon_id=&dycoupon_id=&from_dycoupon_list=&activity_id=&child_shop_id=&type=&recommend=`);
}
