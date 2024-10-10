import _ from 'lodash';

export default {
  state: {
    historyViewList: JSON.parse(localStorage.getItem('historyViewList') || '[]')
  },
  mutations: {
    addHistoryView(state, historyView) {
      state.historyViewList = _.take(_.concat([historyView], _.filter(state.historyViewList, (item => item.id !== historyView.id))), 100);
    },
    deleteHistoryView(state, id) {
      state.historyViewList = _.filter(state.historyViewList, item => item.id != id);
    }
  },
  actions: {
    addHistoryView({ commit, state }, historyView) {
      commit('addHistoryView', historyView);
      localStorage.setItem('historyViewList', JSON.stringify(state.historyViewList));
    },
    deleteHistoryView({ commit, state }, id) {
      commit('deleteHistoryView', id);
      localStorage.setItem('historyViewList', JSON.stringify(state.historyViewList));
    }
  }
};
