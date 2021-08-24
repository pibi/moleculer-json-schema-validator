"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;

beforeAll(async () => {});
afterAll(async () => {});

describe("Test 'moleculer-json-schema-validator'", () => {

	const TestService = {
		name: "TestService",
		actions: {
			"test/noValidation": {
				handler: jest.fn(),
			},
			"test/validation/jsonSchema": {
				handler: jest.fn(),
				jsonSchema: {
					type: "object",
					required: [ "required"],
					properties: {
						required: {
							type: "string"
						},
						extra: {
							type: "number",
							format: "float"
						}
					}
				}
			},
			"test/validation/fallback": {
				handler: jest.fn(),
				params: {
					required: { type: "string" }, // required
					extra: { type: "number", optional: true }
				}
			},
		}
	};

	let broker = new ServiceBroker({ logger: false, validator: new (require("./"))({coerceTypes : true}) });
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	beforeEach(() => jest.clearAllMocks());

	describe("Test 'noValidation' action", () => {
		it("should call the action correctly", async () => {
			await broker.call("TestService.test/noValidation");
			const action = TestService.actions["test/noValidation"].handler;
			expect(action).toBeCalled();
		});

		it("should call the action correctly with extra parameters", async () => {
			await broker.call("TestService.test/noValidation", {extra: true });
			const action = TestService.actions["test/noValidation"].handler;
			expect(action).toBeCalled();
			expect(action).toBeCalledWith(
				expect.objectContaining({params: {extra: true}}),
			);
		});
	});

	describe("Test 'validation/jsonSchema' action", () => {
		it("should call the action correctly", async () => {
			await broker.call("TestService.test/validation/jsonSchema", { required: "required" });
			const action = TestService.actions["test/validation/jsonSchema"].handler;
			expect(action).toBeCalledWith(
				expect.objectContaining({params: { required: "required" }}),
			);
		});

		it("should emit a validation error with missing required", async () => {
			expect.assertions(2);
			try {
				await broker.call("TestService.test/validation/jsonSchema", { required: undefined });
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}

			const action = TestService.actions["test/validation/jsonSchema"].handler;
			expect(action).not.toBeCalled();
		});

		it("should emit a validation error with invalid extra", async () => {
			expect.assertions(2);
			try {
				await broker.call("TestService.test/validation/jsonSchema", { required: "required", extra: "invalid" });
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}

			const action = TestService.actions["test/validation/jsonSchema"].handler;
			expect(action).not.toBeCalled();
		});

		it("should emit a validation error with empty params", async () => {
			expect.assertions(2);
			try {
				await broker.call("TestService.test/validation/jsonSchema");
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}

			const action = TestService.actions["test/validation/jsonSchema"].handler;
			expect(action).not.toBeCalled();
		});

		it("should emit a validation error with null params", async () => {
			expect.assertions(2);
			try {
				await broker.call("TestService.test/validation/jsonSchema", null);
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}

			const action = TestService.actions["test/validation/jsonSchema"].handler;
			expect(action).not.toBeCalled();
		});
	});


	describe("Test 'validation/fallback' action", () => {
		it("should call the action correctly", async () => {
			await broker.call("TestService.test/validation/fallback", { required: "required" });
			const action = TestService.actions["test/validation/fallback"].handler;
			expect(action).toBeCalledWith(
				expect.objectContaining({params: { required: "required" }}),
			);
		});

		it("should emit a validation error with missing required", async () => {
			expect.assertions(2);
			try {
				await broker.call("TestService.test/validation/fallback", { required: undefined });
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}

			const action = TestService.actions["test/validation/fallback"].handler;
			expect(action).not.toBeCalled();
		});

		it("should emit a validation error with invalid extra", async () => {
			expect.assertions(2);
			try {
				await broker.call("TestService.test/validation/fallback", { required: "required", extra: "invalid" });
			} catch(err) {
				expect(err).toBeInstanceOf(ValidationError);
			}

			const action = TestService.actions["test/validation/fallback"].handler;
			expect(action).not.toBeCalled();
		});
	});
});

