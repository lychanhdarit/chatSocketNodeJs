var socket = io("https://lychanhdaric.herokuapp.com");
        //lắng nghe chat tất cả
		socket.on('server-send-data', function (data) {
			$("#list-msg").append("<li><b>"+data.us+"</b>: "+data.msg+"</li>");
        });
        //lắng nghe chat phòng
        socket.on('server-chat', function (data) {
			$("#list-msg").append("<li><b>"+data.us+"</b>: "+data.msg+"</li>");
        });

        socket.on('server-send-focusIn', function (data) { 
			$("#msg-box").html("<p><i>"+data+"</i></p>");
        });

        socket.on('server-send-focusIn-room', function (data) { 
			$("#msg-box").html("<p><i>"+data+"</i></p>");
        });

        socket.on('server-send-focusOut', function (data) {
			$("#msg-box").html("");
        });
        // lắng nghe đăng ký thất bại
        socket.on('server-send-register-fail', function () {
			alert("Đã có người đăng ký!");
        });
         // lắng nghe đăng ký thành công
         socket.on('server-send-register-success', function (data) {
			$("#loginForm").hide(2000);
            $("#chatForm").show(1000);
            $("#currentUser").html(data);

        });
        // lắng nghe danh sách online
        socket.on('server-send-list-user', function (data) {
            $("#list-user").empty();
            data.forEach(i => {
                $("#list-user").append("<li>"+i+" <small>online</small></li>");
            });
        });

        // lắng nghe danh sách room 
        socket.on('server-send-list-room', function (data) {
            $("#list-room").empty(); 
            data.forEach(i => { 
                    $("#list-room").append("<li class='room' onclick=\"joinRoom(\'"+i+"\')\"> "+i+"</li>");
            });
        });

        socket.on('server-send-room-socket', function (data) {
            $("#currentRom").html("Message phòng: "+data);
            $("#hiddenPhong").val(data);
        });

        function joinRoom(room){
            var phong = $("#hiddenPhong").val();//
            socket.emit('client-leave-room',phong);
            socket.emit('client-create-room',room);
        }
		$(document).ready(function(){
            $("#loginForm").show();
            $("#chatForm").hide();

            $("#btnReg").click(()=>{
				socket.emit('client-register',$("#txtname").val());
            });

            $("#btnLogOut").click(()=>{
                socket.emit('client-logout');
                $("#loginForm").show(1000);
                $("#chatForm").hide(2000);
            });

			$("#txtMessage").keyup(function(event) {
				if(event.keyCode === 13) {
                    $("#btn").click();
                    socket.emit('client-focusOut-text');
                }
                var textMsg = $("#txtMessage").val();
                if(textMsg.length >0)
                {
                    var phong = $("#hiddenPhong").val();//client-leave-room
                    if(phong.length>0)
                    {
                        socket.emit('client-focusIn-room'); 
                    }
                    else{
                        socket.emit('client-focusIn-text');
                    }
                   
                }
            }); 
            
            $("#txtMessage").focusout(function() {
                socket.emit('client-focusOut-text');
            }); 

            $("#txtname").keyup(function(event) {
				if(event.keyCode === 13) {
					$("#btnReg").click();
				}
            });    
            $("#txtRoom").keyup(function(event) {
				if(event.keyCode === 13) {
					$("#btnTaoRoom").click();
				}
            });    
            //Gửi tin nhắn
			$("#btn").click(()=>{
                var phong = $("#hiddenPhong").val();//client-leave-room
                if(phong.length>0)
                {
                     //Chat room
                    socket.emit('client-chat',$("#txtMessage").val());   
                }
                else{
                    //All chat all
                    socket.emit('client-send-data',$("#txtMessage").val());
                }
				$("#txtMessage").val("");
            });

            $("#btnTaoRoom").click(()=>{
				socket.emit('client-create-room',$("#txtRoom").val());
            });
            
		});