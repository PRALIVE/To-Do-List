//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//making connection to mingodb server
// mongoose.connect("mongodb://0.0.0.0:27017/todoListDB");

//making connection to mongodb atlas on aws database on web
mongoose.connect(
  "mongodb+srv://YUAMIKAMI:BigTBigA@cluster0.3uiowmr.mongodb.net/todoListDB"
);
//making a schema
const listSchema = {
  name: String,
};

//making a model for collections in mongodb
const Item = mongoose.model("Item", listSchema);

const item1 = new Item({
  name: "Buy Food",
});

const item2 = new Item({
  name: "Cook Food",
});

const item3 = new Item({
  name: "Eat Food",
});

const defaultitems = [item1, item2, item3];

const Customlistschema = {
  name: String,
  listarray: [listSchema],
};

const Customlist = mongoose.model("List", Customlistschema);

app.get("/", function (req, res) {
  const day = date.getDate();

  Item.find(function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultitems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added in todoListDB");
        }
      });
      res.render("/");
    } else {
      res.render("list", { listTitle: day, newListItems: items });
    }
  });
});

app.get("/:customlistname", function (req, res) {
  const customnane = _.capitalize(req.params.customlistname);

  Customlist.findOne({ name: customnane }, function (err, foundedList) {
    if (!err) {
      if (!foundedList) {
        //create a new list
        const list = new Customlist({
          name: customnane,
          listarray: defaultitems,
        });
        list.save();
        res.redirect("/" + customnane);
      } else {
        //show the existing list
        res.render("list", {
          listTitle: foundedList.name,
          newListItems: foundedList.listarray,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemadd = req.body.newItem;
  const listnam = req.body.list;

  const itemadded = new Item({
    name: itemadd,
  });

  if (listnam === date.getDate()) {
    itemadded.save();
    res.redirect("/");
  } else {
    Customlist.findOne({ name: listnam }, function (err, founded) {
      founded.listarray.push(itemadded);
      founded.save();
      res.redirect("/" + listnam);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === date.getDate()) {
    Item.deleteOne({ _id: checkeditemid }, function (err, deleted) {
      if (err) {
        console.log(err);
      } else {
        console.log("deleted Successfully");
        res.redirect("/");
      }
    });
  } else {
    Customlist.findOneAndUpdate(
      { name: listName },
      { $pull: { listarray: { _id: checkeditemid } } },
      function (err, found) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

// app.listen(3000, function() {
//   console.log("Server started successfully");
// });
