const fs = require("fs");

async function run() {
  // 1x1 transparent PNG
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const buffer = Buffer.from(pngBase64, "base64");
  
  const formData = new FormData();
  formData.append("image", new Blob([buffer], { type: "image/png" }), "test.png");

  const res = await fetch("http://localhost:3000/api/recognize", {
    method: "POST",
    body: formData
  });
  
  console.log(res.status);
  console.log(await res.text());
}

run();
