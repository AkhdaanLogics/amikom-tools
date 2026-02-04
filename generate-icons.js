const sharp = require("sharp");

const iconPath = "./public/icon-app.png";

// Generate 192x192
sharp(iconPath)
  .resize(192, 192)
  .png()
  .toFile("./public/icon-192.png")
  .then(() => console.log("✓ icon-192.png created"))
  .catch((err) => console.error("Error creating 192:", err));

// Generate 512x512
sharp(iconPath)
  .resize(512, 512)
  .png()
  .toFile("./public/icon-512.png")
  .then(() => console.log("✓ icon-512.png created"))
  .catch((err) => console.error("Error creating 512:", err));
