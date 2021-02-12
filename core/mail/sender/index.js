const nodemailer = require('nodemailer')
const debug = require('debug')('email:smtp')
const config = require('./config')
const path = require('path')

const main = module.exports = async ([ subject, to, html, file ]) => {
  const email = {
    from: config.from,
    to,
    subject,
    html,
    attachments: [
      {
        filename: path.basename(file),
        path: file
      }
    ]
  }

  debug(email)
  await sendEmail(email)
}

const sendEmail = (email) => {
  return new Promise((resolve, reject) => {
    const transport = nodemailer.createTransport(config.transport)
    transport.sendMail(email, (err, info) => {
      if (err) {
        debug(err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

if (require.main === module) {
  main([
    process.argv[2], // subject
    process.argv[3], // to
    process.argv[4], // html
    process.argv[5], // attachment path
  ]).then(console.log).catch(console.error)
}
