import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '3s', target: 10 },  // Ramp up to 10 VUs
    { duration: '5s', target: 20 },  // Stay at 20 VUs
    { duration: '2s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<250', 'p(99)<500'], // 95% of requests must complete below 250ms
    http_req_failed: ['rate<0.01'],                 // Less than 1% failure rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000/api';

export default function () {
  // 1. Browse Properties
  const listRes = http.get(`${BASE_URL}/properties?purpose=sale&locality=Talap`);
  check(listRes, {
    'properties list 200': (r) => r.status === 200,
    'has properties array': (r) => JSON.parse(r.body).success === true,
  });

  sleep(0.1);

  // 2. View Single Property Detail
  const detailRes = http.get(`${BASE_URL}/properties/cliffside-beachfront-estate-thottada`);
  check(detailRes, {
    'property detail 200': (r) => r.status === 200,
    'detail data masked': (r) => JSON.parse(r.body).data.is_masked === true,
  });

  sleep(0.1);

  // 3. Settings endpoint
  const settingsRes = http.get(`${BASE_URL}/settings`);
  check(settingsRes, {
    'settings 200': (r) => r.status === 200,
  });

  sleep(0.2);
}
