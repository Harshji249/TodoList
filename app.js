const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your Todo list"
});

const item2 = new Item({
    name: "Hit + to add new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    Item.find().then((item) => {

        if (item.length === 0) {
            Item.insertMany(defaultItems).then(() => {
                console.log("Successfull");
            }).catch((err) => {
                console.log(err);
            })
            res.redirect("/");
        }
        else {

            res.render("list", { listTitle: "Today", newListItem: item });
        }

    }).catch((err) => {
        console.log(err)
    })
})

app.get("/:customListName", (req,res)=>{
    const customListName = req.params.customListName;

    List.findOne({name: customListName}).then((foundList)=>{
        if(!foundList){
            // create a new list
            const list = new List({
                name : customListName,
                items : defaultItems
            });
            list.save();
            res.redirect("/"+ customListName);
        } else{
            res.render("list",  {listTitle: foundList.name, newListItem: foundList.items})
        }
    }).catch((err)=>{
        console.log(err);
    })


})

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name : itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}).then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        }).catch((err)=>{
            console.log(err);
        })
    }

})

app.post("/delete", (req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName= req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(()=>{
            console.log("Successfully Deleted");
            res.redirect("/");
        }).catch((err)=>{
            console.log(err);
        })
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull : {items: {_id : checkedItemId}}}).then((foundList)=>{
            res.redirect("/"+listName);
        }).catch((err)=>{
            console.log(err);
        })
    }
})
app.get("/about", (req, res) => {
    res.render("about");
})

app.listen(3000, () => {
    console.log("Listening on post 3000");
})