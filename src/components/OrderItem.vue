<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  clickable: {
    type: Boolean,
    default: true,
  },
  hasRadio: {
    type: Boolean,
    default: false,
  },
  radio: {
    type: Boolean,
    default: false,
  }
});
const emit = defineEmits(['update:radio']);
</script>

<template>
  <div
    class="product-list-item"
    :style="hasRadio ? { display: 'flex' } : {}"
  >
    <VanCheckbox
      v-if="hasRadio"
      :model-value="radio"
      @update:model-value="(selected) => emit('update:radio', selected)"
      style="margin-left: 16px;"
    />
    <VanCard
      :title="data.product.title"
      :price="Number(data.option.price * 0.3).toFixed(2)"
      :origin-price="Number(data.option.price).toFixed(2)"
      :thumb="data.product.thumb"
      :num="data.quantity"
      lazy-load
      @click="clickable ? router.push(`/products/${data.product.id}`) : undefined"
      :style="hasRadio ? { flex: '1 1 0', margin: '0' } : {}"
    >
      <template #tags>
        <VanTag
          round
          style="margin-top: 10px; padding: 3px 6px; background-color: var(--van-gray-2); color: #666;"
        >
          {{ data.option.title }}
        </VanTag>
      </template>
    </VanCard>
  </div>
</template>
