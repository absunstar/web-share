if (window.torrentPost) {
    window.torrentPost.genres.forEach((gen) => {
        document.querySelector('#genres').innerHTML += `  <span> ${gen} </span> `;
    });
    window.torrentPost.torrents.forEach((tor) => {
        document.querySelector('#xpostId').innerHTML += `<a target="_blank" href="${tor.url}"> Download ${tor.quality} ${tor.type} ( ${tor.size} ) Torrent </a>`;
    });
}

console.log('Blogger From Egytag.com');
