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

  /**
   * @param {Object}
   * @prop {String} taskName approval task name
   * @prop {String} taskId approval task id
   */
  async getApprover ({ taskName = null, taskId = null }) {
    const wfJobId = JSON.parse(process.env.THEEYE_JOB_WORKFLOW).job_id
    const jobs = await this.getExecutionJobs(wfJobId)

    let approver = undefined

    for (let index = 0; index < jobs.length && approver === undefined; index++) {
      const job = jobs[index]

      if (
        job._type === 'ApprovalJob' &&
        (job.name === taskName || job.task_id === taskId)
      ) {
        if (job.lifecycle !== 'finished') {
          throw new Error('Approval job is waiting user action')
        }

        approver = job.result.user
      }
    }

    return approver
  }

  /**
   * @param {String} wfJobId The workflow job id for a workflow execution in progress.
   */
  async getExecutionJobs (wfJobId) {
    const workflowId = (process.env.WORKFLOW_ID || WORKFLOW_ID)
    const url = JSON.parse(process.env.THEEYE_API_URL || THEEYE_API_URL)
    const jobsApi = `${url}/workflows/${workflowId}/job/${wfJobId}/jobs?access_token=${SDK_TOKEN}`

    const response = await got.get(jobsApi, {
      headers: { 'content-type': 'application/json' },
      responseType: 'json'
    })

    const body = response.body

    if (!Array.isArray(body) || !(body.length > 0) ) {
      throw new Error('FATAL: No se pudo completar la solicitud')
    }

    console.log('success')
    return body
  }
}

module.exports = WorkflowApi
