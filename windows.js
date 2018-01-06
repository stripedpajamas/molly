const exec = require('child_process').execSync

// to run the scheduled task creation
module.exports = ({ username, password, taskUsername, taskPassword }) => {
  const cmd = `schtasks /Create /tn "QV DNS Update" /sc MINUTE /mo 5 /ru "${taskUsername}" /rp "${taskPassword}" /tr "C:\\QVDNS\\molly -q -u ${username} -p ${password}"`
  return exec(cmd).includes('SUCCESS')
}
