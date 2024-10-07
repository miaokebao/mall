import { createRouter, createWebHashHistory } from 'vue-router';
import store from './store';

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/CategoryList.vue'),
      meta: {
        pageTitle: '首页',
        pageBack: false,
        showTabBar: true,
        showBackTop: true,
      }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('./pages/Search.vue'),
      props: route => ({ keyword: route.query.keyword || '' }),
      meta: {
        pageTitle: '搜索',
        pageBack: true,
        showTabBar: false,
        showBackTop: false,
      }
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('./pages/ProductList.vue'),
      props: route => ({
        categoryId: Number(route.query.categoryId || 0),
        keyword: route.query.keyword || '',
        sort: Number(route.query.sort || 0),
      }),
      meta: {
        pageTitle: '商品列表',
        pageBack: true,
        showTabBar: false,
        showBackTop: true,
      }
    },
    {
      path: '/products/:productId',
      name: 'product',
      component: () => import('./pages/ProductDetail.vue'),
      props: route => ({ productId: Number(route.params.productId) }),
      meta: {
        pageTitle: '商品详情',
        pageBack: true,
        showTabBar: false,
        showBackTop: false,
      }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('./pages/CartList.vue'),
      meta: {
        pageTitle: '购物车',
        pageBack: false,
        showTabBar: true,
        showBackTop: false,
      }
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('./pages/ViewHistoryList.vue'),
      meta: {
        pageTitle: '浏览历史',
        pageBack: false,
        showTabBar: true,
        showBackTop: false,
      }
    },
    {
      path: '/orderConfirm',
      name: 'orderConfirm',
      component: () => import('./pages/OrderConfirm.vue'),
      meta: {
        pageTitle: '确认订单',
        pageBack: true,
        showTabBar: false,
        showBackTop: false,
      },
      beforeEnter() {
        if (!store.getters.totalSelectedQuantity) {
          return { path: '/cart' };
        }
      }
    },
  ]
});

export default router;
