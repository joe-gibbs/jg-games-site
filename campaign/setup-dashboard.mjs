import { randomBytes, createHash } from 'node:crypto';
import { writeFileSync, existsSync } from 'node:fs';
const passwordFile=new URL('.dashboard-password.txt',import.meta.url);
const secretsFile=new URL('.dashboard-secrets.json',import.meta.url);
if(existsSync(passwordFile)||existsSync(secretsFile)){
  if(!existsSync(passwordFile)||!existsSync(secretsFile))throw new Error('Incomplete existing credentials. Do not overwrite automatically.');
  console.log('Existing dashboard credentials preserved.');
}else{
  const password=randomBytes(24).toString('base64url');
  writeFileSync(passwordFile,password+'\n',{mode:0o600,flag:'wx'});
  writeFileSync(secretsFile,JSON.stringify({DASHBOARD_PASSWORD_HASH:createHash('sha256').update(password).digest('hex'),DASHBOARD_SESSION_SECRET:randomBytes(32).toString('hex')}),{mode:0o600,flag:'wx'});
  console.log('Dashboard credentials generated in git-ignored local files.');
}
