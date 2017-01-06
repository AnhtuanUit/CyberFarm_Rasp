
exec = require('child_process');
async = require('async');
var each = require('async-each-series');
//socket client.js
var io = require('socket.io-client');
//var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzllOWJhMzcxNzgxMWUwMjA3NTI1OGIiLCJ1c2VybmFtZSI6InR1YW4iLCJhdmF0YXIiOiJmZW1hbGUucG5nIiwiaWF0IjoxNDcwMDEzMDU0fQ.wb5Vv6pJc9HVF_YKkZLYHi0zT3EebAMIQz0apobDQq0';

var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ODY0YmM4YTJlYzM3YzFjNThhM2Y1YmEiLCJhdmF0YXIiOiJodHRwOi8vd3d3LnRoZWdhbWVlbmdpbmVlci5jb20vYmxvZy93cC1jb250ZW50L3VwbG9hZHMvMjAxMi8wMy9lbmdpbmVlci5wbmciLCJpYXQiOjE0ODI5OTc3NTR9.Atj__D6ffc0Cu5gfK5wxAuuyCkBs99gEr5wsgmdQML4';
var socket = io.connect('http://192.168.1.16:3000?token=' + token, {reconnect: true});

var ackTuoi = -2, ackDoAm = -2;

var message ;

var status = 1;
socket.on('chat', function (data) {
	console.log(data);
	console.log("-------------Start-------------");

	var time = data.estimatedTime;
	var cycels = data.cycles;

	sendCycle(cycels, time);
});

socket.on('radioListen', function (data) {
	console.log(data);
	radioListen();
});

/*[ [ { dest: '00000800122', crt: '0000000212' },
{ dest: '00000801221', crt: '0000000001' } ],
[ { dest: '00000801221', crt: '0000000002' } ] ]*/

var next_1, next_2;
var cycle;
var firstTime = true;
console.log("Run client!!!");


function sendCycle(cycels, _time;) {
	console.log("send cycle");
	var time;
	each(cycels, function(item, next) {
		if(firstTime){
			time = 0;
		} else {
			time = _time;
		}
		next_1 = next;
		cycle = item;
		console.log(time);
		setTimeout(sendNode, time * 1000 );
	}, function (err) {
		console.log('Finish cycle');
	});
}

function sendNode() {
	firstTime = false;
	console.log("send crt");
	each(cycle, function(item, next) {
		next_2 = next;
		sendMessage(item);
	}, function (err) {
		next_1();
		console.log('finished control');
	});

}


function sendMessage(control){
	console.log(control.dest);
	console.log(control.crt);
	socket.emit('updateNode', {
		isError: false,
		control: control
	});	
	exec.execFile('./remote', [control.dest, control.crt]
		,function (error, stdout) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				var state = stdout.split('Got this response ')[1].split('.')[0];
				console.log(state);
				socket.emit('updateNode', {
					isError: false,
					control: state
				});	
				next_2();
			} else {
				socket.emit('updateNode', {
					isError: true,
					control: control
				});	
				next_2();	
			} 
		});
}

function radioListen(){
	exec.execFile('./wait', ['abc']
		,function (error, stdout) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				var state = stdout.split('Got this response ')[1].split('.')[0];
				var info = {
					isUser: false,
					MAC: state.substring(2 ,6),
					type: 2
				};
				socket.emit('acceptJoin', info);	
				console.log("-------------////--------------");
			} else {
				//socket.emit('acceptJoin', state);		
			} 
		});
}
/* {
                isUser: true,
                acceptJoin: true,
                MAC: 120,
                type: 2 
            } */