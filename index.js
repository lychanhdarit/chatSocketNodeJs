var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views","./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT||8000,()=>{console.log("App running...");});

io.on("connection",(socket)=>{
	console.log("co ket noi: "+socket.id);
	
	socket.on("Client-send-data",(data)=>{
		console.log(socket.id+": "+ data);
		io.sockets.emit("Server-send-data",data);
	});
	
	
	socket.on("disconnect",()=>{
		console.log(socket.id+": ngat ket noi!");
	});
});

app.get("/",function(req,res){
	res.render("trangchu");
});
