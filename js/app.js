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

	var token, user_id, status, pcw, pcwOk, logine, pseudoLog, pcwLog, userId, token, test, pseudoFromS, mdpFromS, message, messageLogout, messageDone = false, messageListToAppend, max = 15, test = false;
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
		if(mdp1.length <= 3 || mdp1.length >= 15 || mdp1 !== mdp2){
			mdpokbool = false;
		}
		if(mdp1 === mdp2){
			mdpokbool = true;
		}
		return mdpokbool;
	}
	var app = {
		initialize: function(){
			app.logout(localStorage.token, localStorage.id);
		},
		signup: function(){

			$formConnect.on('submit', function(e){
				$('#errorSignup').removeClass('error').addClass('noError');
				$('#errorSignup').empty();
				e.preventDefault();
				pcw = $mdpSignup.val();
				pcwOk = $mdpOk.val();
				logine = $pseudoSignup.val();
				compareMdp(pcw, pcwOk);
					requestAPI('signup/' + logine + '/' + pcw, function(err, data){
						if(err)
							throw new Error('noob');
						  
						localStorage.setItem('done', messageDone);
						console.log(data.result);
						status = data.result.status;
						if(status === 'failure' && data.result.message == 'this login is not available'){
							$('#errorSignup').removeClass('noError').addClass('error');
							$('#errorSignup').append('<p>Login incorrect</p>');
						}
						if(mdpokbool == false){
							$('#errorSignup').removeClass('noError').addClass('error');
							$('#errorSignup').append('<p>Mot de passe incorrect</p>');
						}
						if(status === 'done'){
	            			window.location.href = 'index.html';
						}
					});
			});
			
		},
		login:function(){
			$formLog.on('submit', function(e){
				$('#errorSignup').removeClass('error').addClass('noError');
				$('#errorSignup').empty();
				e.preventDefault();
				pseudoLog = $pseudo.val();
				pcwLog = $password.val();

				requestAPI('login/' + pseudoLog + '/' + pcwLog, function(err, data){
					if(err)
						throw new Error('FAILURE');		

					status = data.result.status;

					console.log(status);
					console.log(data.result);
					localStorage.setItem('pseudo', pseudoLog);
					localStorage.setItem('token', data.result.token);
					localStorage.setItem('id', data.result.id);
					if(status === 'failure' && data.result.message == 'wrong password'){
						$('#errorSignup').removeClass('noError').addClass('error');
						$('#errorSignup').append('<p>Mot de passe incorrect</p>');
					}
					if(status === 'failure' && data.result.message == 'user ' + pseudoLog + ' unknown'){
						$('#errorSignup').removeClass('noError').addClass('error');
						$('#errorSignup').append('<p>Utilisateur inconnu</p>');
					}
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
				message = encodeURIComponent($messageToSend.val());
				
				requestAPI('say/' + token + '/' + id + '/' + message, function(err, data){
					if(err)
						throw new Error('FAILURE');

					$('#messageToSend').val('');
				});
			});
		},
		messageList: function(token, max) {
			requestAPI('talk/list/' + token + '/' + 0, function(err, data){
				if(err)
					throw Error('FAILURE');
				var mypseudo = localStorage.getItem('pseudo');
				$chat.empty();
					for(var j = data.result.talk.length - max; j < data.result.talk.length; j++){
						if(data.result.talk[j].user_name === mypseudo){
							$chat.append('<div class="messageFromMe"><span class="messageNameFromMe">Moi : </span> ' + data.result.talk[j].content + '</div>');
						}
						else{
							$chat.append('<div class="message"><span class="messageName">' + data.result.talk[j].user_name + ' : </span> ' + data.result.talk[j].content + '</div>');
						}
					}
					test = false;
	            	$('#preloader').empty();

			});
		},
		chatInit: function(){
			app.initialize();
            app.say(localStorage.token, localStorage.id, localStorage.logine);
            max = 15;
            app.loggedUser(localStorage.token);
            app.messageList(localStorage.token, max);
            setInterval(function(){
                app.loggedUser(localStorage.token); 
            }, 5000);
            if(test === false){
            	$('#moreMsg').on('click', function(e){

            		e.preventDefault();
	            	test = true;
	                max = max + 15;
	                $('#preloader').append('Chargements d\'anciens messages.');
	            	app.messageList(localStorage.token, max);
	            	$('#chat').scrollTop(-10*10000000);
            	});
            }
            setInterval(function(){
                app.messageList(localStorage.token, max);
            }, 1000);
            $("#chat").niceScroll({cursorwidth : "12px", cursorcolor: '#4780b1', cursoropacitymax: '0.7', background: 'url(../img/scroll.png)'});
            $("#logged").niceScroll({cursorwidth : "8px", cursorcolor: '#4780b1', cursoropacitymax: '0.9'});
            $('#goDown').on('click', function(){
                $('#chat').scrollTop(10*10000000);
            });
		}
	}
	window.app = app;

})(window, jQuery);


