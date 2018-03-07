require! {
  fs
  os
  path
  getsecret
}

{exec, which} = require 'shelljs'

for command in ['node-dev', 'mongosrv'] # 'gulp', 'pouchdb-server'
  if not which command
    console.log "missing #{command} command. please run the following command:"
    console.log "npm install -g #{command}"
    process.exit()

#exec 'gulp', {async: true}
if not getsecret('MONGODB_URI')?
  exec 'mongosrv', {async: true}
exec 'node-dev --inspect server.js', {async: true}
