# Setting up after cloning

```console
$ docker build -t resize-image-uploader-demo-app .
$ docker-component up -d
$ docker-compose exec rails rake db:create db:migrate db:seed
$ docker-component stop
```

# Start development

```console
$ docker-component up
```

Hold `Ctrl + C` to stop.

# Misc

## Migrate database

```console
$ docker-compose exec rails rake db:migrate
```

## List routes

```console
$ docker-compose exec rails rails routes
```
