// Set the Listenbrainz username
const username = "jasoncrevier";

// Set displayElement to the now-playing widget text from the now_playing.html file
const displayElement = document.getElementById("now-playing");

// Update the widget attributes for the username set above
displayElement.href = `https://listenbrainz.org/user/${username}/`;
displayElement.dataset.username = username;

// Define endpoints from Listenbrainz API
const endpoints = {
  nowPlaying: `https://api.listenbrainz.org/1/user/${username}/playing-now`,
  recentTrack: `https://api.listenbrainz.org/1/user/${username}/listens?count=1`,
};

// Function to check the API response and fail gracefully if it doesn't work
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

// Function to set the artist and track title returned from Listenbrainz (or set it to Unknown if nothing is found)
function renderTrack(statusLabel, track) {
  const artist = track?.artist_name || "Unknown Artist";
  const title = track?.track_name || "Unknown Track";
  displayElement.textContent = `🎧 ${statusLabel}: ${artist} – ${title}`;
}

// Function to update the widget
async function updateNowPlayingWidget() {
  try {
    // Fetch and parse data from the nowPlaying endpoint
    const nowPlayingData = await fetchJson(endpoints.nowPlaying);
    const playingNow = nowPlayingData?.payload?.playing_now;
    const currentTrack = nowPlayingData?.payload?.listens?.[0]?.track_metadata;

    // If something is currently playing, update the widget with Now Playing: currentTrack
    if (playingNow && currentTrack) {
      renderTrack("Now Playing", currentTrack);
      return;
    }

    // Fetch and parse data from the recentTrack endpoint
    const recentData = await fetchJson(endpoints.recentTrack);
    const recentTrack = recentData?.payload?.listens?.[0]?.track_metadata;

    // If nothing is currently playing, update the widget with Last Played: recentTrack
    if (recentTrack) {
      renderTrack("Last Played", recentTrack);
    }
    // If there is no recent track, update the widget to say This user has no listens yet
    else {
      displayElement.textContent = "🎧 This user has no listens yet";
    }
  }
  // If the script can't fetch the data, update the widget to say Error loading track info. 
  // Also give more details in the console
  catch (error) {
    console.error("Failed to update Now Playing widget:", error);
    displayElement.textContent = "🎧 Error loading track info";
  }
}

// Update the widget when the page loads, and then every minute after
updateNowPlayingWidget();
setInterval(updateNowPlayingWidget, 60000);