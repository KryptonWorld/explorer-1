var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var InternalTransaction = new Schema(
{
    "transHash":String,
    "transIndex":Number,
    "from": String,  // for call
    "to": String,
    "value": String,
    "input":String,
});

mongoose.model('eth_internal_transactions', InternalTransaction);
module.exports.InternalTransaction = mongoose.model('eth_internal_transactions');
