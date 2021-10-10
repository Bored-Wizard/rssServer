const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./Models/user");
const Rss = require("./Models/rssFeed");
const Banner = require("./Models/banner");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWTSEC = "efvrbwlrtvkwed349pfqu0v[q]vrivrdcmwc";
const app = express();
app.use(bodyparser.json());
app.use(
  cors({
    origin: "*",
  })
);
mongoose
  .connect(
    "mongodb+srv://sutron:tron1234@rss.dsjmp.mongodb.net/rsstest?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to db");
  })
  .catch((e) => {
    console.log(e);
  });
const port = 5005;

// Get all rss data without authentication
app.get("/api/rss", async (req, res) => {
  try {
    let data = await Rss.find().lean();
    if (!data) {
      return res.json({ status: "error", message: "Unable to fetch data" });
    } else {
      return res.json({ status: "OK", message: "Got the data!!!", data: data });
    }
  } catch (e) {
    console.log(e);
  }
});

app.get("/api/banner", async (req, res) => {
  try {
    let data = await Banner.find().lean();
    if (!data) {
      return res.json({ status: "error", message: "Unable to fetch data" });
    } else {
      return res.json({ status: "OK", message: "Got the data!!!", data: data });
    }
  } catch (e) {
    console.log(e);
  }
});

// Get Default rss without auth
app.post("/api/defaultrss", async (req, res) => {
  let { title } = req.body;
  try {
    let data = await Rss.findOne({ title }).lean();
    if (!data) {
      return res.json({ status: "error", message: "Unable to fetch data" });
    } else {
      return res.json({ status: "OK", message: "Got the data!!!", data: data });
    }
  } catch (e) {
    console.log(e);
  }
});

// add rss with auth
app.post("/api/addrss", async (req, res) => {
  const { title, rssArray, token } = req.body;
  try {
    const verify = jwt.verify(token, JWTSEC);
    const isData = await Rss.findOne({title});
    if(isData){
      const newData = await Rss.findOneAndReplace({
        title,
        rssArray,
      })
      if(newData){
        return res.json({ status: "OK", message: "Data updated on db" });
      }else{
        return res.json({
          status: "error",
          message: "Unable to update the data on db!!!",
        });
      }
    }
    const dbres = await Rss.create({
      title,
      rssArray,
    });
    if (!dbres) {
      return res.json({
        status: "error",
        message: "Unable to add the data to db!!!",
      });
    } else {
      return res.json({ status: "OK", message: "Data added to db" });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      status: "error",
      message: "Unable to add the data to db!!!",
    });
  }

  // }
});

app.post("/api/addBanner", async (req, res) => {
  const { imgUrl, mainUrl, token } = req.body;
  try {
    const verify = jwt.verify(token, JWTSEC);
    const dbres = await Banner.create({
      imgUrl,
      mainUrl,
    });
    if (!dbres) {
      return res.json({
        status: "error",
        message: "Unable to add the data to db!!!",
      });
    } else {
      return res.json({ status: "OK", message: "Data added to db" });
    }
  } catch (e) {
    console.log(e);
  }
});

// add rss with auth
app.post("/api/delrss", async (req, res) => {
  const { title, token } = req.body;
  try {
    const verify = jwt.verify(token, JWTSEC);
    const data = await Rss.findOneAndDelete({ title });
    if (data) {
      return res.json({ status: "OK", message: "Delected successfully!" });
    } else {
      return res.json({ status: "OK", message: "Unable to delete!" });
    }
  } catch (e) {
    console.log(e);
  }
});

app.post("/api/delBanner", async (req, res) => {
  const { imgUrl, token } = req.body;
  try {
    const verify = jwt.verify(token, JWTSEC);
    const data = await Banner.findOneAndDelete({ imgUrl });
    if (data) {
      return res.json({ status: "OK", message: "Delected successfully!" });
    } else {
      return res.json({ status: "OK", message: "Unable to delete!" });
    }
  } catch (e) {
    console.log(e);
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.json({
        status: "error",
        message: "Username or Password incorrect",
      });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id, username: user.username }, JWTSEC);

      return res.json({ status: "OK", data: token });
    } else {
      return res.json({
        status: "error",
        message: "Username or Password incorrect",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

app.post("/api/register", async (req, res) => {
  const { username, password: plainPassword } = req.body;
  if (!plainPassword || plainPassword.length < 6) {
    return res.json({
      status: "error",
      message: "password should be 6 character in length",
    });
  }
  const password = await bcrypt.hash(plainPassword, 10);
  try {
    const result = await User.create({
      username,
      password,
    });
  } catch (e) {
    console.log(JSON.stringify(e));
    if (e.code === 11000) {
      return res.json({ status: "error", message: "Username already in use" });
    }
    throw e;
  }
  res.json({ status: "OK", message: "User made successfully" });
});

app.listen(port, () => {
  console.log("server started at port", port);
});
