const { createSerwistRoute } = require("@serwist/turbopack");
const handler = createSerwistRoute({ swSrc: "app/sw.ts" });
handler.GET({}, { params: Promise.resolve({ path: "sw.js" }) })
  .then(res => {
    console.log("Status:", res.status);
    console.log("Headers:");
    res.headers.forEach((v, k) => console.log(k, v));
  })
  .catch(console.error);
