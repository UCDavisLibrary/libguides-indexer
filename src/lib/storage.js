import {Storage} from '@google-cloud/storage';
import config from './config.js';

class GCSStorage {

  constructor() {
    this.storage = new Storage({
      projectId : config.google.projectId
    });
  }

  getBucket() {
    return this.storage.bucket(config.storage.bucket);
  }

  /**
   * @method initBucket
   * @description ensure gcs bucket exits
   */
  async initBucket() {
    let exists = await this.getBucket(config.storage.bucket).exists();
    exists = exists[0];
    if( exists ) return;
    await this.storage.createBucket(config.storage.bucket);
  }

  getBucketPath(pathname, file) {
    return path.join(this.name, pathname, file).replace(/^\//, '');
  }

  getFileObject(filename) {
    return this.getBucket(config.storage.bucket).file(filename);
  }

  deleteFile(fileName) {
    return this.getBucket(config.storage.bucket).file(fileName).delete();
  }

  async writeJson(filename, data) {
    await this.initBucket();
    return this.getFileObject(filename).save(JSON.stringify(data, '  ', '  '));
  }

  getFiles() {
    return this.getBucket(config.storage.bucket)
      .getFiles({autoPaginate: false });
  }

}

const storage = new GCSStorage();
export default storage;