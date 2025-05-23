---
layout: post
title: I built a Listenbrainz widget
description: A post detailing how and why I built a Listenbrainz now playing widget
date: 2025-05-23
modified: 
categories: 
tags:
  - Listenbrainz
  - Jekyll
  - Navidrome
  - JavaScript
  - music
---

# Bye bye, Spotify
As an alternative to Spotify, I recently started using using [Navidrome](https://www.navidrome.org/). For recommendations, I also started [scrobbling](https://www.collinsdictionary.com/dictionary/english/scrobble) to [Listenbrainz](https://listenbrainz.org).

I thought it would be cool to embed a little widget onto my website to show what I was listening to, but I couldn't find a Listenbrainz widget anywhere in the wild, so I built one myself.

# How it works
The widget reaches out to the Listenbrainz API to see what I'm listening to (or what I last listened to) and displays it with a link that takes you to [my Listenbrainz profile](https://listenbrainz.org/user/jasoncrevier/).

Here's what it looks like (you can also see it on the [homepage]({{site.url}})):

![Screenshot of the widget]({{site.url}}/assets/post-images/widget.png)

# It's Jekyll ready

Because I'm using [Jekyll](https://jekyllrb.com/) to build my site, I built it as an Include, but it should be fairly easy to adapt it for use elsewhere.

You can find the source for it on the [Github repo](https://github.com/jasoncrevier/website) that builds this site:
- HTML: [now_playing.html](https://github.com/jasoncrevier/website/blob/master/_includes/now_playing.html)
- JavaScript: [now_playing.js](https://github.com/jasoncrevier/website/blob/master/assets/js/now_playing.js)