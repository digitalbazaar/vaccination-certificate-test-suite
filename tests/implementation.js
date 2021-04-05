import axios from 'axios';
import {uvci} from '../helpers.js';
import https from 'https';

const httpsAgent = new https.Agent({rejectUnauthorized: false});

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
      const result = await axios.post(
        this.settings.issuer.endpoint,
        JSON.stringify(body),
        {headers, httpsAgent}
      );
      return result;
    } catch(e) {
      // this is just to make debugging easier
      //console.error(e);
      throw e;
    }
  }
  async verify({credential, auth}) {
    try {
      const headers = {..._headers};
      if(auth && auth.type === 'oauth2-bearer-token') {
        headers.Authorization = `Bearer ${auth.accessToken}`;
      }
      const body = {
        verifiableCredential: credential,
        options: {
          checks: ['proof'],
        },
      };
      const result = await axios.post(
        this.settings.verifier,
        body,
        {headers, httpsAgent}
      );
      return result;
    } catch(e) {
      // this is just to make debugging easier
      console.error(e);
      console.log(e.response.data);
      throw e;
    }
  }
}
