const exec = require('child_process').execSync

// to run the scheduled task creation
module.exports = ({ username, password, taskUsername, taskPassword }) => {
  let output = ''
  const cmd = `schtasks /Create /tn "QV DNS Update" /sc MINUTE /mo 5 /ru "${taskUsername}" /rp "${taskPassword}" /tr "C:\\QVDNS\\Molly -q -u ${username} -p ${password}"`
  try {
    output = exec(cmd)
  } catch (e) {
    return false
  }
  return output.includes('SUCCESS')
}
