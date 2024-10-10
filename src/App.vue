<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const route = useRoute();
const store = useStore();
function backPage() {
  if (router.options.history.state) {
    router.back();
  } else {
    router.push('/');
  }
}
</script>

<template>
  <div
    id="container"
    :style="{
      paddingBottom: route.meta.showTabBar ? '60px' : '0',
      boxSizing: 'border-box'
    }"
  >
    <VanSticky>
      <VanNavBar
        v-if="!!route.meta.pageTitle"
        :title="route.meta.pageTitle"
        :left-arrow="route.meta.pageBack"
        @click-left="backPage"
      />
    </VanSticky>
    <RouterView v-slot="{ Component }">
      <KeepAlive :include="['CategoryList', 'ProductList']">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
  <VanTabbar
    v-if="route.meta.showTabBar"
    route
  >
    <VanTabbarItem
      replace
      to="/"
      name="home"
      icon="home-o"
    >
      首页
    </VanTabbarItem>
    <VanTabbarItem
      replace
      to="/cart"
      name="cart"
      icon="cart-o"
      :badge="store.getters.totalQuantity > 0 ? store.getters.totalQuantity : ''"
    >
      购物车
    </VanTabbarItem>
    <VanTabbarItem
      replace
      to="/more"
      name="more"
      icon="more-o"
    >
      更多
    </VanTabbarItem>
  </VanTabbar>
  <VanBackTop
    v-if="route.meta.showBackTop"
    bottom="80"
  />
</template>
