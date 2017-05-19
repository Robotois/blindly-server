const Distance = require('robotois-distance-sensor');
const Button = require('robotois-button');

function Interval() {
    var timer = false;
    this.start = function (fn, time) {
        if (!this.isRunning())
            timer = setInterval(fn, time);
    };
    this.stop = function () {
        clearInterval(timer);
        timer = false;
    };
    this.isRunning = function () {
        return timer !== false;
    };
}

function Sensors() {
    this.rightInterval = false;
    this.centerInterval = false;
    this.leftInterval = false;

    this.distSensor1 = new Distance(1);
    this.distSensor2 = new Distance(2);
    this.distSensor3 = new Distance(3);

    this.button = new Button(4);
    this.button.enableEvents();
}

const sensorSockets = [];

Sensors.prototype.listenTo = function listenTo(namespace) {
  let rightCount = 0;
  let centerCount = 0;
  let leftCount = 0;
  let rightMsg = '';
  let centerMsg = '';
  let leftMsg = '';

  namespace.on('connection', (socket) => {
    for (const i in sensorSockets) {
      sensorSockets[i].socket.disconnect();
      delete sensorSockets[i];
    }

    sensorSockets.push({ id: socket.id, socket });

    console.log(`Socket ID: ${socket.id} connected to /sensors`);

    this.rightInterval = setInterval(() => {
      const value = this.distSensor1.getBasicValue();
      if(value > 50 && value <= 100){
        if(rightMsg != 'Derecha cerca' || rightCount >= 6){
          namespace.emit('right-alert', {message: 'Derecha cerca'});
          rightMsg = 'Derecha cerca';
          rightCount = 0;
        }else{
          rightCount++;
        }
      }
      if(value <= 50){
        if(rightMsg != 'Derecha muy cerca' || rightCount >= 4){
          namespace.emit('right-alert', {message: 'Derecha muy cerca'});
          rightMsg = 'Derecha muy cerca';
          rightCount = 0;
        }else {
          rightCount++;
        }
      }
    }, 1500);
    this.centerInterval = setInterval(() => {
      const value = this.distSensor2.getBasicValue();
      if(value > 50 && value <= 100){
        if(centerMsg != 'Enfrente cerca' || centerCount >= 6){
          namespace.emit('center-alert', {message: 'Enfrente cerca'});
          centerMsg = 'Enfrente cerca';
          centerCount = 0;
        }else{
          centerCount++;
        }
      }
      if(value <= 50){
        if(centerMsg != 'Enfrente muy cerca' || centerCount >= 4){
          namespace.emit('center-alert', {message: 'Enfrente muy cerca'});
          centerMsg = 'Enfrente muy cerca';
          centerCount = 0;
        }else{
          centerCount++;
        }
      }
    }, 1500);
    this.leftInterval = setInterval(() => {
      const value = this.distSensor3.getBasicValue();
      if(value > 50 && value <= 100){
        if(leftMsg != 'Izquierda cerca' || leftCount >= 6){
          namespace.emit('left-alert', {message: 'Izquierda cerca'});
          leftMsg = 'Izquierda cerca';
          leftCount = 0;
        }else {
          leftCount++;
        }
      }
      if(value <= 50){
        if(leftMsg != 'Izquierda muy cerca' || leftCount >= 4){
          namespace.emit('left-alert', {message: 'Izquierda muy cerca'});
          leftMsg = 'Izquierda muy cerca';
          leftCount = 0;
        }else {
          leftCount++;
        }
      }
    }, 1500);

    this.button.on('change', (state) => {
      if(state){
        namespace.emit('position-request',true);
      }
    });
  });
}

module.exports = Sensors;
