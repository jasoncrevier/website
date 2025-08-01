/* Mastodon/Jekyll integration */
/* On page initialization, will look for a mastodon_timeline element
   If found, will load the rss feed from the instance, and display the first N
   items. */
/* Heavily inspired by:
   https://css-tricks.com/how-to-fetch-and-parse-rss-feeds-in-javascript/ */

const MastodonBar = {

  config: {
    instanceName: 'universeodon.com',
    userName: 'null',
    profileImg: '/assets/img/avatar.jpg',
    itemsToDisplay: 5,
  },

  displayItems: function (data, dom) {

    const items = Array.from(data.querySelectorAll("item")).slice(0, MastodonBar.config.itemsToDisplay);
    var html = '';

    items.forEach(item => {

      var mediaHtml = '';
      const media = item.querySelectorAll("content");
      media.forEach(me => {

        const type = me.attributes['type'].value;
        const url = me.attributes['url'].value;
        const alt = (me.querySelector('description') || {}).innerHTML;
        if (/image/.test(type)) mediaHtml += `
          <p><img src="${url}" alt="${alt}" style="width:50%;height:50%;" /></p>
        `;
      });

      /* Create short date/time string. */
      const date = new Date(item.querySelector("pubDate").innerHTML);
      const dateStr = date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

      html += `
        <article class="mastodon-item">
        <a style="font-size: 12px;" href="${item.querySelector("link").innerHTML}" target="_blank" rel="noopener">${dateStr}</a>
          <h4><a href="${item.querySelector("link").innerHTML}" target="_blank" rel="noopener">
            <img alt="profile avatar" class="author-avatar" style="width:30px;height:30px;border-radius:100%;" src="${MastodonBar.config.profileImg}"></a>

            <a href="${item.querySelector("link").innerHTML}" target="_blank" rel="noopener">
              @${MastodonBar.config.userName}@${MastodonBar.config.instanceName}
            </a></h4>
            
          ${mediaHtml}
          <p>
            ${MastodonBar.decodeHTML(item.querySelector("description").innerHTML)}
          </p>
        </article>
      `;
    });

    dom.innerHTML = html;
  },

  decodeArea: document.createElement('textarea'),

  decodeHTML: function (html) {
    MastodonBar.decodeArea.innerHTML = html;
    return MastodonBar.decodeArea.value;
  },

  init: function () {
    const timeline = document.getElementById("mastodon_timeline");
    if (timeline != null) {
      console.log("Initialize mastodon");

      const rssUrl = `https://${MastodonBar.config.instanceName}/users/${MastodonBar.config.userName}.rss`;

      fetch(rssUrl).then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => MastodonBar.displayItems(data, timeline));
    }
  },
};

document.addEventListener('DOMContentLoaded', MastodonBar.init);