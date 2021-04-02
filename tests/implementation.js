import axios from 'axios';

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
      const body = {
        credential: {...credential, issuer: this.settings.issuer.id}
      };
  console.log({body, settings: this.settings});
        const result = await axios.post(this.settings.issuer.endpoint, JSON.stringify(body), {headers});
      return result;
    } catch(e) {
      console.error(e);
    }
  }
  async verify(credential) {

  }
}
