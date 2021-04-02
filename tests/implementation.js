import axios from 'axios';
import {uvci} from '../helpers.js';

const _headers = {
  Accept: 'application/ld+json,application/json',
  'Content-Type': 'application/json',
};

export default class Implementation {
  constructor(settings) {
    this.settings = settings;
  }
  async issue({credential, auth}) {
    try {
      const headers = {..._headers};
      if(auth && auth.type === 'oauth2-bearer-token') {
        headers.Authorization = `Bearer ${auth.accessToken}`;
      }
      const expires = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 2);
        return date.toISOString();
      };
      const body = {
        credential: {
          ...credential,
          id: `urn:uvci:${uvci()}`,
          issuanceDate: new Date().toISOString(),
          expirationDate: expires(),
          issuer: this.settings.issuer.id
        }
      };
// for debugging purposes only
console.log(body);
      const result = await axios.post(
        this.settings.issuer.endpoint, JSON.stringify(body), {headers});
      return result;
    } catch(e) {
// FIXME this is just to make debugging easier
console.error(e);
      throw e;
    }
  }
  async verify(credential) {

  }
}
