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

var hbsBandTemplate = fs.readFileSync('./templates/event-detail.hbs').toString();
var hbsDayTemplate = fs.readFileSync('./templates/day-detail.hbs').toString();

var bandTemplate = Handlebars.compile(hbsBandTemplate);
var dayTemplate = Handlebars.compile(hbsDayTemplate);

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



// cleanup media and posts
rmDir('../src/templates/event-details');
rmDir('../src/templates/day-details');

//make folder
fs.mkdirSync('../src/templates/event-details', '0755');
fs.mkdirSync('../src/templates/day-details', '0755');

var parameterizeDate = function (date, time) {
  var newDate = date.split('/').join('') + time.split(':').splice(0,2).join('');

  return newDate;
}

var buildDayNav = function (data) {
  var newArray = [];

  for (var i in data) {
      var found = false;

      for (var j in newArray) {
          if (newArray[j].location === data[i].location) {
              found = true;
                var title = createSlug(data[i].name);
                var date = parameterizeDate(data[i].date, data[i].time);

                var o = {
                  link: title + '-' + date,
                  name: data[i].name,
                  time: data[i].time,
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
              {
                link: title + '-' + date,
                name: data[i].name,
                time: data[i].time,
              }
            ]

          }
          newArray.push(o);
      }
  }

  return newArray;
}

var extractYtVid = function (url) {
  var YtCode = url.split('=')[1];
  var media = 'http://www.youtube.com/embed/' + YtCode;

  return media;
}

var writeEventDetailPages = function (data) {
  var nav = buildDayNav(data);

  for (var i = 0; i < data.length; i++) {
    var title = createSlug(data[i].name);
    var date = parameterizeDate(data[i].date, data[i].time);
    var media = extractYtVid(data[i].media);

    var band = {
      name        : data[i].name,
      date        : data[i].date,
      day         : 18,
      image       : '',
      venue       : data[i].location,
      description : data[i].description,
      media       : media,
      nav         : nav
    }

     //compile template
     var compiledTemplate = bandTemplate({ 'band': band });

     //filename
     var fileName = title + '-' + date;

     //create file
     fs.writeFileSync('../src/templates/event-details/' + fileName + '.hbs', compiledTemplate);

  }
};

var findUnique = function (data) {
  var u = {}, a = [];
   for(var i = 0, l = data.length; i < l; ++i){

      if(u.hasOwnProperty(data[i].date)) {
         continue;
      }
      a.push(data[i].date);
      u[data[i].date] = 1;
   }
   return a;
};

var writeEventDayPages = function (data) {

  var nav = buildDayNav(data);
  var index = 1;

  var days = findUnique(data);


  for (var i = 0; i < days.length; i ++ ){
    var dayNo = i+1;
    var day = {
      dayNo : dayNo,
      nav: nav
    }

    //compile template
    var compiledTemplate = dayTemplate({ 'day': day });

    //filename
    var fileName = 'day-' + dayNo;
console.log(fileName)
    //create file
    fs.writeFileSync('../src/templates/day-details/' + fileName + '.hbs', compiledTemplate);
  }
}

var parseData = function (data) {

  writeEventDayPages(data);
  writeEventDetailPages(data);

};

Tabletop.init({
  key: key,
  callback: parseData,
  simpleSheet: true }
);



