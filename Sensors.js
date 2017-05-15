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
  namespace.on('connection', (socket) => {
    for (const i in sensorSockets) {
      sensorSockets[i].socket.disconnect();
      delete sensorSockets[i];
    }

    sensorSockets.push({ id: socket.id, socket });

    console.log(`Socket ID: ${socket.id} connected to /sensors`);

    socket.on('join-alerts', () => {
      socket.join('alerts');
      console.log(`Socket ID: ${socket.id} subscribed to alerts`);
      this.rightInterval = setInterval(() => {
        const value = this.distSensor1.getBasicValue();
        if(value > 50 && value <= 100){
          namespace.to('alerts').emit('right-alert', {message: 'Objeto cerca a la derecha'});
        }
        if(value <= 50){
          namespace.to('alerts').emit('right-alert', {message: 'Objeto muy cerca a la derecha'});
        }
      }, 5000);
      this.centerInterval = setInterval(() => {
        const value = this.distSensor2.getBasicValue();
        if(value > 50 && value <= 100){
          namespace.to('alerts').emit('center-alert', {message: 'Objeto cerca al frente'});
        }
        if(value <= 50){
          namespace.to('alerts').emit('center-alert', {message: 'Objeto muy cerca al frente'});
        }
      }, 5000);
      this.leftInterval = setInterval(() => {
        const value = this.distSensor3.getBasicValue();
        if(value > 50 && value <= 100){
          namespace.to('alerts').emit('left-alert', {message: 'Objeto cerca a la izquierda'});
        }
        if(value <= 50){
          namespace.to('alerts').emit('left-alert', {message: 'Objeto muy cerca a la izquierda'});
        }
      }, 5000);
    });

    socket.on('join-position-request', () => {
      socket.join('position-request');
      // console.log(`Socket ID: ${socket.id} subscribed to position requests`);
      this.button.on('change', (state) => {
        if(state){
          namespace.to('position-request').emit('position-request',true);
        }
      });
    });
  });
}

// Sensors.prototype.listenButton = function () {
//   this.button.on('change', (state) => {
//     if(state){
//       this.myNamespace.to('position-request').emit('position-request',true);
//     }
//   });
//
// }
//
// Sensors.prototype.alerts = function alerts(value, close, veryClose, alertName, alertMsg) {
//   // console.log(value);
//   switch (true) {
//     case (value <= 50): // Objeto a menos de 50 cm a la derecha
//       if(!veryClose.isRunning()) { // ya hay una notificacion ejecutandose
//         // console.log(`Objeto muy cerca por ${alertMsg}`);
//         this.myNamespace.to('alerts').emit(alertName, {message: `Objeto muy cerca por ${alertMsg}`});
//         veryClose.start(() => {
//           // console.log(`Objeto muy cerca por ${alertMsg}`);
//           this.myNamespace.to('alerts').emit(alertName, {message: `Objeto muy cerca por ${alertMsg}`});
//         }, 5000);
//       }
//       if(close.isRunning()){
//         close.stop();
//       }
//       break;
//     case (value <= 100):
//       if(!close.isRunning()) { // ya hay una notificacion ejecutandose
//         // console.log(`Objeto cerca por ${alertMsg}`);
//         this.myNamespace.to('alerts').emit(alertName, {message: `Objeto cerca por ${alertMsg}`});
//         close.start(() => {
//           // console.log(`Objeto cerca por ${alertMsg}`);
//           this.myNamespace.to('alerts').emit(alertName, {message: `Objeto cerca por ${alertMsg}`});
//         }, 8000);
//       }
//       if(veryClose.isRunning()){
//         veryClose.stop();
//       }
//       break;
//     default:
//       setTimeout(() => {
//         if(close.isRunning()){
//           close.stop();
//         }
//         if(veryClose.isRunning()){
//           veryClose.stop();
//         }
//       }, 5000);
//   }
// }

module.exports = Sensors;
