#!/usr/bin/env node

const {createBluetooth} = require('node-ble');
const {bluetooth, destroy} = createBluetooth();
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const args = process.argv.slice(2);
const hwmac = args[0]; // 00:12:92:08:18:E6
const primaryService = args[1]; // 25598cf7-4240-40a6-9910-080f19f91ebc
const characteristic = args[2]; // 9cf53570-ddd9-47f3-ba63-09acefc60415

if (!args.length || args.length !== 3) {
  console.error('You must supply valid arguments, ex: <hwmac> <primaryService> <characteristic>');
  process.exit(1);
}

async function shellExec(cmd) {
  const { stdout, stderr } = await exec(cmd);
  if (stderr) console.error(stderr);
  console.log(stdout);
}

async function connect() {
  const adapter = await bluetooth.defaultAdapter();
  if (! await adapter.isDiscovering());
  console.log('Trying to discover Griffin PowerMate');
  await adapter.startDiscovery().catch((err) => {
    console.log('Trying to discover Griffin PowerMate:', err.message);
  });

  const device = await adapter.waitDevice(hwmac);

  await device.connect().catch(async (err) => {
    console.log('Failed to connect to Griffin PowerMate');
    await connect(); // try to connect again...
  });

  if (device) {
    console.log('Griffin PowerMate connected');
  }

  return device;
}

(async () => {
  const device = await connect();
  const gattServer = await device.gatt();
  const volumeService = await gattServer.getPrimaryService(primaryService);
  const knob = await volumeService.getCharacteristic(characteristic);
  await knob.startNotifications();

  device.on('disconnect', async () => {
    console.warn('Griffin PowerMate has been disconnected, attempting to reconnect');
    await connect();
  });

  knob.on('valuechanged', async (buffer) => {
    let jsonBuffer = JSON.parse(JSON.stringify(buffer));
    switch (jsonBuffer.data[0]) {
      case 101:
        console.log('Toggle playback');
        await shellExec('xdotool key XF86AudioPlay');
        break;
      case 103:
        console.log('Volume down');
        await shellExec('xdotool key XF86AudioLowerVolume');
        break;
      case 104:
        console.log('Volume up');
        await shellExec('xdotool key XF86AudioRaiseVolume');
        break;
      case 114:
        console.log('Toggle mute');
        await shellExec('xdotool key XF86AudioMute');
        break;
    }
  })

})().catch(err => {
  console.error(err);
});
