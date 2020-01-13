const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });

const Picture = require('../models/picture');

router.get('/', (req, res, next)=>{
  Picture.find()
  .select('name  _id imgUrl')
  .exec()
  .then(docs =>{
      const response = {
          count: docs.length,
          pictures: docs.map(doc => {
              return{
                  name: doc.name,
                  _id: doc._id,
                  imgUrl: doc.imgUrl,
                  request:{
                      type: 'GET',
                      url: 'https://chat-application-api.herokuapp.com/pictures/' + doc._id 
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

router.post("/", upload.single('imgUrl'), (req, res, next) => {
    console.log(req.file);
    const picture = new Picture({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      imgUrl: req.file.path 
    });
    picture
      .save()
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "Created product successfully",
          createdPicture: {
              name: result.name,
              _id: result._id,
              imgUrl:result.imgUrl,
              request: {
                  type: 'GET',
                  url: "https://chat-application-api.herokuapp.com/pictures/" + result._id
              }
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

router.get('/:pictureId', (req, res, next)=>{
    const id = req.params.pictureId;
    Picture.findById(id)
    .select('name _id imgUrl')
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json({
                product: doc,
                request:{
                    type: 'GET',
                    url: 'https://chat-application-api.herokuapp.com/products/'
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

router.delete('/:pictureId', (req, res, next)=>{
    const id = req.params.pictureId;
    console.log(id);
    Picture.remove({_id: id})
    .exec()
    .then(result=>{
        res.status(200).json(result);
    })
    .catch(err => {
        console.log("something went wrong");
        res.status(500).json({error: err});
    });
});
module.exports= router;