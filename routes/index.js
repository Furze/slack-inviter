var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  var SlackClient = require('slack-api-client');
  var async = require('async');
  var ago = require('ago');
  var slack = new SlackClient(process.env.SLACK_TOKEN);

  async.parallel([
        function (callback) {
          slack.api.users.list({
            presence: 1
          }, function (err, users) {
            if (err) {
              throw err;
            }
            var members = users.members;
            var onlineUsers = 0;
            var totalUsers = 0;
            for (var i = 0; i < members.length; i++) {
              var user = members[i];
              if (user.deleted === false && user.is_bot === false) {
                totalUsers += 1;
                if (user.presence !== 'away') {
                  onlineUsers += 1;
                }
              }
            }
            callback(null, {onlineUsers: onlineUsers, totalUsers: totalUsers});
          });
        },
        function (callback) {
          var ts = (ago(3, "h")+'').slice(0,9);
          slack.api.channels.history({
              channel: 'C03DB1NV5'
            }, function(err, history){
              var numMessages = 0;
              var messages = history.messages;
              for(var i = 0; i < messages.length; i++){
                var messagets = messages[i].ts.slice(0,9);
                if(messagets < ts){
                  numMessages += 1;
                }
              }
              callback(null, {messagesLast3h: numMessages});
          });
        }
      ],
      function (err, results) {
        res.render('index', {
          title: 'Tech Offtopic - Slack Invite',
          onlineUsers: results[0].onlineUsers,
          totalUsers: results[0].totalUsers,
          messagesLast3h: results[1].messagesLast3h
        });
      });
});


module.exports = router;
