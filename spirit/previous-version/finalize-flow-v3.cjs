const fs=require('node:fs'),path=require('node:path');const dir=path.join(__dirname,'dist');
let main=fs.readFileSync(path.join(__dirname,'flow-main-v3.js'),'utf8');
main=main.replace("$('#load-number').textContent='1%';","$('#opening-title').style.setProperty('--title-reveal','1%');$('#load-number').textContent='1%';");
main=main.replace("$('#load-number').textContent=n+'%';","$('#opening-title').style.setProperty('--title-reveal',n+'%');$('#load-number').textContent=n+'%';");
fs.writeFileSync(path.join(__dirname,'flow-main-v3.js'),main);
const fragment=fs.readFileSync(path.join(dir,'flow-audio-v3.fragment'),'utf8');
fs.writeFileSync(path.join(dir,'flow-v3.js'),main+'\n'+fragment);
