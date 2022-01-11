const SimpleSmartContract = artifacts.require('SimpleSmartContract');
contract('SimpleSmartContract', () => {
    it('should deploy contract properly', async function () {
        const simpleSmartContract = await SimpleSmartContract.deployed();
        console.log(simpleSmartContract.address);
        assert(simpleSmartContract.address != '');
    });
});