var express = require("express");
var app = express();
var server = require("http").createServer(app);
var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");
var url = "mongodb://localhost:27017";
var FCM = require("fcm-push");
var _ = require("underscore");
var serverKey ="AAAA07-2ryY:APA91bHKg-31TaP0EJdO0sSCyYIIDEZxEpO1WXK1HBSJmUEm3QdvzgG1ZBHSvDdwlLk5d5cZtwIND6n1aFsLBYjZZIP89oFoOr8DO3uYLlFKUQaeXaWg2YHvK83pHoImfAO1r-D96aVt"; //put your server key here
var fcm = new FCM(serverKey);

var PORT = process.env.PORT || 3000;
server.listen(PORT, function() {
  console.log(`the server is listening on...... ${PORT}`);
});
var dbName = "mydb";
MongoClient.connect(
  url,
  function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to database");
    var dbo = client.db(dbName);
    global.db = dbo;
  }
);



app.post("/push", function(req, res) {
  var devicetoken = req.body.devicetoken;
  var devicetype = req.body.devicetype;
  var message = req.body.message;
  var devicetokenIOS = [];
  var devicetokenAND = [];
  var datatoinsert = [];

  db.collection("user").find({}).sort({ pushid: -1 }).toArray(function(err, result) {
      if (err) {
        res.send({ status: 401, msg: "something went wrong" });
      } else {
        if (result.length > 0) {
          var id = result[0].pushid;
          var res = id.split("_");
        }
      }
    });
  for (i = 0; i < devicetype.length; i++) {
    var obj = {};
    id = parseInt(res[1]) + 1 + i;
    pushid = "PUSH_" + id;
    obj.pushid = pushid;
    obj.bookingId = bookingId;
    obj.message = message;
    obj.devicetoken = devicetoken[i];
    obj.devicetype = devicetype[i];
    obj.isread = 0;
    obj.createdAt = new Date();
    datatoinsert.push(obj);

    if (devicetype[i] == 0) {
        devicetokenAND.push(devicetoken[i]);
    }
    else {
      devicetokenIOS.push(devicetoken[i]);
    }
  }
  db.collection("user").insert(datatoinsert, (err, res) => {
    // console.log("...................",res,err)
    if (err) {
      res.send({ status: 400, msg: "error in insertion" });
    }
    console.log("Inserted successfully");
  });

  if (devicetokenIOS.length != 0) {
    // for ios push
    var chunks = _.chunk(devicetokenIOS, 1000);
    _.map(chunks, e => {
      var message = {
        registration_ids: e,

        notification: {
          title: "hello",
          body: "message"
        }
      };
      fcm.send(message, function(err, response) {
        if (err) {
          console.log("Something gone wrong", err);
          return err;
        } else {
          console.log("Successfully sent ", response);
          return response;
        }
      });
    });
  }
  if (devicetokenAND.length != 0) {
    var chunksAND = _.chunk(devicetokenAND, 1000);
    _.map(chunksAND, e => {
      var message = {
        registration_ids: e,

        notification: {
          title: "hello",
          body: "message"
        }
      };
      fcm.send(message, function(err, response) {
        if (err) {
          console.log("Something gone wrong ", err);
          return err;
        } else {
          console.log("Successfully sent ", response);
          return response;
        }
      });
    });
  }
});
