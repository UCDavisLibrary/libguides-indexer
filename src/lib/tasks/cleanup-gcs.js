import storage from "../storage.js";

async function cleanupGCS(sitemap) {
  let [gcsFiles] = await storage.getFiles();
  gcsFiles = gcsFiles.map(file => file.name)
    .filter(file => file !== 'index.json');

  sitemap = sitemap.urls.map(item => item.id+'.json');

  for( let file of gcsFiles ) {
    if( !sitemap.includes(file) ) {
      console.log(`Removing file: ${file} as it was no longer found in sitemap.xml`)
      await storage.deleteFile(file);
    }
  }

}

export default cleanupGCS;