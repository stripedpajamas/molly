const fs = require('fs')
const os = require('os')
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
		<string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/share/dotnet:/usr/local/sbin</string>
	</dict>
	<key>Label</key>
	<string>com.quovadis.dns-updater</string>
	<key>ProgramArguments</key>
	<array>
		<string>/Applications/Utilities/Molly</string>
		<string>-q</string>
		<string>-u</string>
		<string>${username}</string>
		<string>-p</string>
		<string>${password}</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>StartInterval</key>
	<integer>300</integer>
</dict>
</plist>
`
/* eslint-enable no-tabs */

const loadCmd = 'launchctl enable gui/`stat -f %u`/com.quovadis.dns-updater && launchctl bootstrap gui/`stat -f %u` ~/Library/LaunchAgents/com.quovadis.dns-updater.plist'

module.exports = ({ username, password }) => {
  const plist = plistTemplate({ username, password })
  let loadOutput = ''
  try {
    fs.writeFileSync(`${os.homedir()}/Library/LaunchAgents/com.quovadis.dns-updater.plist`, plist)
    loadOutput = exec(loadCmd)
  } catch (e) {
    console.log(e)
    return false
  }
  // no output is good output
  return loadOutput.length < 1
}
