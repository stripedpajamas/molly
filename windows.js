const exec = require('child_process').execSync

// to run the scheduled task creation
module.exports = ({ username, password, taskUsername, taskPassword }) => {
  const a = `$user = '${taskUsername}'`
  const b = `$pass = '${taskPassword}'`
  const c = `$sta = New-ScheduledTaskAction -Execute 'C:\\QVDNS\\Molly -q -u ${username} -p ${password}'`
  const d = '$sts = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries'
  const e = '$stt = New-ScheduledTaskTrigger -Once -At $(Get-Date) -RepetitionInterval $(New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)'
  const f = '$task = New-ScheduledTask -Action $sta -Trigger $stt -Settings $sts'
  const g = "$task | Register-ScheduledTask -TaskName 'QV DNS Update' -User $user -Password $pass | Format-Wide"
  const script = [a, b, c, d, e, f, g].join(';')
  const cmd = `powershell -Command "& {${script}}"`
  let output = ''
  try {
    output = exec(cmd)
  } catch (e) {
    return false
  }
  return output.includes('QV DNS Update')
}
