var eventData = require('./constants.js')
var Tabletop = require('tabletop');
var path = require('path');
var fs = require('fs');
var Handlebars = require('handlebars');
var moment = require('moment');

console.log('------------')
console.log('eventData');
console.log(eventData.constants.key);
console.log('------------')

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

var hbsBandTemplate = fs.readFileSync(__dirname + '/templates/event.hbs').toString();
var hbsDayTemplate = fs.readFileSync(__dirname + '/templates/day.hbs').toString();

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

var cwd = __dirname.split(path.sep);
cwd.splice(cwd.length - 1, 1)
cwd = cwd.join();

var outputDirectoryName = cwd;
var outputDirectory = cwd + '/';

// cleanup assemble template files
rmDir(outputDirectoryName);

//make folders
fs.mkdirSync(outputDirectoryName, '0755');

var parameterizeDate = function (date, time) {

  var newDate = new Date(date);
  var splitTime = time.split(':');

  newDate.setHours(splitTime[0]);
  newDate.setMinutes(splitTime[1]);
  newDate = moment(newDate).format('YYYY-MM-DD-HH-mm');

  return newDate;
}

var buildGigsNav = function (data) {
  var newArray = [];

  for (var i in data) {
      var found = false;

      for (var j in newArray) {
          if (newArray[j].location === data[i].location && newArray[j].date === data[i].date) {
              found = true;
                var title = createSlug(data[i].name);
                var date = parameterizeDate(data[i].date, data[i].time);

                var o = {
                  link: date + '-' + title  ,
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
            date: data[i].date,
            links : [
              {
                link: date + '-' + title,
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

var buildDaysNav = function (data) {
  //create 2 different left side navs
  var daysArr = findUnique(data);
  var days = [];


  for (var i = 0; i < daysArr.length; i++) {
    var index = i + 1,
        obj;

    obj = {
      linkHref: 'day-' + index,
      linkText: 'Day ' + index
    }

    obj = {
      linkHref: 'day-' + index,
      linkText: 'Day ' + index
    }



    days.push(obj);

  }

  return days;

}

var extractYtVid = function (url) {
  var YtCode = url.split('=')[1];
  var media = 'http://www.youtube.com/embed/' + YtCode;

  return media;
}

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

var filterGigsByDate = function (gigsNav, date) {
  var fiteredGigsNav = [];

  for (var j = 0; j < gigsNav.length; j++) {
    if(gigsNav[j].date == date){
      fiteredGigsNav.push(gigsNav[j]);
    }
  }

  return fiteredGigsNav;
}

var writeEventDetailPages = function (data) {
  console.log('Write event detail pages...')
  var gigsNav = buildGigsNav(data);
  var daysNav = buildDaysNav(data);
  var dateCache;
  var dayNo = 0;

  for (var i = 0; i < data.length; i++) {
    var title = createSlug(data[i].name);
    var date = parameterizeDate(data[i].date, data[i].time);
    var media = extractYtVid(data[i].media);
    var filteredGigs = filterGigsByDate(gigsNav, data[i].date);

    //calculate day number
    if (!dateCache || dateCache != data[i].date) {
      dateCache = data[i].date;
      dayNo++;
    }

    var band = {
      name        : data[i].name,
      date        : data[i].date,
      dayNo       : dayNo,
      image       : '',
      venue       : data[i].location,
      description : data[i].description,
      media       : media,
      gigsNav     : filteredGigs,
      daysNav     : daysNav,
      gigsNavTmpl: '{{> gigsnav}}',
      daysNavTmpl: '{{> daysnav}}',
      descriptionTmpl: '{{> description}}'
    }


     //compile template
     var compiledTemplate = bandTemplate({ 'band': band });

     //filename
     var fileName = date + '-' + title;

     //create file
     fs.writeFileSync(outputDirectory + fileName + '.hbs', compiledTemplate);
  }
  console.log('OK')
};

var writeEventDayPages = function (data) {
  console.log('Writing Event Day pages...')
  var gigsNav = buildGigsNav(data);
  var daysNav = buildDaysNav(data);

  var index = 1;

  var days = findUnique(data);

  for (var i = 0; i < days.length; i ++ ){
    var dayNo = i+1;
    var fiteredGigsNav = filterGigsByDate(gigsNav, days[i]);

    var day = {
      date        : days[i],
      dayNo       : dayNo,
      gigsNav     : fiteredGigsNav,
      daysNav     : daysNav,
      gigsNavTmpl: '{{> gigsnav}}',
      daysNavTmpl: '{{> daysnav}}'
    }

    //compile template
    var compiledTemplate = dayTemplate({ 'day': day });

    //filename
    var fileName = 'day-' + dayNo;

    //create file
    fs.writeFileSync(outputDirectory + fileName + '.hbs', compiledTemplate);
  }
  console.log('OK')
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



