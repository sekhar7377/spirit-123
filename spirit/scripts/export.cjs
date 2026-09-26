const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Copy the completed static export. Existing legacy assets remain available for old links.
fs.cpSync(path.join(root,'out'),path.join(root,'dist'),{recursive:true});
fs.copyFileSync(path.join(root,'out/index.html'),path.join(root,'dist/cinema.html'));
console.log('Next.js static export copied to dist.');
