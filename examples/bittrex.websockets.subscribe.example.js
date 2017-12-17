
const bittrex = require('../node.bittrex.api');

var fs = require('fs');
var markets = fs.readFileSync('Markets.txt').toString().split("\n");


bittrex.options({
  'verbose' : true,
});

console.log('Connecting ....');
bittrex.websockets.subscribe(markets, function(data, client) {
  if (data.M === 'updateExchangeState') {
    data.A.forEach(function(data_for) {
      console.log('Market Update for '+ data_for.MarketName, data_for);
    });
  }
});




// bittrex.getcandles({
//     marketName: m,
//     tickInterval: 'onemin'
// }, function (results, err) {
//     if (err) {
//         /**
//          {
//            success: false,
//            message: 'INVALID_TICK_INTERVAL',
//            result: null
//          }
//          */
//         return console.error(err + m);
//     }
