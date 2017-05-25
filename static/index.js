(function(){

var button1on = $('button#button-1-on');
var button1off = $('button#button-1-off');
var button2on = $('button#button-2-on');
var button2off = $('button#button-2-off');

var commandOff = 0;
var commandOn = 1;
var target1 = 0;
var target2 = 1;

function controlLight(command, target) {
  var content = { command: command, target: target };
  $.ajax({
    type: "POST",
    url: '/control/light',
    data: JSON.stringify(content),
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    async: false,
    success: function(msg) {
      console.log(msg)
    }
  });
}

button1on.on('click', function(e) {
  controlLight(commandOn, target1);
})

button1off.on('click', function(e) {
  controlLight(commandOff, target1);
})

button2on.on('click', function(e) {
  controlLight(commandOn, target2);
})

button2off.on('click', function(e) {
  controlLight(commandOff, target2);
})

})();