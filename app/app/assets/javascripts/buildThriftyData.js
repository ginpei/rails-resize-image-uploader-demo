// @ts-check

/**
 * Build form data resizing image files smaller as specified.
 * @param {HTMLFormElement} form
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @returns {Promise<FormData>}
 * @example
 * // basic idea in JavaScript
 * const form = document.querySelector('#the-form'); // <form id="the-form">
 * form.onsubmit = async (event) => {
 *   event.preventDefault();
 *   const body = await buildThriftyData(form, 400, 400);
 *   const { action, method } = form;
 *   fetch(action, { method, body });
 * };
 * @example
 * # in CoffeeScript on Ruby on Rails
 * document.addEventListener 'turbolinks:load', () ->
 *   form = document.querySelector('#the-form'); // <form id="the-form">
 *   form?.addEventListener 'submit', (event) ->
 *     event.preventDefault()
 *
 *     # don't forget CSRF token!
 *     csrfToken = document.querySelector('meta[name="csrf-token"]').content
 *
 *     buildThriftyData(form, 400, 400)
 *       .then (data) ->
 *         fetch "#{form.action}.json", {
 *           method: form.method
 *           headers:
 *             'X-CSRF-Token': csrfToken
 *           body: data
 *         }
 *       .then (response) ->
 *         response.json()
 *       .then (data) ->
 *         # Let's say your controller returns next URL in `location`
 *         if data.location
 *           Turbolinks.clearCache()
 *           Turbolinks.visit(data.location)
 *       .catch (error) ->
 *         # handle error in any way
 *         console.log error
 */
window.buildThriftyData = async function (form, maxWidth, maxHeight) {
  if (!form || form.nodeName !== 'FORM') {
    throw new Error('Form element must be given');
  }

  const inputs = Array.from(form.querySelectorAll('input[type=file]'));
  const smallImages = await createSmallImages(inputs, maxWidth, maxHeight);
  const data = prepareFormData(form, smallImages);
  return data;

  // ----------------

  /**
   * @param {(Element | HTMLInputElement)[]} inputs These have to be input elements.
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @returns {Promise<IThriftyImage[]>}
   */
  function createSmallImages (inputs, maxWidth, maxHeight) {
    return Promise.all(inputs.map(async (el) => {
      if (!(el instanceof HTMLInputElement)) {
        throw new Error('Element must be an input');
      }

      const file = el.files[0];

      const row = {
        name: el.name,
        filename: file ? file.name : '',
        blob: null,
        originalSize: file ? file.size : 0,
      }

      const image = await readFileAsImage(file);
      if (image) {
        const smallImageData = await makeSmallImage(image, maxWidth, maxHeight, file.type);

        // if the file was small enough,
        // this result could be larger than the original
        row.blob = smallImageData.size < file.size ? smallImageData : file;

        // log for demo
        console.log(`[buildThriftyData] : ${row.name} ${row.originalSize} -> ${row.blob.size}`,
          `(${Math.round(row.blob.size / row.originalSize * 1000) / 10}%)`);
      }

      return row;
    }));
  }

  /**
   * @param {File | null} file
   * @returns {Promise<HTMLImageElement>}
   */
  function readFileAsImage (file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const image = document.createElement('img');
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * @param {HTMLImageElement} image
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @param {string} [type]
   * @returns {Promise<Blob>}
   */
  function makeSmallImage (image, maxWidth, maxHeight, type) {
    const { width, height } = calculateFillSize(image, maxWidth, maxHeight);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, type);
    });
  }

  /**
   *
   * @param {HTMLImageElement} original
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @returns {ISize}
   */
  function calculateFillSize (original, maxWidth, maxHeight) {
    if (!original || original.nodeName !== 'IMG') {
      throw new Error('Image element must be given');
    }

    if (!(maxWidth > 0 && maxHeight > 0)) {
      throw new Error('Max size must be greater than 0');
    }

    const width = original.naturalWidth;
    const height = original.naturalHeight;

    let scale;
    if (width < maxWidth && height < maxHeight) {
      scale = 1;
    } else {
      scale = Math.min(maxWidth / width, maxHeight / height);
    }

    const size = {
      height: height * scale,
      width: width * scale,
    };
    return size;
  }

  /**
   * @param {HTMLFormElement} form
   * @param {IThriftyImage[]} imageData
   */
  function prepareFormData (form, imageData) {
    const data = new FormData(form);

    for (const name of data.keys()) {
      const row = imageData.find(v => v.name === name);
      if (row) {
        data.set(name, row.blob, row.filename);
      }
    }

    return data;
  }
};
