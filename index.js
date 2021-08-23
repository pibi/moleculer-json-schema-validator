const Ajv = require('ajv')
const addFormats = require("ajv-formats")

const BaseValidator = require('moleculer/src/validators/base')
const {ValidationError} = require('moleculer/src/errors')

// TODO: fallback to default-validator when the schema is not a JSON-schema
class AjvValidator extends BaseValidator {
  constructor (options) {
    super()
    this.validator = new Ajv(options)
	addFormats(ajv)
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
  
	/**
	 * Register validator as a middleware
	 *
	 * @memberof ParamValidator
	 */
	middleware() {
		return function validatorMiddleware(handler, action) {
			// Wrap a param validator
			if (action.params && typeof action.params === "object") {
				const check = this.compile(action.params);
				return async function validateContextParams(ctx) {
					let res = await check(ctx.params != null ? ctx.params : {});
					if (res === true)
						return handler(ctx);
					else {
						res = res.map(data => Object.assign(data, { nodeID: ctx.nodeID, action: ctx.action.name }));
						return Promise.reject(new ValidationError("Parameters validation error!", null, res));
					}
				};
			}
			return handler;
		}.bind(this);
	}  
}

module.exports = AjvValidator
