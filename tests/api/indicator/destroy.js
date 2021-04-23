
const Indicators = require('../../../core/api/indicator')

const main = async () => {

  const indicators = await Indicators.Fetch({
    baseUrl: 'http://127.0.0.1:60080',
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjA4MmRmYTE3ZDBmMmEzZDIwYWIyZDliIiwiaWF0IjoxNjE5MTg5NjY1LCJleHAiOjE2MTkyMDA0NjV9.O0d8AZXOHNUpWb-1dhZFPRIAnMeCBi7vuYUTM54ld30'
  })

  for (let indicator of indicators) {
    const response = await indicator.destroy()
    console.log(response.body)
  }

  return {}
}

main().then(console.log).catch(console.error)
