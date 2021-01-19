const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const https = require('https')
const unirest = require('unirest')
const cityModel=require('../models/weather');
const { where, listIndexes } = require('../models/weather');
const appId = "a3fa929a5a7fb4365ea46c103e2db342";
var request = require('request-promise');
var weather_data = [];
const user = require('../models/User');
var userdetails = [];

async function getWeather(cities) {
  try{
 

  for (var city_obj of cities) {
      var city = city_obj.name;
      var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=271d1234d3f497eed5b1d80a07b3fcd1`;

      var response_body = await request(url);

      var weather_json = JSON.parse(response_body);

      var weather = {
          city : city,
          temperature : Math.round(weather_json.main.temp),
          description : weather_json.weather[0].description,
          icon : weather_json.weather[0].icon
      };

      weather_data.push(weather);
  }
}
catch(err){
  console.log(err);
}

  return weather_data;
}





// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
router.get('/home',ensureAuthenticated, (req, res) => {

  cityModel.find({}, function(err, cities) {

      getWeather(cities).then(function(results) {

          var weather_data = {weather_data : results,data:''};

          res.render('index', weather_data);

      });

  });    

});


router.post('/home', (req, res) => {
  const location = req.body.location ? req.body.location : "Bangalore";
  
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&appid=" + appId + "&units=metric";
  const imgs = { 
   Clouds: "https://i.pinimg.com/originals/aa/96/97/aa9697a3f7a61389675b8dc109518753.gif",
   Mist: "https://www.pngkey.com/png/detail/123-1236518_smoke-haze-png-haze-png.png",
   Rain: "https://giffiles.alphacoders.com/116/11620.gif",
   Haze: "https://www.pngkey.com/png/detail/123-1236518_smoke-haze-png-haze-png.png",
   Snow: "https://media1.tenor.com/images/735e68b36fb24b5cadda815230daad05/tenor.gif?itemid=13649339",
   Clear: "https://ak.picdn.net/shutterstock/videos/7824385/thumb/4.jpg",
   Thunderstorm: "https://i.pinimg.com/originals/14/0f/02/140f02ad145786db59e085b058749131.jpg"
  };


  https.get(url, (response) => {
    if (response.statusCode === 200) {
      response.on("data", (data) => {
        const weatherData = JSON.parse(data);
        var status = imgs[weatherData['weather'][0]['main']];
	var newCity = new cityModel({name : req.body.location});
               newCity.save();

               
	
        res.render('index', {data: weatherData, stat: status,forecast:weather_data});
      })
    } else {
      res.render('index', {data: "0"})
    }
  })

})


router.get('/users',ensureAuthenticated, (req, res) =>{

  user.find(function(err, users) {
    if(err){
      console.log(err);
    }
    else{
    //userdetails.push(users);

    res.render('table',{users:users})
    console.log(users);
    }
  })




})

router.get('/aboutus',ensureAuthenticated, (req, res) =>{

  
    //userdetails.push(users);

    res.render('aboutus')
   
    
  })






module.exports = router;
