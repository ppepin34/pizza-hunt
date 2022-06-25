// create variable to hold db connection
let db;

// establish a connection to indexedDB called 'pizza_unt and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);

// this event will emit if the database version changes (nonexistent to v1, v1 to v2, etc)
request.onupgradeneeded = function (event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table) call `new_pizza`, set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

// upon a successful request
request.onsuccess = function (event) {
    // when db is successfully created with its object store or established a connection, save reference to to db in global variable
    db = event.target.result;

    // check if app is online, if yes run uploadPizza function to send all local db data to api
    if (navigator.onLine) {
        //uploadPizza();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

// this function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the db with read and write permissions
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access the object store for `new_pizza`
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // add record to your store with add method
    pizzaObjectStore.add(record);
}

function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();

    // upon successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, sent to api server
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    //open new transaction
                    const transaction = db.transaction(['new_pizza'], 'readwrite');
                    //access new_pizza object store
                    const pizzaObjectStore = transaction.objectStore('new_pizza');
                    // clear items in store
                    pizzaObjectStore.clear();

                    alert('All saved pizzas have been submitted');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadPizza);