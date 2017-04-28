var bcrypt = require('bcryptjs');


module.exports = {



  // create : function(req, res, next) {
  //
  //   User.create(req.params.all(), function userCreated(err, user) {
  //     if (err) {
  //       //console.log(err);
  //       req.session.flash = {
  //         err: err
  //       };
  //       return res.status(200).json(err);
  //     }
  //
  //     req.session.authenticated = true;
  //     req.session.User = user;
  //     user.token = sailsTokenAuth.issueToken(user.id);
  //     user.save(function (err) {
  //       if(err){
  //         return res.state(200).json(err);
  //       }
  //       console.log("Saving user");
  //       res.json({user: user, token: sailsTokenAuth.issueToken(user.id)});
  //     });
  //
  //
  //   });
  // },




  userRegister: function (req, res, next) {

    if (!req.param('email') || !req.param('contact')) {

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
          message: 'Error in logging'
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

          if (user) {


            if (user.contact === parseInt(req.param('contact'))) {

              req.session.authenticated = true;
              req.session.User = user;
              user.registered = true;
              user.breakfast = 1;
              user.lunch = 1;
              user.dinner = 1;
              user.snacks = 1;
              user.coffee = 1;

              user.save(function (err) {
                if (err) {
                  return res.status(200).json({
                    message: "Oops! Something went wrong while registering.",
                    success: true
                  })
                }
                return res.status(200).json({
                  message: "Successfully registered!",
                  success: true
                })
              });
            }
            else {
              return res.status(200).json({
                success: false,
                message: "Wrong credentials.Please check your email or contact no. "
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

  noOfRegisterations : function (req, res, next) {
    var count = 0;

    User.find(function foundUsers(err, users){
      users.forEach(function(user){
        if(user.registered === true){
          count = count + 1;
        }
      });

      console.log(count);
    });

  },

  redlist : function (req, res, next) {

    var temparray = [];
    var overall = [];

    Quiz.find(function foundQuizs(err, quizs){

      User.find(function foundUsers(err, users){
        quizs.forEach(function(quiz) {
          users.forEach(function(user){

          if (quiz.userid === user.id) {
            temparray.push(user.name);
            temparray.push(quiz.score);
          }
          });
          if(temparray.length > 0) {
            overall.push(temparray);
          }
          temparray = [];
        });
        return res.json({
          overall : overall
        })
      });


    });

  },


  // show: function(req, res, next) {
    //   User.findOne(req.param('id'), function foundUser(err, user) {
  //     if (err) return next(err);
  //     if (!user) return next();
  //     res.view({
  //       user: user
  //     });
  //   });
  // }




  index : function(req, res, next){

    User.find(function foundUsers(err, users){
      if(err) return next(err);
      return res.status(200).json({
        users : users
      })
    });
  }
  //this function is used for returning all the users in form of array.


};





