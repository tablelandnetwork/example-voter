// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.11 <0.9.0;

import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/ITablelandController.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

/**
 * @dev Implementation of {ITablelandVoter}.
 */
contract TablelandVoter is ITablelandController {
    using ERC165Checker for address;

    uint256 private _questionsTableId;
    string private constant QUESTIONS_PREFIX = "voter_questions";
    string private constant QUESTIONS_SCHEMA =
        "id integer primary key, token text, body text";

    uint256 private _answersTableId;
    string private constant ANSWERS_PREFIX = "voter_answers";
    string private constant ANSWERS_SCHEMA =
        "qid int, token text, respondent text, vote int, unique(qid, respondent)";

    bytes4 private constant IID_IERC721 = 0x80ac58cd;

    constructor() {
        // Create questions table.
        _questionsTableId = TablelandDeployments.get().createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(QUESTIONS_SCHEMA, QUESTIONS_PREFIX)
        );

        // Set controller for questions table to this contract.
        TablelandDeployments.get().setController(
            address(this),
            _questionsTableId,
            address(this)
        );

        // Create answers table.
        _answersTableId = TablelandDeployments.get().createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(ANSWERS_SCHEMA, ANSWERS_PREFIX)
        );
    }

    // Create an answer.
    // Here we let the contract do inserts into the answers table.
    // The sender must be a holder of token to answer for related questions.
    function answer(
        uint256 qid,
        address token,
        bool vote
    ) external {
        require(
            token.supportsInterface(type(IERC721).interfaceId),
            "token is not an nft"
        );
        require(
            IERC721(token).balanceOf(msg.sender) > 0,
            "sender is not token owner"
        );

        // Insert answer.
        TablelandDeployments.get().runSQL(
            address(this),
            _answersTableId,
            SQLHelpers.toInsert(
                ANSWERS_PREFIX,
                _answersTableId,
                "qid,token,respondent,vote",
                string.concat(
                    Strings.toString(qid),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(token)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(msg.sender)),
                    ",",
                    vote ? "1" : "0"
                )
            )
        );
    }

    // Implement ITablelandController for questions table.
    // Anyone can insert.
    // Nobody can update or delete.
    function getPolicy(address) external payable returns (Policy memory) {
        return
            ITablelandController.Policy({
                allowInsert: true,
                allowUpdate: false,
                allowDelete: false,
                whereClause: "",
                withCheck: "",
                updatableColumns: new string[](0)
            });
    }

    // Return the questions table name
    function getQuestionsTable() public view returns (string memory) {
        return SQLHelpers.toNameFromId(QUESTIONS_PREFIX, _questionsTableId);
    }

    // Return the answers table name
    function getAnswersTable() public view returns (string memory) {
        return SQLHelpers.toNameFromId(ANSWERS_PREFIX, _answersTableId);
    }
}
