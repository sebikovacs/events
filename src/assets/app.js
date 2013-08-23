$(document).ready(function () {
  var loggedin = false;
  var user = null;
  var key = null;

  dpd.users.me(function (result, error) {

    if (result && typeof result == 'object') {

      loggedin = true;
      user = result;

      var signInText = $('.signed-in');
      signInText.show().find('.username').html(user.username);
      $('#sign-out').show();
      $('.account').show();
      $('.buttons a.sign-up').hide();
      $('.buttons a.sign-in').hide();

    } else {
      $('#sign-out').hide();
      $('.signed-in').hide();
      $('.account').hide();
      $('.buttons a.sign-up').show();
      $('.buttons a.sign-in').show();
    }
  });

	$('#sign-up').on('click', function (e) {
		e.preventDefault();
		var email = $(this).parent().find('input[type=email]').val();
		var password = $(this).parent().find('input[type=password]').val();

		var data = {
			username: email,
			password: password
		}

		dpd.users.post(data, function (result, error) {
			console.log(result)
      console.log(error)
		})

	});

	$('#sign-in').on('click', function (e) {
  	e.preventDefault();

  	var email = $(this).parent().find('input[type=email]').val();
  	var password = $(this).parent().find('input[type=password]').val();

  	var data = {
  		username: email,
  		password: password
  	}
  	dpd.users.login(data, function (result, error) {

      if (!error) {
        window.location = 'file:///media/D/dev/events/dist/account.html';
      } else {
        console.log(error)
      }

		})
	});

	$('#sign-out').on('click', function (e) {
		e.preventDefault();
		dpd.users.logout(function (result, error) {

      if (!error) {
        location.reload();
      }
    })
	});

  $('.key').on('paste', function () {
    var el = this;
    setTimeout(function () {

      key = $(el).val().split('?');
      key = key[1].split('=');
      key = key[1].split('&')[0];

    }, 100);
  });

	$('#create-event').on('click', function (e) {
		var eventName;
    e.preventDefault();
    eventName = $(this).parent().find('input.event-name').val();
    eventName = eventName.toLowerCase().replace(/\s+/g, '-');

    // var userObj = {
    //   id: user.id,
    //   eventName: eventName,
    //   eventKey: key
    // }

    // dpd.users.put(userObj, function (result, error) {

    //   if (!error) {
    //     setTimeout(function() {
    //       window.location = 'file:///media/D/dev/events/dist/' + userObj.eventName + '/day-1.html';
    //     }, 6000);
    //   }

    // });
	});


});
