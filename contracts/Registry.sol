pragma solidity 0.5.12;

contract Registry {

  event WhitelistAdded(address, address);
  event WhitelistRemoved(address, address);

  //mapping of callee address to the caller address and a 
  //boolean value that determines if callee can be called
  mapping(address => mapping(address => bool)) public whitelist;

  //mapping of callee address to token to price
  mapping(address => mapping(address => uint256)) public pricing;

  function getPrice(address account, address token) public returns(uint256) {
   return pricing[account][token];
  }

  function canCall(address caller, address callee) public returns(bool) {
    return whitelist[callee][caller];
  }

  function addToWhitelist(address accountToAdd) public {
    whitelist[msg.sender][accountToAdd] = true;
    emit WhitelistAdded(msg.sender, accountToAdd);
  }

  function removeFromWhitelist(address accountToRemove) public {
    delete whitelist[msg.sender][accountToRemove];
    emit WhitelistRemoved(msg.sender, accountToRemove);
  }
}
