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
})