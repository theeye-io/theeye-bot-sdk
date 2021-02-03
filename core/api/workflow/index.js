const got = require('got')
const debug = require('debug')

class WorkflowApi {
  constructor (specs = {}) {
    const apiUrl = JSON.parse(process.env.THEEYE_API_URL)
    this.customerName = JSON.parse(process.env.THEEYE_ORGANIZATION_NAME)
    //this.accessToken = JSON.parse(process.env.THEEYE_API_ACCESS_TOKEN)
    this.urlRoot = `${apiUrl}/workflows`
  }

  /**
   * @return {Workflow}
   */
  async run (options = {}) {
    const { id, secret, task_arguments } = options
    
    id || (id = process.env.WORKFLOW_ID)
    secret || (secret = process.env.WORKFLOW_SECRET)
    
    if (!secret && !this.accessToken) {
      throw new Error('missing credentials: access token or secret required')
    }
    
		if (task_arguments && !Array.isArray(task_arguments)) {
      throw new Error('task_arguments: array expected')
    }
    
    let url
    if (secret) {
      url = `${this.urlRoot}/${id}/secret/${secret}/job?customer=${this.customerName}`
    } else {
      // need access token
      url = `${this.urlRoot}/${id}/job?customer=${this.customerName}&access_token=${this.accessToken}`
    }

    try {
      const response = await got.post(url, {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(task_arguments),
        responseType: 'json'
      })

      return response.body
    } catch (err) {
      console.log(err.message)
      throw new Error(`[${err.response.statusCode}] ${err.response.body}`)
    }
  }
}

module.exports = WorkflowApi
