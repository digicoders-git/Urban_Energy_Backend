const bcrypt = require("bcrypt");

(async () => {
  const password = "admin123"; // 👈 jo password chahiye
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
})();