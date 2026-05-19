const app = require('./app');

const PORT = 5000;

console.log("APP FILE PATH:", __filename);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});