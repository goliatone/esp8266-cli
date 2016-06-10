# An ESP8266 command line interface.

Flash [NodeMcu firmware](https://github.com/nodemcu/nodemcu-firmware) on a ESP8266 board, administer the file system and more.

**Currently only Mac OS is fully supported.**

<!--
>Noun	1.	E.S.P. - apparent power to perceive things that are not present to the sensesE.S.P. - apparent power to perceive things that are not present to the senses
clairvoyance, ESP, extrasensory perception, second sight
parapsychology, psychic phenomena, psychic phenomenon - phenomena that appear to contradict physical laws and suggest the possibility of causation by mental processes
foreknowledge, precognition - knowledge of an event before it occurs

https://vault.fbi.gov/Extra-Sensory%20Perception
http://skepdic.com/esp.html

https://github.com/nodemcu/nodemcu-firmware/issues/241
http://www.lua.org/manual/5.1/luac.html
-->

## Prerequisites

This module depends on SiLabs USB to UART bridge drivers. If you don't have them already installed, here you can find and [download][silabs] the driver.

**Note that after installing the drivers you will have to restart your computer**.

Currently it assumes that you have Python and [pip][pip] installed.

## Install

```
$ npm i -g node-esp
```

After installing or any time after upgrading the module, you have to set the name of the serial port we will use to communicate with the hardware.

This should list all available ports:

```
$ esp port list
┌────────────────────────────────────────┬────────────────────────────────────────┐
│ Port Name                              │ Manufacturer                           │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ /dev/cu.Bluetooth-Incoming-Port        │                                        │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ /dev/cu.Bluetooth-Modem                │                                        │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ /dev/cu.gPhone                         │                                        │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ /dev/cu.SLAB_USBtoUART                 │ Silicon Labs                           │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

The last one is the SiLabs driver we installed, so, to set it:

```
$ esp port set /dev/cu.SLAB_USBtoUART
Port: /dev/cu.SLAB_USBtoUART
```

## Installation Errors
Here are some common errors during the installation process and their quick fix.

##### `npm i -g node-esp` fails:

It could be a permissions issue. Regardless, if you run the following command on your terminal you wont break anything. Then install node-esp again.
```
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}`
```

If you see a similar error output to this, you might have to install pip.
```
Checking dependencies for esptool.py
Traceback (most recent call last):
  File "<string>", line 1, in <module>
ImportError: No module named pip
child_process.js:518
    throw err;
    ^

Error: Command failed: python -c 'import pip; packages = pip.get_installed_distributions(); package_list = ["%s" % (i.key) for i in packages]; print(package_list)'
Traceback (most recent call last):
  File "<string>", line 1, in <module>
ImportError: No module named pipo

    at checkExecSyncError (child_process.js:475:13)
    at execSync (child_process.js:515:13)
    at Module.module.exports (/Users/peperone/node-esp/scripts/postinstall:15:31)
    at Object.<anonymous> (/Users/peperone/node-esp/scripts/postinstall:25:8)
    at Module._compile (module.js:541:32)
    at Object.Module._extensions..js (module.js:550:10)
    at Module.load (module.js:458:32)
    at tryModuleLoad (module.js:417:12)
    at Function.Module._load (module.js:409:3)
    at Function.Module.runMain (module.js:575:10)
```

Just run the following command from terminal:

```
sudo easy_install pip
```

If you see a similar error, but the package is `pyserial`:

```
ImportError: No module named pyserial
```

Just run the following command from terminal:
```
sudo easy_install pyserial
```

## Usage

To show a list of available commands and their description:

```
$ esp --help
```

The basic command format is as follows:
```
$ esp <command> [subcommand] [options]
```



## Commands

### port

#### port set

Sets the name of the serial port to use in future commands.

```
$ esp port set /dev/cu.SLAB_USBtoUART
```

#### port get

Displays the current port that is used.

```
$ esp port get
Port: /dev/cu.SLAB_USBtoUART
```

#### port list

Shows a list of all available ports:

