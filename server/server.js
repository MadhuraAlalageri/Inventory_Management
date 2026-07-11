require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5003;

console.log("APP FILE PATH:", __filename);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});