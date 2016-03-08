var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var usersOnline = 0;
  var totalUsers = 0;
  var SlackClient = require('slack-api-client');
  var slack = new SlackClient(process.env.SLACK_TOKEN);
  slack.api.users.list({
    presence: 1
  }, function (err, users) {
    if (err) { throw err; }
    var members = users.members;
    for(var i = 0; i < members.length; i++){
      var user = members[i];
      if(user.deleted  === false && user.is_bot === false ){
        totalUsers += 1;
        if( user.presence !== 'away') {
          usersOnline += 1;
        }
      }
    }
    //console.log(usersOnline + "/" + totalUsers);
    res.render('index', { title: 'Tech Offtopic - Sponsored by Bigpipe', numOnline: usersOnline, totalUsers: totalUsers });
  });
});

module.exports = router;
