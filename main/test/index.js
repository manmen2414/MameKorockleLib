import * as lib from "../web.js";
/**@type {lib.Korockle?} */
let korockle = null;
async function connect() {
  if (!korockle) {
    const hid = await lib.getKorockle();
    korockle = new lib.Korockle(hid);
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
    const color = lib.Color.fromRGB(rgb);
    $("#r").text(color.red);
    $("#g").text(color.green);
    $("#b").text(color.blue);
    await korockle.led(color);
  }, 100);
}
$(() => {
  $("#connect").on("click", (ev) => {
    connect();
  });
  rgbLive();
});
