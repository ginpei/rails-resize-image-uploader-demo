Rails demo app that resizes image files smaller before uploading.

The core idea is that it scales down images before upload to the server, using HTML canvas.

See [app/app/assets/javascripts/buildThriftyData.js](app/app/assets/javascripts/buildThriftyData.js).

# Get started

You need [Docker](https://www.docker.com/get-started). Otherwise you need MySQL that host is named `db`.

```console
$ git clone git@github.com:ginpei/rails-resize-image-uploader-demo.git
$ cd rails-resize-image-uploader-demo
$ docker-compose up
```

(Hold `Ctrl+C` to stop Docker container.)

For the first time, you have to set DB up as you know. While the above Docker container is running, execute this in another console.

```console
$ docker-compose run app rake db:setup
```

OK then everything is ready now. Open the app in your browser and try.

- [http://localhost:3000/posts](http://localhost:3000/posts)
