
contract Seminar {

    bytes32 public id;
    bytes32 public name;
    bytes32 public member;

    function Seminar(bytes32 _id, bytes32 _name, bytes32 _member) {
        id = _id;
        name = _name;
        member = _member;
    }
}
