# Pixel2D
Pixel2D is a simple, WebGL-based tile map editor. It allows you to create maps by placing rectangular tiles on a canvas, along
with arbitrary sprites and other visual elements.

The current code uses Angular 2 for the frontend along with Java and Spring Boot on the backend. Scaffolding is based on the
awesome [angular2-webpack-starter](https://github.com/AngularClass/angular2-webpack-starter) project. WebGL rendering uses the
equally awesome [PixiJS](http://www.pixijs.com/) library.

This project originally started as a way for me to get familiar with Angular 2 and the whole ecosystem of technologies surrounding
it. It's more of a learning effort than anything else, but hopefully in time it may grow to be a useful tool for anyone who's into
building levels for tile-based games. :)

![Screenshot](http://i.imgur.com/eQnABG5.png)

## Building
You can run a NodeJS server which will start the UI in development mode:

```
cd src/main/webapp
npm run server:dev:hmr
```
Afterwards, open http://localhost:3000 in your favorite browser.
