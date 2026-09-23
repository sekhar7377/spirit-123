// Regenerate the browser bundle from editable sources. No dependencies required.
const fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
fs.writeFileSync(path.join(__dirname,'dist/flow-v3.js'),read('flow-main-v3.js')+'\n'+read('flow-audio-v3.js'));
