const fs = require('fs')
const exec = require('child_process').execSync

/* eslint-disable no-tabs */
const plistTemplate = ({ username, password }) => `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>EnvironmentVariables</key>
	<dict>
		<key>PATH</key>
		<string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/sbin</string>
	</dict>
	<key>Label</key>
	<string>com.quovadis.dns-updater</string>
	<key>ProgramArguments</key>
	<array>
		<string>/Applications/Utilities/Molly</string>
		<string>-q</string>
		<string>-u</string>
		<string>dGVzbGE=</string>
		<string>-p</string>
		<string>YXNkZg==</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>StartInterval</key>
	<integer>300</integer>
</dict>
</plist>
`
/* eslint-enable no-tabs */

const copyCmd = 'sudo chown root /tmp/com.quovadis.dns-updater.plist && sudo mv /tmp/com.quovadis.dns-updater.plist /Library/LaunchDaemons'
const loadCmd = 'sudo launchctl enable system/com.quovadis.dns-updater && sudo launchctl bootstrap system /Library/LaunchDaemons/com.quovadis.dns-updater.plist'

module.exports = ({ username, password }) => {
  const plist = plistTemplate({ username, password })
  let copyOutput = ''
  let loadOutput = ''
  try {
    fs.writeFileSync('/tmp/com.quovadis.dns-updater.plist', plist)
    fs.chmodSync('/tmp/com.quovadis.dns-updater.plist', 644)
    copyOutput = exec(copyCmd)
    loadOutput = exec(loadCmd)
  } catch (e) {
    return false
  }
  // no output is good output
  return loadOutput.length < 1 && copyOutput.length < 1
}
