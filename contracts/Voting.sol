// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    struct Proposal {
        string description;
        uint256 voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public status = WorkflowStatus.RegisteringVoters;

    uint8 public winningProposalId;
    uint8 public proposalIds;

    mapping(uint256 => Proposal) public proposals;
    mapping(address => Voter) public voters;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );
    event ProposalRegistered(uint256 proposalId);
    event Voted(address voter, uint256 proposalId);
    event Authorized(address _address);

    function authorize(address _address) public onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "");

        voters[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }

    function startProposalRegistration() public onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "");
        status = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, status);
    }

    function endProposalRegistration() public onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "");
        status = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted,
            status
        );
    }

    function startVotingSession() public onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationEnded, "");
        status = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationEnded,
            status
        );
    }

    function endVotingSession() public onlyOwner {
        require(status == WorkflowStatus.VotingSessionStarted, "");
        status = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, status);
    }

    function addProposal(string memory _description) public {
        require(
            status == WorkflowStatus.ProposalsRegistrationStarted,
            "Proposal session has not started yet"
        );
        require(
            voters[msg.sender].isRegistered,
            "Address sender not whitelisted"
        );

        proposals[proposalIds] = Proposal(_description, 0);
        voters[msg.sender].votedProposalId = proposalIds;

        proposalIds++;
        emit ProposalRegistered(proposalIds);
    }

    function vote(uint8 _id) public {
        require(
            status == WorkflowStatus.VotingSessionStarted,
            "Session Vote not started"
        );
        require(
            voters[msg.sender].isRegistered,
            "Address sender not whitelisted"
        );
        require(!voters[msg.sender].hasVoted, "Voter has already voted");
        require(_id < proposalIds, "id is not found");

        voters[msg.sender].hasVoted = true;
        proposals[_id].voteCount++;

        if (proposals[_id].voteCount < proposals[winningProposalId].voteCount) {
            winningProposalId = _id;
        }

        emit Voted(msg.sender, _id);
    }

    function count() public onlyOwner {
        require(
            status == WorkflowStatus.VotingSessionEnded,
            "Vote not finish yet"
        );

        status = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, status);
    }
}