```
$ esp port get
┌────────────────────────────────────────┬────────────────────────────────────────┐
│ Port Name                              │ Manufacturer                           │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ /dev/cu.Bluetooth-Incoming-Port        │                                        │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ /dev/cu.Bluetooth-Modem                │                                        │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ /dev/cu.gPhone                         │                                        │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ /dev/cu.SLAB_USBtoUART                 │ Silicon Labs                           │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

### file

#### file list
Lists the sizes and names of all files on the module.

```
$ esp file list
┌────────────────────────────────────────┬────────────────────┐
│ File                                   │ Size (bytes)       │
├────────────────────────────────────────┼────────────────────┤
│ hello_world.lua                        │ 24                 │
└────────────────────────────────────────┴────────────────────┘
```

#### file write &lt;local_filename> [&lt;remote_filename>]
Writes a file from the local file system to the module.

If a second filename is given, the local file will be renamed to this value on the device, else it will keep its local name.

```
$ esp file write ./app_init.lua init.lua
```

#### file push &lt;local_filename> [&lt;remote_filename>]

Alternative to `esp file write` that compress the file if they are of any of the following types:

- Lua
- HTML
- JavaScript
- CSS.

```
$ esp file push ./webserver.lua init.lua
```

#### file read &lt;remote_filename>

Displays the content of a file from the module.

```
$ esp file read hello_world.lua
print("Hello World!")
```

#### file execute &lt;remote_filename>
Executes the content of a Lua file on the module, returns the output.

```
$ esp file execute hello_world.lua
Hello World!
```

#### file remove &lt;remote_filename>

Removes a file from the module.

```
$ esp file remove test.lua
```

### restart

#### restart
Restarts the module.

```
$ esp restart
```

### run

#### run &lt;lua>
Runs Lua code on the module, returns the output.

```
$ esp run "print 'And all the insects ceased in honor of the moon.'"
And all the insects ceased in honor of the moon.
```

### monitor

#### monitor
Displays the data received from the serial port.

```
$ esp monitor
Displaying output from port /dev/cu.SLAB_USBtoUART
Press ^C to stop.
```

### fs

File system commands.

#### fs info
Shows information about the file system.

```
$ esp fs info

Total : 3381221 bytes
Used  : 502 bytes
Remain: 3380719 bytes
```

#### fs format
Formats the file system removing all user files.

```
$ esp fs format
```

### info

#### info heap

```
$ esp fs format
```

#### info flash

Available flash memory.

```
$ esp info flash
```

#### info build

Build information.

- majorVer (number)
- minorVer (number)
- devVer (number)
- chipid (number)
- flashid (number)
- flashsize (number)
- flashmode (number)
- flashspeed (number)

```
$ esp info build
```

#### info chip

Returns chip id number.

```
$ esp info chip
```

### wifi

#### wifi restore

```
$ esp wifi restore
```

#### wifi getip

```
$ esp wifi getip
```

### esptool

Provides a helper command to flash a board using [esptool][esptool]

#### esptool flash &lt;firmware>

The `<firmware>` parameter should be a valid path to a NodeMCU binary file.

```
$ esp esptool flash <firmware>
```

## Roadmap

Use: https://github.com/inikulin/elegant-status

Add features:
* repl (figure out if monitor is the same?)
* compile lua files to lc (is `luac -o app.lc app.lua` the same as if we do on ESPLorer?)
* ~~Handle errors~~
* Lua:
    * [lint][lua-lint]
    * precompile
* ~~Restore WiFi settings: node.restore()~~
* Handle Esptool python error: busy port
* For HTML/CSS/JS files we might want to keep dir structure.
* Move `scripts/esptool.py` to it's own directory `scripts/esptool/esptool.py`.

[lua-lint]: https://github.com/valeriansaliou/grunt-contrib-lualint/blob/master/tasks/lualint.js


## License
MIT


[esptool]: https://github.com/themadinventor/esptool
[silabs]:https://www.silabs.com/products/mcu/Pages/USBtoUARTBridgeVCPDrivers.aspx
[pip]:https://pypi.python.org/pypi/pip
