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
    'apikey': APIKEY,
    'apisecret': APISECRET,
    'stream': false,
    'verbose': false,
    'cleartext': true
});


function persist(data, market) {

    if (data !== null) {
        var sql = "INSERT INTO results (O, H, L, C, V, T, BV, Market) VALUES "
        for (var i = data.length -1, len = data.length -120; i > len; i--) {
            if (i === data.length -1) {
                sql += "(";
            } else {
                sql += ", (";
            }
            sql += +data[i]['O'] + ", " + data[i]['H'] + ", " + data[i]['L'] + ", " + data[i]['C'] + ", " + data[i]['V'] + ", '" + data[i]['T'] + "', " + data[i]['BV'] +
                ", '" + market + "')";
        }
        // console.log(sql);
        con.query(sql, function (err) {
            if (err) throw err;
            // console.log(market + " inserted");
        });
    }
}


/**
 *  getCandles
 */
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


for (var i = 0, len = markets.length; i < len; i++) {
    (function () {
        var m = markets[i].toString().trim();
        var fullUrl = 'https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=' + m + '&tickInterval=thirtyMin';
        bittrex.sendCustomRequest(fullUrl, function (data, err) {
                if (err) {
                    return console.error(err + m);
                } else {
                    data = JSON.parse(data);
                    persist(data.result, m);
                }
            }, true
        );
    })();
}
console.log("Done");

