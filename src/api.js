import request from './request.js';

export function fetchCategoryList() {
  return request.get('/category/list?child_shop_id=');
}

export function fetchProduct(productId) {
  return request.get(`/details-new?id=${productId}&activity_id=undefined`);
}

export function fetchProducts(categoryId, keyword, page, sort, by) {
  return request.get(`/list?title=${keyword}&category_ids=${categoryId}&group_ids=&page=${page}&page_size=20&sort=${sort}&by=${by}&lat=&lng=&coupon_id=&dycoupon_id=&from_dycoupon_list=&activity_id=&child_shop_id=&type=&recommend=`);
}
