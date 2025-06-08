Version: 1.1
Getting Started
It should be noted that Dice-Box can only accept simple dice notations or notation objects such as 2d20 or {qty:2,sides:20}. Once the notation has been sent to Dice-Box using the roll method, it will kick off the 3D physics simulation. When dice have stopped moving, the module will return a detailed result object that you are free to parse as you see fit.

This may seem overly simplistic because TTRPG rolls can be pretty complex. However, it is not the job of the Dice-Box to perform complex notation operations. For complex notations that require analyzing both the input and the output to determine the final result, such as advantage rolls, exploding rolls or target rolls, you'll need a parser to supply that functionality. @3D-dice supplies a module called Dice Parser Interface which supports the full Roll20 Dice Specification. Read more about the parser in the addons section.

Install the module
The core library can be install from npm using:

npm install @3d-dice/dice-box

Copy static assets
When installing the library, the terminal will ask you to identify a destination for static assets. This defaults to /public/assets and will timeout after 10 seconds. You can always manually move these files. They can be found in the @3d-dice/dice-box/src/assets folder. Copy everything from this folder to your local static assets or public folder.

If you're using npm version 7 or later, postinstall scripts output are suppressed. This means you will not be prompted to pick a directory. Instead, you will have to move the static assets manually.

Import the module
To import the module into a project with a build system (e.g.: vite or webpack):

import DiceBox from '@3d-dice/dice-box'

ES Module
This project is built as an ES module. To import Dice Box as an ES module:

import DiceBox from "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/dice-box.es.min.js";

If you plan on using the unpkg.com CDN, then you'll also have to set the following config options. The drawback to this approach means you are limited to the default dice set (at the moment).

  assetPath: "assets/",
  origin: "https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/",

Code Sandbox Example: Dice Box as ES Module

Create a new instance
Create a new instance of the DiceBox class. The single argument1 for the constructor is an object of config options. Be sure to set the path to the assets folder mentioned earlier. The assetPath is the only required config option.

const diceBox = new DiceBox({
  assetPath: '/assets/dice-box/' // include the trailing backslash
})

Configuration Options
These options can be passed into the constructor when creating a new instance of Dice-Box

Option	Default Setting	Description
id	'dice-canvas'	The ID of the canvas element.
assetPath	'/assets/'	The path to static assets needed by this module. *required
container1	document.body	A query selector for the DOM element to place the dice box canvas in.
gravity	1	Too much gravity will cause the dice to jitter. Too little and they take much longer to settle.
mass	1	The mass of the dice. Affects how forces act on the dice such as spin
friction	.8	The friction of the dice and the surface they roll on
restitution	0	The bounciness of the dice
angularDamping	.4	Determines how quickly the dice lose their spin (angular momentum)
linearDamping	.4	Determines how quickly the dice lose their linear momentum
spinForce	4	The maximum amount of spin the dice may have
throwForce	5	The maximum amount of throwing force used
startingHeight	8	The height at which the toss begins
settleTimeout	5000	Time in ms before a die is stopped from moving
offscreen	true	If offscreenCanvas is available it will be used
delay	10	The delay between dice being generate. If they're all generated at the same time they instantly collide with each other which doesn't look very natural.
lightIntensity	1	Global illumination levels
enableShadows	true	Do the dice cast a shadow? Turn off for a performance bump
shadowTransparency	.8	Set the transparency of the shadows cast by the dice
theme	'default'	For additional themes see @3d-dice/dice-themes
preloadThemes1	[]	An array of themes to pre-load. Useful for themes that extend other themes.
externalThemes1	{}	An object with theme system names as the key value and an external url path to theme assets. Useful for accessing themes on a CDN.
themeColor	'#2e8555'	Some themes allow for a configurable base color as a HEX value
scale	6	Options are best between 2-9. The higher the number the larger the dice. Accepts decimal numbers
suspendSimulation	false	Turn off the 3D simulation and use the built-in random number generator instead.
origin	location.origin	Sets the site origin used for constructing paths to assets.
onBeforeRoll1	function	callback function triggered after notation has been parsed, but before the roll starts
onDieComplete	function	callback function triggered whenever an individual die has completed rolling
onRollComplete	function	callback function triggered whenever all the dice have completed rolling
onRemoveComplete	function	callback function triggered whenever a die has been removed from the scene
onThemeConfigLoaded	function	callback function triggered after a theme config file has been successfully fetched and parsed
onThemeLoaded	function	callback function triggered after a theme has finished loading all related assets
Initialize
After a class instance has been made you must then initialize it. Once initialized, you'll be ready to roll some dice. The init method is an async method so it can be awaited or followed by a .then() method.

diceBox.init().then(()=>{
  diceBox.roll('2d20')
})

or, since init is a Promise, it can be awaited:

await diceBox.init()
diceBox.roll('2d20')


Version: 1.1
Common Objects
Roll Object
The roll object is whats required by the roll and add methods. At a minimum you must specify the number of sides of the dice to be rolled.

{
  modifier: int,      // optional - the modifier (positive or negative) to be added to the final results
  qty: int,           // optional - the number of dice to be rolled. Defaults to 1
  sides: mixed,       // the type of die to be rolled. Either a number such as 20 or a die type such as "fate".
  theme: string,      // optional - the theme's 'systemName' for this roll
  themeColor: string  // optional - HEX value for the theme's material color
}


Individual Die Result Object
When die results are returned they will contain the information listed below. Individual die results can then be passed back in to roll, add, reroll and remove methods as the notation argument.

{
  groupId: int,       // the roll group this die belongs to
  rollId: int,        // the unique identifier for this die within the group
  sides: int,         // the type of die
  theme: string,      // the theme that was assigned to this die
  themeColor: string  // optional - HEX value for the theme's material color
  value: int,         // the result for this die
}

