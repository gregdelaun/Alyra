// voting.test.js 
const { BN, ether } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const VOTING = artifacts.require('Voting');
const truffleAssert = require('truffle-assertions');

contract('Voting', function (accounts) {
    const owner = accounts[0];
    const recipient = accounts[1];
    const spender = accounts[2];

    it('si un adresse est autorisée elle doit être dans la mapping a true', async function () {
        const voting = await VOTING.deployed();
        await voting.authorize(spender);
        bool_regist = (await voting.voters(spender)).isRegistered;
        assert(bool_regist == true);
    });

    it('un event a été emit lorsque la fonction startProposalRegistration est appelé', async function () {
        const voting = await VOTING.deployed();
        let lx = await voting.startProposalRegistration();
        console.log((await voting.status()).toString())
        truffleAssert.eventEmitted(lx, 'WorkflowStatusChange');
    });

    // it('une proposition a été ajouté et un event lié a cela à été emit', async function () {
    //     const voting = await VOTING.deployed();
    //     console.log((await voting.status()).toString())
    //     await voting.authorize(owner);
    //     await voting.addProposal("test");
    //     console.log("test");
    // });

    it('un event a été emit lorsque la fonction endProposalRegistration est appelé', async function () {
        const voting = await VOTING.deployed();
        let lx = await voting.endProposalRegistration();
        truffleAssert.eventEmitted(lx, 'WorkflowStatusChange');
    });

    it('un event a été emit lorsque la fonction startVotingSession est appelé', async function () {
        const voting = await VOTING.deployed();
        let lx = await voting.startVotingSession();
        truffleAssert.eventEmitted(lx, 'WorkflowStatusChange');
    });

    it('un event a été emit lorsque la fonction endVotingSession est appelé', async function () {
        const voting = await VOTING.deployed();
        let lx = await voting.endVotingSession();
        truffleAssert.eventEmitted(lx, 'WorkflowStatusChange');
    });


});