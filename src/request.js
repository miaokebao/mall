import axios from 'axios';

const request = axios.create({
  baseURL: 'https://cs.sdxpos.com/shop/client/goods',
  headers: {
    'session-id': 123,
    'client-type': 'wxapp',
    'shop-id': 1162,
  }
});

export default request;
