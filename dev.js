global.WebSocket = require('ws');
global.XMLHttpRequest = require('xhr2');
var DeviceHive = require('./devicehive.device');

var data = {
    power: 100,
    energy: 100 / 60
}
var data2 = {
    power: 0,
    energy: 0
}

var dh = new DeviceHive("http://playground.devicehive.com/api/rest", "virtual_esp8266", "FsJCDRAbjTO+5GA8b0nydWJvtHl4Nwc4wZqHnqM/+Gk=");

dh.registerDevice({
        guid: "virtual_esp8266",
        name: "virtual_esp8266",
        key: "virtual_esp8266", // obsolete but still required
        status: "Online",
        deviceClass: {
            name: "esp8266_device",
            version: "1.0.0",
        },
        equipment: [{
            name: "virtual_esp8266",
            type: "smart_meter",
            code: "smart_meter"
        }]
    },
    function(err, res) {
        if (err)
            console.log(err);
        else {
            dh.openChannel(function(err, res) {
                if (err)
                    console.log(err);
                else {
                    var SubCommands = {
                        names: ["gpio/write", "uart/int"]
                    };
                    var CmdSub = dh.subscribe(function(err, res) {
                        if (err)
                            console.log(err);
                        else
                            console.log('DEVICE SUBSCRIBES TO MASAGES ' + JSON.stringify(res));
                    }, SubCommands);
                    var relay = 'OFF';
                    var uart_state = 'OFF';
                    CmdSub.message(function(cmd) {
                        //console.log(cmd);
                        if (cmd.command == "gpio/write") {
                            if (relay == "OFF") {
                                relay = "ON";
                                console.log("RELAY ON");
                                cmd.update({
                                    "command": "gpio/write",
                                    "status": "OK",
                                    "result": {
                                        "message": "Relay in ON!"
                                    }
                                }, function(err, res) {
                                    if (err)
                                        console.log(err);
                                    else
                                        console.log("Command updated");
                                });
                            } else if (relay == "ON") {
                                relay = "OFF";
                                console.log("RELAY OFF");
                                cmd.update({
                                    "command": "gpio/write",
                                    "status": "OK",
                                    "result": {
                                        "message": "Relay in OFF!"
                                    }
                                }, function(err, res) {
                                    if (err)
                                        console.log(err);
                                    else
                                        console.log("Command updated");
                                });
                            }
                        }
                        if (cmd.command == 'uart/int') {
                            if (uart_state == 'OFF') {
                                uart_state = 'ON';
                                cmd.update({
                                    "command": "uart/int",
                                    "status": "OK",
                                    "result": {
                                        "message": "Start sending data!"
                                    }
                                }, function(err, res) {
                                    if (err)
                                        console.log(err);
                                    else
                                        console.log("Command updated");
                                });
                                setInterval(function() {
                                    if (relay == "ON") {
                                        dh.sendNotification("uart/int", data, function(err, res) {
                                            if (err)
                                                console.log(err);
                                            else
                                                console.log("uart/int notification sent!");
                                        });
                                    } else if (relay == "OFF") {
                                        dh.sendNotification("uart/int", data2, function(err, res) {
                                            if (err)
                                                console.log(err);
                                            else
                                                console.log("uart/int notification sent!");
                                        });
                                    }
                                }, 5000);
                            } else if (uart_state == 'ON')
                                cmd.update({
                                    "command": "uart/int",
                                    "status": "OK",
                                    "result": {
                                        "message": "UART is already sending data!"
                                    }
                                }, function(err, res) {
                                    if (err)
                                        console.log(err);
                                    else
                                        console.log("Command updated");
                                });
                        }
                    });
                }
            }, "websocket");
        }
    });
