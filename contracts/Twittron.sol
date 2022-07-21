// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "./ITRC20.sol";

contract Twittron {
    struct TransferReceipt {
        uint256 id;
        address sender;
        uint256 amount;
        uint256 timestamp;
        bool claimed;
        address trc20Address;
    }

    address owner;
    uint256 public counterId;
    mapping(string => address) public handleAddress;
    mapping(uint256 => TransferReceipt) public receiptId;
    mapping(string => uint256[]) public handleVault;

    event TransferData(
        address indexed _from,
        address indexed _trc20,
        uint256 _value,
        uint256 _receiptId
    );

    constructor() {
        owner = msg.sender;
        counterId = 1;
    }

    modifier _ownerOnly() {
        require(msg.sender == owner, "owner only transaction.");
        _;
    }

    function updateHandleAddress(string memory handle, address walletAddress) external _ownerOnly {
        require(bytes(handle).length > 0, "twitter handle is required.");
        handleAddress[handle] = walletAddress;
    }

    function transferTrx(string calldata handle) external payable returns (uint256) {
        require(bytes(handle).length > 0, "twitter handle is required.");

        uint256 id = nextCounterId();
        handleVault[handle].push(id);
        receiptId[id] = TransferReceipt(id, msg.sender, msg.value, block.timestamp, false, address(0));

        emit TransferData(msg.sender, address(0), msg.value, id);

        return id;
    }

    function transferTrc20(string calldata handle, ITRC20 token, uint256 amount) external returns (uint256) {
        require(bytes(handle).length > 0, "twitter handle is required.");

        uint256 trc20balance = token.balanceOf(address(msg.sender));
        require(amount <= trc20balance, "insufficient balance");

        token.transferFrom(msg.sender, address(this), amount);

        uint256 id = nextCounterId();
        handleVault[handle].push(id);
        receiptId[id] = TransferReceipt( id, msg.sender, amount, block.timestamp, false, address(token));

        emit TransferData(msg.sender, address(token), amount, id);

        return id;
    }

    function receiptList10(string calldata handle, uint256 startIndex) external view returns (TransferReceipt[] memory)
    {
        require(bytes(handle).length > 0, "twitter handle is required.");

        uint256[] memory ids = handleVault[handle];
        uint256 min = ids.length - startIndex < 10
            ? ids.length - startIndex
            : 10;
        TransferReceipt[] memory receipts = new TransferReceipt[](min);

        for (uint256 i = 0; i < min; i++) {
            receipts[i] = receiptId[ids[startIndex + i]];
        }

        return receipts;
    }

    function releaseFund(uint256 id, string memory handle) external payable {
        require(bytes(handle).length > 0, "twitter handle is required.");

        TransferReceipt memory receipt = receiptId[id];
        require(receipt.id != 0, "invalid receipt id.");
        require(receipt.claimed != true, "receipt has been claimed.");

        address receiver = handleAddress[handle];
        require(receiver != address(0), "twitter handle not registered in the oracle.");

        if (receipt.trc20Address == address(0)) {
            payable(receiver).transfer(receipt.amount);
        } else {
            ITRC20(receipt.trc20Address).transfer(receiver, receipt.amount);
        }

        receipt.claimed = true;
        receiptId[id] = receipt;
    }

    // utility function
    function checkBalance() external view returns (uint256 contractAccount, uint256 senderAccount) {
        return (
            address(this).balance,
            address(msg.sender).balance
        );
    }
    
    function checkTokenBalance(ITRC20 token) external view returns (uint256 contractAccount, uint256 senderAccount) {
        return (
            token.balanceOf(address(this)),
            token.balanceOf(msg.sender)
        );
    }

    function nextCounterId() internal returns (uint256) {
        return counterId++;
    }
}
