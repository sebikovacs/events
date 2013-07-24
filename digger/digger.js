var Tabletop = require('tabletop');
var fs = require('fs');
var Handlebars = require('handlebars');
var moment = require('moment');

var key = "0AhwOls2FTsDFdFVWUjE1R2djOHVDS3N0bkpsdzdRZnc";

//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
Handlebars.registerHelper('dateFormat', function(context, block) {
  if (moment) {
    var f = block.hash.format || "";
    return moment(context).format(f);
  }else{
    return context;   //  moment plugin not available. return data as is.
  };
});

var hbsBandTemplate = fs.readFileSync('./templates/band.hbs').toString();
var bandTemplate = Handlebars.compile(hbsBandTemplate);

var rmDir = function(dirPath) {
  try { var files = fs.readdirSync(dirPath); }
  catch(e) { return; }
  if (files.length > 0)
  for (var i = 0; i < files.length; i++) {
    var filePath = dirPath + '/' + files[i];
    if (fs.statSync(filePath).isFile())
    fs.unlinkSync(filePath);
    else
    rmDir(filePath);
  }
  fs.rmdirSync(dirPath);
};
var createSlug = function (input) {
  function parameterizeMatch(value) {
    return value.replace(/ /, '-').replace(/\S+/g, function(character) {
      return character.toLowerCase();
    });
  }

  return input.replace(/(?:\w+ ?)/g, parameterizeMatch);
};

//MIKLOS GYÖRGY

// cleanup media and posts
rmDir('../src/templates/event-details');

//make folder
fs.mkdirSync('../src/templates/event-details', '0755');

var parameterizeDate = function (date, time) {
  var newDate = date.split('/').join('') + time.split(':').splice(0,2).join('');

  return newDate;
}

var buildNav = function (data) {
  var newArray = [];

  for (var i in data) {
      var found = false;

      for (var j in newArray) {
          if (newArray[j].location === data[i].location) {
              found = true;
                var title = createSlug(data[i].name);
                var date = parameterizeDate(data[i].date, data[i].time);

                var o = {
                  link: title + '-' + date
                };

                newArray[j].links.push(o)

              break;
          }
      }

      if (false === found) {
          var title = createSlug(data[i].name);
          var date = parameterizeDate(data[i].date, data[i].time);

          var o = {
            location: data[i].location,
            links : [
              {link: title + '-' + date}
            ]

          }
          newArray.push(o);
      }
  }

  return newArray;
}

var writeFiles = function (data) {
  var nav = buildNav(data);

  for (var i = 0; i < data.length; i++) {
    var title = createSlug(data[i].name);
    var date = parameterizeDate(data[i].date, data[i].time);
    var band = {
      name  :       data[i].name,
      date  :       data[i].date,
      day   :       18,
      image :       '',
      venue :       data[i].location,
      description : data[i].description,
      nav: nav
    }

     //compile template
     var compiledTemplate = bandTemplate({ 'band': band });

     //filename
     var fileName = title + '-' + date;

     //create file
     fs.writeFileSync('../src/templates/event-details/' + fileName + '.hbs', compiledTemplate);

  }
};


var parseData = function (data) {


  writeFiles(data);

};

Tabletop.init({
  key: key,
  callback: parseData,
  simpleSheet: true }
);



