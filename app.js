const parseJson = require('parse-json');
const i2c = require('i2c-bus')
var Validator = require('jsonschema').Validator;
var v = new Validator();
const EEPROM = 0x50; //7-bit slave address
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://mqtt.labict.be')
var topic = 'test/bug/id'

var schema = {
  "id": "/SchemaId",
  "type": "object",
  "properties": {
    "id": {"type": "string"
          }
  }
};

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

client.on('connect', function () {
  client.subscribe(topic, function (err) {
    if (!err) {
      console.log("Successfully subscribed to test/bug/id")
    }
  })
})
 
client.on('message', function (topic, message) {
  try{
    var myObj = JSON.parse(message);
    v.addSchema(schema, '/SchemaId');

    if(v.validate(myObj, schema).valid){
      console.log("Object is validated!");
      var id = myObj.id
      const bufmessage = new Buffer.from(id,"hex")
      console.log(bufmessage)
      //("00000000" + myObj.id).slice(-8)
      
      const buf = new Buffer([0x1F,0xE0])
      var buffer = new Buffer(10)
      var arr = [buf, bufmessage];
      buffer = Buffer.concat(arr);

      const i2c1 = i2c.openSync(1)
      sleep(1000);
    
      i2c1.i2cWriteSync(EEPROM, 0x0A, buffer).toString()
      sleep(2000);

      i2c1.closeSync();
      console.log("Done")
      client.publish(topic,'done')
    }
    else{
      console.log("not validated");
      console.log("try again")
    }
  }
  catch(err){
    console.log("error")
    console.log("try again")
  }
  
})