Roll Result Array Object
The results object will contain an array of roll groups and the individual rolls made in those groups. For example, 3d6 would create a roll group with three rolls in it.

[
  {                    // the roll group object
    id: 0,             // the id of this group - should match the groupId of rolls
    mods: [],          // the roll modifier
    qty: int,          // the number of dice in this roll
    rolls: [           // an array of Die Result Objects
      {
        groupId: int,
        result: int,
        rollId: int,
        sides: int,
        theme: string,
        themeColor: string,
      }
    ],
    sides: int,        // the type of die used
    theme: string      // the theme for this group of dice
    themeColor: string // the theme color for this group of dice
    value: int         // the sum of the dice roll results and modifier
  }
]

The result object for 3d6 will look something like this

[
  {
    groupId: 0,
    mods: [],
    qty: 3,
    rolls: [
      {
        sides: 6,
        groupId: 0,
        rollId: 0,
        theme: 'diceOfRolling',
        themeColor: null,
        value: 5
      },
      {
        sides: 6,
        groupId: 0,
        rollId: 1,
        theme: 'diceOfRolling',
        themeColor: null,
        value: 2
      },
      {
        sides: 6,
        groupId: 0,
        rollId: 2,
        theme: 'diceOfRolling',
        themeColor: null,
        value: 3
      }
    ],
    sides: 6,
    value: 10
  }
]

What's the difference between groupId, and rollId?
groupId: the roll group this die is a part of. This becomes more useful with the advanced dice roller that accepts notations such as 2d10+2d6. In this case groupId: 0 would be assigned to the 2d10 and groupId: 1 would be assigned to the 2d6

rollId: the id of the die within the group. By default this is incremented automatically by the dice roller, however there are cases where the rollId is assigned, such as exploding die. In this case, in order to make an association between the 'exploder' and the 'explodee' the rollId of the added die is set to a decimal value of the triggering die. For example with 1d6 that explodes twice:

[
  {
    qty: 3,
    sides: 6,
    mods: [
      {
        type: 'explode',
        target: null
      }
    ],
    rolls: [
      {
        sides: 6,
        groupId: 0,
        rollId: 0,
        theme: 'diceOfRolling',
        themeColor: null,
        value: 6
      },
      {
        sides: 6,
        groupId: 0,
        rollId: 0.1,
        theme: 'diceOfRolling',
        themeColor: null,
        value: 6
      },
      {
        sides: 6,
        groupId: 0,
        rollId: 0.2,
        theme: 'diceOfRolling',
        themeColor: null,
        value: 5
      }
    ],
    id: 0,
    value: 17
  }
]

Theme Config Object
This object is required to load a theme

{
  name: string,                  // the pretty name of this theme, can include spaces and special characters
  systemName: string,            // required - the camelCased system name for this theme, used internally
  extends: string,               // optional - The theme systemName this theme extends
  author: string,                // optional - author of this theme
  version: number,               // optional - version of this theme
  thumbnail: string,             // optional - A rendered image of what this dice theme looks like
  meshFile: string,              // the relative path and file name that contains the 3D mesh data for this theme. Only required if not using 'default' mesh. This can point to a shared mesh file located anywhere in static assets folder.
  meshName: string,              // deprecated in v1.1 - the system name used for this theme's 3D models. Only required if not using 'default' mesh. If sharing a mesh file with another theme, then it should have the same meshName as the one it's sharing.
  diceAvailable: [],             // required - a list of dice available (:string) with this theme.
  material: {
    type: string,                // required - the type of material being loaded for this theme
    diffuseTexture: string || {  // either the relative path and file name of a texture file or an object
      light: string,             // the relative path and file name of the 'light' texture used for HEX color based materials
      dark: string               // the relative path and file name of the 'dark' texture used for HEX color based materials
    },
    diffuseLevel: float,         // optional - intensity or strength of the texture
    bumpTexture: string,         // optional - the relative path and file name of a texture file
    bumpLevel: float,            // optional - intensity or strength of the texture
    specularTexture: string,     // optional - the relative path and file name of a texture file
    specularPower: float         // optional - defines how sharp are the highlights in the material
  },
  themeColor: string,            // a HEX value to be applied to a color material.
  d4FaceDown: false,             // optional - calculate the d4 value based on the downward facing 3D mesh face id
}


Version: 1.1
Methods
Promised based rolls
The methods .roll(),.add(), .reroll() and .remove() are all methods that return a promise containing the results of the dice rolled by the callee. So it is possible to write diceBox.roll('4d6').then(results => console.log(results)). Results can also be retrieved from the onRollComplete callback event or by using the .getRollResults() method (not a promise).

Roll
A roll will clear current dice and start a new roll. Returns a promise with an array of die results

roll(notation:mixed, options = {theme:string, newStartPoint:boolean})

Example
diceBox.roll('2d20',{theme:'rust'})

Arguments
Argument	Type	Default Value	Description
notation	string | array | notation object | array of notation objects	n\a	See notation description
options	object	see options	options that can be set with each roll
Notation
The notation argument can accept the following roll formats

simple string notation described as 'number of dice' + 'd' + 'number of sides on the die'. e.g.: 5d6 rolls five six-sided dice.
an array of string notation. e.g.: ['2d10','2d6']
a Roll Object as described above. e.g.:{qty: 5, sides: 10}
an array of Roll Objects. e.g.:[{qty: 2, sides: 10},{qty: 1, sides: 6}] |
a mixed array of Roll Objects and string notation. e.g.:[{qty: 2, sides: 10},'2d8']
Options
Key	Type	Default Value	Description
theme	string - optional	undefined	the systemName of a theme for the roll. This value will override theme values that appear in the notation object
newStartPoint	boolean - optional	true	will toss the collection of dice in from a new point along the edge of the box
Themes
Themes can be specified in four different places. On the config object at initialization, as an options parameter when using .roll() or .add(), as specified in a roll object and as specified in a die result object. Themes are applied in the order of options parameter first, roll object or die result object second and box config option third. The roll object and die result object are processed at the same level.

