const axios = require('axios').default;
const { WAFJS } = require('wafjs');
const { request } = require('../../Shop/app');
const ips = require("../models/ipModel.js");
const { Model } = require('mongoose');
const generalController = require('./generalControllers');



// WAF-JS is a simple WAF developed for basic protection on Node.JS web systems, providing basic bot detection,
//  HTTP method checking and some HTTP headers analysis. With a simple package install and passing some arguments,
//  it can check if you want to continue handling the request, or simply drop it, log it or redirect it somewhere else.

const baseConfig = {
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'], // allowed / desired HTTP methods
    contentTypes: ['application/json', 'multipart/form-data'] // allowed / desired content-types
  }
let _wafjs = new WAFJS(baseConfig)



module.exports = (app) => {
    app.get('/api/v1/security/', async (req, res, next) => {
      // get ip address of user and save it as a local variable in /routes 
      // always check if bad request count is less than 20      
      var ipAddress = req.connection.remoteAddress;
      if (!ipAddress) {
          return '';
      }// convert from "::ffff:192.0.0.1"  to "192.0.0.1"
      if (ipAddress.substr(0, 7) == "::ffff:") {
          ipAddress = ipAddress.substr(7)}

    const yes= await ips.findOne({guestIP: ipAddress})

    if (!yes) {
      const doc = await ips.create({guestIP: ipAddress,count: 0});
      res.status(201).json({
        status: "NEW !!",
        data: doc,
    });
  }else{
    res.status(201).json({
      status: "Exists !!",
      data: yes,
  });
  }
    })

    app.patch('/api/v1/security/increment', async (req, res, next) => {
      const ipAddress = req.body.ipAdd;
      const kk = await ips.findOne({guestIP: ipAddress});
      const cou = kk.count+1;
      const doc = await ips.findOneAndUpdate({guestIP: ipAddress},{$set:{count:cou}})

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
    })

    app.post('/api/v1/security/captcha', async(req,res,next)=>{
      //Destructuring response token from request body
    const {token} = req.body;
    var stat = null

    //sends secret key and response token to google
        await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.REACT_APP_SECRET_KEY}&response=${token}`
          ).then(res =>  stat = res.data.success)

    //check response status and send back to the client-side
          if (stat) {
            res.send("Human");
        }else{
          res.send("Robot");
  }
})
}
