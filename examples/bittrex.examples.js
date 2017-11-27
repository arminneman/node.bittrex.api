
const bittrex = require('../node.bittrex.api');
const APIKEY = 'KEY';
const APISECRET = 'SECRET';

bittrex.options({ 
  'apikey' : APIKEY, 
  'apisecret' : APISECRET, 
  'stream' : false, 
  'verbose' : false, 
  'cleartext' : true
});

/**
 *  sendCustomRequest example
 */
bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-ltc', function( data ) {
  console.log( data );
}, true);

/**
 *  getmarkethistory example
 */
bittrex.getmarkethistory( { market : 'BTC-LTC' }, function( data ) {
  console.log( data.result );
});


