const fs = require('fs')

class WorkflowCache {
  /**
   * @constructor
   * @param {Object} path
   */
  constructor (path) {
    this.path = (path || './cache')
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path, { recursive: true })
      console.log(`cache directory ${this.path} created`)
    }
  }

  /**
   * @param {Object} payload
   */
  save (payload) {
    const workflowId = JSON.parse(process.env.THEEYE_JOB_WORKFLOW).job_id
    const content = JSON.stringify(payload)
    fs.writeFileSync(`${this.path}/${workflowId}.json`, content, 'utf8')
  }

  /**
   * @return {Object}
   */
  get () {
    const workflowId = JSON.parse(process.env.THEEYE_JOB_WORKFLOW).job_id
    const content = fs.readFileSync(`${this.path}/${workflowId}.json`, 'utf8')
    return JSON.parse(content)
  }
}

module.exports = WorkflowCache
