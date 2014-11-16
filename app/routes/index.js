var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gcm = require('node-gcm');

var User = require('../models/user');
var Question = require('../models/question');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* Verify login. If user doesn't exist, add user to db
If deviceId doesn't exist then add to user's list of devices
*/

router.post('/login', function(req, res){
     console.log('in login page');
     var userId = req.body.userId;
     var deviceId = req.body.deviceId;
     csp_session = req.session;

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
          return res.json({message: 'Logged in successfully'});
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

/* ask a question. Additional arguments may be passed:
  1. qcode == 1 [Is parking available]
    a. lot_name
    b. longitude
    c. latitude
*/
router.post('/:user_id/ask/:question_code', function(req, res){
  var userId = req.params.user_id;
  var qcode = req.params.question_code;
  var question = "";
  var answers = [];
  var askedBy;

  if(qcode == 1){
    var parking_lot = req.body.parking_lot;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    question = "Is there any parking available in "+parking_lot+"?";
    answers.push({
      answer: "Yes",
      voters: []
    });
    answers.push({
      answer: "No",
      voters: []
    });
    answers.push({
      answer: "Dunno",
      voters: []
    });
  }

  //Get current user's record from db
  User.findOne({userId: userId}, function(err,user){
    if (err) {
      console.log(err);
      return res.json({error: err});
    }
    else{
      if(user){
        var newQuestion = new Question({
          question: question,
          answers: answers,
          askedBy: user,
          timestamp: new Date().getTime(),
          respondents: [],
          answerSatisfaction: false,
          questionAnswered: false
        });
        newQuestion.save(function(){
          console.log(newQuestion);
        });
        return res.json({message: 'Question posed to other users'});
      }
    }
  });
  //create new record for new question

  //return res.json({message: 'Question posed to other users'});
});

module.exports = router;
