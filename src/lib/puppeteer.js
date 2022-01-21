import Puppeteer from "puppeteer";

class PuppeteerWrapper {

  async init() {
    this.browser = await Puppeteer.launch();
    this.page = await this.browser.newPage();
  }

  /**
   * @method readMetaContent
   * @description read meta tag content attribute
   */
  async readMetaContent(name) {
    let resp = await this.page.evaluate(name => {
      return document.querySelector(`meta[name="${name}"]`).getAttribute('content');
    }, name);

    return resp;
  }

}

const puppeteer = new PuppeteerWrapper();
export default puppeteer;