const { assert } = require("console");

const HelloWorld = artifacts.require('HelloWorld');
contract('HelloWorld', () => {
    it("Should return HelloWorld", async () => {
        const helloworld = await HelloWorld.deployed();
        const result = await helloworld.hello();
        assert(result === 'Hello World');
    });
});