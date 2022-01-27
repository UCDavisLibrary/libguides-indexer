import puppeteer from '../puppeteer.js';
import striptags from 'striptags';

async function childPages() {
  let children = await puppeteer.page.evaluate(() => 
    Array.from(document.querySelectorAll('.nav.nav-pills a'))
      .filter(a => !(a.getAttribute('href') || '').match(/#/))
      .filter(a => !a.classList.contains('active'))
      .map(a => ({label: a.innerHTML, href: a.href}))
  ); 
  children.forEach(item => item.label = striptags(item.label).trim());
  return children;
}

export default childPages;