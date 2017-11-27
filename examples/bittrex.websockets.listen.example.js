
const bittrex = require('../node.bittrex.api');

const fs = require('fs');
const util = require('util')
var markets = fs.readFileSync('Markets.txt').toString().split("\n");

console.log('Connecting ....');
// bittrex.websockets.listen(function(data, client) {
//   if (data.M === 'updateSummaryState') {
//     data.A.forEach(function(data_for) {
//       data_for.Deltas.forEach(function(marketsDelta) {
//         console.log('Ticker Update for '+ marketsDelta.MarketName, marketsDelta);
//           // fs.appendFileSync('results.txt', 'Ticker Update for '+ marketsDelta);
//       });
//     });
//   }
// });

        for (var i = 0, len = markets.length; i < len; i++) {
             var m = markets[i].toString().trim();
            var fullUrl ='https://bittrex.com/Api/v2.0/pub/market/GetLatestTick?marketName=' +m + '&tickInterval=onemin';

            bittrex.sendCustomRequest(fullUrl, function (data) {
                    fs.appendFileSync(m + '.txt', JSON.stringify(data));
                }, true
            );
        }

