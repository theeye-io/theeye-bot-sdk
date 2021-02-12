const imaps = require('imap-simple')
const rfc2047 = require('rfc2047')

class MailBot {
  constructor (config) {
    this.config = config
  }

  async connect () {
    const connection = await imaps.connect({ imap: this.config.imap })
    await connection.openBox(this.config.folder)
    this.connection = connection
    return this
  }

  async fetchMessages (searchCriteria) {
    const fetchOptions = { bodies: [ 'HEADER', 'TEXT' ], struct: true }

    const mailSearch = await this.connection.search(searchCriteria, fetchOptions)

    console.log('Fetched: ', mailSearch.length, ' messages with the selected criteria\n')

    return mailSearch
  }

  getFrom (message) {
    const body = this.getBody(message)
    return body.from[0]
  }

  getSubject (message) {
    const body = this.getBody(message)
    return body.subject[0]
  }

  getBody (message) {
    let body = null
    for (const part of message.parts) {
      if (part.which === 'HEADER') {
        body = part.body
      }
    }

    if (body === null) {
      throw new Error('no se encontro el body')
    }

    return body
  }

  /**
   * @param {Mail} message
   * @param {Array} types list to search by admited mimetype
   * @return {Array}
   */
  searchAttachments (message, types) {
    const attachments = []
    const parts = imaps.getParts(message.attributes.struct)
    for (const part of parts) {
      if (part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT') {
        if (types.indexOf(part.subtype) !== -1) {
          attachments.push(part)
        }
      }
    }
    return attachments
  }

  /**
   * @param {Mail}
   * @param {Array} attachments to download
   * @return {Array}
   */
  downloadAttachments (message, attachments) {
    const downloadPromises = []
    const parts = imaps.getParts(message.attributes.struct)

    for (const attachment of attachments) {
      const promise = this.connection
        .getPartData(message, attachment)
        .then(partData => {
          return {
            filename: rfc2047.decode(attachment.disposition.params.filename),
            data: partData
          }
        })

      downloadPromises.push(promise)
    }

    return Promise.all(downloadPromises)
  }

  getDate (message) {
    const body = this.getBody(message)
    return new Date(body.date[0])
  }

  closeConnection () {
    return this.connection.end()
  }
}

exports.MailBot = MailBot
