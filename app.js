console.log("Hello World!")
//https://www.npmjs.com/package/i2c-bus
const i2c = require('i2c-bus')
//var Validator = require('jsonschema').Validator;
//var v = new Validator();
//var schema = {"id": "number"};
const EEPROM = 0xA0
console.log("Hello World!")
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://mqtt.labict.be')
 
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
  // message is Buffer
  console.log(message.toString())
  const i2c1 = i2c.openSync(1)
  i2c1.i2cWriteSync(EEPROM, 10, [0x1F,0xE0,message])
  i2c1.closeSync();
  var test
  i2c1.i2cWriteSync(EEPROM, 2, [0x1F,0xE0])
  i2c1.i2cReadSync(EEPROM, 8, test )
  console.log(test.toString())
})