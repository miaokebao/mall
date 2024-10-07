import { createApp } from 'vue';
import store from './store';
import router from './router';
import './style.css';
import App from './App.vue';
import Vant, { Lazyload } from 'vant';
import '@vant/touch-emulator';
import 'vant/lib/index.css';

createApp(App)
  .use(Vant)
  .use(Lazyload)
  .use(router)
  .use(store)
  .mount('#app');
