const got = require('got')
const debug = require('debug')('theeye:indicator')

const BASE_URL = JSON.parse(process.env.THEEYE_API_URL || JSON.stringify('https://supervisor.theeye.io'))

class TheEyeIndicatorApi {

  constructor (properties = {}, settings = {}) {

    const { title, type } = properties

    if (!title) {
      throw new Error('Indicator "title" is requiered')
    }

    this.settings = {}
    this.properties = {}

    Object.assign(this.settings, settings)
    Object.assign(this.properties, properties)

    this.properties.type = (type || 'text')
  }

  get url () {
    const titleURLEncoded = encodeURIComponent(this.properties.title)
    const rootURL = `${this.baseUrl}/indicator`

    let url
    if (this.properties.id) {
      url = `${rootURL}/title/${titleURLEncoded}?access_token=${this.accessToken}`
    } else {
      url = `${rootURL}?access_token=${this.accessToken}`
    }
    return url
  }

  get baseUrl () {
    return this.settings.baseUrl || BASE_URL
  }

  get accessToken () {
    const token = this.settings.accessToken || process.env.THEEYE_ACCESS_TOKEN
    return token
  }

  static async Fetch (options = {}) {
    let { baseUrl, accessToken } = options

    baseUrl || (baseUrl = BASE_URL)

    const fetchApi = `${baseUrl}/indicator?access_token=${accessToken}`
    const request = TheEyeIndicatorApi.Request({ url: fetchApi, method: 'get' })
    const response = await request

    if (response.statusCode < 200 || response.statusCode > 300) {
      throw new Error(`${response.statusCode}: ${response.body}`)
    }

    const payload = JSON.parse(response.body)
    const indicators = []
    for (let properties of payload) {
      indicators.push( new TheEyeIndicatorApi(properties, { baseUrl, accessToken }) )
    }
    return indicators
  }

  async save () {
    let request
    if (this.properties.id) {
      request = this.apiRequest({
        url: this.url,
        method: 'put', 
        json: this.properties,
        responseType: 'json'
      })
    } else {
      request = this.apiRequest({
        url: this.url,
        method: 'post',
        json: this.properties,
        responseType: 'json'
      })
    }

    const response = await request

    if (response.statusCode < 200 || response.statusCode > 300) {
      throw new Error(`${response.statusCode}: ${JSON.stringify(response.body)}`)
    }

    const body = response.body

    debug(body)

    Object.assign(this.properties, body)

    return response
  }

  destroy () {
    return this.apiRequest({ url: this.url, method: 'delete' })
  }

  apiRequest (options) {
    debug(options)
    const promise = got(options)
      .catch(error => {
        if (error.response) {
          return error.response
        }
        throw error
      })
    return promise
  }

  static Request (options) {
    debug(options)
    const promise = got(options)
      .catch(error => {
        if (error.response) {
          return error.response
        }
        throw error
      })
    return promise
  }

}

module.exports = TheEyeIndicatorApi
