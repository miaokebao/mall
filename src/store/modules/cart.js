import { generateUUID } from "../../util";
import _ from 'lodash';

export default {
  state: {
    cartList: JSON.parse(localStorage.getItem('cartList') || '[]'),
  },
  mutations: {
    toggleCartCheckAll(state, selected) {
      state.cartList = _.map(state.cartList, item => {
        item.selected = selected;
        return item;
      });
    },
    addCartRecord(state, addData) {
      if (!addData.quantity) {
        return;
      }
      const cartRecord = state.cartList.find(item => item.option_id === addData.option_id);
      if (cartRecord) {
        if (typeof addData.product !== 'undefined') {
          cartRecord.product = addData.product;
        }
        cartRecord.quantity += addData.quantity;
      } else {
        addData.id = generateUUID();
        addData.selected = true;
        state.cartList.push(addData);
      }
    },
    deleteCartRecord(state, id) {
      state.cartList = _.filter(state.cartList, item => item.id != id);
    },
    deleteCartRecords(state, ids) {
      state.cartList = _.filter(state.cartList, item => !ids.include(item.id));
    },
    updateCartRecord(state, updateData) {
      if (!updateData.id) {
        return;
      }
      const cartRecord = state.cartList.find(item => item.id === updateData.id);
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
    clearSelectedCartRecords(state) {
      state.cartList = _.filter(state.cartList, item => !item.selected);
    }
  },
  actions: {
    toggleCartCheckAll({ commit, state }, selected) {
      commit('toggleCartCheckAll', selected);
      localStorage.setItem('cartList', JSON.stringify(state.cartList));
    },
    addCartRecord({ commit, state }, addData) {
      commit('addCartRecord', addData);
      localStorage.setItem('cartList', JSON.stringify(state.cartList));
    },
    deleteCartRecord({ commit, state }, id) {
      commit('deleteCartRecord', id);
      localStorage.setItem('cartList', JSON.stringify(state.cartList));
    },
    deleteCartRecords({ commit, state }, ids) {
      commit('deleteCartRecords', ids);
      localStorage.setItem('cartList', JSON.stringify(state.cartList));
    },
    updateCartRecord({ commit, state }, updateData) {
      commit('updateCartRecord', updateData);
      localStorage.setItem('cartList', JSON.stringify(state.cartList));
    },
    clearSelectedCartRecords({ commit, state }) {
      commit('clearSelectedCartRecords');
      localStorage.setItem('cartList', JSON.stringify(state.cartList));
    }
  },
  getters: {
    selectedCartList(state) {
      return _.filter(state.cartList, item => item.selected);
    },
    totalQuantity(state) {
      return _.sum(_.map(state.cartList, item => Number(item.quantity)));
    },
    totalSelectedQuantity(state) {
      return _.sum(_.map(state.cartList, item => item.selected ? Number(item.quantity) : 0));
    },
    totalSelectedPrice(state) {
      return _.sum(_.map(state.cartList, item => {
        if (!item.selected) {
          return 0;
        }
        const option = _.find(item.product.options, option => option.id === item.option_id);
        return Number(item.quantity) * Number(option.price);
      }));
    },
  }
};
