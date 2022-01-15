// voting.test.js 
const { BN, ether } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const VOTING = artifacts.require('Voting');
const truffleAssert = require('truffle-assertions');

contract('Voting', function (accounts) {
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];

    const proposal1 = "Prop 1";
    const proposal2 = "Prop 2";
    const proposal3 = "Prop 3";

    const vote1 = new BN(0);
    const vote2 = new BN(1);
    const vote3 = new BN(2);

    const RegisteringVoters = new BN(0);
    const ProposalsRegistrationStarted = new BN(1);
    const ProposalsRegistrationEnded = new BN(2);
    const VotingSessionStarted = new BN(3);
    const VotingSessionEnded = new BN(4);

    describe("Voting DApp", function() {
        beforeEach(async function () {
            this.VotingInstance = await VOTING.new({from:owner});
        });

        describe("Init", function() {
            it("Owner check", async function () {
                expect(await this.VotingInstance.owner()).to.equal(owner);
            });

            it("RegisteringVoters check", async function() {
                expect(await this.VotingInstance.status()).to.be.bignumber.equal(RegisteringVoters);
            });
        });
        describe("Authorise Step", function() {
            it('si un adresse est autorisée elle doit être dans la mapping a true', async function () {
                    await this.VotingInstance.authorize(voter1);
                    bool_regist = (await this.VotingInstance.voters(voter1)).isRegistered;
                    expect(bool_regist).to.equal(true);
                });
            it('si un adresse est autorisée elle doit être dans la mapping a true', async function () {
                await this.VotingInstance.authorize(voter1);
                bool_regist_1 = (await this.VotingInstance.voters(voter2)).isRegistered;
                bool_regist_2 = (await this.VotingInstance.voters(voter3)).isRegistered;
                expect(bool_regist_1).to.equal(false);
                expect(bool_regist_2).to.equal(false);
            });
        })
        describe("Proposal Step", function() {        
            it("Voters add propositions", async function() {
                await this.VotingInstance.authorize(voter1, {from:owner});
                await this.VotingInstance.authorize(voter2, {from:owner});
                await this.VotingInstance.authorize(voter3, {from:owner});
                await this.VotingInstance.startProposalRegistration({from:owner});
                await this.VotingInstance.addProposal(proposal1, {from:voter1});
                await this.VotingInstance.addProposal(proposal2, {from:voter2});
                await this.VotingInstance.addProposal(proposal3, {from:voter3});
                let prop_1 = await this.VotingInstance.proposals(0);
                let prop_2 = await this.VotingInstance.proposals(1);
                let prop_3 = await this.VotingInstance.proposals(2);
                expect(prop_1.description).to.equal(proposal1);
                expect(prop_2.description).to.equal(proposal2);
                expect(prop_3.description).to.equal(proposal3);
            });
        })
        describe("Voting step", function() {
            beforeEach(async function () {
                await this.VotingInstance.authorize(voter1, {from:owner});
                await this.VotingInstance.authorize(voter2, {from:owner});
                await this.VotingInstance.authorize(voter3, {from:owner});
                await this.VotingInstance.startProposalRegistration({from:owner});
                await this.VotingInstance.addProposal(proposal1, {from:voter1});
                await this.VotingInstance.addProposal(proposal2, {from:voter2});
                await this.VotingInstance.addProposal(proposal3, {from:voter3});
                await this.VotingInstance.endProposalRegistration({from:owner});
                await this.VotingInstance.startVotingSession({from:owner});
            });

            it("Voters vote", async function() {
                await this.VotingInstance.vote(0, {from:voter1});
                await this.VotingInstance.vote(0, {from:voter2});
                await this.VotingInstance.vote(1, {from:voter3});
                let v1 = await this.VotingInstance.voters(voter1)
                let v2 = await this.VotingInstance.voters(voter2)
                let v3 = await this.VotingInstance.voters(voter3)
                v1 = v1.votedProposalId.toString()
                v2 = v2.votedProposalId.toString()
                v3 = v3.votedProposalId.toString()
                let nbr_vote_v1 = await this.VotingInstance.proposals(v1)
                let nbr_vote_v2 = await this.VotingInstance.proposals(v2)
                let nbr_vote_v3 = await this.VotingInstance.proposals(v3)
                expect(nbr_vote_v1.voteCount).to.be.bignumber.equal(vote3);
                expect(nbr_vote_v2.voteCount).to.be.bignumber.equal(vote2);
                expect(nbr_vote_v3.voteCount).to.be.bignumber.equal(vote1);
            });
        })
        describe("Check Event Emitted", function() {
            it('un event a été emit lorsque la fonction startProposalRegistration est appelé', async function () {
                let lx = await this.VotingInstance.startProposalRegistration();
                truffleAssert.eventEmitted(lx, 'WorkflowStatusChange');
            });
    })
    describe("End of vote", function() {
        beforeEach(async function () {
            await this.VotingInstance.authorize(owner, {from:owner});
            await this.VotingInstance.authorize(voter1, {from:owner});
            await this.VotingInstance.authorize(voter2, {from:owner});
            await this.VotingInstance.authorize(voter3, {from:owner});
            await this.VotingInstance.startProposalRegistration({from:owner});
            await this.VotingInstance.addProposal(proposal1, {from:voter1});
            await this.VotingInstance.addProposal(proposal2, {from:voter2});
            await this.VotingInstance.addProposal(proposal3, {from:voter3});
            await this.VotingInstance.addProposal({from:owner});
            await this.VotingInstance.startVotingSession({from:owner});
            await this.VotingInstance.vote(vote1, {from:voter1});
            await this.VotingInstance.vote(vote2, {from:voter2});
            await this.VotingInstance.vote(vote2, {from:voter3});
        });

        it("VotingSessionEnded", async function() {
            await this.VotingInstance.endVotingSession({from:owner});
            expect(await this.VotingInstance.status()).to.be.bignumber.equal(VotingSessionEnded);
        });
    })
    })
});