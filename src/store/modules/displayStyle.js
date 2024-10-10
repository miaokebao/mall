export default {
  state: {
    displayStyle: localStorage.getItem('displayStyle') == 'grid' ? 'grid' : 'list',
  },
  mutations: {
    toggleDisplayStyle(state) {
      state.displayStyle = state.displayStyle === 'list' ? 'grid' : 'list';
    }
  },
  actions: {
    toggleDisplayStyle({ commit, state }) {
      commit('toggleDisplayStyle');
      localStorage.setItem('displayStyle', state.displayStyle);
    }
  }
};
