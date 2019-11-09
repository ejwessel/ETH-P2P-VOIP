pragma solidity 0.5.12;

contract Registry {

  event WhitelistAdded(address, address);
  event WhitelistRemoved(address, address);

  //mapping of callee address to the caller address and a 
  //boolean value that determines if callee can be called
  mapping(address => mapping(address => bool)) public whitelist;

  //mapping of callee address to token to price
  mapping(address => mapping(address => uint256)) public pricing;

  function getPrice(address account, address token) external view returns(uint256) {
   return pricing[account][token];
  }
  
  function setPrice(address token, uint256 price) external {
    pricing[msg.sender][token] = price;
  }

  function canCall(address caller, address callee) external view returns(bool) {
    return whitelist[callee][caller];
  }

  function addToWhitelist(address accountToAdd) external {
    whitelist[msg.sender][accountToAdd] = true;
    emit WhitelistAdded(msg.sender, accountToAdd);
  }

  function removeFromWhitelist(address accountToRemove) external {
    delete whitelist[msg.sender][accountToRemove];
    emit WhitelistRemoved(msg.sender, accountToRemove);
  }
}
