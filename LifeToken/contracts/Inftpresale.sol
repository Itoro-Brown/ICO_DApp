//SPDX-Licence-Identifier : MIT

// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.9;

interface nftpresale2 {
    function tokenOfOwnerByIndex(address owner, uint256 index)
        external
        view
        returns (uint256 tokenId);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);
}
