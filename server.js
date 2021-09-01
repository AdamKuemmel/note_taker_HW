const express = require("express");
const path = require("path");

const uuid = require("./helpers/uuid");
const fs = require("fs");

const util = require("util");

const readFromFile = util.promisify(fs.readFile);
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);
app.get("/api/notes", (req, res) => {
  console.log(`${req.method} request received to get notes`);
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});
const writeToFile = (destination, note) => {
  fs.writeFile(destination, JSON.stringify(note, null, 4), (err) =>
    err ? console.error(err) : console.info("Succesfully updated notes")
  );
};
const append = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      throw err;
    } else {
      const note = JSON.parse(data);
      note.push(content);
      writeToFile(file, note);
    }
  });
};

app.post("/api/notes", (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    append(newNote, "./db/db.json");

    const response = {
      status: "well done!",
      body: newNote,
    };

    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
