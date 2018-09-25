#!/usr/bin/env node

/*
    Endpoint for client interface with ERC-20 tokens
*/

var eth = require('./web3relay').eth;

var BigNumber = require('bignumber.js');
var etherUnits = require(__lib + "etherUnits.js")
var DB = require("../db.js")
var TokenBalance = DB.TokenBalance
var NftTopics = DB.NftTopics
var NftOwnership = DB.NftOwnership
var NftInfo = DB.NftInfo
var Nfts = require("../public/nfts.json")

const ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"}];

const Contract = eth.contract(ABI);



module.exports = function(req, res){
  console.log(req.body)

  var contractAddress = req.body.address;

  var nftIns = Contract.at(contractAddress);

  if (!("action" in req.body))
    res.status(400).send();
  else if (req.body.action=="info") {
    try {
      var actualBalance = eth.getBalance(contractAddress);
      var totalSupply =  nftIns.totalSupply();
      // totalSupply = etherUnits.toEther(totalSupply, 'wei')*100;
      var name = Nfts[contractAddress].name
      var symbol = Nfts[contractAddress].symbol
      NftTopics.find({"nftType": Nfts[contractAddress].contractName,"event":"Transfer" }).count( (err,trxscnt)=>{
       NftOwnership.find({"nftType":Nfts[contractAddress].contractName }).distinct("owner", (err,holders )=>{
          NftOwnership.aggregate([ {$match:{"nftType":Nfts[contractAddress].contractName } } ,{$group:{_id:"$owner",total:{$sum:1}}} ,{$sort:{ total:-1 } },{ $limit : 100 } ],(err,result)=>{
            var tokenData = {
              "balance" : actualBalance,
              "total_supply": totalSupply.valueOf(),
              "total_holders":holders.length,
              "count": trxscnt,
              "name": name,
              "symbol": symbol,
              "bytecode": eth.getCode(contractAddress),
              "token_balances":result,
            }
            res.write(JSON.stringify(tokenData));
            res.end();
         })
       })
      })
    } catch (e) {
      console.error(e);
    }
  } else if (req.body.action=="balanceOf") {
    var addr = req.body.user.toLowerCase();
    try {
      var tokens = Token.balanceOf(addr);
      var decimals = Tokens[contractAddress].decimal
    //  console.log("@@Tokens is ",tokens , " decimal is ",decimals," addr is ",addr ," Contract is ",contractAddress)
      // tokens = etherUnits.toEther(tokens, 'wei')*100;
      res.write(JSON.stringify({"tokens": tokens/Math.pow(10,parseInt(decimals)) }));
      res.end();
    } catch (e) {
      console.error(e);
    }
  } else if ( req.body.action == "transferNfts" ){ 
    let filter = {}
    let order = (parseInt( req.body.order ) )
    if ( order == 1 ){
      filter ={"blockNumber":{$gte : parseInt(req.body.last_id)}}
    }else if (order == -1){
      filter ={"blockNumber":{$lte : parseInt(req.body.last_id)}}
    }

    NftTopics.find(filter).find({"nftType":Nfts[contractAddress].contractName,"event":"Transfer" }).sort("-_id").limit(50).exec( (err,trans)=>{
      var nftIds = trans.map( t=> t.nftId )
      NftInfo.find({"nftType":Nfts[contractAddress].contractName, "nftId":{$in:nftIds} }).select("nftId image_url").exec( (err, infos)=>{
        var infoMaps = {}
        infos.forEach ( info=>{
          infoMaps[info.nftId] = info.image_url
        })
        res.write( JSON.stringify( {transList: trans ,infoMaps : infoMaps} ) )
        res.end();
      })

    })

  }
};  

const MAX_ENTRIES = 50;
