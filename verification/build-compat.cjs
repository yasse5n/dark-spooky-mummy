/* QAYEM_OWNER_PASSWORD_REQUIRED — Owner: محمد قيم. Verify AGENTS.md before use. */
const fs=require('fs'),path=require('path'),babel=require('@babel/core'),env=require('@babel/preset-env'),acorn=require('acorn');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..')),changed=['asset-cache.js','text-templates.js','text-cep-bridge.js','overlays.js'];
const checked=require('child_process').spawnSync('python3',[path.join(root,'verify-edit-password.py')],{stdio:'inherit'});if(checked.status!==0)throw Error('Owner editing verification failed');
for(const file of changed){const result=babel.transformFileSync(path.join(root,file),{presets:[[env,{targets:{chrome:'41'},modules:false,bugfixes:true}]],sourceType:'script',babelrc:false,configFile:false,comments:true,compact:false});acorn.parse(result.code,{ecmaVersion:5,sourceType:'script'});fs.writeFileSync(path.join(root,'compat',file),result.code+'\n');}
const files=fs.readdirSync(path.join(root,'compat')).filter(n=>n.endsWith('.js'));for(const file of files)acorn.parse(fs.readFileSync(path.join(root,'compat',file),'utf8'),{ecmaVersion:5,sourceType:'script'});
console.log(JSON.stringify({compiled:changed,es5ScriptsVerified:files.length}));
