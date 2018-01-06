const os = require('os')

const win = os.platform() === 'win32'

module.exports = [
  {
    type: 'input',
    name: 'username',
    message: 'Ok. Let\'s start by logging in to the DNS service. Username?'
  },
  {
    type: 'password',
    name: 'password',
    message: 'Thanks! And now the DNS account password:'
  },
  {
    type: 'input',
    name: 'taskUsername',
    message: 'Alright, now I need the username to login to the computer:',
    when: win
  },
  {
    type: 'password',
    name: 'taskPassword',
    message: 'Cool. And now the password to login to the computer:',
    when: win
  }
]