Add
This method will add the specified notation to the current roll in a new roll group. Returns a promise with an array of die results for the dice that were added.

add(notation:mixed, options = {theme:string, newStartPoint:boolean})

Example
diceBox.add([{qty: 2, sides: 8},'1d6'],{newStartPoint: false})

Arguments
Argument	Type	Default Value	Description
notation	string | array | notation object | array of notation objects	n\a	Same as roll notation description
options	object	see roll options	options that can be set with each roll
Reroll
This method will reroll a die. Returns a promise with an array of die results for the dice that were rerolled.

reroll(notation:mixed, options = {remove:boolean, newStartPoint:boolean})

Example
diceBox.reroll({groupId: 0,rollId: 2})

Arguments
Argument	Type	Default Value	Description
notation	notation object | array of notation objects	n\a	See notation note below. Valid notation includes objects returned from roll and add promises.
options	object	see options	options that can be set with each roll
note
The notation argument here requires an roll object or an array of roll objects identifying the roll group groupId and die rollId you wish to reroll. Die result objects from previous rolls are valid arguments and can be passed in to trigger a reroll.

Options
Key	Type	Default Value	Description
remove	boolean - optional	false	indicates the die being rerolled should be removed from the scene
newStartPoint	boolean - optional	true	will toss the collection of dice in from a new point along the edge of the box
Remove
Remove dice from the scene. Returns a promise with an array of die results for the dice that were removed.

remove(notation:mixed)

Example
diceBox.remove({groupId: 0,rollId: 2})

Arguments
Argument	Type	Default Value	Description
notation	notation object | array of notation objects	n\a	Same as reroll notation description
Clear
This will clear all dice from the scene.

diceBox.clear()

Hide
This will hide the canvas element that the Dice-Box is rendered to. If a className is provided, then it will be added to the <canvas> element in order to enable a CSS based transition. If no className is provided then visibility is toggled off without an effect.

diceBox.hide(className:string)

Arguments
Argument	Type	Default Value	Description
className	string	n\a	Sets a CSS class on the canvas in order to use CSS transition effects for hide.
Show
This will show the canvas element that the Dice-Box is rendered to. If a className was defined on hide() then this class name will be removed from the canvas to reverse the hide effect. Otherwise visibility is toggled on.

diceBox.show()

Get Roll Results
Get the results of all the dice in the scene at anytime. However, if dice are still rolling they will not have a value yet.

diceBox.getRollResults() // returns an array of roll result objects

Update Config
Use this method to update any of the config settings. Most settings will be applied immediately, but theme/dice color changes will only take effect before or after a roll.

diceBox.updateConfig({configObject})


Version: 1.1
Callbacks
onBeforeRoll
This callback is triggered before the roll begins, but after the notation has been parsed. The callback argument includes the parsed notation.

diceBox.onBeforeRoll = (parsedNotation) => console.log('parsedNotation', parsedNotation)

onDieComplete
This callback is triggered whenever an individual die has completed rolling and contains the die result object as it's argument.

diceBox.onDieComplete = (dieResult) => console.log('die result', dieResult)

onRollComplete
This callback is triggered whenever all the dice have finished rolling and/or the physics simulation has been stopped and contains the roll result object as it's argument.

diceBox.onRollComplete = (rollResult) => console.log('roll results', rollResult)

onRemoveComplete
This callback is triggered whenever a die has been removed from the scene and contains the die result object that was removed as it's argument.

diceBox.onRemoveComplete = (dieResult) => console.log('die removed', dieResult)

onThemeConfigLoaded
This callback is triggered after a theme config file has been successfully fetched and parsed. It contains the theme config data as an argument parameter.

diceBox.onThemeConfigLoaded = (config) => console.log('theme config data', config)

onThemeLoaded
This callback is triggered after the onThemeConfigLoaded is complete and the theme has fetched and loaded all the necessary 3D models, textures, and materials it needs. It contains the theme config data as an argument parameter.

diceBox.onThemeLoaded = (config) => console.log('theme config data', config)


Version: 1.1
Themes
Everyone loves different dice colors and styles. Also, sometimes it's important to have different colored dice at the virtual table in order to distinguish who's making rolls. With that in mind I've tried to keep the theme layer flexible and easy to customize.

How themes work
Themes should be located in the /public/assets/themes folder. Dice-Box only comes with the default theme. Additional themes can be downloaded or installed from @3d-dice/dice-themes. Themes have been designed to be easy drop-in addons. Inside a theme folder is a package.json file used by npm, a theme.config.json file, a couple of texture files, and possibly a json file for the 3D models used by this theme.

The folder name for a theme must match the systemName parameter in the theme.config.json file.

Copying theme files
If you use npm to install a theme, then you must manually copy the theme to your static assets folder.

Theme can also be downloaded as a .zip file from the dice-themes/downloads folder.

Extended themes
Some themes are design to add more options to other themes. For instance, when you'd like to add more dice types to a set. These themes are identified by the extends parameter in the theme.config.json file.

For example, Default Extras is a theme that extends the Default theme. It adds a d2, dfate and dpip to the default dice available. They may then be called with other default dice using standard notation such as diceBox.roll(['2d2', '2d6']).

If you assign an theme extension to the config.theme option, the extension and the theme it targets will both be loaded and config.theme will be set to the target's systemName.

You cannot extend a theme that extends another theme. You can extend a target theme multiple times.

Naming Practices
A theme extension will follow the naming pattern of {target theme name}-{extension name}. For example default-extras or diceOfRolling-fate

