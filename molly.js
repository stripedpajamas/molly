const os = require('os')
const program = require('commander')
const inquirer = require('inquirer')
const chalk = require('chalk')
const api = require('./api')
const util = require('./util')
const questions = require('./questions')
const windowsTask = require('./windows')
const macTask = require('./mac')

const win = os.platform() === 'win32'
const mac = os.platform() === 'darwin'

program
  .option('-q, --quiet', 'Non-interactive mode (automatically set DNS record, must specify u/p)')
  .option('-u, --username [username]', 'Username')
  .option('-p, --password [password]', 'Password')
  .parse(process.argv);

// in non interactive mode, the program will:
// 1. nslookup username.quovadis.ninja
// 2. get public ip by hitting https://nautilus.quo.cc/dns/ip
// 3. compare them, if they are the same exit, if not
// 4. post to https://nautilus.quo.cc/dns/update with username/password/ip
// 5. exit

(async () => {
  if (!program.quiet) {
    console.log(chalk.green('Hello, I\'m Molly. I\'m here to help set up a custom DNS record.'))
    console.log(chalk.green('Hang on one second while I get things ready...'))
  }

  let ip
  let ipProblems
  let internetProblems

  try {
    ip = await api.getPublicIP()
    if (!ip) ipProblems = true
  } catch (e) {
    internetProblems = true
  }

  // internet problems?
  if (internetProblems || ipProblems) {
    if (!program.quiet) {
      util.paktc('Oh no! I don\'t seem to be able to connect to the DNS update service. I can\'t help you set up your DNS :(', 'red')
    } else {
      console.error('internet problems or ip problems')
      process.exit(1)
    }
  }

  if (program.quiet) {
    if (!(program.username && program.password)) {
      console.error('no username and password specified, exiting')
      process.exit(1)
    }
    // decode
    const username = Buffer.from(program.username, 'base64').toString()
    const password = Buffer.from(program.password, 'base64').toString()

    // determine if we even need to update by running an nslookup
    let current
    try {
      const currentIPs = await util.nslookup(`${username}.quovadis.ninja`)
      if (currentIPs.length) {
        current = currentIPs[0]
      }
    } catch (e) {
      console.error('failed to get current ip, updating anyway')
    }

    if (ip !== current) {
      const payload = {
        username,
        password,
        ip
      }
      try {
        const success = await api.updateDNS(payload)
        if (success) {
          console.log('updated dns', username, ip)
          process.exit(0)
        } else {
          console.error('failed to update dns')
          process.exit(1)
        }
      } catch (e) {
        console.error('failed to update dns:', e)
        process.exit(1)
      }
    }
    process.exit()
  }

  // interactive mode
  if (!internetProblems && !ipProblems && !program.quiet) {
    inquirer.prompt(questions).then(async (answers) => {
      const payload = {
        username: answers.username,
        password: answers.password,
        ip
      }

      const b64u = Buffer.from(answers.username).toString('base64')
      const b64p = Buffer.from(answers.password).toString('base64')

      const taskPayload = {
        username: b64u,
        password: b64p,
        taskUsername: answers.taskUsername,
        taskPassword: answers.taskPassword
      }

      console.log(chalk.green('Cool. I\'ve got everything I need.'))
      console.log(chalk.green('I\'ll set up the scheduled task and do an initial DNS update'))

      if (mac) {
        console.log(chalk.green.bold('The task scheduler is going to ask for the Mac login password. Put it in and hit enter.'))
      }

      let taskResult
      if (win) {
        taskResult = windowsTask(taskPayload)
      } else if (mac) {
        taskResult = macTask(taskPayload)
      }

      if (taskResult) {
        console.log(chalk.green('Scheduled task created successfully!'))
      } else {
        console.log(chalk.red('I wasn\'t able to create the scheduled task :( Create one that runs this command every 5 minutes:'))
        console.log(chalk.bgGreen.bold(`molly -q -u ${b64u} -p ${b64p}`))
      }

      try {
        const success = await api.updateDNS(payload)
        if (success) {
          util.paktc('Initial DNS update successful! All done.')
        } else {
          util.paktc('I wasn\'t able to update the DNS record :(', 'red')
        }
      } catch (e) {
        util.paktc('I wasn\'t able to update the DNS myself.', 'red')
      }
    })
  }
})()
