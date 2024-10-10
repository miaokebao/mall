<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { formatOrderItems } from '../util';

const router = useRouter();
const props = defineProps({
  data: {
    type: Array,
    required: true,
  }
});
const orderItems = computed(() => {
  return formatOrderItems(props.data);
});
</script>

<template>
  <div class="pt-10">
    <div class="product-list product-list-inset">
      <div
        v-for="(orderItem, index) in orderItems"
        :key="index"
        class="product-list-item"
      >
        <VanCard
          :title="orderItem.product.title"
          :price="Number(orderItem.option.price * 0.3).toFixed(2)"
          :origin-price="Number(orderItem.option.price).toFixed(2)"
          :thumb="orderItem.product.thumb"
          :num="orderItem.quantity"
          @click="router.push(`/products/${orderItem.product.id}`)"
          lazy-load
        >
          <template #tags>
            <VanTag
              round
              style="margin-top: 10px; padding: 3px 6px; background-color: var(--van-gray-2); color: #666;"
            >
              {{ orderItem.option.title }}
            </VanTag>
          </template>
        </VanCard>
      </div>
    </div>
  </div>
</template>
