var bcrypt = require('bcryptjs');
var senderid;

// var bcrypt = require('bcrypt');
module.exports = {

  'welcome': function (req, res) {
    return res.status(200).json({
      user : 1
    })
  },

  'new': function (req, res) {
    if(req.session.authenticated)
    {
      res.redirect('/session/welcome');
      return;
    }
    res.view();
  },

  create: function (req, res, next) {

    if (!req.param('email') || !req.param('contact')) {
      req.session.flash = {
        err: 'You must enter both a username/email and contact number.'
      };
      return res.status(200).json({
        success : false,
        message : "You must enter both a username/email and contact number"
      });    }

    User.findOne({
      or : [
        { username: req.param('email') },
        { email: req.param('email') }
      ]
    }).exec(function(err, user) {

      if (err){
        req.session.flash = {
          err: 'Error in logging'
        };
        return res.status(200).json({
          success : false,
          message : "Error in logging.Please fill details properly!"
        });
      }


      // If no user is found...
      if (!user) {
        var noAccountError = {
          name: 'noAccount',
          message: 'The email address not found.'
        };
        // req.session.flash = {
        //   err: 'The email address ' + req.param('email') + ' not found.'
        // };
        return res.status(200).json({
          success : false,
          message : "The email address not found"
        });
      }
      else{

        User.findOne({
          email : req.param('email')
        }, function foundUser(err, user) {

          if (err) return next(err);

          // If the contact from the form doesn't match the contact from the database...
          if(user){
            console.log(user.contact + 1);
            console.log(req.param('contact'));

            if(user.contact === parseInt(req.param('contact'))){
              req.session.authenticated = true;
              req.session.User = user;

              user.token = sailsTokenAuth.issueToken(user.id);

              return res.status(200).json({
                user : user,
                token : sailsTokenAuth.issueToken(user.id),
                success : true
              })
            }
            else{
              return res.status(200).json({
                success : false,
                message : "Wrong credentials.Please check your email or contact no. "
              });
            }
          }
          else{
            return res.status(200).json({
              success : false,
              message : "No email address found."
            });
          }

        });
      }

    });
  },

  checktoken : function (req, res, next) {
    User.findOne({
      id : req.header('id')
    }, function foundUser(err, user) {
      if (!user) {
        console.log("Enters 4");

        return res.status(200).json({
          success : false,
          message : "The email address not found"
        });
      }
      else{
        return res.status(200).json({
          user : user,
          success : true
        })

      }

    });

      },


  destroy: function (req, res, next) {

    User.findOne(req.session.User.id, function foundUser(err, user) {

      var userId = req.session.User.id;

      if (user) {
        // The user is "logging out" (e.g. destroying the session) so change the online attribute to false.
        User.update(userId, {
          online: false
        }, function (err) {
          if (err) return next(err);

          // Inform other sockets (e.g. connected sockets that are subscribed) that the session for this user has ended.
          User.publishUpdate(userId, {
            loggedIn: false,
            id: userId,
            name: user.name,
            action: ' has logged out.'
          });

          // Wipe out the session (log out)
          req.session.destroy();

          // Redirect the browser to the sign-in screen
          res.redirect('/session/new');
        });
      } else {

        // Wipe out the session (log out)
        req.session.destroy();

        // Redirect the browser to the sign-in screen
        res.redirect('/session/new');
      }
    });
  },

  timestamp : function (req, res, next) {
    var time = 27

  }
};

