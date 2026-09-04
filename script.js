function formatDate(date) {
  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return date.toLocaleDateString(navigator.language, options).replace(/,/, ",");
}

async function fetchLastTrack() {
  try {
    const response = await fetch(
      "https://lastfm-last-played.biancarosa.com.br/hadi7546/latest-song",
    );
    const data = await response.json();
    const track = data.track;

    const trackElement = document.getElementById("lastfm-track");

    const image =
      track.image.find((img) => img.size === "extralarge") ||
      track.image.find((img) => img.size === "large") ||
      track.image[track.image.length - 1];

    const isNowPlaying = track["@attr"] && track["@attr"].nowplaying === "true";
    const playStatus = isNowPlaying
      ? '<div class="play-date now-playing">Now playing</div>'
      : `<div class="play-date bright-date">${formatDate(new Date(track.date.uts * 1000))}</div>`;

    trackElement.innerHTML = `
            <div class="track-info">
                <img src="${image["#text"]}" alt="Album cover" class="album-cover" onerror="this.style.display='none'">
                <div class="track-details">
                    <a class="track-name" href="${track.url}" target="_blank" title="${track.name}">${track.name}</a>
                    <div class="artist-name" title="by ${track.artist["#text"]}">by ${track.artist["#text"]}</div>
                    <div class="album-name" title="from ${track.album["#text"]}">from ${track.album["#text"]}</div>
                    ${playStatus}
                </div>
            </div>
        `;
  } catch (error) {
    console.error("Error fetching Last.fm data:", error);
    document.getElementById("lastfm-track").innerHTML =
      '<div class="error">Unable to load track information</div>';
  }
}

