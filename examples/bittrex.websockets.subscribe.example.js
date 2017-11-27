
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





