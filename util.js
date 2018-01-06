const readline = require('readline')
const chalk = require('chalk')
const dns = require('dns')

dns.setServers([
  '40.117.190.151'
])

module.exports.nslookup = (host) => {
  return new Promise((resolve, reject) => {
    dns.resolve4(host, (err, ip) => {
      if (err) {
        return reject(err)
      }
      return resolve(ip)
    })
  })
}

module.exports.paktc = (msg, color) => {
  const m = msg || 'Please contact Quo Vadis Support to get to the bottom of this: 704-814-8819'
  const c = color || 'green'

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(chalk[c](`${m}\nPress any key to continue...`), () => {
    rl.close()
    process.exit()
  })
}
