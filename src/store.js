import { createStore } from 'vuex';
import _ from 'lodash';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x'? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const store = createStore({
  state () {
    const rawCartList = JSON.parse(localStorage.getItem('cartList') || '[]');
    const viewHistoryList = JSON.parse(localStorage.getItem('viewHistoryList') || '[]');
    const displayStyle = localStorage.getItem('displayStyle') == 'grid' ? 'grid' : 'list';
    return {
      rawCartList: rawCartList,
      viewHistoryList: viewHistoryList,
      displayStyle: displayStyle,
    };
  },
  getters: {
    cartList(state) {
      const rawCartList = state.rawCartList;
      return _.map(rawCartList, item => {
        const cartRecord = _.cloneDeep(item);
        cartRecord.option = _.find(cartRecord.product.options, option => option.id === cartRecord.option_id);
        return cartRecord;
      });
    },
    selectedCartList(state) {
      const rawCartList = state.rawCartList;
      return _.map(_.filter(rawCartList, item => item.selected), item => {
        const cartRecord = _.cloneDeep(item);
        cartRecord.option = _.find(cartRecord.product.options, option => option.id === cartRecord.option_id);
        return cartRecord;
      });
    },
    totalQuantity(state) {
      return _.sum(_.map(state.rawCartList, item => Number(item.quantity)));
    },
    totalSelectedQuantity(state) {
      return _.sum(_.map(state.rawCartList, item => item.selected ? Number(item.quantity) : 0));
    },
    totalSelectedPrice(state) {
      return _.sum(_.map(state.rawCartList, item => {
        if (!item.selected) {
          return 0;
        }
        const option = _.find(item.product.options, option => option.id === item.option_id);
        return Number(item.quantity) * Number(option.price);
      }));
    },
  },
  mutations: {
    toggleCartCheckAll(state, selected) {
      state.rawCartList = _.map(state.rawCartList, item => {
        item.selected = selected;
        return item;
      });
    },
    addCartRecord(state, addData) {
      if (!addData.quantity) {
        return;
      }
      const cartRecord = state.rawCartList.find(item => item.option_id === addData.option_id);
      if (cartRecord) {
        if (typeof addData.product !== 'undefined') {
          cartRecord.product = addData.product;
        }
        cartRecord.quantity += addData.quantity;
      } else {
        addData.id = generateUUID();
        addData.selected = true;
        state.rawCartList.push(addData);
      }
    },
    deleteCartRecord(state, id) {
      state.rawCartList = _.filter(state.rawCartList, item => item.id != id);
    },
    updateCartRecord(state, updateData) {
      if (!updateData.id) {
        return;
      }
      const cartRecord = state.rawCartList.find(item => item.id === updateData.id);
      if (!cartRecord) {
        return;
      }
      const fieldKeys = ['product', 'option_id', 'quantity', 'selected'];
      _.forEach(fieldKeys, fieldKey => {
        if (typeof updateData[fieldKey] !== 'undefined') {
          cartRecord[fieldKey] = updateData[fieldKey];
        }
      });
    },
    addViewHistory(state, viewHistory) {
      state.viewHistoryList = _.take(_.concat([viewHistory], _.filter(state.viewHistoryList, (item => item.id !== viewHistory.id))), 100);
    },
    deleteViewHistroy(state, id) {
      state.viewHistoryList = _.filter(state.viewHistoryList, item => item.id != id);
    },
    toggleDisplayStyle(state) {
      state.displayStyle = state.displayStyle === 'list' ? 'grid' : 'list';
    }
  },
  actions: {
    toggleCartCheckAll({ commit, state }, selected) {
      commit('toggleCartCheckAll', selected);
      localStorage.setItem('cartList', JSON.stringify(state.rawCartList));
    },
    addCartRecord({ commit, state }, addData) {
      commit('addCartRecord', addData);
      localStorage.setItem('cartList', JSON.stringify(state.rawCartList));
    },
    deleteCartRecord({ commit, state }, id) {
      commit('deleteCartRecord', id);
      localStorage.setItem('cartList', JSON.stringify(state.rawCartList));
    },
    updateCartRecord({ commit, state }, updateData) {
      commit('updateCartRecord', updateData);
      localStorage.setItem('cartList', JSON.stringify(state.rawCartList));
    },
    addViewHistory({ commit, state }, viewHistory) {
      commit('addViewHistory', viewHistory);
      localStorage.setItem('viewHistoryList', JSON.stringify(state.viewHistoryList));
    },
    deleteViewHistroy({ commit, state }, id) {
      commit('deleteViewHistroy', id);
      localStorage.setItem('viewHistoryList', JSON.stringify(state.viewHistoryList));
    },
    toggleDisplayStyle({ commit, state }) {
      commit('toggleDisplayStyle');
      localStorage.setItem('displayStyle', state.displayStyle);
    }
  }
});

export default store;
