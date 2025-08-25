// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract BountyBoard {
    struct Bounty {
        uint256 id;
        address company;
        string title;
        string description;
        string[] requiredSkills;
        uint256 payment;
        bool isActive;
        uint256 createdAt;
        uint256 deadline;
    }
    
    struct Application {
        address applicant;
        string coverLetter;
        uint256 appliedAt;
        bool isAccepted;
        bool isCompleted;
    }
    
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Application[]) public applications;
    mapping(uint256 => uint256) public bountyCount;
    
    uint256 public nextBountyId;
    
    // 🆕 ENHANCED EVENTS with full bounty data
    event BountyPosted(
        uint256 indexed bountyId, 
        address indexed company, 
        string title, 
        string description,
        string[] requiredSkills,
        uint256 payment,
        uint256 deadline,
        uint256 createdAt
    );
    
    event ApplicationSubmitted(
        uint256 indexed bountyId, 
        address indexed applicant,
        string coverLetter,
        uint256 appliedAt
    );
    
    event ApplicationAccepted(
        uint256 indexed bountyId, 
        address indexed applicant,
        uint256 acceptedAt
    );
    
    event BountyCompleted(
        uint256 indexed bountyId, 
        address indexed applicant,
        uint256 completedAt
    );
    
    function postBounty(
        string memory _title,
        string memory _description,
        string[] memory _requiredSkills,
        uint256 _payment,
        uint256 _deadline
    ) external payable {
        require(msg.value == _payment, "Payment amount must match bounty value");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        uint256 bountyId = nextBountyId++;
        
        bounties[bountyId] = Bounty({
            id: bountyId,
            company: msg.sender,
            title: _title,
            description: _description,
            requiredSkills: _requiredSkills,
            payment: _payment,
            isActive: true,
            createdAt: block.timestamp,
            deadline: _deadline
        });
        
        // 🆕 Emit enhanced event with full data
        emit BountyPosted(
            bountyId, 
            msg.sender, 
            _title, 
            _description,
            _requiredSkills,
            _payment,
            _deadline,
            block.timestamp
        );
    }
    
    function applyForBounty(uint256 _bountyId, string memory _coverLetter) external {
        require(_bountyId < nextBountyId, "Bounty does not exist");
        require(bounties[_bountyId].isActive, "Bounty is not active");
        require(block.timestamp < bounties[_bountyId].deadline, "Bounty deadline has passed");
        
        Application memory newApplication = Application({
            applicant: msg.sender,
            coverLetter: _coverLetter,
            appliedAt: block.timestamp,
            isAccepted: false,
            isCompleted: false
        });
        
        applications[_bountyId].push(newApplication);
        
        // 🆕 Emit enhanced event with cover letter
        emit ApplicationSubmitted(_bountyId, msg.sender, _coverLetter, block.timestamp);
    }
    
    function acceptApplication(uint256 _bountyId, uint256 _applicationIndex) external {
        require(_bountyId < nextBountyId, "Bounty does not exist");
        require(msg.sender == bounties[_bountyId].company, "Only company can accept applications");
        require(_applicationIndex < applications[_bountyId].length, "Invalid application index");
        
        Application storage application = applications[_bountyId][_applicationIndex];
        require(!application.isAccepted, "Application already accepted");
        
        application.isAccepted = true;
        bounties[_bountyId].isActive = false;
        
        // 🆕 Emit enhanced event with timestamp
        emit ApplicationAccepted(_bountyId, application.applicant, block.timestamp);
    }
    
    function completeBounty(uint256 _bountyId, uint256 _applicationIndex) external {
        require(_bountyId < nextBountyId, "Bounty does not exist");
        require(msg.sender == bounties[_bountyId].company, "Only company can complete bounty");
        require(_applicationIndex < applications[_bountyId].length, "Invalid application index");
        
        Application storage application = applications[_bountyId][_applicationIndex];
        require(application.isAccepted, "Application must be accepted first");
        require(!application.isCompleted, "Bounty already completed");
        
        application.isCompleted = true;
        
        // Transfer payment to the accepted applicant
        payable(application.applicant).transfer(bounties[_bountyId].payment);
        
        // 🆕 Emit enhanced event with timestamp
        emit BountyCompleted(_bountyId, application.applicant, block.timestamp);
    }
    
    function getBounty(uint256 _bountyId) external view returns (Bounty memory) {
        require(_bountyId < nextBountyId, "Bounty does not exist");
        return bounties[_bountyId];
    }
    
    function getApplications(uint256 _bountyId) external view returns (Application[] memory) {
        require(_bountyId < nextBountyId, "Bounty does not exist");
        return applications[_bountyId];
    }
    
    function getBountyCount() external view returns (uint256) {
        return nextBountyId;
    }
}
