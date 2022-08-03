import puppeteer from '../puppeteer.js';

/**
 * Grab author property from ucdlib-author-profile element
 */
 function author() {
  return puppeteer.page.evaluate(() => {
    let ele = document.querySelector('ucdlib-author-profile');
    if( !ele ) ele = document.querySelector('ucdlib-theme-author-profile');
    if( ele ) return ele.getAttribute('email');
    return '';
  });
 }
 
 export default author;