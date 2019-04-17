var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var {Conf,NftDbConn} = require("./config")
var nftMongoose = NftDbConn


var Block = new Schema(
{
    "number": {type: Number, index: {unique: true}},
    "hash": String,
    "numTxns": Number,
    "parentHash": String,
    "stateRoot": String,
    "miner": String,
    "gasLimit": Number,
    "gasUsed": Number,
    "timestamp": Number,
    "extraData":  mongoose.Schema.Types.Mixed,
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

var ReceiptLog = new Schema({
  hash : String,
  address :String,
  topics : String,
  blockNumber : Number,
  data: mongoose.Schema.Types.Mixed,
});

var TokenBalance = new Schema({
  "addr" :String,
  "tokenType" : String,
  "value" :Number,
})


var TokenTransaction = new Schema({
    "transHash": String,
    "contractType":String,
    "blockNumber": Number,
    "transIndex": Number,
    "from": String,
    "to": String,
    "value": String,
    "gasPrice": String,
    "createdAt":Number,
})


var NftTopics = new Schema({
  nftType:String,
  nftId : Number,
  blockNumber : Number,
  transHash : String,
  transIndex :Number,
  event :  String, //Transfer
  price: Number,
  from : String,
  to : String,
  createdAt : Number
});



var NftOwnership = new Schema({
  nftType:String,
  nftId: Number,
  owner : String,
  blockNumber :Number
});


var NftInfo = new Schema({
  nftType:String,
  nftId : Number,
  tags : [],
  image_url :String,
  desc : String,
  name : String,
  properties : mongoose.Schema.Types.Mixed,
  createdAt : Number
});


mongoose.model('token_balances', TokenBalance);
mongoose.model('token_transactions', TokenTransaction);

nftMongoose.model("nft_topics",NftTopics)
nftMongoose.model("nft_ownerships",NftOwnership)
nftMongoose.model("nft_iteminfos",NftInfo)


module.exports.Block = mongoose.model('zil_blocks',Block);
module.exports.Contract = mongoose.model('zil_contracts',Contract);
module.exports.Transaction = mongoose.model('zil_transaction',Transaction);
module.exports.ReceiptLog = mongoose.model('zil_receipt_logs',ReceiptLog);

module.exports.TokenBalance = mongoose.model('token_balances');
module.exports.TokenTransaction = mongoose.model('token_transactions');

module.exports.NftTopics = nftMongoose.model('nft_topics');
module.exports.NftOwnership = nftMongoose.model('nft_ownerships');
module.exports.NftInfo = nftMongoose.model('nft_iteminfos');


console.log("@@@Conf ",Conf.MongoUrl)
mongoose.connect(process.env.MONGO_URI || Conf.MongoUrl);
//nftMongoose.connect( Conf.NftMongoUrl);


mongoose.set('debug', true);
//nftMongoose.set('debug', true);
