
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
// to use css,js,files
app.use(express.static("public"));
//connection
mongoose.connect("mongodb+srv://Vac13:Vactor@cluster0.0ckbdxy.mongodb.net/todolistDB",{useNewUrlParser:true});
//schema of items
const itemSchema ={
    name: String
};
const Item = mongoose.model("Item",itemSchema);
//mongoose document

const item1 = new Item({
  name:"Welcome to TODOLIST."
});
const item2 = new Item({
  name:"Hit + to add task."
});
const item3 = new Item({
  name:"<--- Hit to delete task"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items:[itemSchema]
};
const List = mongoose.model("List",listSchema);

let day = date();
app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      //insert many in model
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully inserted default items into DB");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {ListTitle: day,  newItems: foundItems});
    }
  });

});
//posting at root route.

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });

  if(listName === day){
    item.save();
    res.redirect("/");
  }
  else{//search the item
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })

  }

});


app.post("/delete",function(req,res){
  const cheskedItemId = req.body.checkbox;
  const listName = req.body.listName;

    if(listName === day){
      Item.findByIdAndRemove(cheskedItemId,function(err){
        if(!err){
          console.log("Successfully deleted");
          res.redirect("/");
        }
      });
    }
    else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:cheskedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
    }

});


//dyanmic route by expressjs

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //show existing list
        res.render("list", {ListTitle: foundList.name,  newItems: foundList.items});
      }
    }
  });

});

app.listen("3000", function() {
  console.log("server has started at port 3000");
})
