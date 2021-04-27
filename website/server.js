if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const session = require('express-session')
  const methodOverride = require('method-override')
  const cookieParser = require('cookie-parser')
  const bodyParser = require('body-parser');
  const moment = require("moment");
  const request = require("request");
  
  const jwt = require('jsonwebtoken');
  var jwt_token = "JJFEYRKLKZBUMS2JLJCVCVCDJNETKQ2VKNKVEU2KLJDUKVKTGJDEWNKLIZDVGMSNJJFEGRSNKMZE4R2KJNKVGVCTJBFVURKWIVJTESKKJZGEKMSWJNIEWRK2IU2FGMSLJJNEGVCFKZBVIS2SIVKEWURSKZDVESSFI5JFGSSHKZDUKTKSGJJUSTSCIVKVMU2IJFLEOVSFJVJUOSJVIZCUOUSLKBFVESSUIVKEGQ2JKJFUKU2UJJJUSVSGIU2FIU2GJNLEYVSHKNBUYSKWJZDE2U2LKRFE4SCVLFJVGTSJKZEFMR2TKNKEUTJSKVEVMSSTJNJEEVKPKNJUGSKGJRDEWVKTIREVURSEJNJFGR2JJZFUKV2TGJGEUWSHIZFVKMSYJNHEUVKXKZJUMSKWINLEWVJSJFFEUSCFJ5LEWRCLIJCVIMR5HU6Q====";

  app.use(express.static("public"));
  
  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(methodOverride('_method'))
  app.engine('html', require('ejs').renderFile)
  app.set('view engine', 'html')
  
  app.get('/', checkAuthenticated, (req, res) => {
	console.log(req.session)
    res.render('index.ejs', req.session)
  })
  
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs', req.session)
  })
  
  app.post('/api/login', checkNotAuthenticated, (req,res)=>{
	var email = req.body.email;
	var password = req.body.password;
	request({
		url: "http://user/api/users/login",
		method: "POST",
		json: {
			email: email,
			password: password
		},
	}, function(err,response,body){
		if(err){
			console.log(err)
			res.status(500).json({})
		}else{
			console.log(response.statusCode);
			console.log(body);
			if(response.statusCode==401){
				res.status(401).json({});
			}else if(response.statusCode==200){
				var expire = moment().add(10,'d').toDate().getTime();
				var token = jwt.sign({"email":email,"userID":body["userID"],"username":body["username"],"exp":expire}, jwt_token);
				res.status(200).cookie('token',token, { maxAge: 9000000, httpOnly: true }).send("{}");
			}
		}
	})
  });
  
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', req.session)
  })
  
  app.post('/api/register', checkNotAuthenticated, async (req, res) => {
    try {
	  request({
		url: "http://user/api/users/",
		method: "POST",
		json: {
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			username: req.body.username,
			email: req.body.email,
			password: req.body.password
		},
	}, function(err,response,body){
		if(err){
			console.log(err)
			res.status(500).json({})
		}else{
			console.log(response.statusCode);
			console.log(body);
			if(response.statusCode==401){
				res.status(401).json({});
			}else if(response.statusCode==409){
				res.status(409).json({});
			}else if(response.statusCode==201){
				res.status(201).json({});
			}else{
				res.status(501).json({});
			}
		}
	})
    } catch {
		res.status(501).json({});
    }
  })

  app.get('/welcome', checkNotAuthenticated, (req, res) => {
    res.render('welcome.html')
  })
  
  app.get('/messages', checkAuthenticated, (req, res) => {
    res.render('messages.ejs', req.session)
  })
  
  app.get('/api/createConv/', checkAuthenticated, (req,res)=>{
	var convID = req.params.convID;
	request({
		url: "http://conversation/api/conversations/",
		method: "POST"
	}, function(err,response,body){
		if(err){
			console.log(err)
			res.status(500).json({})
		}else{
			console.log(response.statusCode);
			console.log(body);
			if(response.statusCode==401){
				res.status(401).json({});
			}else if(response.statusCode==201){
				res.status(200).json(body);
			}
		}
	})
  });
  
  app.get('/api/messages/:convID/', checkAuthenticated, (req,res)=>{
	var convID = req.params.convID;
	request({
		url: "http://conversation/api/conversations/"+convID+"/",
		method: "GET"
	}, function(err,response,body){
		if(err){
			console.log(err)
			res.status(500).json({})
		}else{
			console.log(response.statusCode);
			console.log(body);
			if(response.statusCode==401){
				res.status(401).json({});
			}else if(response.statusCode==200){
				res.status(200).json(body);
			}
		}
	})
  });
  
  app.post('/api/messages/:convID/', checkAuthenticated, (req,res)=>{
	var convID = req.params.convID;
	request({
		url: "http://conversation/api/conversations/"+convID+"/",
		method: "POST",
		json: {
			userID: req.session.userID,
			message: req.body.message
		},
	}, function(err,response,body){
		if(err){
			console.log(err)
			res.status(500).json({})
		}else{
			console.log(response.statusCode);
			console.log(body);
			if(response.statusCode==401){
				res.status(401).json({});
			}else if(response.statusCode==201){
				res.status(201).json(body);
			}
		}
	})
  });
  
  app.get('/logout', (req, res) => {
	res.status(200).cookie('token',"", { maxAge: 1, httpOnly: true }).redirect("/welcome")
  })
  
  function checkAuthenticated(req, res, next) {
    var token = req.cookies.token;
	if(token!=null){
      jwt.verify(token, jwt_token, function(err, decoded) {
        if(err){
            console.log(err);
			res.redirect('/welcome')
        }else{
            console.log(decoded)
			if(new Date(decoded.exp)<new Date()){
				//Session expire
				res.redirect('/welcome')
			}else{
				req.session = decoded;
				next();
			}
        }
      });
	}else{
		res.redirect('/welcome')
	}
  }
  
  function checkNotAuthenticated(req, res, next) {
    var token = req.cookies.token;
	if(token!=null){
      jwt.verify(token, jwt_token, function(err, decoded) {
        if(err){
            console.log(err);
			next();
        }else{
            console.log(decoded)
			if(new Date(decoded.exp)<new Date()){
				//Session expire
				next();
			}else{
				res.redirect('/welcome')
			}
        }
      });
	}else{
		next();
	}
  }

  //console.log(__dirname)
  app.listen(3000)