var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views","./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT||8000);

var dataUser=[];

io.on("connection",(socket)=>{
	console.log("- New conection website.!!!");
    
    //lắng nghe tin nhắn
	socket.on("client-send-data",(data)=>{
        console.log(socket.id+": "+ data);
        //io.sockets.emit trả cho tất cả
		io.sockets.emit("server-send-data",{us:socket.username,msg:data});
	});
    //lắng nghe tin nhắn theo phong
	socket.on("client-chat",(data)=>{
        console.log(socket.id+": "+ data);
        //io.sockets.in gửi theo room/socket
        io.sockets.in(socket.roomName).emit("server-chat",{us:socket.username,msg:"<i style='color:#007793'>"+data+"</i>"});
        
      
	});
    //Lắng nghe đăng ký
    socket.on("client-register",(data)=>{
        if(dataUser.indexOf(data)>=0){
            //Thất bại
            //sockets.emit chỉ trả cho socket hiện tại
            socket.emit("server-send-register-fail");
            console.log("Username: "+data+" register exits.!!!");
        }
        else{
            //Thành công thêm vào mảng
            dataUser.push(data);
            socket.username = data;//tự định nghĩa thêm username
            socket.emit("server-send-register-success",data);
            console.log("Username: "+data+" register success.!!!");
        }
        io.sockets.emit("server-send-list-user",dataUser);
        
        var dataRoom=[];
        for (r in socket.adapter.rooms) {
            dataRoom.push(r);
        }

        io.sockets.emit("server-send-list-room",dataRoom);
    });
    
    //lắng nghe focus all
	socket.on("client-focusIn-text",(data)=>{
        //Xóa trong mảng
        dataUser.splice(dataUser.indexOf(socket.username,1)); 
        //Phát cho hàng xóm trừ mình
        socket.broadcast.emit("server-send-focusIn",socket.username+" đang gõ...");
     });
     //lắng nghe focus room
	socket.on("client-focusIn-room",(data)=>{
        //Xóa trong mảng
        dataUser.splice(dataUser.indexOf(socket.username,1)); 
        //Phát cho hàng xóm trừ mình
        io.sockets.in(socket.roomName).emit("server-send-focusIn-room",socket.username+" đang gõ...");
     });
    //lắng nghe focus
    socket.on("client-focusOut-text",(data)=>{
        //Xóa trong mảng
        dataUser.splice(dataUser.indexOf(socket.username,1)); 
        //Phát cho hàng xóm trừ mình
        socket.broadcast.emit("server-send-focusOut",socket.username+" đang gõ");
    });

    //lắng nghe logout
	socket.on("client-logout",(data)=>{
       //Xóa trong mảng
       dataUser.splice(dataUser.indexOf(socket.username,1)); 
       //Phát cho hàng xóm trừ mình
       socket.broadcast.emit("server-send-list-user",dataUser);
    });

    //lắng nghe tạo room
    socket.on("client-leave-room",(data)=>{

        socket.leave(data); 
        console.log("leave room: "+data+"!");
        var dataRoom=[];
        for (r in socket.adapter.rooms) {
            dataRoom.push(r);
        }

        io.sockets.emit("server-send-list-room",dataRoom);
        socket.emit("server-send-room-socket",data);
        //console.log(socket.adapter.rooms);//Log list rooom
     });

	socket.on("client-create-room",(data)=>{
        socket.join(data);
        socket.roomName = data;
        console.log("Created room: "+data+"!");
        var dataRoom=[];
        for (r in socket.adapter.rooms) {
            dataRoom.push(r);
        }

        io.sockets.emit("server-send-list-room",dataRoom);
        socket.emit("server-send-room-socket",data);
        //console.log(socket.adapter.rooms);//Log list rooom
     });
    
    //Ngắt kết nối
	socket.on("disconnect",()=>{
        if(socket.username)
        {
            console.log(socket.username+": Disconnect!");
            io.sockets.emit("server-send-list-user",dataUser);
        }
        else{
            console.log(socket.id+": Disconnect!"); 
            //Phát cho hàng xóm trừ mình
            io.sockets.emit("server-send-list-user",dataUser);
        }
       
        
	});
});

app.get("/",function(req,res){
	res.render("index");
});
