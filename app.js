//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));








const url = "mongodb+srv://admin:admin123@cluster0.aq21kv9.mongodb.net/todolist";
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

async function connect() {
  try {
    await mongoose.connect(url, mongooseOptions);
    console.log("Connect Mongodb success");
  } catch (err) {
    console.error(err);
  }
}
connect();









const itemsSchema = {
  name:String
};
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", async function(req, res) {
  const day = date.getDate();

  try {
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      await Item.insertMany(defaultItems);
      console.log("Success save in the DB");
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  } catch (err) {
    console.error(err);
  }
});

app.post("/", async function(req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: item
  });

  try {
    if (listName === "Today") {
      await newItem.save();
      res.redirect("/");
    } else {
      const foundList = await List.findOne({ name: listName });
      foundList.items.push(newItem);
      await foundList.save();
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.error(err);
  }
});


app.post("/delete", function (req, res) {
  const checkId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkId)
      .then(() => {
        console.log("Item has been deleted successfully!");
        res.redirect("/");
      })
      .catch(err => console.error(err));
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkId } } }
    )
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch(err => console.error(err));
  }
});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(foundList => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save()
          .then(() => res.redirect("/" + customListName))
          .catch(err => console.error(err));
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch(err => console.error(err));
});

let port = process.env.PORT;
if(port == null || port ==""){
  port =3000;
}
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
