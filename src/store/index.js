import { createStore } from 'vuex';
import _ from 'lodash';

const modulesFiles = import.meta.glob('./modules/*.js', { eager: true });
const modules = _.reduce(modulesFiles, (modules, value, key) => {
  const moduleName = key.replace(/^\.\/(.*)\.\w+$/, '$1');
  modules[moduleName.split('/')[1]] = value.default;
  return modules;
}, {});

const store = createStore({
  modules,
});

export default store;
