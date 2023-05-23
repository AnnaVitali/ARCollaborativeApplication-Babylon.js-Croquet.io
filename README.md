# ARCollaborativeApplication-Babylon.js-Croquet.io

This repository contains some examples of applications made using Babylon.js and Croquet.io.

In detail the examples realized have as objective to create a collaborative AR experience thanks to the use of WebXR, enabling multiple user to see and interact with holograms visible in the same point in space thanks to the usage of a marker.

## WebXR Image Tracking
This example shows how it is possible to create a collaborative application that allows users to see a hologram at the same point of space thanks to the use of a target and the API provided by WebXR that is accessed through Babylon.js.

You can find the example inside the directory `WebXRImageTracking`.

![Alt Text](img/image_tracking_WebXR.gif)

To test the example this **image target** was used:

<img src="WebXRImageTracking/public/img/imageTracking.png"  width="200" height="200">

### Known issue

When a new user joins in an already started session, for which manipulations have already been carried out on the hologram, will start not synchronized, but will see the application in its initial state.

## Zappar  Image Tracking

This example shows how it is possible to create a collaborative application that allows users to see a hologram at the same point of space thanks to the use of a target and the API provided by [Zappar](https://github.com/zappar-xr/zappar-babylonjs) used with Babylon.js.

You can find the example inside the directory `ZapparImageTracking`.

![Alt Text](img/zappar_image_tracking.gif)

Compared to the previous example in this case you have the advantage that if a user enters a session already started finds the state of the application as it is currently and continues to see the hologram from its point of view.
In this case, moreover, the positioning of the hologram is more precise and the coordinates of it are expressed according to the target, see the code for more details.

![Alt Text](img/zappar_session_join.gif)

To test the example this **image target** was used:

<img src="img/example-tracking-image.png"  width="400" height="200">

## How to run the examples

Since WebXR only works on secure sites (https) or localhost, in order to launch the application with a specific IP address, you must associate a certificate to the web page. To do this you can use openssl and execute the following commands in the application directory:

```shell
openssl genrsa -out private_key.pem
```

```shell
openssl req -new -key private_key.pem -out csr.pem
```

```shell
openssl x509 -req -days 9999 -in csr.pem -signkey private_key.pem -out cert.pem
```

Once you have created the certificate you can launch the application by running the following commands:

```shell
npm install
```

```shell
node app.js
```
