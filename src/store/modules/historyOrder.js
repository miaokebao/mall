import _ from 'lodash';

export default {
  state: {
    historyOrderList: JSON.parse(localStorage.getItem('historyOrderList') || '[]')
  },
  mutations: {
    addHistoryOrder(state, historyOrder) {
      state.historyOrderList = _.take(_.concat([historyOrder], state.historyOrderList), 100);
    },
    deleteHistoryOrder(state, id) {
      state.historyOrderList = _.filter(state.historyOrderList, item => item.id != id);
    }
  },
  actions: {
    addHistoryOrder({ commit, state }, historyOrder) {
      commit('addHistoryOrder', historyOrder);
      localStorage.setItem('historyOrderList', JSON.stringify(state.historyOrderList));
    },
    deleteHistoryOrder({ commit, state }, id) {
      commit('deleteHistoryOrder', id);
      localStorage.setItem('historyOrderList', JSON.stringify(state.historyOrderList));
    }
  }
};