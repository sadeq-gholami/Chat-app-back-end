const express = require('express');
const router = express.Router();
const Chatkit = require('@pusher/chatkit-server');
const chatkit = new Chatkit.default({
    key:process.env.API_KEY,
    instanceLocator:process.env.INSTANCELOCATOR
})
router.post('/users', (req, res) => {
      const { username } = req.body
      chatkit
        .createUser({
          id: username,
          name: username
        })
        .then(() => res.sendStatus(201))
        .catch(error => {
          if (error.error === 'services/chatkit/user_already_exists') {
            res.sendStatus(200)
          } else {
            res.status(error.status).json(error)
          }
        })
    });
    
    router.post('/authenticate', (req, res) => {
      const authData = chatkit.authenticate({ userId: req.query.user_id })
      res.status(authData.status).send(authData.body)
    });

    module.exports= router;