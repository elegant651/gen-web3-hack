// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MultisigOwnable.sol";
import "./ERC721A.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

error MaxSupplyReached();
error WithdrawFailed();

contract GenWeb3 is ERC721A, ERC2981, MultisigOwnable, ReentrancyGuard {
  using Address for address;
  using Strings for uint256;
  using SafeMath for uint256;

  bool public isTransferPausable;
  bool public isSalePausable;

  uint256 public immutable maxSupply;
  string private _nameOverride;
  string private _symbolOverride;
  string private _baseTokenURI;

  struct MetadataURI {
    string name;
    string description;
    string image;
  }

  // On-chain metadata
  mapping(uint256 => MetadataURI) public metadatas;

  constructor(
    string memory initialName,
    string memory initialSymbol,
    uint256 _maxSupply
  ) ERC721A("", "") {
    maxSupply = _maxSupply;
    _nameOverride = initialName;
    _symbolOverride = initialSymbol;
    isTransferPausable = false;
    isSalePausable = false;
    _setDefaultRoyalty(msg.sender, 250);
  }

  modifier saleIsActive() {
    require(isSalePausable == false, "Sale is not active");
    _;
  }

  modifier callerIsUser() {
    require(tx.origin == msg.sender, "The caller is another contract");
    _;
  }

  function mint(
    string calldata _name,
    string calldata _description,
    string calldata _image
  ) external payable callerIsUser saleIsActive {
    // Mint token
    if (totalSupply() + 1 > maxSupply) revert MaxSupplyReached();
    MetadataURI memory metadataURI = MetadataURI(
      _name,
      _description,
      _image);
    metadatas[totalSupply()] = metadataURI;
    _safeMint(msg.sender, 1, '');
  }

  // Used to mint unclaimed tokens after minting phase
  function devMint(uint256 _amount) external onlyRealOwner {
    _safeMint(msg.sender, _amount, '');
  }

  /**
  * ======================================================================================
  *
  *  Contract Functions
  *
  * ======================================================================================
  */

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
      if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

      bytes memory dataURI = abi.encodePacked(
        '{"name": "GEN-Web3 #',tokenId.toString(), '","description": "Gen Web3 with query: ',metadatas[tokenId].description,'","image": "', metadatas[tokenId].image, '"}'
      );

      return string(
        abi.encodePacked(
          "data:application/json;base64,",
          Base64.encode(dataURI)
        )
      );
  }

  function transferPaused(bool _isTransferPausable) external onlyOwner {
    isTransferPausable = _isTransferPausable;
  }

  function salePaused(bool _isSalePausable) external onlyOwner {
    isSalePausable = _isSalePausable;
  }

  function name() public view override returns (string memory) {
    if (bytes(_nameOverride).length == 0) {
      return ERC721A.name();
    }
    return _nameOverride;
  }

  function symbol() public view override returns (string memory) {
    if (bytes(_symbolOverride).length == 0) {
      return ERC721A.symbol();
    }
    return _symbolOverride;
  }

  function setNameAndSymbol(
    string calldata _newName,
    string calldata _newSymbol
  ) external onlyRealOwner {
    _nameOverride = _newName;
    _symbolOverride = _newSymbol;
  }

  function setDefaultRoyalty(
    address receiver,
    uint96 feeNumerator
  ) external onlyOwner {
    _setDefaultRoyalty(receiver, feeNumerator);
  }

  function withdraw() external onlyRealOwner nonReentrant {
    uint256 balance = address(this).balance;
    if (!_transferETH(owner(), balance)) revert WithdrawFailed();
  }

  /**
  * ======================================================================================
  *
  *  IERC165
  *
  * ======================================================================================
  */

  /**
    * @dev Returns true if this contract implements the interface defined by
    * `interfaceId`. See the corresponding
    * [EIP section](https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified)
    * to learn more about how these ids are created.
    *
    * This function call must use less than 30000 gas.
    */
  function supportsInterface(
      bytes4 interfaceId
  ) public view virtual override(ERC721A, ERC2981) returns (bool) {
      // The interface IDs are constants representing the first 4 bytes
      // of the XOR of all function selectors in the interface.
      // See: [ERC165](https://eips.ethereum.org/EIPS/eip-165)
      // (e.g. `bytes4(i.functionA.selector ^ i.functionB.selector ^ ...)`)
      return
          ERC721A.supportsInterface(interfaceId) ||
          ERC2981.supportsInterface(interfaceId);
  }

  /**
  * ======================================================================================
  *
  *  Extras Functions
  *
  * ======================================================================================
  */

  function stringToBytes32(string memory source) public pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly {
      result := mload(add(source, 32))
    }
  }

  function _transferETH(address to, uint256 value) internal returns (bool) {
    (bool success, ) = to.call{ value: value, gas: 30000 }(new bytes(0));
    return success;
  }

  /**
     * @dev Hook that is called before a set of serially-ordered token ids are about to be transferred. This includes minting.
     * And also called before burning one token.
     *
     * startTokenId - the first token id to be transferred
     * quantity - the amount to be transferred
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, `from`'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, `tokenId` will be burned by `from`.
     * - `from` and `to` are never both zero.
     */
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override{
      super._beforeTokenTransfers(from, to, startTokenId, quantity);

      require(!isTransferPausable, "ERC721: token transfer is not allowed while paused");
    }
}