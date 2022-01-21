import fetch from 'node-fetch';
import crypto from 'crypto';
import { parseStringPromise as parseString } from 'xml2js';
import config from '../config.js';

async function crawlSitemap(url) {
  if( !url ) {
    url = config.libguides.host+config.libguides.sitemap;
  }
  console.log('Reading sitemap: '+url);
  const resp = await fetch(url);
  let xml = await parseString(await resp.text());

  let urls = [];
  if( xml.sitemapindex && xml.sitemapindex.sitemap ) {
    for( let sitemap of xml.sitemapindex.sitemap ) {
      console.log(sitemap.loc[0]);
      let resp = await crawlSitemap(sitemap.loc[0]);
      urls = [...urls, ...resp.urls];
    }
  }

  // urlset for urls
  if( xml.urlset && xml.urlset.url ) {
    urls = [...urls, ...xml.urlset.url.map(item => ({
      url : item.loc[0],
      id : crypto.createHash('md5').update(item.loc[0]).digest('hex')
    }))];
  }

  return {id: url, urls};
}

export default crawlSitemap;
