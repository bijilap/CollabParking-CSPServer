var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gcm = require('node-gcm');
var http = require('http');

var User = require('../models/user');
var Question = require('../models/question');
var UserCredential = require('../models/user_credential');

var crypto = require('crypto');

var extra_functions = require('./functions.js');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/*
  Simple authentication
*/
router.post('/:user_id/authenticate', function(req,res){
    var userId = req.params.user_id;
    var password = req.body.password;
    UserCredential.findOne({userId: userId}, function(err, usrc){
      if(err){
        console.log(err);
        return res.json({message:'Unknown error', code:"-400" });
      }
      else{
        if(usrc){
          var hashs = crypto.createHash('md5');
          var hashp = crypto.createHash('sha512');
          hashs.update(userId);
          var salt = hashs.digest('base64');
          hashp.update(password+salt);
          var hashPassword = hashp.digest('base64');
          console.log(usrc)
          console.log(hashPassword);
          console.log(usrc.password);
          if(hashPassword != usrc.password)
            return res.json({message:'Authentication failed - Invalid credential', code:"-402" });

          return res.json({message:'Success', code:"200" });
        }
        else{
          return res.json({message:'Authentication failed - No such user', code:"-401" })
        }
      }
    });
});

router.post('/:user_id/new_user', function(req,res){
  var userId = req.params.user_id;
  var password = req.body.password;
  UserCredential.findOne({userId: userId}, function(err, user){
    if(err){
      console.log(err);
      return res.json({message:'Unknown error', code:"-400" });
    }
    else{
      if(!user){
        var hashs = crypto.createHash('md5');
        var hashp = crypto.createHash('sha512');
        hashs.update(userId);
        var salt = hashs.digest('base64');
        hashp.update(password+salt);
        var hashPassword = hashp.digest('base64');
        console.log(hashPassword);

        var newCredential =  new UserCredential({
          userId: userId,
          password: hashPassword,
          saltString: salt
        });

        newCredential.save(function(){
              return res.json({message:'Success', code:"200" });
        });

        //return res.json({message:'Waiting', code:"-402" });
      }
      else{
        console.log(user);
        return res.json({message:'User already exists', code:"-401" })
      }
    }
  });
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

/*
  User profile
*/
router.post('/:user_id/profile', function(req,res){
  var userId = req.params.user_id;
  User.findOne({userId: userId}, function(err,user){
    if (err) {
      console.log(err);
      return res.json({error: err});
    }
    else{
      if(user){
        var resultJson = {
          userId : user.userId,
          points : user.rating.points,
          stars : user.rating.stars,
          price: user.preference.price,
          distance: user.preference.distance
        };
        return res.json(resultJson);
      }
      else{
        return res.json({});
      }
    }
  });
});

router.post('/:user_id/preference/update/:metric/:valuem', function(req,res){
  var userId = req.params.user_id;
  var metric = req.params.metric;
  var value = req.params.valuem;
  User.findOne({userId: userId}, function(err,user){
    if (err) {
      console.log(err);
      return res.json({error: err});
    }
    else{
      if(user){
        if(metric == "distance")
          user.preference.distance = value;
        else(metric == "price")
          user.preference.price = value;
        user.save(function()
          {
            console.log(user);
            return res.json({message: 'Updated metric'});
          }
        );
      }
      else{
        console.log("No such user");
        return res.json({message : 'no such user'});
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
router.post('/:user_id/ask/:question_code/:lot_id', function(req, res){
  var userId = req.params.user_id;
  var qcode = req.params.question_code;
  var question = "";
  var answers = [];
  var askedBy;
  var lotId = req.params.lot_id;

  if(qcode == 1){
    var parking_lot = req.body.parking_lot;
    latitude = req.body.latitude;
    longitude = req.body.longitude;
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
          askedBy: userId,
          timestamp: new Date().getTime(),
          respondents: [],
          answerSatisfaction: false,
          questionAnswered: false
        });
        newQuestion.save(function(err, thisQues){
	  var quesId = thisQues._id;
          console.log(newQuestion);
          broadcastQuestion(question, lotId, quesId);
          setTimeout(function() {
  		console.log('Reply to poser');
  		
  		Question.findOne({_id: quesId}, function(err, ques){
  			solutions = ques.answers;
  			console.log(ques);
  			var no_percent = 0;
  			var yes_percent = 0;
  			if((solutions[0].voters.length + solutions[1].voters.length)!=0){
  				no_percent = (solutions[1].voters.length * 100)/(solutions[0].voters.length + solutions[1].voters.length);
  				yes_percent = (solutions[0].voters.length * 100)/(solutions[0].voters.length + solutions[1].voters.length);
  			}
			sendAnswerToDevice(userId, question, yes_percent, no_percent);
  		});
	   }, 200000);
          return res.json({message: 'Question posed to other users'});
        });
      }
    }
  });
  //create new record for new question

  //return res.json({message: 'Question posed to other users'});
});


router.post('/:user_id/answer/:question_id', function(req, res){
  var userId = req.params.user_id;
  var questionId = req.params.question_id;
  var answer = req.body.answer;

  Question.findOne({_id:questionId}, function(err, question){
    if(err){
      return res.json({message: "Answering failed"});
    }
    else{
        if(question){
          console.log(question);
          var length = question.answers.length;
          for(var i=0; i<length;i++){
            if(question.answers[i].answer == answer){
              question.answers[i].voters.push(userId);
              question.respondents.push(userId);
              question.save(function(){
                return res.json({message: "Answer submitted"});
              });
              break;
            }
          }
        }
        else{
          return res.json({message: "No such question"});
        }
    }
  });

});

router.post('/:user_id/askTestQuestion', function(req, res){
  var userId = req.params.user_id;
  var dummyQuestion = "Test question?";
  sendQuestionToDevice(userId, dummyQuestion);
});


function sendQuestionToDevice(userId, question, quesId){
  User.findOne({userId: userId}, function(err, user){
        if (err) {
          console.log(err);
          return res.json({error: err});
        }
        else{
          if(user){
	    var message = new gcm.Message();
	    message.addDataWithKeyValue('question',question);
	    message.addDataWithKeyValue('question_id', quesId);
	    message.addDataWithKeyValue('gcm_type', "question");
            devices = user.deviceList;
            var sender = new gcm.Sender('AIzaSyBX621CX0O8oJN7Huk3krrRx7AnGtdZ36Q');
            sender.send(message, devices, 4, function(err, result) {

	    console.log(message);
	    if (err){
              console.log('Error sending message!');
	      console.log(err);
              return "";
            }
            else {
              console.log(result);
              return "";
              //return res.json({message: 'Message sent successfully'});
            }
          });
        }
      }
    });

}

function sendAnswerToDevice(userId, question, yes_percent, no_percent){
  User.findOne({userId: userId}, function(err, user){
        if (err) {
          console.log(err);
          return res.json({error: err});
        }
        else{
          if(user){
	    var message = new gcm.Message();
	    message.addDataWithKeyValue('question',question);
	    message.addDataWithKeyValue('gcm_type', "solution");
	    message.addDataWithKeyValue('yes', yes_percent);
	    message.addDataWithKeyValue('no', no_percent);
            devices = user.deviceList;
            var sender = new gcm.Sender('AIzaSyBX621CX0O8oJN7Huk3krrRx7AnGtdZ36Q');
            sender.send(message, devices, 4, function(err, result) {

	    console.log(message);
	    if (err){
              console.log('Error sending message!');
	      console.log(err);
              return "";
            }
            else {
              console.log(result);
              return "";
              //return res.json({message: 'Message sent successfully'});
            }
          });
        }
      }
    });

}


function broadcastQuestion(question, lotId, quesId){
    var httpOption = {
    host : '54.69.152.156', // here only the domain name
    // (no http/https !)
    port : 55321,
    path : '/csp/data/user/query/parking/' + lotId, // the rest of the url with parameters if needed
    method : 'GET' // do GET
    };

    var req = http.request(httpOption, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);

    res.on('data', function(data) {
      //process.stdout.write(d);
      console.log("BQ-Data");
      console.log(JSON.parse(data));
      /*
        assuming result set has structure :
        {
        userList: [userid1, userid2,.....]
        }
      */

      var userList = JSON.parse(data);
      for(var i in userList){
        console.log(userList[i].id);
        sendQuestionToDevice(userList[i].id, question, quesId);
      }

    });

  });

  req.end();

  req.on('error', function(e) {
    console.error(e);
  });
}

module.exports = router;
