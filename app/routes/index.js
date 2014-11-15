var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gcm = require('node-gcm');

var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* Verify login. If user doesn't exist, add user to db
If deviceId doesn't exist then add to user's list of devices
*/
router.post('/hello', function(req,res){
  console.log('hello');
  res.render('index', { title: 'Express' });
}
);
router.post('/login', function(req, res){
     console.log('in login page');
     var userId = req.body.userId;
     var deviceId = req.body.deviceId;

    if (userId.length == 0 || deviceId.length == 0)
      return res.json({error: 'Invalid parameters given!'});

    User.findOne({userId: userId}, function(err, user){
      if (err) {
        console.log(err);
        return res.json({error: err});
      }
      else{
        if (user) {
          console.log('User exists');
          //check if this device exists.
          devices = user.deviceList;
          index = devices.indexOf(deviceId);

          //if not found, add it else ignore
          if (index == -1) {
            user.deviceList.push(deviceId);
            user.save(function()
              {
                console.log('Added new device for user');
                return res.json({message: 'Added new device for user'});
              }
            );
          }
        }
        else {
          //if user doesn't exist, add new user with new device id
          var newUser = new User({
            userId: userId,
            deviceList: [deviceId],
            rating: {
              points: 100,
              stars: 0
            },
            preference: {
              price: true,
              distance: false
            }
          });
          newUser.save(function()
            {
              console.log(newUser);
              return res.json({message: 'Added user to database'});
            }
          );
        }
      }
    });
});

module.exports = router;
