import fetch, {FormData} from "node-fetch";
import config from './config.js';
import storage from './storage.js'

class HarvestDatabase {

  constructor() {
    this.accessToken = '';
  }

  async fetchApiToken() {
    if( this.accessToken ) return;

    let formData = new FormData();
    formData.set('client_id', config.libguides.api.clientId);
    formData.set('client_secret', config.libguides.api.clientSecret);
    formData.set('grant_type', 'client_credentials');

    let resp = await fetch(config.libguides.api.url+config.libguides.api.authPath, {
      method : 'POST',
      body: formData
    });

    resp = await resp.json();

    // clear token before expires
    setTimeout(() => this.accessToken = '', (resp.expires_in-5)*1000);
    this.accessToken = resp.access_token;
  }

  async fetchDatabases(secondAttempt=false) {
    await this.fetchApiToken();

    let resp = await fetch(config.libguides.api.url+config.libguides.api.databasePath, {
      headers : {
        Authorization : 'Bearer '+this.accessToken
      }
    });

    resp = await resp.json();
    if( resp.status ) {
      console.error(resp);
      // try one more time;
      if( !secondAttempt ) {
        return this.fetchDatabases(true);
      }
      return null;
    }

    return resp;
  }

  async harvest() {
    let databases = await this.fetchDatabases();
    if( !databases ) return;
    if( databases.status ) return;
    console.log(`Harvested ${databases.length} databases`);
    await storage.writeJson(config.storage.databaseFile, databases);
  }

}

const instance = new HarvestDatabase();
export default instance;