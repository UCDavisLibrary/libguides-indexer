import puppeteer from '../puppeteer.js';

/**
 * Grab author property from ucdlib-author-profile element
 */
 function author() {
  return puppeteer.page.evaluate(() => {
    const authorSet = new Set();
    const eles = ['ucdlib-author-profile', 'ucdlib-theme-author-profile'];
    for( let ele of eles ) {
      const authors = Array.from( document.querySelectorAll(ele) );
      authors.forEach( author => {
        const email = author.getAttribute('email');
        if( email ) authorSet.add(email);
      });
    }
    return Array.from(authorSet);
  });
 }
 export default author;
