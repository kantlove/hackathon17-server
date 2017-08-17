import express from 'express';
import EventModel from './models/event';
import UserModel from './models/user';

let router = express.Router();
export default router;

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  const options = { timeZone: 'Asia/Singapore', timeZoneName: 'short' };
  console.log('Time: ', new Date(Date.now()).toLocaleTimeString('en-US', options));
  next();
});

router.get('/', function(req, res) {
  EventModel.find({}).exec()
    .then(function(events) {
      res.send(events);
    })
    .catch(function(err) {
      res.status(400).send(`Failed to list events. ${err}`);
    });
});

router.post('/', function(req, res) {
  req.checkBody('name', 'cannot be empty').notEmpty();
  req.checkBody('creator', 'cannot be empty').notEmpty();
  req.checkBody('time', 'cannot be empty').notEmpty();
  req.checkBody('location', 'cannot be empty').notEmpty();

  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      let errors = JSON.stringify(result.array());
      res.status(400).send(`Parameter errors:\n ${errors}`);
      return;
    }

    const event_name = req.body.name;
    const creator = req.body.field;
    const time = req.body.field;
    const location = req.body.field;
  
    UserModel.create({ 
      name: event_name,
      creator: creator,
      time: time,
      location: location
    })
      .then(function() {
        res.sendStatus(200);
      })
      .catch(function(err) {
        res.status(400).send(`Failed to create user ${event_name}. ${err}`);
      });
  });
});

router.post('/join', function(req, res) {
  req.checkBody('user_name', 'cannot be empty').notEmpty();
  req.checkBody('event_name', 'cannot be empty').notEmpty();

  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      let errors = JSON.stringify(result.array());
      res.status(400).send(`Parameter errors:\n ${errors}`);
      return;
    }

    const user_name = req.body.user_name;
    const event_name = req.body.event_name;

    // Check if user exists
    UserModel.findOne({ name: user_name }).exec()
      .then(function(this_user) {
        if(!this_user) throw new Error(`Cannot find user ${user_name}`);

        // Join the event
        EventModel.findOneAndUpdate(
          { name: event_name }, 
          { $inc: { audience_count: 1 }}
        ).exec()
          .then(function(updated_event) {
            if(!updated_event) throw new Error(`Cannot find event ${event_name}`);
          })
          .catch(function(reason) {
            throw new Error(reason);
          });
      })
      .catch(function(reason) {
        console.log(`Join event request from ${user_name} to ${event_name} failed. ${reason}`);
        res.status(400).send(reason);
      });
  });
});
