console.log("Hello World!")
//https://www.npmjs.com/package/another-json-schema
//https://www.npmjs.com/package/i2c-bus
const parseJson = require('parse-json');
const i2c = require('i2c-bus')
var Validator = require('jsonschema').Validator;
var v = new Validator();
//var schema = {id: "string"};
const EEPROM = 0x50; //7-bit slave address
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://mqtt.labict.be')


var schema = {
  "id": "/SchemaId",
  "type": "object",
  "properties": {
    "id": {"type": "string"}
  }
};
var dataObject = {
  Player: {
      username: "10",
      movement: true,
      dev_id: "ttn", 
      action: "rocket", // don't know what this will be yet
      joined: true
  },
  Controller: {
      id: 0,
      addons: [20, null, null], 
      dev_id: ""
  }
};

var jsonschemaPlayer = {
  "id": "/SchemaPlayer",
  "type": "object",
  "properties": {
      "username": {"type": "string"},
      "movement": {"type": "string"},
      "dev_id": {"type": "string"},
      "action": {"type": "string"},
      "joined": {"type": "boolean"},
  }
};

var jsonschemaController = {
  "id": "/SchemaController",
  "type": "object",
  "properties": {
      "id": {"type": "integer"},
      "addons": {
          "type": "array",
          "items":  {
              "type": ["integer", null]
          }
      },
      "dev_id": {"type": "string"}
  }
};

var schemaObject = {
  "type": "object",
  "properties": {
      "Player": {"$ref": "/SchemaPlayer"},
      "Controller": {"$ref": "/SchemaController"}
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
  client.subscribe('test/bug/id', function (err) {
    if (!err) {
      //client.publish('presence', 'Hello mqtt')
      console.log("Successfully subscribed to test/bug/id")

    }
  })
})
 
client.on('message', function (topic, message) {
  
  //message to right format to send via mqtt
  console.log(message.toString())
  
  v.addSchema(schema, '/SchemaId');

  console.log("\n")
  //validate
  console.log("\n")
  console.log(v.validate(message.toJSON, schema));
  if(v.validate(message.toJSON, schema).valid){
    console.log("Object is validated!");

    
  //getting json object in
  var myObj = JSON.parse(message);
  console.log(myObj.id)
  const bufmessage = new Buffer(myObj.id)
  console.log(bufmessage)
  const buf = new Buffer([0x1F,0xE0])
  var buffer = new Buffer(10)
  var arr = [buf, bufmessage];
  buffer = Buffer.concat(arr);
  console.log(buffer)
  // message is Buffer
  const i2c1 = i2c.openSync(1)
  sleep(1000);
  
  //writing in
  console.log(i2c1.i2cWriteSync(EEPROM, 0x0A, buffer).toString())
  sleep(2000);
  //read works
  sleep(2000);
  var buftest = new Buffer(8);
  console.log(i2c1.i2cWriteSync(EEPROM, 0x02, buf ).toString())
  sleep(2000);
  console.log(i2c1.i2cReadSync(EEPROM, 0x08, buftest ))
  sleep(2000);
  console.log(buftest.toString())
  i2c1.closeSync();


  }
  else{
    console.log("not validated");
  }
  //getting json object in
  var myObj = JSON.parse(message);
  console.log(myObj.id)
  //console.log(typeof(myObj.id))

})