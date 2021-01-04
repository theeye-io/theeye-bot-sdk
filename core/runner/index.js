/**
 * @param {Array} data
 */
const successOutput = ({ data, components, next }) => {
  let output = { state: "success", data, components, next }
  console.log(JSON.stringify(output)) 
  process.exit()
}

/**
 * @param {Error} err
 */
const failureOutput = (err) => {
  console.error(err)
  
  let output = {
    state: "failure",
    data: {
      message: err.message,
      code: err.code,
      data: err.data 
    }
  }
  console.error(JSON.stringify(output))
  process.exit()
}

process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p)
  failureOutput(reason)
})

process.on('uncaughtException', err => {
  console.error(err, 'Uncaught Exception thrown')
  failureOutput(err)
})

class TheEyeTaskRunner {
  constructor () {
    // parse parameters.
    // connection, keys, directories, parameters, etc
  }

  initialize () {
    // nothing yet
  }

  /**
   * @return {Promise}
   */
  async run (parameters) {
    throw new Error('HELP: Extend TheEyeCore and redefine this method for your needs')
  }

  async main () {
    try {
      const parameters = []
      for (let index = 2; index < process.argv.length; index++) {
        paramters.push( process.argv[index] )
      }

      const output = this.run( parameters )
      return successOutput(output)
    } catch (e) {
      return failureOutput(e)
    }
  }
}

module.exports = TheEyeTaskRunner
