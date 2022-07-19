const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const addKeywords = require("ajv-keywords");

const { Validators, Errors: { ValidationError } } = require("moleculer");

class AjvValidator extends Validators.Base {
	constructor (options = {}) {
		super();
		this.validator = new Ajv(options);
		addKeywords(this.validator);
		addFormats(this.validator);
		this.fallbackValidator = new Validators.Fastest();
	}

	compile (schema) {
		const validate = this.validator.compile(schema);
		return (params) => this.validate(params, validate);
	}

	async validate (params, validate) {
		const isValid = await validate(params);
		if (!isValid) throw new ValidationError("Parameters validation error!", null, validate.errors);
	}

	/**
	 * Register validator as a middleware
	 *
	 * @memberof ParamValidator
	 */
	middleware() {
		return function validatorMiddleware(handler, action) {
			if (!action.jsonSchema || typeof action.jsonSchema !== "object") {

				// no schema to validate for => just return back the handler directly
				if (!action.params || typeof action.params !== "object") return handler;

				// fallback to the fastest validator (moleculer's default validator)
				const checkFn = this.fallbackValidator.compile(action.params);
				return async function validateContextParams(ctx) {
					const res = await checkFn(ctx.params);
					if (res !== true)
						throw new ValidationError("Parameters validation error!", null, res);
					return handler(ctx);
				};
			}

			// Wrap a param validator when the params are specified
			const checkFn = this.compile(action.jsonSchema);
			return async function validateContextParams(ctx) {
				await checkFn(ctx.params != null ? ctx.params : {});
				return handler(ctx);
			};
		}.bind(this);
	}
}

module.exports = AjvValidator;
