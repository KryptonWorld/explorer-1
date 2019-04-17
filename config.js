var nftConn = require('mongoose');
var Conf = {
  BCProvider :"https://dev-api.zilliqa.com",
  MongoUrl : "mongodb://127.0.0.1:27017/zil_blockchain",
  NftMongoUrl : "mongodb://127.0.0.1:27017/zil_nfts",
}

exports.Conf = Conf;
exports.NftDbConn = nftConn.createConnection(Conf.NftMongoUrl) ;
