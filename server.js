
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

var controlArray;


var i, howManyTimes, time;
var status = 1;
socket.on('chat', function (data) {
	console.log(data);
	time = data.estimatedTime;
	controlArray = data.cycles;
	howManyTimes = controlArray.length;
	i = 0;
	console.log("-------------Start-------------");
	f();
});

socket.on('radioListen', function (data) {
	console.log(data);
	radioListen();
});

/*[ [ { dest: '00000800122', crt: '0000000212' },
{ dest: '00000801221', crt: '0000000001' } ],
[ { dest: '00000801221', crt: '0000000002' } ] ]*/

function f() {
	var obj = controlArray[i];
	sendNode(obj);
	i++;
	if( i < howManyTimes){
		setTimeout( f, time * 1000 );
	}
}
var nexts;
var item;
function sendNode(obj) {
	console.log("send");
	each(obj, function(el, next) {
		nexts = next;
		item = el;
		setTimeout(sendMessage, 1000);

	}, function (err) {
		console.log('finished');
	});

}


console.log("Run client!!!");


//define the routes from the external file
function sendMessage(){
	console.log(item.dest);
	console.log(item.crt);
	exec.execFile('./remote', [item.dest, item.crt]
		,function (error, stdout) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				var state = stdout.split('Got this response ')[1].split('.')[0];
				console.log(item);
				nexts();
				console.log("-------------////--------------");
			} else {
				socket.emit('updateNode', 1);		
			} 
		});
}

function radioListen(){
	exec.execFile('./wait', ['abc']
		,function (error, stdout) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				var state = stdout.split('Got this response ')[1].split('.')[0];
				console.log("-------------////--------------");
			} else {
				socket.emit('updateNode', 1);		
			} 
		});
}