import axios from 'axios';
import config from '../config/environment';

const creatorDBClient = axios.create({
  baseURL: config.creatorDB.baseUrl,
  headers: {
    'Accept': 'application/json',
    'apiId': config.creatorDB.apiKey,
  },
});

export default creatorDBClient; 