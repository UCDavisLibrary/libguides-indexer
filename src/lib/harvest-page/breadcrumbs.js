import puppeteer from '../puppeteer.js';

/**
 * Grab the ucdlib-crawler="breadcrumb" content and title
 */
 async function libBoxes() {
  let breadcrumbs = await puppeteer.page.evaluate(() => 
    Array.from(document.querySelectorAll('[ucdlib-crawler="breadcrumb"]'))
      .map(ele => {

        if( ele.nodeName !== 'A' ) {
          if( ele.childElementCount === 0 ) {
            return {label: ele.innerHTML, href: ''}
          }

          ele = ele.querySelector('a');
        }
        if( !ele ) return null;

        return {
          label : ele.textContent,
          href : ele.getAttribute('href')
        }
      })
      .filter(item => item !== null)
  );

   return breadcrumbs;
 }
 
 export default libBoxes;