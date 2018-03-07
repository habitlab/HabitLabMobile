require! {
  muri
  getsecret
}

{exec, which} = require 'shelljs'

for command in ['mongo-express']
  if not which command
    console.log "missing #{command}. please run the following command:"
    console.log "npm install -g #{command}"
    process.exit()

parsed = muri getsecret 'MONGODB_URI'
console.log parsed

{host, port} = parsed.hosts[0]
{user, pass} = parsed.auth
