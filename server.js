
exec = require('child_process');
async = require('async');
var each = require('async-each-series');
//socket client.js
var io = require('socket.io-client');
var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ODY0YmM4YTJlYzM3YzFjNThhM2Y1YmEiLCJhdmF0YXIiOiJodHRwOi8vd3d3LnRoZWdhbWVlbmdpbmVlci5jb20vYmxvZy93cC1jb250ZW50L3VwbG9hZHMvMjAxMi8wMy9lbmdpbmVlci5wbmciLCJpYXQiOjE0ODQ1MzMyMDB9.nDQDeDuxUNokFidOG2da5OIWM8ksnu1vzgaIxloY91E';

//var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ODc4YTgwMjVlNzE0YjIwZDA4ZWI3ZjkiLCJpYXQiOjE0ODQzNzEzNjR9.9Z-9FxAfXfI8dI7CAy1dTsdRbhwB13r5TRnBZuMfChY';
//var socket = io.connect('http://192.168.1.13:3000?token=' + token, {reconnect: true});
var socket = io.connect('https://mysterious-harbor-27480.herokuapp.com?token=' + token, {reconnect: true});

var ackTuoi = -2, ackDoAm = -2;

var message ;
var firstTime;
var status = 1;
var cycleLength = 0, dem = 0;

socket.on('chat', function (data) {
	console.log(data);
	console.log("-------------Start-------------");

	var cycels = data.cycles;
	dem = 0;
	firstTime = true;
	sendCycle(cycels);
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
console.log("Run client!!!");

var time;
function sendCycle(cycels) {
	console.log("send cycle");
	cycleLength = cycels.length;
	 	
	each(cycels, function(item, next) {

		if(firstTime){
			time = 0;
		} else {
			time = item[0].crt.substring(4, 8);
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
		dem++;
		console.log(dem);
		console.log(cycleLength);
		if(dem == cycleLength){
			
			setTimeout(function () {
				socket.emit('updateNode', {
					isError: false,
					control: {
						dest: '0001200080',
						crt:  '0000000012'
					}
				});	
			}, time * 1000 );
		}
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
				var dest = stdout.split('Got this response ')[1].split('.')[1];
				var crt = stdout.split('Got this response ')[1].split('.')[2];

				console.log(dest);
				console.log(crt);
				socket.emit('updateNode', {
					isError: false,
					control: {
						dest: dest,
						crt: crt
					}
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
	setTimeout(function () {
		socket.emit('acceptJoin', false, '0130', 2); 
	}, 3 * 1000 );
	
/*	exec.execFile('./wait', ['abc']
		,function (error, stdout) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				var state = stdout.split('Got this response ')[1].split('.')[0];
				var info = {
					isUser: false,
					MAC: state.substring(2 ,6),
					type: 2
				};
				console.log(state);
				socket.emit('acceptJoin', false, state.substring(2 ,6), 2);	
				console.log("-------------////--------------");
			} else {
				//socket.emit('acceptJoin', state);		
			} 
		});*/
	}
/* {
                isUser: true,
                acceptJoin: true,
                MAC: 120,
                type: 2 
            } */