pragma solidity ^0.8.2;
pragma abicoder v2;

contract APIContract {
    struct user {
        string apiKey; //referred to as ID in the api
        string email; //number of user logins to the api
        string password; // used to login to the api
        uint256 FileCount; //total number of files owned by user
    }
    struct file {
        string ownerKey;
        string title;
        string fileHash;
        string contentType;
    }

    mapping(string => user) public users;
    //mapping(string => file) private files;

    mapping(uint256 => mapping(string => file)) public files;
    address private owner;

    event userCreated(string email, string apiKey);
    event apiKeySentToUser(address user, bytes32 apiKey, uint256 count);
    modifier isOwner {
        require(msg.sender == owner, "not enough privilege");
        _;
    }

    function login(string memory _email, string memory password)
        public
        view
        isOwner
        returns (string memory id)
    {
        require(
            keccak256(abi.encodePacked((users[_email].email))) ==
                keccak256(abi.encodePacked((_email))),
            "SIGN UP PLEASE "
        );
        require( //password verification
            keccak256(abi.encodePacked((users[_email].password))) ==
                keccak256(abi.encodePacked((password))),
            "WRONG PASSWORD"
        );
        return users[_email].apiKey;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    function signUp(
        string memory _email,
        string memory _password,
        string memory api_key
    ) public isOwner {
        //verifies api key doesn't ALREADY exist
        require(
            keccak256(abi.encodePacked((users[_email].email))) !=
                keccak256(abi.encodePacked((_email))),
            "THIS EMAIL ALREADY EXISTS"
        );

        users[_email].email = _email;
        users[_email].password = _password;
        users[_email].apiKey = api_key;

        users[_email].FileCount = 0;
        emit userCreated(_email, api_key);
    }

    function getHashOfFile(
        string memory title,
        string memory api_key,
        string memory _email
    ) public view isOwner returns (string memory hash) {
        // file memory myfile=files[msg.sender][title];
        //verifies that the sender is the true owner of the file ==>implemented to resolve file title conflicts(two different files having the same title)
        uint256 count = users[_email].FileCount;
        require(count != 0, "No file found ");
        for (uint256 i = 0; i < count; i++) {
            if (
                keccak256(abi.encodePacked((files[i][api_key].title))) ==
                keccak256(abi.encodePacked((title)))
            ) {
                return files[i][api_key].fileHash;
            }
        }
    }

    function addFile(
        string memory title,
        string memory _hash,
        string memory api_key,
        string memory _email,
        string memory _contentType
    ) public isOwner returns (bool) {
        uint256 count = users[_email].FileCount;
        //require(files[title].ownerKey != msg.sender, "file already exists");

        for (uint256 i = 0; i < count; i++) {
            require(
                keccak256(abi.encodePacked((files[i][api_key].title))) !=
                    keccak256(abi.encodePacked((title))),
                "file already exists"
            ); // to avoid duplicate files owned by the same user
        }

        files[count][api_key].title = title;
        files[count][api_key].ownerKey = api_key;
        files[count][api_key].fileHash = _hash;
        files[count][api_key].contentType = _contentType;
        users[_email].FileCount++;
        return true;
    }

    function updateHashOfFile(
        string memory title,
        string memory _hash,
        string memory api_key,
        string memory _email
    ) public isOwner returns (bool value) {
        uint256 count = users[_email].FileCount;
        require(count != 0, "No file found ");
        for (uint256 i = 0; i < count; i++) {
            if (
                keccak256(abi.encodePacked((files[i][api_key].title))) ==
                keccak256(abi.encodePacked((title)))
            ) {
                files[i][api_key].fileHash = _hash;

                return true;
            }
        }
    }

    function deleteFile(
        string memory title,
        string memory api_key,
        string memory _email
    ) public isOwner returns (bool value) {
        uint256 count = users[_email].FileCount;
        require(count != 0, "No file found ");
        for (uint256 i = 0; i < count; i++) {
            if (
                keccak256(abi.encodePacked((files[i][api_key].title))) ==
                keccak256(abi.encodePacked((title)))
            ) {
                files[i][api_key].fileHash = ""; //empties the hash of file in the mapping
                files[i][api_key].title = ""; // empties the title in the mapping

                return true;
            }
        }
    }

    function getAllFiles(string memory api_key, string memory _email)
        public
        view
        isOwner
        returns (file[] memory)
    {
        uint256 count = users[_email].FileCount;
        require(count != 0, "No file found ");

        file[] memory list = new file[](count);
        for (uint256 i = 0; i < count; i++) {
            list[i] = files[i][api_key]; //iterate through the files mapping
        }
        return list;
    }
}
