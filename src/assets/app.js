$(document).ready(function () {
  var loggedin = false;
  var user = null;
  var key = null;

  dpd.users.me(function (result, error) {
    if (result && typeof result == 'object') {
      loggedin = true;
      user = result;
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
        location.reload();
      } else {
        console.log(error)
      }

		})
	});

	$('#sign-out').on('click', function (e) {
		e.preventDefault();
		dpd.users.logout(function (result, error) {
      console.log('Log out');
      console.log(result)
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

	$('#submit-event').on('click', function (e) {
		e.preventDefault();
    var eventName = $(this).parent().find('input.event-name').val();

    var userObj = {
      id: user.id,
      eventName: eventName,
      eventKey: key
    }

    dpd.users.put(userObj, function (result, error) {
      console.log('put this shit on')
      console.log(result);
      console.log(error)
    });
	});


});
