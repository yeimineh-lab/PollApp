const express = require("express");
const pollsRoutes = require("./routes/polls.routes.js");
const usersRoutes = require("./routes/users.routes.js");
const authRoutes = require("./routes/auth.routes.js");
const path = require("path");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../..")));     
app.use(express.static(path.join(__dirname, "../../client"))); 


app.get("/", (req, res) => res.send("Simple Poll API is running"));

app.use("/api/v1", pollsRoutes);
app.use("/api/v1", usersRoutes);
app.use("/api/v1", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
