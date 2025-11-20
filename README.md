Models - How the data will be structured before passing into database
Utils - Utilities for each function 
Public - public folder lor





Function Flow Example (Top to bottom)

<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
index.html calls function from inline html example: onclick("function()")

public/js file runs the logic (api call, logic for functionality (check case, error handling, etc.))

index.js will then route the API to the respective util files

util files utilises the files in models example jonathanUtils uses user.js to 'model' or format the way the data will be passed to the database. 

utils is basically the main bridge between database and backend js.
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>





things to take note

<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
make sure your API call functions are async
use this example to reformat array if you are doing a check case:
const res = await fetch("/retrieve-users", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        let checkBody;
        checkBody = await res.json();
        checkData = Array.isArray(checkBody?.users) ? checkBody.users : [];

        // check if user already exists
        const existingUser = checkData.find((u) => u.username === username);
        if (existingUser) {
            return alert("Username already taken");
        }
        else
            console.log("Username available");

pls dont make changes in already working files
- login.js
- jonathan.js
- retrieveUserUtil.js
- jonathanUtil.js
- book.js
- user.js

remove unused commented out codes to hide the fact that we fked up our stuff

remove sussy comments from chatgpt or github copilot for obv reasons ***IMPORTANT***

remove stuff in this readme that gives away that we are using ai to code once we are done lol ***IMPORTANT***
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



