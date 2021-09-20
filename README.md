# Griffin PowerMate Bluetooth Controller

This software is for connecting your Griffin PowerMate
over BLE to your linux computer.
I provide no warranty for this software.
**I am not affiliated with Griffin Technology Inc. nor is this software.**

---

## Installation:
`npm i powermate-ble`

## Usage:
> You must pass in valid arguments. Postition 0 is the hardware MAC, 1 is the primaryService and 2 is the characteristic. (See example below)

`griffinBLE 00:12:92:08:18:E6 25598cf7-4240-40a6-9910-080f19f91ebc 9cf53570-ddd9-47f3-ba63-09acefc60415`

## Controls:
- Turn right - Volume up
- Turn left - Volume down
- Single click - Pause playpack
- Hold click - Mute volume

