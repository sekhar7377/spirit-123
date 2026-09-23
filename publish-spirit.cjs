// Publishing fallback: credentials are accepted through hidden stdin only.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const source=path.join(__dirname,'spirit');
const checkout=path.join(__dirname,'spirit-publish');
const archive=path.join(__dirname,'spirit-deployment.tar');
if(process.stdin.isTTY)process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdout.write('Ready for publishing credential JSON on stdin (input is hidden).\n');
let input='';
process.stdin.on('data',chunk=>{input+=chunk;if(!/[\r\n]/.test(input))return;process.stdin.pause();let credential;try{
 credential=JSON.parse(input.trim());input='';
 if(credential.auth_mode!=='http_extra_header')throw Error('Unsupported credential mode');
 const env={...process.env,GIT_TERMINAL_PROMPT:'0',GIT_CONFIG_COUNT:'1',GIT_CONFIG_KEY_0:'http.extraHeader',GIT_CONFIG_VALUE_0:'Authorization: Bearer '+credential.token};
 const run=(exe,args,cwd=__dirname)=>execFileSync(exe,args,{cwd,env,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 if(!fs.existsSync(path.join(checkout,'.git'))){run('git',['clone',credential.remote_url,checkout]);run('git',['checkout','-B',credential.branch],checkout);}
 else{run('git',['fetch','origin',credential.branch],checkout);}
 const files=['dist','.openai','README.md','server.cjs','flow-main-v3.js','flow-audio-v3.js','build-v3.cjs','IMAGE-EDITS.md','PROJECT-DIRECTION.md'];
 for(const name of files)fs.cpSync(path.join(source,name),path.join(checkout,name),{recursive:true});
 run('git',['add',...files],checkout);
 if(run('git',['status','--porcelain'],checkout))run('git',['-c','user.name=Codex','-c','user.email=codex@users.noreply.github.com','commit','-m','Create continuous Spirit experience with animated title and cleaned imagery'],checkout);
 const sha=run('git',['rev-parse','HEAD'],checkout);
 run('git',['push','origin',`HEAD:${credential.branch}`],checkout);
 run('tar',['-cf',archive,'.openai/hosting.json','dist'],checkout);
 const entries=run('tar',['-tf',archive],checkout);
 if(!entries.includes('dist/index.html')||!entries.includes('dist/assets/one-bad-habit-telugu.mp3'))throw Error('Archive validation failed');
 process.stdout.write(JSON.stringify({project_id:JSON.parse(fs.readFileSync(path.join(source,'.openai/hosting.json'))).project_id,commit_sha:sha,archive,checkout_path:checkout})+'\n');
 process.exit(0);
 }catch(error){let message=(error.stderr?.toString()||error.message||'Publishing failed');if(credential?.token)message=message.split(credential.token).join('[redacted]');process.stderr.write(message+'\n');process.exit(1);}});
