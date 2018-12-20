const inquirer = require("inquirer");
const mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "greatBay_DB"
});

const makeConnection = () => {
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    initGreatBay();
  });
};

makeConnection();

const initGreatBay = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "init",
        message: "Welcome to Great Bay. Please choose an option.",
        choices: ["Post an item", "Bid on an item"]
      }
    ])
    .then(response => {
      if (response.init === "Post an item") {
        postAnItem();
      } else {
        bidOnAnItem();
      }
    });
  //ending init bracket
};

const postAnItem = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "item_name",
        message: "Please enter item name"
      },
      {
        type: "input",
        name: "item_category",
        message: "Please enter a category"
      },
      {
        type: "input",
        name: "starting_bid",
        message: "What is your starting bid?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(responses => {
      console.log("Inserting a new item...\n");
      const query = connection.query(
        "INSERT INTO auctions SET ?",
        {
          item_name: responses.item_name,
          category: responses.item_category,
          starting_bid: responses.starting_bid,
          highest_bid: responses.starting_bid
        },
        function(err, res) {
          if (err) throw err;
          console.log("Your auction was created successfully!\n");
          initGreatBay();
        }
      );
    });
};
const bidOnAnItem = () => {
  console.log("Selecting all bidding items...\n");
  connection.query("SELECT * FROM auctions", function(err, res) {
    if (err) throw err;
    //    console.log(res[1])
    // how to change this to forEach loop???
    let arrayOfItems = [];
    for (let i = 0; i < res.length; i++) {
      arrayOfItems.push(res[i].item_name);
    }

    inquirer
      .prompt([
        {
          type: "rawlist",
          name: "available_items",
          message: "Please pick an item to bid on.",
          choices: arrayOfItems
        },
        {
          type: "input",
          name: "bid",
          message: "How much would you like to bid?"
        }
      ])
      .then(response => {
        let chosenItem;

        for (let i = 0; i < res.length; i++) {
          if (res[i].item_name === response.available_items) {
            chosenItem = res[i];
          }
        }
        // console.log(`chosen item: ${chosenItem}`)
        if (chosenItem.highest_bid < parseInt(response.bid)) {
          connection.query(
            "UPDATE auctions SET ? WHERE ?",
            [
              {
                highest_bid: response.bid
              },
              {
                id: chosenItem.id
              }
            ],
            function(err, res) {
                if (err) throw err;
              console.log(`${chosenItem.item_name} bid updated!\n`);
              initGreatBay();
            }
          );
        } else {
          console.log(`Your bid was too low. Try again...`);
          initGreatBay();
        }
      });

    

  });
};
    connection.end();
