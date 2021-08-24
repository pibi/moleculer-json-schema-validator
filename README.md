# Moleculer JSON Schema Validator

Validate moleculer action params via JSON Schema.

## Install

`npm install --save moleculer-json-schema-validator`

## Usage

```js
// moleculer.config.js

const Validator = require('moleculer-json-schema-validator')

module.exports = {
  ...
  validator: new Validator()
}
```

```js
// service.js

module.exports = {
  actions: {
    hello: {
      jsonSchema: {
        properties: {
          "name": {type: "string"}
        },
        required: ["name"]
      },
      handler (ctx) {
        const {name} = ctx.params
        return `Hello ${name}`
      }
    }
  }
}
```

## License

MIT