Theme Limitations
It's important to know that Dice-Box currently only loads the StandardMaterial and CustomMaterial libraries from BabylonJS. PBR materials are not currently supported due to the high overhead it has. It's also important to know that BabylonJS expects normal maps to be DirectX formatted. If you have OpenGL normal maps then you'll want to invert the red and green color channels of the file (using image editing software like Affinity Photo) to convert it to DirectX.

Sharing mesh files
For distribution reasons, themes from @3d-dice/dice-themes include their required 3D models, but if you're using multiple themes that load the same model file, then you can put that shared file in the /public/assets/models folder. After that, update the meshFile path in the theme.config.json files as necessary. For example

  meshFile: "../../models/gemstone.json",

The mesh files can be large in size. Sharing the meshes will save some bandwidth and memory.

Creative Commons 0
The 3D models and textures available in the @3d-dice/dice-box and @3d-dice/dice-themes projects are licensed as CC0 content. In summary, CC0 says,

"To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty."

What this means is that these assets are free to be used and distributed by anyone in public or commercial products.

See also http://creativecommons.org/publicdomain/zero/1.0/

Custom themes
Custom themes are possible, but it can be a difficult process. If you are interested in converting a 3D dice set into playable dice in Dice Box, please log an issue on GitHub and I'll see if I can assist.


Version: 1.1
Default
The default theme that is packaged with Dice Box. These are sharp edged numerical dice. The mesh name is default.

A special thanks to the team at Quest Portal for providing the original 3D models.

default dice screenshot
Dice Available
d4 d6 d8 d10 d12 d20 d100

Configurable Colors
Use the themeColor config option to change the color of the dice. Based on the color's luminosity, the numbers will automatically switch between black and white for improved contrast.

Repo
Default Dice: https://github.com/3d-dice/dice-themes/tree/main/themes/default


Version: 1.1
Default - Extras
This theme extends the Default theme, adding a two sided coin, a fate die and a d6 with pips. In order to use it with the default theme, simply load it using the new preloadThemes config option.

default extra dice screenshot
Dice Available
d2 dfate dpip

Configurable Colors
Use the themeColor config option to change the color of the dice. Based on the color's luminosity, the numbers will automatically switch between black and white for improved contrast.

Repo
Default Extras: https://github.com/3d-dice/dice-themes/tree/main/themes/default-extras


Version: 1.1
Blue Green Metal
A rough metallic theme using standard textures. This theme uses the smoothDice mesh.

blue green metal dice screenshot
Dice Available
d4 d6 d8 d10 d12 d20 d100

Install
npm isntall @3d-dice/theme-blue-green-metal

Repo
Blue Green Metal Dice: https://github.com/3d-dice/dice-themes/tree/main/themes/blueGreenMetal


Version: 1.1
Dice of Rolling
A theme inspired by the original Dice of Rolling, which is one of my favorite dice sets. This theme uses the smoothDice mesh.

dice of rolling screenshot
Dice Available
d4 d6 d8 d10 d12 d20 d100

Install
npm install @3d-dice/theme-dice-of-rolling

Repo
Dice of Rolling: https://github.com/3d-dice/dice-themes/tree/main/themes/diceOfRolling


Version: 1.1
Dice of Rolling - Fate
A theme extending the Dice of Rolling theme with an orange fate die.

dice of rolling fate dice screenshot
Dice Available
dfate

Install
npm install @3d-dice/theme-dice-of-rolling-fate

Repo
Dice of Rolling Fate: https://github.com/3d-dice/dice-themes/tree/main/themes/diceOfRolling-fate


Version: 1.1
Genesys
The first theme made available that uses symbols instead of numbers. This theme posed many challenges for implementation but is finally ready for release with v1.1.0. This theme uses the genesys mesh. A special thanks to Arran France and the team at Quest Portal for providing the original dice set.

genesys dice screenshot
Dice Available
boost setback ability difficulty challenge proficiency

Addons
Since Genesys dice are so unique, additional addons where made to ensure it could interface with Dice Box correctly and adequately. Be sure to check out Genesys Dice Picker and Genesys Display Results for components that demo how to handle input and output related to Dice Box.

Install
npm install @3d-dice/theme-genesys

Repo
Genesys: https://github.com/3d-dice/dice-themes/tree/main/themes/genesys



Version: 1.1
Rock
A rough surface texture meant to appear stone like. This theme uses transparent png files to apply some surface coloring and texture, while allowing for a configurable base color. This theme uses the smoothDice mesh.

rock dice screenshot
Dice Available
d4 d6 d8 d10 d12 d20 d100

Configurable Colors
Use the themeColor config option to change the color of the dice. Based on the color's luminosity, the numbers will automatically switch between black and white for improved contrast.

Install
npm install @3d-dice/theme-rock

Repo
Rock Dice: https://github.com/3d-dice/dice-themes/tree/main/themes/rock


Version: 1.1
Rust
A rough surface texture meant to appear like weathered and blistered metal. This theme uses transparent png files to apply some surface coloring and texture, while allowing for a configurable base color. This theme uses the smoothDice mesh.

rust dice screenshot
Dice Available
d4 d6 d8 d10 d12 d20 d100

Configurable Colors
Use the themeColor config option to change the color of the dice. Based on the color's luminosity, the numbers will automatically switch between black and white for improved contrast.

Install
npm install @3d-dice/theme-rust

Repo
Rust Dice: https://github.com/3d-dice/dice-themes/tree/main/themes/rust


Version: 1.1
Wooden
A rustic wooden texture with raised wood grain patterns. This theme uses the smoothDice mesh.

wooden dice screenshot
Dice Available
d4 d6 d8 d10 d12 d20 d100

Install
npm install @3d-dice/theme-wooden

Repo
Wooden Dice: https://github.com/3d-dice/dice-themes/tree/main/themes/wooden


Version: 1.1
About Addons
In this project I refer to addons as JavaScript modules that can be used with Dice-Box. So far I've created four modules that are designed to integrate with Dice-Box. More are planned and I certainly encourage others to build their own.

