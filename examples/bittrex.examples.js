
const bittrex = require('../node.bittrex.api');
const APIKEY = 'KEY';
const APISECRET = 'SECRET';

var mysql = require('mysql');
const fs = require('fs');
const util = require('util')
var markets = fs.readFileSync('Markets.txt').toString().split("\n");

var con = mysql.createConnection({
    host: "localhost",
    database: "bittrex",
    user: "root",
    password: ""
});



bittrex.options({ 
  'apikey' : APIKEY, 
  'apisecret' : APISECRET, 
  'stream' : false, 
  'verbose' : false, 
  'cleartext' : true
});

// /**
//  *  sendCustomRequest example
//  */
// bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-ltc', function( data ) {
//   console.log( data );
// }, true);

// /**
//  *  getmarkethistory example
//  */
// bittrex.getmarkethistory( { market : 'BTC-LTC' }, function( data ) {
//   console.log( data.result );
// });

/**
 *  getCandles
 */
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
for (var i = 0, len = markets.length; i < len; i++) {
    var data = null;
    var m = markets[i].toString().trim();
    // var fullUrl = 'https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=' + m + '&tickInterval=onemin';

    bittrex.getcandles({
            marketName: m,
            tickInterval: 'onemin'
        }, function (results, err) {
        if (err) {
            /**
             {
               success: false,
               message: 'INVALID_TICK_INTERVAL',
               result: null
             }
             */
            return console.error(err + m);
        }
            var temp = JSON.parse(results);
        if(results !==null) {
            data = (temp.result);


            var sql = "INSERT INTO results (O, H, L, C, V, T, BV, Market) VALUES "
            for (var i = 0, len = 5; i < len; i++) {
                if (i === 0) {
                    sql += "(";
                } else {
                    sql += ", (";
                }
                sql += +data[i]['O'] + ", " + data[i]['H'] + ", " + data[i]['L'] + ", " + data[i]['C'] + ", " + data[i]['V'] + ", '" + data[i]['T'] + "', " + data[i]['BV'] +
                    m + ')';

            }
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(m + " inserted");
                });
            }
            ;
        }, true
    );
}
