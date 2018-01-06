const axios = require('axios')
const ipR = /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/

module.exports = {
  getPublicIP () {
    return axios.get('https://nautilus.quo.cc/dns/ip')
      .then(response => response.data.ip && (response.data.ip.match(ipR) || [])[0])
  },
  updateDNS ({ username, password, ip }) {
    const payload = { username, password, ip }
    return axios.post('https://nautilus.quo.cc/dns/update', payload)
      .then(r => r.data.ok)
  }
}
