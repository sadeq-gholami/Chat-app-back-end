const express = require('express');
const router = express.Router();
const Chatkit = require('@pusher/chatkit-server');
const mongoose = require('mongoose');
const bcrypt =require('bcrypt');

const User = require('../models/user');

const chatkit = new Chatkit.default({
    key:process.env.API_KEY,
    instanceLocator:process.env.INSTANCELOCATOR
});

router.get('/users', (req, res, next)=>{
  User.find()
  .select('username  _id password avatarURL')
  .exec()
  .then(docs =>{
      const response = {
          count: docs.length,
          users: docs.map(doc => {
              return{
                  username: doc.username,
                  _id: doc._id,
                  password:doc.password,
                  avatarURL:doc.avatarURL,
                  request:{
                      type: 'GET',
                      url: 'https://chat-application-api.herokuapp.com/chatkit/users/' + doc._id 
                  }
              }
          })
      }
      res.status(200).json(response);
  })
  .catch(err =>{
    console.log(err);
    res.status(500).json({error: err});
  });
});

router.post("/users", async (req, res, next) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPassword);
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      username: req.body.username,
      password: hashedPassword,
      avatarURL:req.body.avatarURL
    });
    const savedUser = await user.save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });

      chatkit.createUser({
        id: savedUser.username,
        name: savedUser.username,
        avatarURL:savedUser.avatarURL
      })
      .then(() => {
        res.sendStatus(201)
      })
      .catch(error => {
        if (error.error === 'services/chatkit/user_already_exists') {
          res.sendStatus(200)
        } else {
          console.log(error);
          res.status(error.status).json(error);
        }
      }); 
});
router.get('/users/:userId', (req, res, next)=>{
  const id = req.params.userId;
  User.findById(id)
  .select('username _id password avatarURL')
  .exec()
  .then(doc => {
      if(doc){
          res.status(200).json({
              product: doc,
              request:{
                  type: 'GET',
                  url: 'https://chat-application-api.herokuapp.com/chatkit/users/'
              }
          });
      } else{
          res.status(404).json({message:"invalid id for the specified product"});
      }
  })
  .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
  });
});

router.delete('/users/:userId', (req, res, next)=>{
  const id = req.params.userId;
  User.remove({_id: id})
  .exec()
  .then(result=>{
      res.status(200).json(result);
  })
  .catch(err => {
      console.log("something went wrong");
      res.status(500).json({error: err});
  });
});

router.post('/users/login', async(req,res, next)=>{
  console.log(req.headers)
   const user = await User.find({username:req.headers.username})
    .select('username  _id password')
    .exec()
    .then(docs =>{
        return docs;
    })
    .catch(err =>{
      console.log(err);
      res.status(500).json("can not find user");
    });
    if(user.length < 1){
      res.status(400).json("there is no user with the given usernam");
    }
    try{
      if (await bcrypt.compare(req.headers.password, user[0].password)){
        const authData = chatkit.authenticate({ userId: req.query.user_id});
        res.status(authData.status).send(authData.body);
      }else{
        res.status(401).json("not allowed");
      }
    }catch{
      res.status(500).json("failed to hash");
    }
}); 

module.exports= router;