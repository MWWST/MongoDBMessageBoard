var express = require("express");
// Create an Express App
var app = express();

var path = require("path");
// Require body-parser (to recieve post data from clients)
var bodyParser = require("body-parser");

var mongoose = require('mongoose');
var validate = require('mongoose-validator');

// Integrate body-parser with our App
app.use(bodyParser.urlencoded());
// Setting our Static Folder Directory
// app.use(express.static(__dirname + "./static"));  //we are not using static folder for this project
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request
app.get('/', function(req, res) {
    

Post.find({},function(err,allposts){
		if(err){
			console.log('there was an error',allposts);
		}
		else if (allposts){
			
			Comment.find({},function(err,allcomments){
				if (err){
					console.log('err');
				}
				else if(allcomments){
					comments={comments:allcomments}
					res.render('index',{allposts:allposts,comments:allcomments})
				}
			})
		}
	})
})

app.post('/posts/new',function(req,res){

	var newpost= new Post({text:req.body.post,name:req.body.name})

	newpost.save(function(err){
		if(err){
			console.log('something went wrong',err);
			Post.find({},function(err,allposts){
			if(err){
				console.log('there was an error',allposts);
				}
				else if (allposts){
					
					Comment.find({},function(err,allcomments){
						if (err){
							console.log('err');
						}
						else if(allcomments){
							
							res.render('index', {errors: newpost.errors,allposts:allposts,comments:allcomments})
						}
					})
				}
			})
				
			}
		else {
			console.log('successfully added the post');
			res.redirect('/')
		}
	})

})

app.post('/comments/new',function(req,res){
	console.log('request body id',req.body.id);
	console.log('request name',req.body.name);
	console.log('request comment',req.body.comment);
	Post.findOne({_id:req.body.id},function(err,post){
		console.log('found post',post);
		var comment = new Comment({text:req.body.comment,name:req.body.name});
		console.log(comment);
		 comment._post = post._id;
		post.comments.push(comment);
		comment.save(function(err){
	post.save(function(err){
		if(err){
			console.log(err);
			res.render('index', {title: 'you have errors!', errors: comment.errors})
		}
		else{
			res.redirect('/');
		}
	})		
		})
	})
})

app.post('/comments/destroy',function(req,res){
	// console.log(Post);
	console.log(req.body.postid);
	Comment.findById(req.body.id,function(err,comment){
		console.log(comment);
		comment.remove();
		comment.save(function(err){
			if(err){
				console.log(err);
			}
			else {
				res.redirect('/');
			}
		})


	})
	

})



app.listen(8010, function() {
    console.log("listening on port 8010");
})



mongoose.connect('mongodb://localhost/messageBoard2016');


var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [4, 50],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'isAlphanumeric',
    passIfEmpty: true,
    message: 'Name should contain alpha-numeric characters only'
  })
];








var Schema=mongoose.Schema;




var postSchema = new mongoose.Schema({
 text: String, 
 comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
 name:{type:String, required: true, validate:nameValidator},
 created_at: {type: Date, default: new Date},
 modified_at:{type:Date}
});




var commentSchema = new mongoose.Schema({
 _post: {type: Schema.Types.ObjectId, ref: 'Post'},
 text: String, 
 created_at: {type: Date, default: new Date},
 name:{type:String, required: true, validate:nameValidator},
 modified_at:{type:Date}
});

postSchema.path('text').required(true, 'Post cannot be blank');
postSchema.path('name').required(true, 'Name cannot be blank');
commentSchema.path('name').required(true, 'Name cannot be blank');
commentSchema.path('text').required(true, 'You cant post a blank comment now can you?');



mongoose.model('Post',postSchema) // set the schema in our models as User
var Post = mongoose.model('Post');
console.log(Post);
// console.log(Post());



mongoose.model('Comment',commentSchema) // set the schema in our models as User
var Comment = mongoose.model('Comment');






