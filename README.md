ExitFlickr
==========

An industrial strength [Node.js](http://nodejs.org/) app that backs-up the original sizes of photos in sets to your local machine.

This app **ONLY** downloads _photos that are in sets_.

# Set-up
1. Make sure you have [Node.js](http://nodejs.org/) installed on your machine.
2. [Request an API key](http://www.flickr.com/services/apps/create/apply/). Click on Non-commericial. For the name you can anything or use "ExitFlickr". You'll automatically get a key. In `app.'s` fill in the `api_key` and `secret` with these credentials.

# Instructions
1. Download this repo.
2. Open up your favorite command line tool (like Terminal) and navigate to the `ExitFlickr` folder.
3. Run `npm install` to install the dependencies.
4. Run `npm start` to start the app.
5. The first time you run the app you'll be asked to enter in a code, enter this code, and add the variables from command line to `app.js` to avoid having to re-enter the code.

# Notes
- ExitFlickr uses the [node-flickrapi](https://github.com/Pomax/node-flickrapi) node.js library.
- The number of simultaneous downloads is limited to 10. I found around 20 connections led to Flickr hanging up the connection.
- Photos will be downloaded in the `data/images` folder.


