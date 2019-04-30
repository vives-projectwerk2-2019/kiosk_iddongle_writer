const parseJson = require('parse-json');
const i2c = require('i2c-bus')
require('dotenv').config()
var Validator = require('jsonschema').Validator;
var v = new Validator();
const EEPROM = 0x50; //7-bit slave address
var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://mqtt.labict.be')
var topic = 'kiosk/' + process.env.ID + '/program-dongle'
var topicStatus = 'kiosk/' + process.env.ID + '/status'
var topicPing = 'kiosk/' + process.env.ID + '/ping'
var busy = false;


var schema = {
  "id": "/SchemaId",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  }
};

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

client.on('connect', function () {
  client.subscribe(topic, function (err) {
    if (!err) {
      console.log("Successfully subscribed to kiosk/" + process.env.ID + '/program-dongle')
    }
  })
})

client.on('message', function (topic, message) {
  try {
    busy = true;
    client.publish(topicStatus, "{\"status\":\"busy\"}", () => {
      var myObj = JSON.parse(message);
      v.addSchema(schema, '/SchemaId');

      if (v.validate(myObj, schema).valid) {
        console.log("Object is validated!");
        var id = myObj.id
        const bufmessage = new Buffer.from(id, "hex")
        console.log(bufmessage)
        var buffertest = new Buffer(8)
        const buf = new Buffer([0x00, 0x00])
        var buffer = new Buffer(10)
        var arr = [buf, bufmessage]
        buffer = Buffer.concat(arr)

        const i2c1 = i2c.openSync(1)
        sleep(1000)
        i2c1.i2cWriteSync(EEPROM, 0x0A, buffer)
        sleep(2000)

        //i2c1.closeSync();
        console.log("Done")
        client.publish(topicStatus, "{\"status\":\"ack\"}")
        busy = false
        //const i2c1 = i2c.openSync(1)
        //sleep(2000)
        //i2c2.i2cWriteSync(EEPROM, 2, buf)
        //sleep(2000)
        console.log("buffertest: ")
        console.log(buffertest)
        i2c1.i2cWriteSync(EEPROM, 2, buf)
        sleep(2000)
        i2c1.i2cReadSync(EEPROM, 0X08, buffertest)
        sleep(2000)
        console.log("buffertest: ")
        console.log(buffertest)
        i2c1.closeSync();
      }
      else {
        client.publish(topicStatus, "{\"status\":\"nack\"}")
        console.log("not validated")
        console.log("try again")
        busy = false
      }

    })


  }
  catch (err) {
    client.publish(topicStatus, "{\"status\":\"nack\"}")
    console.log("error")
    console.log("try again")
    busy = false
  }
})

setInterval(() => {
  if (busy == false) {
    client.publish(topicPing, "{\"ping\":\"ping\"}")
  }
}, 10000)