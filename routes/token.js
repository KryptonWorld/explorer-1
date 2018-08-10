#!/usr/bin/env node

/*
    Endpoint for client interface with ERC-20 tokens
*/

var eth = require('./web3relay').eth;

var BigNumber = require('bignumber.js');
var etherUnits = require(__lib + "etherUnits.js")
var DB = require("../db.js")
var TokenBalance = DB.TokenBalance
var TokenTransaction = DB.TokenTransaction
var Tokens = require("../public/tokens.json")

const ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"}];

const Contract = eth.contract(ABI);



module.exports = function(req, res){
  console.log(req.body)

  var contractAddress = req.body.address;

  var Token = Contract.at(contractAddress);

  if (!("action" in req.body))
    res.status(400).send();
  else if (req.body.action=="info") {
    try {
      var actualBalance = eth.getBalance(contractAddress);
      actualBalance = etherUnits.toEther(actualBalance, 'wei');
      var totalSupply = Token.totalSupply();
      // totalSupply = etherUnits.toEther(totalSupply, 'wei')*100;
      var decimals =  Tokens[contractAddress].decimal
      var name = Tokens[contractAddress].name
      var symbol = Tokens[contractAddress].symbol

      console.log("decimals is ",decimals , " totalSupply is ",totalSupply,totalSupply.valueOf()/Math.pow(10,parseInt(decimals)) )
      TokenBalance.find({"value":{$gt:0}}).count( (err,holdcnt)=>{
        TokenTransaction.find().count( (err,trxscnt )=>{
          TokenBalance.find().sort("-value").limit(100).exec( (err,balances ) =>{
            var tokenData = {
              "balance": actualBalance,
              "total_supply": totalSupply.valueOf()/Math.pow(10,parseInt(decimals)),
              "total_decimal" : Math.pow(10,parseInt(decimals)),
              "total_holders":holdcnt,
              "count": trxscnt,
              "name": name,
              "symbol": symbol,
              "bytecode": eth.getCode(contractAddress),
              "token_balances" : balances,
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
      var decimals = Token.decimals();
      // tokens = etherUnits.toEther(tokens, 'wei')*100;
      res.write(JSON.stringify({"tokens": tokens/Math.pow(10,parseInt(decimals)) }));
      res.end();
    } catch (e) {
      console.error(e);
    }
  } else if ( req.body.action == "transferTokens" ){ 
    let filter = {}
    let order = (parseInt( req.body.order ) )
    if ( order == 1 ){
      filter ={"blockNumber":{$gte : parseInt(req.body.last_id)}}
    }else if (order == -1){
      filter ={"blockNumber":{$lte : parseInt(req.body.last_id)}}
    }
    TokenTransaction.find(filter).sort("-_id").exec( (err,trans)=>{
      res.write( JSON.stringify( {transList: trans,decimals : Tokens[contractAddress].decimal } ) )
      res.end();
    })
  }
};  

const MAX_ENTRIES = 50;
