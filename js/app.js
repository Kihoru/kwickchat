(function (window, $) {
	'use strict';

	const API_ROOT_URL 		= "http://greenvelvet.alwaysdata.net/kwick/api/";
	const $pseudoSignup 	= $('#pseudoSignup');
	const $mdpSignup 		= $('#passwordSignup');
	const $mdpOk 			= $('#mdpOkSignup');
	const $pseudo 			= $('#pseudo');
	const $password			= $('#password');
	const $sendSignup		= $('#sendSignup');
	const $send 			= $('#send');
	const $logout 			= $('#logout');
	const $pseudoConnect	= $('#pseudoConnect');
	const $chat				= $('#chat');
	const $formConnect 		= $('#formConnection');
	const $formLog			= $('#formLog');
	const $disconnect		= $('#disconnect');
	const $logged 			= $('#logged');
	const $sendTheMessage	= $('#sendTheMessage');
	const $messageToSend	= $('#messageToSend');
	const $sendBox 			= $('#sendBox');

	var token, user_id, status, pcw, pcwOk, login, pseudoLog, pcwLog, userId, token, test, pseudoFromS, mdpFromS, message, messageLogout;

	var tblMsg = [];

	var mdpokbool = false;

	function requestAPI	(url, cb) {
		var request = $.ajax({
			type: 'GET',
			url: API_ROOT_URL + url,
			dataType: 'jsonp'
		});

		request.fail(function(jqXHR, textStatus, errorTrown){
			cb(textStatus, null);
		});

		request.done(function(data){
			cb(null, data);
		});
	};
	function compareMdp	(mdp1, mdp2){
		if(mdp1.length <= 3){
			alert('Mot de passe trop court');
			mdpokbool = false;
		}
		if(mdp1.length >= 15){
			alert('Mot de passe trop long');
			mdpokbool = false;
		}
		if(mdp1 !== mdp2){
			alert('Erreur : Mots de passes différents');
			mdpokbool = false;
		}
		else{
			mdpokbool = true;
		}
	}
	var app = {
		initialize: function(){
			app.signup();
			app.login();
			app.logout(localStorage.token, localStorage.id);
			/*app.loggedUser();*/
		},
		signup: function(){

			$formConnect.on('submit', function(e){

				e.preventDefault();

				pcw = $mdpSignup.val();
				pcwOk = $mdpOk.val();
				login = $pseudoSignup.val();
				compareMdp(pcw, pcwOk);

				requestAPI('signup/' + login + '/' + pcw, function(err, data){
					if(err)
						throw new Error('noob');

					localStorage.setItem('pseudo', login);  

					console.log(data.result.status);
				});

				/*window.location.href = 'index.html';*/
			});
			
		},
		login:function(){
			$formLog.on('submit', function(e){

				e.preventDefault();
				pseudoLog = $pseudo.val();
				pcwLog = $password.val();

				requestAPI('login/' + pseudoLog + '/' + pcwLog, function(err, data){
					if(err)
						throw new Error('FAILURE');		

					status = data.result.status;

					console.log(status);	
					localStorage.setItem('token', data.result.token);
					localStorage.setItem('id', data.result.id);

					if(status === 'done'){
						window.location.href = 'chat.html';
					}	
				});
					


			});
		},
		logout:function(token, id){
			$disconnect.on('click', function(){
				requestAPI('logout/' + token + '/' + id, function(err, data){
					if(err)
						throw new Error('FAILURE');

					console.log(data.result.status);

					document.location.href = 'index.html';
				});
			});
		},
		loggedUser: function(token){
			
			requestAPI('user/logged/' + token, function(err, data){
				if(err)
					throw new Error('FAILURE');

				$logged.empty();
				$('#nb').empty();
				$('#nb').append(data.result.user.length);
				for(var i = 0; i < data.result.user.length; i++){
					$logged.append('<div class="logged">' + data.result.user[i] + '<div class="blue"></div></div>');
				}
			});
		},
		say: function(token, id, log){
			$sendBox.on('submit', function(e){
				e.preventDefault();
				message = $messageToSend.val();
			
				requestAPI('say/' + token + '/' + id + '/' + message, function(err, data){
					if(err)
						throw new Error('FAILURE');

					$('#messageToSend').val('');
					/*$chat.append('<div class="message"><span class="messageName>' + log + ' : </span>' + message);*/
				});
			});
		},
		messageList: function(token) {
			requestAPI('talk/list/' + token + '/' + 0, function(err, data){
				if(err)
					throw Error('FAILURE');
				$chat.empty();
				for(var j = 0; j < data.result.talk.length; j++){
					console.log(data.result.talk[j].user_name);
					$chat.append('<div class="message"><span class="messageName">' + data.result.talk[j].user_name + ' : </span> ' + data.result.talk[j].content + '</div>').scrollTop(-10*100000000000);
				}

			});
		}
	}
	window.app = app;

})(window, jQuery);