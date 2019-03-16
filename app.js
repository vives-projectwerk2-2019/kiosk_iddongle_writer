console.log("Hello World!")
//https://www.npmjs.com/package/i2c-bus
const i2c = require('i2c-bus')
//var Validator = require('jsonschema').Validator;
//var v = new Validator();
//var schema = {"id": "number"};
const EEPROM = 0x50; //7-bit slave address
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://mqtt.labict.be')


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

client.on('connect', function () {
  client.subscribe('test/bug/id', function (err) {
    if (!err) {
      //client.publish('presence', 'Hello mqtt')
      console.log("Successfully subscribed to test/bug/id")

    }
  })
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  const i2c1 = i2c.openSync(1)
  sleep(1000);
  console.log(message)
  
  const buf = new Buffer([0x1F,0xE0])
  //const buf2 = new Buffer([0x1F,0xE0, 0x74, 0x65, 0x73, 0x74, 0x74, 0X65, 0x73, 0x74])
  //console.log(buf2)
  //const buf2 = new Buffer([0x1F, 0xE0])
  var buffer = new Buffer(10)
  var arr = [buf, message];
  buffer = Buffer.concat(arr);
  console.log(buffer)
  console.log(i2c1.i2cWriteSync(EEPROM, 0x0A, buffer).toString())
  sleep(2000);
  //console.log(i2c1.i2cWriteSync(EEPROM, 0x08, buffer ).toString())
  //sleep(2000);
  //read works
  sleep(2000);
  var buftest = new Buffer(8);
  console.log(i2c1.i2cWriteSync(EEPROM, 0x02, buf ).toString())
  sleep(2000);
  console.log(i2c1.i2cReadSync(EEPROM, 0x08, buftest ))
  sleep(2000);
  console.log(buftest.toString())
  i2c1.closeSync();
})