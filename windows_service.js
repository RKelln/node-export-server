// Install or uninstall highcharts chart export server:
//
//  > node windows_service [install]
//  - installs service, "install" is the default and is optional
//
//  > node windows_service uninstall
//  - uninstalls service
//
// See https://github.com/coreybutler/node-windows

var name = 'HighCharts Export Server';
var host = '127.0.0.1';
var port = '3003';
var scriptOptions = '--enableServer 1 --host '+host+' --port '+port+' --styledMode 1';


var cmd = 'install';

if (process.argv[2]) {
	cmd = process.argv[2];
}

var Service = require('node-windows').Service;
var EventLogger = require('node-windows').EventLogger;

var log = new EventLogger('HighCharts Export Server Service');

// Create a new service object
var svc = new Service({
 	name: name,
 	description: 'The nodejs highcharts export server.',
 	script: require('path').join(__dirname, 'bin', 'cli.js'),
 	scriptOptions: scriptOptions
});

// HACK/workaround for errors starting/uninstalling:
// https://github.com/coreybutler/node-windows/issues/85
svc.user.account = 'dummy';
svc.user.password = 'dummy';

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
	log.info(name + " installed with options: " + scriptOptions);
	console.log("Service installed. Starting with options: " + scriptOptions);
 	svc.start();
 	console.log("Service started. Confirm by using 'Start > Run > services.msc' and checking " + name);
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function() {
	if (svc.exists) {
		log.info(name + " uninstall failed");
	  	console.log('Uninstall failed.');
	} else {
		log.info(name + " uninstalled");
	  	console.log('Uninstall complete.');
	}
});

// Just in case this file is run twice.
svc.on('alreadyinstalled',function(){
  console.log('This service is already installed.');
});


svc.on('start', function(){
  	log.info(name + ' started.');
});

svc.on('stop', function(){
 	log.info(name + ' stopped.');
});

svc.on('error', function(e){
	log.error(name + ' error: ' + e);
});


switch (cmd) {
	case 'install':
		if (svc.exists) {
			console.log(name + ' already exists');
		} else {
			svc.install();
		}
		break;
	case 'uninstall':
		if (svc.exists) {
			svc.uninstall();
		} else {
			console.log(name + " doesn't exist");
		}
		break;
	case 'start':
		svc.start();
		break;
	case 'stop':
		svc.stop();
		break;
	default:
		console.log('Unsupport command: ' + cmd);
}

