const express = require("express");
const { connect } = require("./db/database");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/v1/users", userRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => res.status(500).json({ message: "Something went wrong" }));

const start = connect().then(() => app);

if (require.main === module) {
  start.then(() => console.log(`Server running on http://localhost:${PORT}`));
  start.then(app => app.listen(PORT));
}

module.exports = start;
