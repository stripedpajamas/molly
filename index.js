const readline = require('readline');
const program = require('commander');
const inquirer = require('inquirer');
const axios = require('axios');

const ipR = /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/;
const ipRInput = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

let internetProblems;
let ipProblems;
let ip;

function close(msg) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(msg, () => {
    rl.close();
    process.exit();
  });
}

function logProblemAndExit() {
  close('Oh no! Something went wrong. You\'ll need Quo Vadis Support to get to the bottom of this: 704-814-8819');
}

async function getIp() {
  try {
    const response = await axios.get('https://nautilus.quo.cc/dns/ip');
    if (response.data && response.data.ip) {
      const ipMatch = (response.data.ip.match(ipR) || [])[0];
      if (!ipMatch) {
        ipProblems = true;
      } else {
        ip = ipMatch;
      }
    } else {
      ipProblems = true;
    }
  } catch (e) {
    internetProblems = true;
  }
}

function updateDNS(payload, quiet = false) {
  axios.post('https://nautilus.quo.cc/dns/update', payload)
    .then((response) => {
      if (response.data.ok) {
        if (!quiet) {
          close('All done! Press any key to exit');
        } else {
          process.exit();
        }
      } else {
        logProblemAndExit();
      }
    })
    .catch((e) => {
      if (e.response && e.response.status === 401) {
        close('Your credentials didn\'t work! Try running this again with different credentials.');
      }
      logProblemAndExit();
    });
}

program
  .option('-q, --quiet', 'Non-interactive mode (automatically set DNS record, must specify u/p)')
  .option('-u, --username [username]', 'Username')
  .option('-p, --password [password]', 'Password')
  .parse(process.argv);

const questions = [
  {
    type: 'input',
    name: 'username',
    message: 'Ok. Let\'s start by logging in to your DNS account. What\'s your username?',
    when: () => !internetProblems,
  },
  {
    type: 'password',
    name: 'password',
    message: 'Thanks! And now your DNS account password:',
    when: () => !internetProblems,
  },
  {
    type: 'confirm',
    name: 'manualEntry',
    default: false,
    message: () => `Alright. I think your IP address is ${ip}... do you want to enter a different one?`,
    when: () => !internetProblems && !ipProblems,
  },
  {
    type: 'input',
    name: 'ip',
    message: 'Alright. I wasn\'t able to figure out your IP address myself. Please enter it here:',
    validate: input => ipRInput.test(input) || 'That\'s not a valid IP address!',
    when: () => !internetProblems && ipProblems,
  },
  {
    type: 'input',
    name: 'ip',
    message: 'Ok, tell me your IP address:',
    validate: input => ipRInput.test(input) || 'That\'s not a valid IP address!',
    when: answers => answers.manualEntry && !internetProblems,
  },
];


(async () => {
  if (!program.quiet) {
    console.log('Hello, I\'m Molly. I\'m here to help update your custom DNS record.');
    console.log('Hang on one second while I get things ready...');
  }

  await getIp();

  // internet problems?
  if (internetProblems) {
    console.log('Oh no! I don\'t seem to be able to connect to the DNS update service. I can\'t help you update your DNS :(');
    close('Please contact Quo Vadis Support to get to the bottom of this: 704-814-8819');
  }

  if (program.quiet) {
    if (!(program.username && program.password)) {
      console.log('To use non-interactive mode, you have to specify your username and password!');
      process.exit(1);
    }
    const payload = {
      username: program.username,
      password: program.password,
      ip,
    };
    updateDNS(payload, true);
    return;
  }

  // interactive mode
  inquirer.prompt(questions).then(async (answers) => {
    const payload = {
      username: answers.username,
      password: answers.password,
      ip: answers.ip || ip,
    };
    console.log('Cool. I\'ve got everything I need. Updating now...');
    updateDNS(payload);
  });
})();
