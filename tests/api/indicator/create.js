const Indicator = require('../../../core/api/indicator')

const faker = require('faker')
const text = { type: "text", value: () => faker.random.words() }
const counter = { type: "counter", value: () => faker.random.number() }
const progress = { type: "progress", value: () => faker.random.number(100) }

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjA4MmRmYTE3ZDBmMmEzZDIwYWIyZDliIiwiaWF0IjoxNjE5MTg5NjY1LCJleHAiOjE2MTkyMDA0NjV9.O0d8AZXOHNUpWb-1dhZFPRIAnMeCBi7vuYUTM54ld30'
const baseUrl = 'http://127.0.0.1:60080'

const indicatorsCount = (process.argv[2] || 3)

const main = async () => {
  const indicators = []

	for (let index = 0; index < indicatorsCount; index++) {
		const properties = generateProperties()
    const indicator = new Indicator(properties, { baseUrl, accessToken })
    await indicator.save()
		indicators.push( indicator.properties.id )
	}

  return { data: indicators }
}

const generateProperties = () => {
  let indicator = faker.helpers.randomize([text, counter, progress])
  let randomOrder = faker.random.number(999999)
  let gen = {
    tags: `Order: ${randomOrder}`,
    order: randomOrder,
    state: faker.helpers.randomize(["failure","normal"]),
    read_only: faker.helpers.randomize([true, false]),
    severity: faker.helpers.randomize(['CRITICAL', 'HIGH', 'LOW']),
    title: faker.random.words().replace( new RegExp('[/ ]', 'gim'), '_'),
    value: indicator.value(),
    type: indicator.type
  }
  return gen
}

/**
 * @param {Array} data
 */
const outputSuccess = ({ data, components }) => {
  let output = { state: "success", data, components }
  console.log( JSON.stringify(output) )
}

/**
 * @param {Error} err
 */
const outputFailure = (err) => {
  console.error(err)
  let output = { state: "failure", data: [ err.message, err.data, { count: err.count } ] }
  console.error( JSON.stringify(output) )
  process.exit(1)
}

main ().then(outputSuccess).catch(outputFailure)
