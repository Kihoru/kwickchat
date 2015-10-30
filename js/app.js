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

	var token, user_id, status, pcw, mdpCorrect,
	pcwOk, logine, pseudoLog, pcwLog, userId,
	token, pseudoFromS, mdpFromS, message,
	messageLogout, messageDone = false,
	messageListToAppend, max = 15, loadMore = false, mdpokbool = false, tblMsg = [];

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
				if(pcw.length <= 3 || pcw.length >= 15 || pcw !== pcwOk){
					mdpokbool = false;
					$('#errorSignup').removeClass('noError').addClass('error');
					$('#errorSignup').append('<p>Mot de passe incorrect</p>');
				}
				else if(pcw === pcwOk){
					console.log('dafuq');
					mdpokbool = true;
					mdpCorrect = pcw;
				}
				if(mdpokbool === true){
					requestAPI('signup/' + logine + '/' + mdpCorrect, function(err, data){
						if(err)
							throw new Error('noob');

						status = data.result.status;
						console.log(data.result);
						console.log(status);

						if(status === 'failure' && data.result.message == 'this login is not available'){
							$('#errorSignup').removeClass('noError').addClass('error');
							$('#errorSignup').append('<p>Login incorrect</p>');
						}	
						else if(status === 'done' && mdpokbool === true){
	            			window.location.href = 'index.html';
						}
					});
				}
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
					if(status === 'failure'){
						if(status === 'failure' && data.result.message == 'wrong password'){
							$('#errorSignup').removeClass('noError').addClass('error');
							$('#errorSignup').append('<p>Mot de passe incorrect</p>');
						}
						else if(status === 'failure' && data.result.message == 'user ' + pseudoLog + ' unknown'){
							$('#errorSignup').removeClass('noError').addClass('error');
							$('#errorSignup').append('<p>Utilisateur inconnu</p>');
						}
					}
					else if(status === 'done'){
						window.location.href = 'chat.html';
						setTimeout(function(){
							$('#chat').scrollTop(10*10000000);
						}, 2000);
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
				loadMore = false;
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
            if(loadMore === false){
            	$('#moreMsg').on('click', function(e){

            		e.preventDefault();
	            	loadMore = true;
	                max = max + 15;
	                $('#preloader').append('Chargements d\'anciens messages.');
	            	app.messageList(localStorage.token, max);
	            	$('#chat').scrollTop(-10*10000000);
            	});
            }
            //loadMoreer une div qui affiche en fadeIn/fadeOut des messages pour les deconnections
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


