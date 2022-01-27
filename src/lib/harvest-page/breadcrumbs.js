import puppeteer from '../puppeteer.js';

/**
 * Grab the .s-lib-box content and title
 */
 async function libBoxes() {
  let breadcrumbs = await puppeteer.page.evaluate(() => 
    Array.from(document.querySelectorAll('.breadcrumb li'))
      .map(ele => {
        if( ele.childElementCount === 0 ) {
          return {label: ele.innerHTML, href: ''}
        }

        let anchor = ele.querySelector('a');
        if( !anchor ) return null;

        return {
          label : anchor.innerHTML,
          href : anchor.getAttribute('href')
        }
      })
      .filter(item => item !== null)
  );

   return breadcrumbs;
 }
 
 export default libBoxes;