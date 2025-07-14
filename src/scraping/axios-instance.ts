import config from '@config';
import type { AxiosInstance } from 'axios';
import axios from 'axios';

const RCDB_BASE_URL = config.RCDB_URL || 'https://rcdb.com';

const instance: AxiosInstance = axios.create({
  baseURL: RCDB_BASE_URL,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
    'Accept-Language': 'en-US, en',
    Cookie: 'dm=1; lan=1; uom=2',
  },
});

export default instance;
