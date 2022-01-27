import puppeteer from '../puppeteer.js';

async function ogMetatags() {
  let resp = await puppeteer.page.evaluate(() => 
    Array.from(document.querySelectorAll('meta'))
      .filter(tag => (tag.getAttribute('property') || '').match(/^og:/))
      .map(tag => ({
        name: tag.getAttribute('property').replace(/^og:/, '').toLowerCase(),
        value: tag.getAttribute('content')  
      }))
  );

  let data = {};
  resp.forEach(item => data[item.name] = item.value);

  return data;
}

export default ogMetatags;