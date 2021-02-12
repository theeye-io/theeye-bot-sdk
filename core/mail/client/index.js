const fs = require('fs')
const path = require('path')
const MailBot = require('./lib/mailbot')
const MailApi = require('./lib/api')
const helpers = require('./lib/helpers')
const config = require('./config')

module.exports = async () => {
  const mailBot = new MailBot(config)
  const connection = await mailBot.connect()
  const messages = await mailBot.fetchMessages(config.searchCriteria)

  let movedMessages = 0
  let processedMessages = 0
  let attachmentsFound = 0
  let attachmentsProcessed = 0

  for (const message of messages) {
    // parse parts inside body
    const mailFrom = await mailBot.getFrom(message)
    console.log(mailFrom)
    const mailSubject = await mailBot.getSubject(message)
    console.log(mailSubject)
    const mailDate = await mailBot.getDate(message)
    console.log(mailDate)
    // const body = await mailBot.getBody(message)
    const attachments = await mailBot.searchAttachments(message, ['pdf', 'tiff', 'tif'])

    if (attachments.length > 0) {
      const attachmentsData = await mailBot.downloadAttachments(message, attachments)
      if (attachmentsData.length > 0) {

        processedMessages++

        const hashMail = helpers.createHash(`${mailFrom}${mailSubject}${mailDate}`)
        const dateFormatted = helpers.dateFormat(mailDate)
        const attachmentsPath = path.join(config.downloadsDirectory, dateFormatted, hashMail)

        console.log(`downlaods directory ${attachmentsPath}`)
        if (!fs.existsSync(attachmentsPath)) {
          console.log('creating downlaods directory')
          fs.mkdirSync(attachmentsPath, { recursive: true })
        }

        for (const index in attachmentsData) {
          attachmentsFound++

          const attachmentHash = helpers.createHash(attachmentsData[index].data)
          const fileExt = path.extname(attachmentsData[index].filename)
          const renamedFile = `${config.folder}_${dateFormatted}_${hashMail}_${attachmentHash}${fileExt}`
          const attachmentPath = path.join(attachmentsPath, renamedFile)
          const attachmentData = attachmentsData[index].data

          console.log(`saving attachment into ${attachmentPath}`)
          fs.writeFileSync(attachmentPath, attachmentData)

          const payload = {
            folder: config.folder,
            from: mailFrom,
            subject: mailSubject,
            reception_date: mailDate,
            mail_hash: hashMail,
            attachment_filename: attachmentsData[index].filename,
            attachment_hash: attachmentHash,
            attachment_renamed: renamedFile
          }

          // verifica si el attachment ya fue procesado.
          const checkResponse = await MailApi.checkExists(payload)
          console.log(checkResponse)

          const mailExists = JSON.parse(checkResponse)
          if (/not found/i.test(mailExists) === true) {
            attachmentsProcessed++
            console.log(`uploading attachment ${attachmentPath}`)
            const uploadResponse = await MailApi.upload(payload, attachmentPath)
            console.log(uploadResponse)
          } else {
            console.log('already processed')
          }
        }
      }
    }

    const messageUid = message.attributes.uid
    await connection.connection.moveMessage(messageUid, config.newFolder)
    movedMessages++
  }

  await mailBot.closeConnection()

  return { processedMessages, movedMessages, attachmentsFound, attachmentsProcessed }
}
