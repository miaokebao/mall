<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast } from 'vant';
import { downloadFile } from '../util';
import copy from 'copy-to-clipboard';

const props = defineProps({
  url: {
    type: String,
    default: ''
  }
});
const router = useRouter();

function copyLink() {
  copy(props.url);
  showSuccessToast('链接已复制');
}
function backHome() {
  router.replace('/');
}

onMounted(() => {
  downloadFile(props.url, 'order.xlsx');
});
</script>

<template>
  <div class="msg">
    <div class="msg-icon-area">
      <VanIcon
        name="checked"
        color="#07c160"
        size="60"
      />
    </div>
    <div class="msg-text-area">
      <h2 class="msg-title">导出成功</h2>
      <p class="msg-desc">导出已经开始，若浏览器没有自动下载，可点此下方按钮复制链接进行下载</p>
    </div>
    <div class="msg-opr-area">
      <VanButton
        class="msg-btn"
        type="success"
        @click="copyLink"
      >
        复制链接
      </VanButton>
      <VanButton
        class="msg-btn"
        @click="backHome"
      >
        返回
      </VanButton>
    </div>
  </div>
</template>

<style scoped>
.msg {
  min-height: 100vh;
  box-sizing: border-box;
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  text-align: center;
}
.msg-icon-area {
  margin-bottom: 32px;
}
.msg-text-area {
  margin-bottom: 32px;
  padding: 0 32px;
  -webkit-box-flex: 1;
  -webkit-flex: 1;
  flex: 1;
  line-height: 1.6;
  word-wrap: break-word;
  -webkit-hyphens: auto;
  hyphens: auto;
}
.msg-title {
  margin-bottom: 16px;
  font-weight: 500;
  font-size: 22px;
  color: rgba(0, 0, 0, 0.9);
}
.msg-desc {
  font-size: 17px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 16px;
}
.msg-opr-area {
  margin-bottom: 96px;
}
.msg-btn + .msg-btn {
  margin-top: 16px;
}
.msg-btn {
  margin: 0 auto;
  width: 160px;
  display: block;
}
</style>
