// hello.js
var deployd = require('deployd')
  , options = {
  	port: 2403,
  	env: 'development'
  };

var dpd = deployd(options);

dpd.listen();