export default {
  fetch() {
    return new Response('Not found', { status: 404 });
  },
};

export { OAuthStateStore } from './state-store';
