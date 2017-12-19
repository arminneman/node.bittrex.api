const bittrex = require('../node.bittrex.api');
const APIKEY = 'KEY';
const APISECRET = 'SECRET';
var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '@gmail.com',
        pass: ''
    }
});


var averages= "";




var mysql = require('mysql');
const fs = require('fs');
const util = require('util')
var markets = fs.readFileSync('Markets.txt').toString().split("\n");
// var averages = '';

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

function getAverage(market){
    var a= null;
    con.query("select results.market, results.BV from results where MARKET = " + "'" +market +"'"+ "and T = SEC_TO_TIME((TIME_TO_SEC(NOW()) DIV 1800) * 1800) - INTERVAL 1 hour  ORDER BY T DESC LIMIT 1", function (err, result, fields) {
        if (err) throw err;
        a = result[0];
    });

    con.query("select results.market, AVG(BV) from results where MARKET = " + "'" + market +"'"+ " and T BETWEEN SEC_TO_TIME((TIME_TO_SEC(NOW()) DIV 1800) * 1800) - INTERVAL 6 hour  AND (SEC_TO_TIME((TIME_TO_SEC(NOW()) DIV 1800) * 1800)) - INTERVAL 90 minute ORDER BY T DESC", function (err, result, fields) {
        if (err) throw err;
        if ( typeof a !== 'undefined'){
            // console.log(a['BV']);
            // console.log(result[0]['AVG(BV)']);
            if((a['BV'] / result[0]['AVG(BV)']) > 4 && (a['BV'] !== null && result[0]['AVG(BV)'] !==null)){
                averages = (result[0]['market'] +": " +  (a['BV'] / result[0]['AVG(BV)']));
                console.log("Alert");
                sendMail(averages);
                // generateReport(market);
            }

            console.log(result[0]['market'] +": " +  (a['BV'] / result[0]['AVG(BV)']));
        }



    });
}

function persist(data, market) {

    if (data !== null) {
        var sql = "INSERT IGNORE INTO results (O, H, L, C, V, T, BV, Market) VALUES "
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
            if (err){
                console.log(market + ": " + err);
            }
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
                    getAverage(m);
                    // if(i === markets.length ){
                    //     console.log("test");
                    //     sendMail(averages);
                    //         console.log("test");
                    // }
                }
            }, true
        );
    })();
}


function sendMail(averages){

    transporter.sendMail(mailOptions = {
        from: 'arminneman@gmail.com',
        to: 'gutsu001@gmail.com',
        subject: 'Sending Email using Node.js',
        text: averages
    }, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

