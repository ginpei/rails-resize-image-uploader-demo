# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

document.addEventListener 'turbolinks:load', () ->
  form = document.querySelector('.js-post-form')
  form?.addEventListener 'submit', (event) =>
    event.preventDefault()
    csrfToken = document.querySelector('meta[name="csrf-token"]').content

    buildThriftyData(form, 400, 400)
      .then (data) =>
        fetch "#{form.action}.json", {
          method: form.method
          headers:
            'X-CSRF-Token': csrfToken
          body: data
        }
      .then (response) ->
        response.json()
      .then (data) ->
        console.log data
        if data.location
          Turbolinks.clearCache()
          Turbolinks.visit(data.location)
      .catch (error) ->
        console.error error
        form.querySelector('[data-disable-with]').disabled = false

      return

      xhr = new XMLHttpRequest()
      xhr.onload = ->
        try
          data = JSON.parse(xhr.responseText)
          location = data.locate
          Turbolinks.clearCache()
          Turbolinks.visit(location)
        catch error
          console.error error
          form.querySelector('[data-disable-with]').disabled = false
      xhr.open(form.method, "#{form.action}.json")
      xhr.setRequestHeader('X-CSRF-Token', csrfToken)
      xhr.send(data)

      # TODO move to result page