async function fetchLastCommit() {
  try {
    const response = await fetch(
      "https://api.github.com/users/hadi7546/events/public",
    );
    const data = await response.json();

    const pushEvent = data.find((event) => event.type === "PushEvent");

    if (pushEvent) {
      const commit = pushEvent.payload.commits[0];
      const repo = pushEvent.repo.name.split("/")[1];
      const repoUrl = `https://github.com/${pushEvent.repo.name}`;
      const date = formatDate(new Date(pushEvent.created_at));
      const repoImageUrl = `https://opengraph.githubassets.com/1/${pushEvent.repo.name}`;

      const commitElement = document.getElementById("github-commit");

      commitElement.innerHTML = `
        <div class="commit-info">
          <div class="commit-details">
            <a class="commit-message" href="${commit.url.replace("api.github.com/repos", "github.com").replace("/commits/", "/commit/")}" target="_blank" title="${commit.message.split("\n")[0]}">${commit.message.split("\n")[0]}</a>
            <div class="commit-repo" title="in ${repo}">in <a href="${repoUrl}" target="_blank">${repo}</a></div>
            <div class="commit-date bright-date">${date}</div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    document.getElementById("github-commit").innerHTML =
      '<div class="error">Unable to load commit information</div>';
  }
}

async function fetchLastTypeTest() {
  try {
    const apeKey =
      "NjhiNDE4MzBlZmY2N2M0ZmRjNjE4OTBlLlRHbmVNampEemxnSllFXzc5TW02TVByZ2hlNFp2Q1VU";
    const response = await fetch("https://api.monkeytype.com/results/last", {
      headers: {
        Authorization: `ApeKey ${apeKey}`,
      },
    });
    const data = await response.json();
    const test = data.data;

    const testElement = document.getElementById("monkeytype-test");
    const date = formatDate(new Date(test.timestamp));
    const modeDisplay =
      test.mode === "time"
        ? `${test.mode} ${test.testDuration}s`
        : test.mode + test.mode2;
    // Scaled against 200 WPM so the bar reads like a machine's throughput gauge.
    const wpmRatio = Math.max(0, Math.min(1, test.wpm / 200));
    testElement.innerHTML = `
      <div class="test-info">
        <div class="test-details">
          <div class="test-wpm">${test.wpm} WPM</div>
          <div class="fc-bar fc-bar--green test-bar">
            <div class="fc-bar-fill" style="width: ${(wpmRatio * 100).toFixed(1)}%"></div>
          </div>
          <div class="test-accuracy">${test.acc}% accuracy</div>
          <div class="test-mode">mode: ${modeDisplay}</div>
          <div class="test-date bright-date">${date}</div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching MonkeyType data:", error);
    document.getElementById("monkeytype-test").innerHTML =
      '<div class="error">Unable to load test information</div>';
  }
}

function setupMusicPlayer() {
  const musicToggle = document.getElementById("music-toggle");
  const music = document.getElementById("background-music");

  if (musicToggle && music) {
    const playIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M8 5v14l11-7z"/></svg>';
    const pauseIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

    const render = () => {
      const playing = !music.paused;
      musicToggle.innerHTML = playing ? pauseIcon : playIcon;
      musicToggle.classList.toggle("is-playing", playing);
      musicToggle.setAttribute("aria-pressed", String(playing));
    };

    musicToggle.addEventListener("click", () => {
      if (music.paused) {
        music.play();
      } else {
        music.pause();
      }
    });

    music.addEventListener("play", render);
    music.addEventListener("pause", render);
    render();
  }
}

function ensureCursorPersistence() {
  document.addEventListener("click", () => {
    setTimeout(() => {
      const html = document.querySelector("html");
      const styleAttr = html.getAttribute("style") || "";

      if (!styleAttr.includes("cursor")) {
        html.style.cursor = "url('public/arrow.cur'), auto";
      }

      document
        .querySelectorAll("a, button, .home-link, [role='button']")
        .forEach((el) => {
          const elStyle = el.getAttribute("style") || "";
          if (!elStyle.includes("cursor")) {
            el.style.cursor = "url('public/click.cur'), pointer";
          }
        });

    }, 10);
  });

  document.querySelectorAll("a").forEach((link) => {
    if (link.host === window.location.host) {
      link.addEventListener("click", (e) => {
        const cursorStyle = document.createElement("style");
        cursorStyle.textContent = `* { transition: none !important; }`;
        document.head.appendChild(cursorStyle);
      });
    }
  });
}

function setupAgeHover() {
  const ageElement = document.querySelector(".age-hover");
  if (!ageElement) {
    return;
  }

  const labelText = ageElement.dataset.ageLabel || ageElement.textContent.trim();
  const baseAgeYears = Number.parseFloat(ageElement.dataset.ageYears);
  const birthdateRaw = ageElement.dataset.birthdate;
  const birthDate = birthdateRaw ? new Date(birthdateRaw) : null;
  const hasBirthDate = birthDate && !Number.isNaN(birthDate.getTime());
  const baseStartRaw = ageElement.dataset.ageStart;
  const baseStartDate = baseStartRaw ? new Date(baseStartRaw) : null;
  const hasBaseStart = baseStartDate && !Number.isNaN(baseStartDate.getTime());
  const msPerYear = 1000 * 60 * 60 * 24 * 365.2425;
  const baseTimestamp = hasBaseStart ? baseStartDate.getTime() : Date.now();

  let intervalId = null;

  const getAgeYears = () => {
    if (hasBirthDate) {
      return (Date.now() - birthDate.getTime()) / msPerYear;
    }
    if (Number.isFinite(baseAgeYears)) {
      return baseAgeYears + (Date.now() - baseTimestamp) / msPerYear;
    }
    return null;
  };

  const renderAge = () => {
    const age = getAgeYears();
    if (age !== null) {
      ageElement.textContent = age.toFixed(10);
    }
  };

  const startCounter = () => {
    renderAge();
    if (intervalId) {
      return;
    }
    intervalId = setInterval(renderAge, 50);
  };

  const stopCounter = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    ageElement.textContent = labelText;
  };

  ageElement.addEventListener("mouseenter", startCounter);
  ageElement.addEventListener("mouseleave", stopCounter);
}

document.addEventListener("DOMContentLoaded", () => {
  setupMusicPlayer();
  ensureCursorPersistence();
  setupAgeHover();

  if (document.getElementById("lastfm-track")) {
    fetchLastTrack();
    fetchLastCommit();
    fetchLastTypeTest();

    setInterval(fetchLastTrack, 30 * 1000);
    setInterval(fetchLastCommit, 5 * 60 * 1000);
    setInterval(fetchLastTypeTest, 5 * 60 * 1000);
  }
});
