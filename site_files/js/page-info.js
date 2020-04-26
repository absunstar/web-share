const {
    ipcRenderer,
    desktopCapturer
} = require('electron');


window.addEventListener('load', () => {
    let image = document.querySelector('meta[property="og:image"]')

    ipcRenderer.send('page-info', {
        image_url: image ? image.content : '/images/no.png'
    })

})