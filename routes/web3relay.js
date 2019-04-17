#!/usr/bin/env node

/*
    Endpoint for client to talk to etc node
*/

var Conf = require("../config").Conf

var BigNumber = require('bignumber.js');
var etherUnits = require(__lib + "etherUnits.js")

var getLatestBlocks = require('./index').getLatestBlocks;
var filterBlocks = require('./filters').filterBlocks;
var filterTrace = require('./filters').filterTrace;
var DB = require("../db.js")
var Transaction = DB.Transaction
var ReceiptLog = DB.ReceiptLog
var Block = DB.Block

var async = require("async")


const { Zilliqa } = require('@zilliqa-js/zilliqa');
var zilliqa = new Zilliqa(Conf.BCProvider);

exports.data = async function(req, res){
  console.log(req.body)

  if ("tx" in req.body) {
    var txHash = req.body.tx.toLowerCase();
    let trans = await Transaction.findOne({"hash":txHash})
    let events = await ReceiptLog.find({hash : txHash})



    let to = trans.toJSON()
    if( to.to == "0x0000000000000000000000000000000000000000" ){
      let res = await zilliqa.blockchain.getContractAddressFromTransactionID(trans.hash)
      to.contractAddr = `0x${res.result}`
    }else{
      to.contractAddr = false
    }

    to.events = events.map( e=> { return {eventName : e.topics, params: e.data } })
    res.write(JSON.stringify(to));
    res.end();



  } else if ("tx_trace" in req.body) {
      res.end();
  } else if ("addr_trace" in req.body) {
  } else if ("addr" in req.body) {
    var addr = req.body.addr.toLowerCase();
    var options = req.body.options;
    var addrData = {};

    async.parallel([
      (finish) =>{
        if (options.indexOf("balance") > -1) {
           zilliqa.blockchain.getBalance(addr.substr(2)).then((res)=>{
            addrData["balance"] = res.result.balance
             finish()
           }).catch(err=>{
            console.error("AddrWeb3 error :" + err);
             finish()
           })

        }
      },
      /*
      async() =>{
        try{
          let response  = await zilliqa.blockchain.getBalance(addr.substr(2))
          console.log("@@balance response is ",response)
          addrData["balance"] = response.result.balance
        }catch(err){
          console.error("AddrWeb3 error :" + err);
        }
      },
      */
      (finish) =>{
        if (options.indexOf("count") > -1) {
          var addrFind = Transaction.find( { $or: [{"to": addr}, {"from": addr}] })  
          addrFind.count(function (err, cnt) {
            if(!err){
              addrData["count"] = cnt
            }else{
              addrData = {"error": true};
            }
            finish()
          })
        }
      },
      (finish) =>{
        if (options.indexOf("bytecode") > -1) {
             zilliqa.blockchain.getSmartContractCode(addr.substr(2)).then(response=>{
               if (response.result.code ){
                  addrData["isContract"] = true;
                  addrData["bytecode"] = response.result.code
               }else{
                  addrData["isContract"] = false;
               }
               console.log("@@@@response is ",response)
              finish()
             }).catch(err=>{
              finish()
             })
        }
      }

    ],(err,reslut)=> {
      res.write(JSON.stringify(addrData));
      res.end();
    })
   


  } else if ("block" in req.body) {
    var blockNumOrHash;
    var filter = {}
    if (/^(0x)?[0-9a-f]{64}$/i.test(req.body.block.trim())) {
        blockNumOrHash = req.body.block.toLowerCase();
        filter["hash"] =blockNumOrHash
    } else {
        blockNumOrHash = parseInt(req.body.block);
        filter["number"] =blockNumOrHash
    }
    let block = await Block.findOne(filter)
    var bo  = block.toJSON()
    var trans = await Transaction.find({blockNumber : block.number})

    bo.transactions = trans.map(a=> a.hash)

    res.write(JSON.stringify(bo));
    res.end();

  } else {
    console.error("Invalid Request: " + action)
    res.status(400).send();
  }

};

exports.zilliqa = zilliqa
let eth = { contract : zilliqa.contracts.new }
exports.eth = eth
  
