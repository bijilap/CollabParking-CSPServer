var http = require('http');

function broadcastQuestion(question, latitude, longitude){
    var httpOption = {
    host : '54.69.152.156', // here only the domain name
    // (no http/https !)
    port : 55321,
    path : '/csp/data/parking/query/nearbyUsers', // the rest of the url with parameters if needed
    method : 'GET' // do GET
    };

    var req = http.request(options, function(res) {
	  console.log("statusCode: ", res.statusCode);
	  console.log("headers: ", res.headers);

	  res.on('data', function(data) {
	    //process.stdout.write(d);
	    console.log("BQ-Data", data);
	    /*
	    	assuming result set has structure :
	    	{
				userList: [userid1, userid2,.....]
	    	}
	    */
	    var userList = data['userList'];
	    for(var i in userList){
	    	sendQuestionToDevice(userList[i], question);
	    }
	  });

	});

	req.end();

	req.on('error', function(e) {
	  console.error(e);
	});
}

function sendQuestionToDevice(userId, question){
  User.findOne({userId: userId}, function(err, user){
        if (err) {
          console.log(err);
          return res.json({error: err});
        }
        else{
          if(user){
            devices = user.deviceList;
            var sender = new gcm.Sender('AIzaSyD7ZO1TPCyCTsXQLj2xUkCY23I8UenziBc');
            sender.send(question, devices, 4, function(err, result) {
            if (err)
              return res.json({error: 'Error switching user to new device!'});
            else {
              console.log(result);
              return res.json({message: 'User moved to new device'});
            }
          });
        }
      }
    });

}
