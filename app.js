var express = require('express');
var bodyParser = require('body-parser');
var modbus = require('jsmodbus');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function(req, res){
  var html = `
  <html>
    <script src="https://code.jquery.com/jquery-3.1.0.min.js"></script> 
  <body>
    <h2>Modbus</h2>
    <h4>Read Register</h4>
    <textarea rows="12" cols="50" id="read"></textarea>
    <button id="read-btn">Read</button>
    <h4>Write Register</h4>
    offset
    <input id="input1"/>
    value
    <input id="input2"/>
    <button id="write-btn">write</button>
  </body>
  <script>
    $('#read-btn').click(function(){
      $.get('/api/modbus', function(data){
        $('#read').val(JSON.stringify(data, null, 2))
      })
    })
    $('#write-btn').click(function(){
      $.post('/api/modbus', {input1: $('#input1').val(), input2: $('#input2').val()}, function(data){
        $('#read').val(JSON.stringify(data, null, 2))
      })
    })
  </script>
  </html>
  `
  res.end(html);
});

var client = modbus.client.tcp.complete({ 
  'host'              : '127.0.0.1', 
  'port'              : 8888,
  'autoReconnect'     : true,
  'reconnectTimeout'  : 1000,
  'timeout'           : 5000,
  'unitId'            : 0
});

app.get('/api/modbus', function(req, res){
  client.connect();
  client.on('connect', function(){
    // read coils
    client.readHoldingRegisters(0, 10).then(function (resp) {
      res.json(resp);
    }).fail(res.json);
  })
})

app.post('/api/modbus', function(req, res){
  console.log(req.body)
  var input1 = req.body.input1;
  var input2 = req.body.input2;
  client.connect();
  client.on('connect', function(){
    // write coils input1 offset input2 (true/false)
    client.writeSingleRegister(input1, input2).then(function (resp) {
      console.log(resp)
      res.json(resp)
    }).fail(res.json);
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

var stampit = require('stampit'),
    modbus = require('jsmodbus');

// server
modbus.server.tcp.complete({ port : 8888 });