Dice Parser Interface
Advanced Dice Roller
Dice Picker
Display Results
Box Controls
Genesys Dice Picker
Genesys Results


Version: 1.1
Dice Parser Interface
As mentioned in the config setup, Dice-Box requires a parser to do the fun TTRPG things. Any roll notations that are more than the simple pattern {quantity}d{side}+/-{modifier} have to go through a parser to make sense of the notation. All the rolls supported are documented at Roll20 Dice Specification

note
Dice Parser Interface only works with the following dice types: d4, d6, d8, d10, d12, d20, d100, dfate.

dice-roller-parser
Rather than write my own parser from the ground up, I found one written by Ben Morton called dice_roller. While almost fully featured, the dice_roller project seems to have gone dormant. I forked that project into @3d-dice/dice-roller-parser, where I've been able to fix some bugs I've found as well as add features I need for Dice-Box. The important feature of dice_roller that made it different from other programmatic dice rollers like RPG Dice Roller is that it allows a custom random function as a constructor parameter. Instead of using a random function, I hijack this feature to pass in a function that contains all the roll results from Dice-Box. So instead of producing random numbers, it's just parsing the notation with the values I've delivered to it.

note
The documentation for @3d-dice/dice-roller-parser on GitHub is pretty robust so it is not reproduced here.

note
@3d-dice/dice-roller-parser is a dependency of @3d-dice/dice-parser-interface. You do not have to install it separately.

Parser Interface
The dice-parser-interface simply provides an interface between @3d-dice/dice-roller-parser and @3d-dice/dice-box. Since dice-roller-parser is pretty self contained, I did not want to include this interface in that package. The parser is available at @3d-dice/dice-parser-interface

Caveats
One thing this modules does not do is provide the interface for providing an input for the roll notation string or displaying the final results. It is expected that the developer will create their own inputs and outputs or a module such as Advanced Roller

Install
Install the library using:

npm install @3d-dice/dice-parser-interface

Setup
Then create a new instance of the parser

import DiceParser from '@3d-dice/dice-parser-interface'

const DP = new DiceParser()

The DP class instance now has methods to parse raw notations, process re-rolls and compute the final results from dice-box

<form id="dice-to-roll">
	<input id="input--notation" class="input" placeholder="2d20" autocomplete="off" />
</form>

const form = document.getElementById("dice-to-roll")
const notationInput = document.getElementById("input--notation")

const submitForm = (e) => {
  e.preventDefault();
	const notation = DP.parseNotation(notationInput.value)
}

form.addEventListener("submit", submitForm)

Methods
Method	Arguments	Description
parseNotation	notation :string	Accepts a dice string input, parses it and returns a JSON representation of the parsed input.
handleRerolls	rollResults :array	Accepts an array of dice roll results and returns a new array of dice objects that need to be re-rolled
parseFinalResults	rollResults :array	pass in a roll results object to get the computed results of the dice roll
parseNotation
Accepts a dice string input, parses it and returns a JSON representation of the parsed input.

Example: DP.parseNotation('4d6')

{
  die: {
    type: 'number',
    value: 6
  },
  count: {
    type: 'number',
    value: 4
  },
  type: 'die',
  mods: [],
  root: true,
  label: ''
}

See also: Just parse the value

handleRerolls
This method accepts an array of dice rolls (generated by parseNotation, updated by dice-box) and returns a new array of dice objects that need to be re-rolled. Examples of rolls that could generate rerolls include: exploding, penetrating, and compounding rolls (e.g.: 6d6!). Reroll and reroll-once notation is also supported (e.g.: 2d12r1).

rollResults Input
An example of what the input object should look like. This is what the final results look like from dice-box. See also: Dice Box: Common Objects Example 3d6r1 (roll 3 six sided dice, reroll dice that resulted in 1)

[
  {
    qty: 4,
    sides: 6,
    mods: [
      {
        type: "reroll",
        target: {
          type: "target",
          mod: null,
          value: {
            type: "number",
            value: 1
          }
        }
      }
    ],
    rolls: [
      {
        sides: 6,
        groupId: 0,
        rollId: 0,
        theme: "diceOfRolling",
        value: 1
      },
      {
        sides: 6,
        groupId: 0,
        rollId: 1,
        theme: "diceOfRolling",
        value: 4
      },
      {
        sides: 6,
        groupId: 0,
        rollId: 2,
        theme: "diceOfRolling",
        value: 3
      },
      {
        sides: 6,
        groupId: 0,
        rollId: "0.1",
        theme: "diceOfRolling",
        value: 2
      }
    ],
    groupId: 0,
    value: 10
  }
]

Returned Dice Object:
Any dice that need a reroll are passed back in an array.

Property	Type	Description
groupId	int	The group the reroll target belongs to
rollId	int or string	The roll id of the die being rerolled. This will be incremented by .1 for every reroll made
side	int	The number of sides the reroll die has
qty	int	The number of dice to be rolled. This will always be 1 on rerolls but is needed by dice-box
Example:

[
	{
		"groupId": 0,
		"rollId": "2.1",
		"sides": 6,
		"qty": 1
	},
	{
		"groupId": 0,
		"rollId": "3.1",
		"sides": 6,
		"qty": 1
	}
]

parseFinalResults
After all rolls and rerolls have completed, you can pass the results object to parseFinalResults to get the final results of the dice roll. This typically happens inside dice-box's onRollComplete callback method.

Example:

const results = DRP.parseFinalResults(results)

Example: 3d6r1

