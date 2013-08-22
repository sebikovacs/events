var sys = require('sys');
var fs = require('fs');
var exec = require('child_process').exec;
var child;

console.log('=========');
console.log(this);
console.log('=========');

var content = "exports.constants = {\n" +
    "name: '" + this.eventName + "',\n" +
	"key: '" + this.eventKey + "'\n" + 
    "};";

fs.writeFile('digger/constants.js', content, function(){
    // executes `pwd`
    child = exec("node digger/digger.js", function (error, stdout, stderr) {
      sys.print('stdout: ' + stdout);
      sys.print('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      console.log('done digging');
      
      //run grunt
      var smallChild = exec("grunt", function (error, stdout, stderr) {
          sys.print('stdout: ' + stdout);
          sys.print('stderr: ' + stderr);
          
          if (error !== null) {
            console.log('exec error: ' + error);
          }
          console.log('done assembling');
      });
    });
});


