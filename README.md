<div align='center'>
	<h1>Kogs in Town</h1>
	<p>It's like Bands in Town, but custom-made for me!</p>
	<a href='https://bands.kognise.dev' target='_blank'><img src='https://doggo.ninja/IFbjNY.png' alt='A screenshot of the website. Title: Kogs in Town. Subtitle: Local shows around San Francisco. Website body is a list of musical artists with accompanying images, dates, and locations.' width='800'></a>
</div>

## What?

Spotify's Live Events feature is awesome, but it misses a bunch of local shows. Every other event aggregator, Bands in Town as a salient example, also misses lots of events. They also tend to have absolutely horrible UIs that do not at all facilitate quickly scanning through shows.

So I made my own personal tool that pulls from the websites of a couple of venues close to where I live. It also uses Spotify's private API (shh, don't tell anyone) to pull my list of recommended live events.

It has a fast, dense UI that facilitates scanning. If I feel like it, I will add features in the future to save events or hide them.

## Where Does It Pull from?

- The Regency Ballroom
- The Warfield
- Bill Graham Civic Auditorium
- Oracle Park Concert Series
- Spotify Personal Suggestions
- Spotify Popular in Your Area

## Can I Use This?

Probably not. Well, it has a public URL, so be my guest, but it probably won't be very helpful to you unless you live with me and have the same music taste as me. (So, my roommate might actually find it helpful. Hi Galen.)

I'm putting it on GitHub because sharing source code is fun and important to the world. If you want a similar tool for yourself, fork this! I bet you can use some of the code!

Live URL: https://bands.kognise.dev/

## Bucket List

- Display a warning when data is out of date due to a fetch error
- Hiding/highlighting functionality (maybe refactor to Preact or something)
- GitHub-style heatmap