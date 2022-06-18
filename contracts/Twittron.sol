// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract Twittron {
  struct TransferReceipt {
    uint id;
    address sender;
    uint256 amount;
    uint timestamp;
    bool claimed;
  }

  address owner;
  uint public counterId;
  mapping(string => address) public handleAddress;
  mapping(uint => TransferReceipt) public receiptId;
  mapping(string => uint[]) public handleVault;

  constructor() {
    owner = msg.sender;
    counterId = 1;
  }
  
  modifier _ownerOnly() {
    require(msg.sender == owner, "owner only transaction.");
    _;
  }
  
  function updateHandleAddress(string memory handle, address walletAddress) public _ownerOnly {
    require(bytes(handle).length > 0, "twitter handle is required.");
    handleAddress[handle] = walletAddress;
  }

  function transferFund(string calldata handle) external payable returns (uint) {
    require(bytes(handle).length > 0, "twitter handle is required.");

    uint id = nextCounterId();
    handleVault[handle].push(id);
    receiptId[id] = TransferReceipt(id, msg.sender, msg.value, block.timestamp, false);
    
    return id;
  }

  function receiptList10(string memory handle, uint startIndex) public view returns (TransferReceipt[] memory) {
    require(bytes(handle).length > 0, "twitter handle is required.");

    uint[] memory ids = handleVault[handle];
    uint min = ids.length - startIndex < 10 ? ids.length - startIndex : 10;
    TransferReceipt[] memory receipts = new TransferReceipt[](min);

    for (uint i = 0; i < min; i++) {
      receipts[i] = receiptId[ids[startIndex + i]];
    }

    return receipts;
  }
  
  function releaseFund(uint id, string memory handle) public payable {
    require(bytes(handle).length > 0, "twitter handle is required.");

    TransferReceipt memory receipt = receiptId[id];
    require(receipt.id != 0, "invalid receipt id.");
    require(receipt.claimed != true, "receipt has been claimed.");

    address receiver = handleAddress[handle];
    require(receiver != address(0), "twitter handle not registered in the oracle.");

    payable(receiver).transfer(receipt.amount);
    receipt.claimed = true;
    receiptId[id] = receipt;
  }

  // utility function
  function checkBalance() public payable returns (uint256 contractAccount, uint256 ownerAccount, uint256 senderAccount) {
    return (address(this).balance, address(owner).balance, address(msg.sender).balance);
  }

  function nextCounterId() public returns (uint) {
    return counterId++;
  }
}