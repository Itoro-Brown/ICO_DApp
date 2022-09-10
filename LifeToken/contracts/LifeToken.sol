//SPDX-License-Identifier : MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Inftpresale.sol";

contract LifeToken is ERC20, Ownable {
    //Here the interface from my previous nftpresale is called and given a new variable
    nftpresale2 _ntfpresale2;

    //This here depicts the total amount of token can ever be in circulation
    uint256 public constant maxTotalSupply = 10000 * 10**18;

    //This is the tokenprice
    uint256 public constant tokenPrice = 0.001 ether;

    //This mapping here maps the tokenIds that have being so a user does own two tokens with the same tokenId.
    mapping(uint256 => bool) public tokenIdClaimed;

    //This is the amount of token that will be given for each that one owns.
    //It is calculated by multiplying 10 to the power of 18 which is the standard for numbering in solidity
    uint256 public constant tokensPerNft = 10 * 10**18;

    //The constructor here is required to get the contract adddress of the previous deployed nftpresale nft contract address
    //So the functions can be used. Also the and symbol of the token is inputed as they are needed before deployment.
    constructor(address nftpresale) ERC20("LifeToken", "LT") {
        //This right here set the address of the nftpresale from the previous nft contract and gets users that have minted the nfts
        _ntfpresale2 = nftpresale2(nftpresale);
    }

    //The function below gives the user the ability to claim their token on the basics that they must have joined in either
    //the private or public nft mint/presales and own one or more of the nfts.

    // modifier onlyOwner() {
    //     msg.sender = owner;
    //     require(owner, "You are not the owner of this contract");
    // }

    function claim() public payable {
        address sender = msg.sender;
        uint256 balance = _ntfpresale2.balanceOf(sender);
        uint256 amount = 0;
        require(balance > 0, "You do not own any of our nft collection");

        //The loop below goes through the balance of the sender or address and gets each tokenId owned by the address
        //and is put in place so it doesnt go beyond the number of token that the user has.
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = _ntfpresale2.tokenOfOwnerByIndex(sender, i);

            if (!tokenIdClaimed[tokenId]) {
                amount += 1;
                tokenIdClaimed[tokenId] = true;
            }
        }
        require(amount > 0, "You have already claimed your token");

        _mint(sender, amount * tokensPerNft);
    }

    function mint(uint256 amount) public payable {
        uint256 _requiredAmount = tokenPrice * amount;
        require(
            msg.value >= _requiredAmount,
            "Amount money sent is not enough"
        );
        uint256 amountWithDecimals = amount * 10**18;
        require(
            totalSupply() + amountWithDecimals <= maxTotalSupply,
            "Exceeds the maximum total supply"
        );
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {}

    fallback() external payable {}
}