{
  "count": {
    "type": "number",
    "value": 3,
    "success": null,
    "successes": 0,
    "failures": 0,
    "valid": true,
    "order": 0
  },
  "die": {
    "type": "number",
    "value": 6,
    "success": null,
    "successes": 0,
    "failures": 0,
    "valid": true,
    "order": 0
  },
  "rolls": [
    {
      "critical": null,
      "die": 6,
      "matched": false,
      "order": 0,
      "roll": 2,
      "success": null,
      "successes": 0,
      "failures": 0,
      "type": "roll",
      "valid": true,
      "value": 2
    },
    {
      "critical": "failure",
      "die": 6,
      "matched": false,
      "order": 1,
      "roll": 1,
      "success": null,
      "successes": 0,
      "failures": 0,
      "type": "roll",
      "valid": false,
      "value": 1,
      "reroll": true
    },
    {
      "critical": "failure",
      "die": 6,
      "matched": false,
      "order": 2,
      "roll": 1,
      "success": null,
      "successes": 0,
      "failures": 0,
      "type": "roll",
      "valid": false,
      "value": 1,
      "reroll": true
    },
    {
      "critical": null,
      "die": 6,
      "matched": false,
      "order": 3,
      "roll": 3,
      "success": null,
      "successes": 0,
      "failures": 0,
      "type": "roll",
      "valid": true,
      "value": 3
    },
    {
      "critical": "failure",
      "die": 6,
      "matched": false,
      "order": 2,
      "roll": 1,
      "success": null,
      "successes": 0,
      "failures": 0,
      "type": "roll",
      "valid": false,
      "value": 1,
      "reroll": true
    },
    {
      "critical": null,
      "die": 6,
      "matched": false,
      "order": 5,
      "roll": 5,
      "success": null,
      "successes": 0,
      "failures": 0,
      "type": "roll",
      "valid": true,
      "value": 5
    }
  ],
  "success": null,
  "successes": 0,
  "failures": 0,
  "type": "die",
  "valid": true,
  "value": 10,
  "order": 0,
  "matched": false
}


Version: 1.1
Advanced Roller
The Advanced Roller module is a part of the @3d-dice/dice-ui package. This UI module provides a simple text input field and a clear button. The field is connect to Dice Parser Interface. On submit, the field will send the roll notation to FDP to be parsed and will return the result to the callback onSubmit. The clear button will clear out any values stored in the parser and invokes the onClear callback, which is usually a good place to clear your dice-box as well.

note
Advanced Roller only works with the following dice types: d4, d6, d8, d10, d12, d20, d100, dfate.

Advanced Roller Screenshot

Install
Add the dice-ui module using

npm install @3d-dice/dice-ui

Setup
Then create a new instance of the roller

import { AdvancedRoller } from '@3d-dice/dice-ui'

const Roller = new AdvancedRoller()

Config Options
The AdvancedRoller only has one argument which is a config object

Option	type	default	Description
target	string :dom node selector	document.body	The target DOM node to inject the roller into
onSubmit	function	noop	callback triggered on form submit, after notation has been parsed
onClear	function	noop	callback triggered when form reset event is triggered
onReroll	function	noop	callback triggered when FDP returns reroll results
onResults	function	noop	callback triggered when there are no reRoll results and the final result object has been parsed by FDP
Methods
Method	Arguments	Description
submitForm	event :event - form submit	Take the submit event and passes the input notation to FDP. Calls onSubmit callback with results.
clear	none	Clears any values stored in FDP. Calls the onClear callback
handleResults	results :object	Passes roll results object to FDP to check for rerolls. Gets the final parsed results from FDP. Calls onResults callback
Custom Events
resultsAvailable
When the final results are available, a custom event called resultsAvailable is also dispatched. The final results object can be found on the event.details property.

Example

document.addEventListener('resultsAvailable', (e) => console.log('roll results: ', e.detail))


Callbacks
The advanced roller lets you decide what to do with the results the parser returns.

onSubmit
After the value of the notation input has been processed by FDP, this callback is triggered, passing back the notation object generated by FDP. This can then be passed onto Dice-Box for rolling.

Example

const Roller = new AdvancedRoller({
  target: '#roller',
  onSubmit: (notation) => {
    diceBox.roll(notation)
  }
})

onClear
After clearing out out any values remaining in FDP, this callback is trigger to allow for follow-up actions in the scene

Example

const Roller = new AdvancedRoller({
  target: '#roller',
  onSubmit: (notation) => {
    diceBox.roll(notation)
  },
  onClear: () => {
    diceBox.clear()
    Display.clear()  // Display refers to Display Results module available in @3d-dice/dice-ui
  }
})


onReroll
When the handleResults method is called FDP will parse rollResults looking for anything that would trigger a reroll. If the right conditions are met then DRP will return an array of dice objects that need a reroll. The array is then passed on to this callback to be handled as you see fit.

Example

const Roller = new AdvancedRoller({
  target: '#rollers',
  onSubmit: (notation) => {
    diceBox.roll(notation)
  },
  onClear: () => {
    diceBox.clear()
    Display.clear()
  },
  onReroll: (rolls) => {
    rolls.forEach(roll => diceBox.add(roll))
  }
})

onResults
This callback is triggered when the handleResults method has determined that there are no reroll results and the final result object has been parsed by FDP. The final result object is passed on to this callback to be handled as you see fit.

Example

const Roller = new AdvancedRoller({
  target: '#rollers',
  onSubmit: (notation) => {
    diceBox.roll(notation)
  },
  onClear: () => {
    diceBox.clear()
    Display.clear()
  },
  onReroll: (rolls) => {
    rolls.forEach(roll => diceBox.add(roll))
  },
  onResults: (results) => {
    Display.showResults(results)  // Display refers to Display Results module available in @3d-dice/dice-ui
  }
})


Version: 1.1
Dice Picker
This is a simple UI module aimed at making picking dice simple and easy. I put this module together mostly to make setting up simple rolls on mobile devices easy. Just tap away at the dice you want to roll. It's very similar in nature to Advanced Roller.

note
This module is for use with the standard 7 TTRPG dice. The main intention of this module is to function as an example of how to create your own UI interface for the Dice Box.

