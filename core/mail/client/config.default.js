const path = require('path')

module.exports = {
  imap: {
    user: '',
    password: '',
    host: '',
    port: 993,
    tls: true,
    authTimeout: 3000
  },
  folder: '',
  newFolder: '',
  searchCriteria: ['ALL'],
  apiHostname: '',
  apiPort: '3000',
  protocol: 'https',
  downloadsDirectory: path.join(__dirname, 'attachments'),
  apiAccessToken: ''
}
