const bittrex = require('../node.bittrex.api');
const APIKEY = 'KEY';
const APISECRET = 'SECRET';
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '',
        pass: ''
    }
});


var averages =  new Buffer




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
    con.query("select results.market, results.BV from results where MARKET = " + "'" +market +"'"+ "and T BETWEEN NOW() - INTERVAL 11 hour AND NOW() LIMIT 1", function (err, result, fields) {
        if (err) throw err;
        a = result[0];
    });

    con.query("select results.market, AVG(BV) from results where MARKET = " + "'" + market +"'"+ " and T BETWEEN NOW() - INTERVAL 11 hour AND NOW()-1 LIMIT 10", function (err, result, fields) {
        if (err) throw err;

        if((a['BV'] / result[0]['AVG(BV)'] > 2) && (a['BV'] !== null && result[0]['AVG(BV)'] !==null) ){
            averages.fill(result[0]['market'] +": " +  (a['BV'] / result[0]['AVG(BV)']));
            console.log("Alert");
        }
        // console.log(result[0]['market'] +": " +  (a['BV'] / result[0]['AVG(BV)']));

    });
}

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
            if (err){
                console.log(market + err);
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


for (var i = 0, len = 50; i < len; i++) {
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
                    if(i === 50 ){
                        console.log("test");
                        sendMail(averages);
                            console.log("test");
                    }
                }
            }, true
        );
    })();
}

var mailOptions = {
    from: 'arminneman@gmail.com',
    to: 'arminsaraji@gmail.com@',
    subject: 'Sending Email using Node.js',
    text: averages
}

function sendMail(averages){

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