Dice Picker Screenshot

Install
Add the dice-ui module using

npm install @3d-dice/dice-ui

Setup
Then create a new instance of the picker

import { DicePicker } from '@3d-dice/dice-ui'

const dicePicker = new DicePicker()

Config Options
The DicePicker only has one argument which is a config object

Option	type	default	Description
target	string :dom node selector	document.body	The target DOM node to inject the roller into
onSubmit	function	noop	callback triggered on form submit, after notation has been parsed
onClear	function	noop	callback triggered when form reset event is triggered
onReroll	function	noop	callback triggered when FDP returns reroll results
onResults	function	noop	callback triggered when there are no reRoll results and the final result object has been parsed by FDP
Methods
Method	Arguments	Description
submitForm	event :event - form submit	Take the submit event and passes the input notation to FDP. Calls onSubmit callback with results.
clear	none	Clears the current notation and any values stored in FDP. Calls the onClear callback
setNotation	notation :object	Set the default values for tossing, sort of like placeholder values
handleResults	results :object	Passes roll results object to FDP to check for rerolls. Gets the final parsed results from FDP. Calls onResults callback
note
There's currently nothing in Dice Picker that would trigger rerolls.

With the exception of setNotation these methods and callbacks operate the same as the Advanced Roller.

setNotation example:

dicePicker.setNotation({
  d4: {
    count: 2
  },
  d6: {
    count: 2
  },
  d8: {
    count: 2
  },
  d10: {
    count: 2
  },
  d12: {
    count: 2
  },
  d20: {
    count: 2
  },
  d100: {
    count: 1
  }
})

Screenshot with notation set: Set Notation


Version: 1.1
Display Results
Another module available as part of the @3d-dice/dice-ui package. This module takes the final result object as input and creates a modal popup window displaying the final roll results and the final value of that roll.

Display Results Screenshot

This module will also apply styles based on different roll properties such as crit-success, crit-failure, die-dropped, die-rerolled, and die-exploded.

If the roll had a specified target number for success then this module will display either a green checkmark for success, a red x for failure and a gray minus for null (neither success or failure). It will also display the sum total of successes.

This module now supports string values and an array of string values. This is useful if the dice faces represent symbols or text (e.g.: "Left, Right, Center" or "Genesys").

Install
Add the dice-ui module using

npm install @3d-dice/dice-ui

Setup
Then create a new instance of the roller

import { DisplayResults } from '@3d-dice/dice-ui'

const Display = new DisplayResults()

Config
The constructor only accepts one argument which is a CSS selector where this component should be injected into the DOM.

Option	type	default	Description
target	string :dom node selector	document.body	The target DOM node to inject the display results into
Methods
Method	Arguments	Description
showResults	rollResults :object	Takes roll results as input and generates a popup display
clear	none	hides the popup display with a CSS transition effect
Example

const results = {
  count: {
    type: "number",
    value: 2,
    success: null,
    successes: 0,
    failures: 0,
    valid: true,
    order: 0
  },
  die: {
    type: "number",
    value: 20,
    success: null,
    successes: 0,
    failures: 0,
    valid: true,
    order: 0
  },
  rolls: [
      {
      critical: null,
      die: 20,
      matched: false,
      order: 0,
      roll: 19,
      success: null,
      successes: 0,
      failures: 0,
      type: "roll",
      valid: false,
      value: 19,
      drop: true
    },
    {
      critical: "success",
      die: 20,
      matched: false,
      order: 1,
      roll: 20,
      success: null,
      successes: 0,
      failures: 0,
      type: "roll",
      valid: true,
      value: 20
    }
  ],
  success: null,
  successes: 0,
  failures: 0,
  type: "die",
  valid: true,
  value: 20,
  order: 0,
  matched: false
}

Display.showResults(results)

Styles
class name	example
crit-success	20
crit-failure	1
die-dropped	2
die-rerolled	1
die-exploded	6
success	success
failure	failure
null	null
Examples
4d6! (exploding roll)

exploding 4d6

10d10>7 (targeted success roll)

target roll

2d20kh (advantage roll - keep highest)

reroll

2d10ro<2 (reroll once 2s or less)

reroll


Version: 1.1
Box Controls
Box Controls uses the popular dat.GUI module which is self described as:

A lightweight graphical user interface for changing variables in JavaScript

Use this module if you want to dynamically experiment with the Dice-Box config settings and see real time feedback. All changes are passed to Dice-Box's updateConfig() method.

This module was created for experimental and demo purposes.

Install
Add the dice-ui module using

npm install @3d-dice/dice-ui

Setup
Then create a new instance of the picker

import { BoxControls } from '@3d-dice/dice-ui'

const Controls = new BoxControls({
  onUpdate: (updates) => {
    diceBox.updateConfig(updates)
  }
})

Settings
Sliders
Config Options	min	default	max	step
gravity	0	1	10	1
mass	1	1	20	1
friction	0	.8	1	.1
restitution	0	0	1	.1
linearDamping	0	.5	1	.1
angularDamping	0	.4	1	.1
spinForce	0	6	15	1
throwForce	0	3	15	1
startingHeight	1	20	65	1
settleTimeout 100	0	5000	20000	1000
delay	10	10	500	10
scale	1	4	10	.1
shadowTransparency	0	0.8	1	.01
lightIntensity	0	1	5	.1
note
While the slider has a max setting, there is no enforced max in the module itself.

Checkbox
Config Option	default
enableShadows	true
suspendSimulation	false
Combo Box
Config Option	default	options
theme	'default'	array passed in from options.themes
Color Picker
Config Option	default
themeColor	#0974E6
Theme config
Not all themes make use of themeColor.

Setting theme controls
The controls for theme and themeColor have been exposed as themeSelect and themeColorPicker respectively. These controls can now be set externally.

Controls.themeSelect.setValue('diceOfRolling')
Controls.themeColorPicker.setValue('#fc05fc')

