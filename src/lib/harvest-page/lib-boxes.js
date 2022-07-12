import puppeteer from '../puppeteer.js';
import striptags from 'striptags';

/**
 * Grab the .s-lib-box content and title
 */
 async function libBoxes() {
  let titles = await puppeteer.page.evaluate(() => 
    Array.from(document.querySelectorAll('[ucdlib-crawler="content-title"]'))
      .map(ele => ele.textContent)
      .map(text => text.trim())
  );

  let content = await puppeteer.page.evaluate(() => {
    let elements = Array.from(document.querySelectorAll('[ucdlib-crawler="content"]'));
    // strip all script tag content
    elements.forEach(ele => {
      Array.from(ele.querySelectorAll('script,style')).map(script => script.innerHTML = '');
    });
    return elements.map(ele => ele.textContent.replace(/(\t| )+/g, ' ').trim())
  });

  content = content
    .map(text => striptags(text).replace(/\n/g, ' ').trim())
    .filter(text => text !== '')
    .map(text => text.replace(/\s+/g, ' '));

   return {titles, content};
 }
 
 export default libBoxes;