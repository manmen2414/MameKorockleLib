import { device, programLib } from "../web/export.js";
import Korockle from "../web/korockle.js";
const { Color } = programLib;
/**@type {Korockle?} */
let korockle = null;
async function connect() {
  if (!korockle) {
    const hid = await device.getKorockle();
    korockle = new Korockle(hid);
    $("#connectinfo").attr("class", "connected").text("Connected");
  } else {
    korockle.hid.close();
    korockle = null;
    $("#connectinfo").attr("class", "unconnected").text("Unconnected");
  }
}
function rgbLive() {
  setInterval(async () => {
    if (!korockle) return;
    const rgb = $("#color").val().substring(1);
    const color = Color.fromRGB(rgb);
    $("#r").text(color.red);
    $("#g").text(color.green);
    $("#b").text(color.blue);
    await korockle.led(color);
  }, 100);
}
function timeLive() {
  setInterval(async () => {
    if (!korockle) return;
    const time = $("#time");
    const [hourStr, minuteStr] = time.val().split(":");
    await korockle.setTime(parseInt(hourStr), parseInt(minuteStr));
  }, 300);
}
function bodyIsLight() {
  setInterval(async () => {
    if (!korockle) return;
    const data = await korockle.getInfo();
    const color = Math.floor((data.light / 100) * 255);
    const color16 = ("0" + color.toString(16)).slice(-2);
    $("body").css("background-color", "#" + color16 + color16 + color16);
  }, 100);
}
function youtube() {
  const VIDEOID = "gRiQDRZSM0U";
  let player;
  let pushing = false;
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("player", {
      videoId: VIDEOID,
      width: 960,
      height: 540,
      events: {
        onReady: onPlayerReady,
      },
    });
  };
  function onPlayerReady(event) {
    setInterval(async () => {
      if (!korockle) return;
      const data = await korockle.getInfo();
      if (!pushing && data.isButtonClicking) {
        const state = player.getPlayerState();
        if (state === 2 || state === 5) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      }
      pushing = data.isButtonClicking;
      const time = player.getCurrentTime();
      const minute = Math.floor(time / 60);
      const second = time % 60;
      await korockle.setTime(minute, second);
    }, 100);
  }
  $('<script src="https://www.youtube.com/iframe_api"></script>').appendTo(
    $("head")
  );
}

$(() => {
  $("#connect").on("click", (ev) => {
    connect();
  });
  youtube();
});
