const Ajv = require('ajv')

const BaseValidator = require('moleculer/src/validator')
const {ValidationError} = require('moleculer/src/errors')

class AjvValidator extends BaseValidator {
  constructor (options) {
    super()
    this.validator = new Ajv(options)
  }

  compile (schema) {
    const validate = this.validator.compile(schema)
    return (params) => this.validate(params, validate)
  }

  async validate (params, validate) {
    const isValid = await validate(params)
    if (isValid) return true
    else throw new ValidationError('Parameters validation error!', null, validate.errors)
  }
}

module.exports = AjvValidator
