import express from 'express';
import UserModel from './models/user';

let router = express.Router();
export default router;

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

router.get('/', function(req, res) {
  const name = req.query.name;
  let query = {};
  if(name) query = { $text: { $search: name } };

  UserModel.find(query).exec()
    .then(function(users) {
      res.send(users);
    })
    .catch(function(err) {
      console.log(`Failed to list users. ${err}`);
      res.sendStatus(500);
    });
});

router.post('/', function(req, res) {
  req.checkBody('name', 'cannot be empty').notEmpty();
  req.checkBody('field', 'cannot be empty').notEmpty();

  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      let errors = JSON.stringify(result.array());
      res.status(400).send(`Parameter errors:\n ${errors}`);
      return;
    }

    const user_name = req.body.name;
    const field = req.body.field;
  
    UserModel.create({ name: user_name })
      .then(function() {
        console.log(`Create user ${user_name}`);
        res.sendStatus(200);
      })
      .catch(function(err) {
        console.log(`Failed to create user ${user_name}. ${err}`);
        res.sendStatus(500);
      });
  });
});

router.post('/follow', function(req, res) {
  req.checkBody('user_name', 'cannot be empty').notEmpty();
  req.checkBody('follow_name', 'cannot be empty').notEmpty();

  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      let errors = JSON.stringify(result.array());
      res.status(400).send(`Parameter errors:\n ${errors}`);
      return;
    }

    const user_name = req.body.user_name;
    const follow_name = req.body.follow_name;

    // Check if user exists
    UserModel.findOne({ name: user_name }).exec()
      .then(function(this_user) {
        if(!this_user) throw new Error(`Cannot find user ${user_name}`);

        UserModel.findOne({ name: follow_name }).exec()
          .then(function(follow_user) {
            if(!follow_user) throw new Error(`Cannot find user ${follow_name}`);
    
            // Update for this user
            UserModel.findOneAndUpdate(
              { name: user_name }, 
              { $addToSet: { follows: follow_name }}
            ).exec()
              .then(function() {
                // Update follow target
                follow_user.update({ $addToSet: { followers: user_name }}).exec()
                  .then(function() {
                    console.log(`User ${user_name} follows user ${follow_name}`);
                    res.sendStatus(200);
                  })
                  .catch(function(reason) {
                    throw new Error(reason);
                  });
              })
              .catch(function(reason) {
                throw new Error(reason);
              });
          })
          .catch(function(reason) {
            throw new Error(reason);
          });
      })
      .catch(function(reason) {
        console.log(`Follow request from ${user_name} to ${follow_name} failed. ${reason}`);
        res.status(500).send(reason);
      });
  });
});
