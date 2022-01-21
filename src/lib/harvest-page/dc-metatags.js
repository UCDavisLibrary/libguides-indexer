import puppeteer from '../puppeteer.js';

async function dcMetatags() {
  let resp = await puppeteer.page.evaluate(() => 
    Array.from(document.querySelectorAll('meta'))
      .filter(tag => (tag.getAttribute('name') || '')
      .match(/^DC\./))
      .map(tag => ({
        name: tag.getAttribute('name'),
        value: tag.getAttribute('content')  
      }))
  );
  return resp;
}

export default dcMetatags;