This was set up so the controls would reflect the theme or themeColor first loaded by dice box. Other controls have not been exposed.



Version: 1.1
Genesys Dice Picker
This module has all the same features as Dice Picker. There are only a few UI differences to accommodate this unique dice set. Just tap away at the dice you want to roll.

note
This module is for use with the Genesys dice theme. The main intention of this module is to function as an example of how to create your own UI interface for the Dice Box.

Genesys Dice Picker Screenshot

Install
Add the dice-ui module using

npm install @3d-dice/dice-ui

Setup
Then create a new instance of the picker

import { GenesysDicePicker } from '@3d-dice/dice-ui'

const dicePicker = new GenesysDicePicker()

Config Options
The GenesysDicePicker only has one argument which is a config object

Option	type	default	Description
target	string :dom node selector	document.body	The target DOM node to inject the roller into
onSubmit	function	noop	callback triggered on form submit, after notation has been parsed
onClear	function	noop	callback triggered when form reset event is triggered
onReroll	function	noop	callback triggered when FDP returns reroll results
onResults	function	noop	callback triggered when there are no reRoll results and the final result object has been parsed by FDP
Methods
Method	Arguments	Description
submitForm	event :event - form submit	Take the submit event and passes the input notation to FDP. Calls onSubmit callback with results.
clear	none	Clears the current notation and any values stored in FDP. Calls the onClear callback
setNotation	notation :object	Set the default values for tossing, sort of like placeholder values
handleResults	results :object	Passes roll results object to FDP to check for rerolls. Gets the final parsed results from FDP. Calls onResults callback
setNotation example:

dicePicker.setNotation({
  ability: {
    count: 0
  },
  boost: {
    count: 0
  },
  challenge: {
    count: 0
  },
  difficulty: {
    count: 0
  },
  proficiency: {
    count: 0
  },
  setback: {
    count: 0
  }
})

Screenshot with notation set:

Set Notation


Version: 1.1
Genesys Results
This module has most of the same features as Display Results. It takes the final result object as input and creates a modal popup window displaying the final roll result totals.

Display Results Screenshot

This module supplies symbols matching the dice face values and colorizes them to match the die that produced them.

note
This module is for use with the Genesys dice theme. The main intention of this module is to function as an example of how to create your own UI interface for the Dice Box.

Install
Add the dice-ui module using

npm install @3d-dice/dice-ui

Setup
Then create a new instance of the roller

import { GenesysResults } from '@3d-dice/dice-ui'

const Display = new GenesysResults()

Config
The constructor only accepts one argument which is a CSS selector where this component should be injected into the DOM.

Option	type	default	Description
target	string :dom node selector	document.body	The target DOM node to inject the display results into
Methods
Method	Arguments	Description
showResults	rollResults :object	Takes roll results as input and generates a popup display
clear	none	hides the popup display with a CSS transition effect
Styles
All styles are scoped to .genesysResults.

class name	example
die-boost	
die-setback	
die-ability	
die-difficulty	
die-challenge	
die-proficiency	
note
Empty faces with no value are not shown in the results

Tooltips
A simple tooltip has been implemented in this module to help identify the symbols on hover. Display Results with tooltip Screenshot



# dice-box-threejs
3D Dice implemented with ThreeJS and Cannon ES

Based on [Major's 3D Dice](https://majorvictory.github.io/3DDiceRoller/)

The goal of this project is to decouple the UI of Major's 3D Dice and strip down the dice box to just the essentials. Just a module that accepts simple dice notation input and outputs a JSON object when the dice finish rolling.

Why another dice roller when you have [@3d-dice/dice-box](https://github.com/3d-dice/dice-box)?
Teall dice had already solved predeterministic rolling, which is a feature some developers really need. Major's 3D dice are based on Teall Dice.

## Demo
https://codesandbox.io/s/dice-box-threejs-j79h35?file=/src/index.js

## Install using NPM
```
npm install @3d-dice/dice-box-threejs
```

## Config Options
```
const defaultConfig = {
	framerate: (1/60),
	sounds: false,
	volume: 100,
	color_spotlight: 0xefdfd5,
	shadows: true,
	theme_surface:  "green-felt",
	sound_dieMaterial: 'plastic',
	theme_customColorset: null,
	theme_colorset: "white", // see available colorsets in https://github.com/3d-dice/dice-box-threejs/blob/main/src/const/colorsets.js
	theme_texture: "", // see available textures in https://github.com/3d-dice/dice-box-threejs/blob/main/src/const/texturelist.js
	theme_material: "glass", // "none" | "metal" | "wood" | "glass" | "plastic"
	gravity_multiplier: 400,
	light_intensity: 0.7,
	baseScale: 100,
	strength: 1, // toss strength of dice
	onRollComplete: () => {}
}
```

## Getting Results
### There are three ways to get results
1. You can define an `onRollComplete` callback function when creating the Dice Box
```
const Box = new DiceBox("#scene-container",{
  onRollComplete: (results) => {
    console.log(`I've got results :>> `, results);
  }
});
```
2. You can listen for the custom event that is triggered when results are ready
```
document.addEventListener("rollComplete",(e => {
  console.log(`I've got custom event results :>> `, e.detail);
}))
```
3. You can await the results from the `roll` method. Just be sure the function this call is in is `async`
```
setTimeout(async () => {
  const result = await Box.roll("6d6")
  console.log('result :>> ', result);
}, 1000);
```

## Predetermined Outcomes
As mentioned previously, this project was forked for it's predeterministic rolling capability. The notation to roll your predetermined outcomes looks like this:
```
Box.roll("6d6@4,4,4,4,4,4") // rolls six dice that will land on 4's
```

## Notes
In order to use textures or sounds, you will need to manually copy the assets out of the `./public` folder and into your static assets folder where you're building your app.