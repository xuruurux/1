var express = require('express');
var router = express.Router();

var modbus = require('../jsmodbus/modbus.js');
var client = modbus.client.tcp.complete({
	'host' : '127.0.0.1',
	'port' : 502,
	'autoReconnect' : false,
	'reconnectTimeout' : 1000,
	'timeout' : 5000,
	'unitId' : 0
});

var filename = './data/a';
var filedata = [] ;
var transmitBlock = 960;
var filepos = 0;
var fileretrytimes = 0;

client.on('connect',function(){
	client.writeFileData(filepos*transmitBlock , filedata.toString().substr(filepos*transmitBlock,transmitBlock))
		.then(function (res) {
			console.log(res);
		}).fail(console.log)
})

client.on('data',function(){
	if(filepos < parseInt(filedata.length / transmitBlock))
	{
		filepos++;
		client.writeFileData(filepos*transmitBlock , filedata.toString().substr(filepos*transmitBlock,transmitBlock))
		.then(function (res) {
			console.log(res);
		}).fail(console.log)
  	}
  	else
  	{
  		fileretrytimes = 0;
  		filepos = 0;
  	}
})

client.on('close',function(){
	if(fileretrytimes != 0) {
		fileretrytimes--;
		client.connect();
	}
})

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('index', { title: 'Sdo' });

  	var fs = require('fs');
 	fs.readFile(filename,function (err, data){
		if(err){
			return console.error(err);
		}
		filedata = data;
		fileretrytimes = 3;
  		client.connect();
	});
});

module.exports = router;