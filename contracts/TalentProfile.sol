// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract TalentProfile {
    struct Profile {
        string name;
        string email;
        string telegram;
        string bio;
        string resumeHash;
        string[] skills;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    mapping(address => Profile) public profiles;
    mapping(address => bool) public hasProfile;
    
    // 🆕 ENHANCED EVENTS with full profile data
    event ProfileCreated(
        address indexed user, 
        string name, 
        string email, 
        string telegram, 
        string bio, 
        string resumeHash, 
        string[] skills, 
        uint256 timestamp
    );
    
    event ProfileUpdated(
        address indexed user, 
        string name, 
        string email, 
        string telegram, 
        string bio, 
        string resumeHash, 
        string[] skills, 
        uint256 timestamp
    );
    
    function createProfile(
        string memory _name,
        string memory _email,
        string memory _telegram,
        string memory _bio,
        string memory _resumeHash,
        string[] memory _skills
    ) external {
        require(!hasProfile[msg.sender], "Profile already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        profiles[msg.sender] = Profile({
            name: _name,
            email: _email,
            telegram: _telegram,
            bio: _bio,
            resumeHash: _resumeHash,
            skills: _skills,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        hasProfile[msg.sender] = true;
        
        // 🆕 Emit enhanced event with full data
        emit ProfileCreated(
            msg.sender, 
            _name, 
            _email, 
            _telegram, 
            _bio, 
            _resumeHash, 
            _skills, 
            block.timestamp
        );
    }
    
    function updateProfile(
        string memory _name,
        string memory _email,
        string memory _telegram,
        string memory _bio,
        string memory _resumeHash,
        string[] memory _skills
    ) external {
        require(hasProfile[msg.sender], "Profile does not exist");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        Profile storage profile = profiles[msg.sender];
        profile.name = _name;
        profile.email = _email;
        profile.telegram = _telegram;
        profile.bio = _bio;
        profile.resumeHash = _resumeHash;
        profile.skills = _skills;
        profile.updatedAt = block.timestamp;
        
        // 🆕 Emit enhanced event with full data
        emit ProfileUpdated(
            msg.sender, 
            _name, 
            _email, 
            _telegram, 
            _bio, 
            _resumeHash, 
            _skills, 
            block.timestamp
        );
    }
    
    function getProfile(address _user) external view returns (Profile memory) {
        require(hasProfile[_user], "Profile does not exist");
        return profiles[_user];
    }
    
    function profileExists(address _user) external view returns (bool) {
        return hasProfile[_user];
    }
}
