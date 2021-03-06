import puppeteer from '../puppeteer.js';

async function dcMetatags() {
  let resp = await puppeteer.page.evaluate(() => 
    Array.from(document.querySelectorAll('meta'))
      .filter(tag => (tag.getAttribute('name') || '')
      .match(/^DC\./))
      .map(tag => ({
        name: tag.getAttribute('name').replace(/^DC\./, '').toLowerCase(),
        value: tag.getAttribute('content')  
      }))
  );

  let data = {};
  resp.forEach(item => data[item.name] = item.value);

  return data;
}

export default dcMetatags;