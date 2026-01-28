const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/doctors", require("./routes/doctors"));
app.use("/tokens", require("./routes/tokens"));

app.get("/", (req, res) => {
    res.json({ status: "OPD Token Allocation System running" });
});

app.listen(PORT, () => {
    console.log(`Server running 🚀 on http://localhost:${PORT}`);
});
