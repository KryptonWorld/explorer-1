var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var Conf = require("./config").Conf

var Block = new Schema(
{
    "number": {type: Number, index: {unique: true}},
    "hash": String,
    "parentHash": String,
    "nonce": String,
    "sha3Uncles": String,
    "logsBloom": String,
    "transactionsRoot": String,
    "stateRoot": String,
    "receiptRoot": String,
    "miner": String,
    "difficulty": String,
    "totalDifficulty": String,
    "size": Number,
    "extraData": String,
    "gasLimit": Number,
    "gasUsed": Number,
    "timestamp": Number,
    "uncles": [String]
});

var Contract = new Schema(
{
    "address": {type: String, index: {unique: true}},
    "creationTransaction": String,
    "contractName": String,
    "compilerVersion": String,
    "optimization": Boolean,
    "sourceCode": String,
    "abi": String,
    "byteCode": String
}, {collection: "Contract"});

var Transaction = new Schema(
{
    "hash": {type: String, index: {unique: true}},
    "nonce": Number,
    "blockHash": String,
    "blockNumber": Number,
    "transIndex": {type:Number ,alias :"transactionIndex"},
    "from": String,
    "to": String,
    "value": String,
    "gas": Number,
    "gasPrice": String,
    "createdAt":{type: Number ,alias : "timestamp"},
    "input": String
});

mongoose.model('eth_blocks', Block);
mongoose.model('eth_contracts', Contract);
mongoose.model('eth_transaction', Transaction);

module.exports.Block = mongoose.model('eth_blocks');
module.exports.Contract = mongoose.model('eth_contracts');
module.exports.Transaction = mongoose.model('eth_transaction');

mongoose.connect(process.env.MONGO_URI || Conf.MongoUrl);
mongoose.set('debug', true);
