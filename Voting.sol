//Admin.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/access/Ownable.sol";

contract Voting is Ownable{
    
    uint8 public winningProposalId;
    uint8 public proposalIds;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address=> bool) public whitelist;
    mapping(address => Voter) public voters;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }
   
    struct Proposal {
        string description;
        uint voteCount;
    }
        
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    
    WorkflowStatus public status; 
    
    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    event Authorized(address _address);

   function authorize(address _address) public onlyOwner{
        WorkflowStatus previous = status;
        WorkflowStatus newStatus = WorkflowStatus.RegisteringVoters;
        status = newStatus;
        whitelist[_address] = true;
        emit VoterRegistered(_address);
        emit WorkflowStatusChange(previous, status);
    }
   
    function startProposalRegistration() public onlyOwner   {
        WorkflowStatus previous = status;
        WorkflowStatus newStatus = WorkflowStatus.ProposalsRegistrationStarted;
        status = newStatus;
        emit WorkflowStatusChange(previous, status);
    }

    function endProposalRegistration() public onlyOwner   {
        WorkflowStatus previous = status;
        WorkflowStatus newStatus = WorkflowStatus.ProposalsRegistrationEnded;
        status = newStatus;
        emit WorkflowStatusChange(previous, status);
    }

    function startVotingSession() public onlyOwner   {
        WorkflowStatus previous = status;
        WorkflowStatus newStatus = WorkflowStatus.VotingSessionStarted;
        status = newStatus;
        emit WorkflowStatusChange(previous, status);
    }
    function endVotingSession() public onlyOwner   {
        WorkflowStatus previous = status;
        WorkflowStatus newStatus = WorkflowStatus.VotingSessionEnded;
        status = newStatus;
        emit WorkflowStatusChange(previous, status);
    }

    function addProposal(string memory _description) public {

        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Proposal session has not started yet");
        require(whitelist[msg.sender] == true, "Address sender not whitelisted");
        Proposal memory newProposal = Proposal(_description, 0);
        Voter memory newVoter = Voter(true,false, proposalIds);
        proposals[proposalIds] = newProposal;
        voters[msg.sender] = newVoter;
        proposalIds++;
        emit ProposalRegistered(proposalIds);
    }

    function vote(uint256 _id) public {
        require(status == WorkflowStatus.VotingSessionStarted, "Session Vote not started");
        require(whitelist[msg.sender] == true, "Address sender not whitelisted");
        require(voters[msg.sender].hasVoted == false, "Voter has already voted");
        voters[msg.sender].hasVoted = true;
        proposals[_id].voteCount++;
        emit Voted(msg.sender, _id);
    }

    function count() public onlyOwner {
        require(status == WorkflowStatus.VotingSessionEnded, "Vote not finish yet");
        uint8 id;
        uint256 highest;
        for (uint256 i = 0; i <= proposalIds; i++) {
            if (highest < proposals[i].voteCount) {
                highest = proposals[i].voteCount;
            }
        }
        winningProposalId = id;
        WorkflowStatus previous = status;
        WorkflowStatus newStatus = WorkflowStatus.VotesTallied;
        status = newStatus;
        emit WorkflowStatusChange(previous, status);
    }
}
