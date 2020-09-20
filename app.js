
//Storage Controller
const StorageCtrl = (function() {
 
    return {
        getItems: function() {
            let items;
            if (localStorage.getItem('items') === null) {
                items = [];
            } else {
                items = JSON.parse(localStorage.getItem('items'));
            }
            return items;
        },
        setItems: function(item) {
            let items = this.getItems();

            items.push(item);
            localStorage.setItem('items', JSON.stringify(items));
        },
        delItems: function(delItem){
            let items = this.getItems();

            items = items.filter(function(item){
                if(item.id !== delItem.id ){
                    return true;
                }
            })

            localStorage.setItem('items', JSON.stringify(items));
        },
        updateItems: function(curItem){
            let items = this.getItems();

            items.forEach(function(item){
                if(item.id === curItem.id){
                    item.name = curItem.name;
                    item.calories = curItem.calories;
                }
            })
            localStorage.setItem('items', JSON.stringify(items));
        }
    }
 
})();

//Item Controller
const ItemCtrl = (function () {
    //Item Constructor 
    const Item = function (id, name, calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    }

    //The data
    const data = {
        items: [],
        currentItem: null,
        totalCalories: 0
    }

    //Public methods
    return {
        getdata: function(){
            return data;
        },
        getItems: function () {
            return data.items;
        },
        getCurrentItem: function(){
            return data.currentItem;
        },
        addItem: function (name, calories) {

            //Add id
            //Use some logic to auto increment 
            let ID;
            if (data.items.length > 0) {
                ID = data.items[data.items.length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Parse calories into a number
            calories = parseInt(calories);

            //Create object
            newItem = new Item(ID, name, calories);

            //Push to the items array
            data.items.push(newItem);

            //Return the item for the local storage
            return newItem;

        },
        updateItem: function(name, calories){
            //Calories to number
            calories = parseInt(calories);

            //Loop trough the items, see if there is a match and update
            data.items.forEach(function(item){

                if(item.id === data.currentItem.id){
                    item.name = name;
                    item.calories = calories;
                }
            });
            
        },
        deleteItems: function(id){

            //Loop trough data.items, filter out the items that don't
            //match and set data.items with the returned array
            data.items = data.items.filter(function(item){
                if(item.id !== id)
                return true;
            });
        },
        getItemById: function(id){
            let found;
            //Loop trough the items, find the match and return the object
            data.items.forEach(function(item){
                if(item.id === id){
                    found = item;
                }
            })
            return found;
        },
        setCurrentItem: function(item){
            data.currentItem = item;
        },
        getTotalCalories: function () {
            if (data.items.totalCalories) {

                return data.items.totalCalories;

            } else {

                //Add the calories
                let total = 0;

                data.items.forEach(function (calories) {
                    total += calories.calories;
                })
                data.totalCalories = total;

                //Set the total calories in the datastructure
                return data.totalCalories;
            }
        },
        copyFromStorage: function(fromStorage){
            data.items = fromStorage;
        },
        logData: function () {
            return data;
        }
    }
})();

//UI Controller
const UICtrl = (function () {

    //Selectors 
    const UISelectors = {
        itemList: '#item-list',
        addBtn: '.add-btn',
        updateBtn: '.update-btn',
        deleteBtn: '.delete-btn',
        backBtn: '.back-btn',
        name: '#item-name',
        calories: '#item-calories',
        totalCalories: '.total-calories'
    }

    return {
        getSelectors: function () {
            return UISelectors;
        },
        getItemsInput: function () {
            return {
                name: document.querySelector(UISelectors.name).value,
                calories: document.querySelector(UISelectors.calories).value
            }
        },
        setDataToCurrentItem: function(e){
            //The id
            const listId = parseInt(e.target.parentElement.parentElement.id);
            //Retrieve the name and the calories from ItemCtrl.data using the id
            let item = ItemCtrl.getItemById(listId);
            //Set current item
            ItemCtrl.setCurrentItem(item);
          
        },
        initialState: function () {
            document.querySelector(UISelectors.addBtn).style.display = 'inline',
                document.querySelector(UISelectors.updateBtn).style.display = 'none',
                document.querySelector(UISelectors.deleteBtn).style.display = 'none',
                document.querySelector(UISelectors.backBtn).style.display = 'none'
        },
        editState: function () {
            document.querySelector(UISelectors.addBtn).style.display = 'none',
                document.querySelector(UISelectors.updateBtn).style.display = 'inline',
                document.querySelector(UISelectors.deleteBtn).style.display = 'inline',
                document.querySelector(UISelectors.backBtn).style.display = 'inline'
        },
        populateItemList: function (items) {
            let html = ''

            items.forEach(function (item) {
                html += `<li class="collection-item" id="${item.id}">
                            <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                            <a href="#" class="secondary-content">
                                <i class="edit-item fa fa-pencil"></i>
                            </a>
                         </li>`
            })

            //Insert list items
            document.querySelector(UISelectors.itemList).innerHTML = html;
        },
        addItemToForm: function(){
            let data = ItemCtrl.getdata();
            document.querySelector(UISelectors.name).value = data.currentItem.name;
            document.querySelector(UISelectors.calories).value = data.currentItem.calories;
        },
        clearInput: function () {
            document.querySelector(UISelectors.name).value = '';
            document.querySelector(UISelectors.calories).value = '';
        },
        showTotalCalories(total) {
            document.querySelector(UISelectors.totalCalories).innerHTML = total;

        }
    }

})();

//App Controller
const AppCtrl = (function () {

    //Load eventlisteners
    const loadEventListeners = function () {
        UISelectors = UICtrl.getSelectors();

        //Disable the enter key to avoid annoyance
        document.addEventListener('keypress', function(e){
            if(e.keyCode === 13 || e.which === 13){
                e.preventDefault();
                return false;
            }
        })

        //Add item event
        document.querySelector(UISelectors.addBtn).addEventListener('click', itemAddSubmit);

        //Edit icon click event
        document.querySelector(UISelectors.itemList).addEventListener('click', itemEditSubmit);

        //Update item event
        document.querySelector(UISelectors.updateBtn).addEventListener('click', itemUpdateSubmit);

        //Delete item
        document.querySelector(UISelectors.deleteBtn).addEventListener('click', deleteItemSubmit);

        //Back button
        document.querySelector(UISelectors.backBtn).addEventListener('click', backToInit);
    }

    //Event handlers
    const itemAddSubmit = function (e) {

        //Get input values
        const input = UICtrl.getItemsInput();

        //Check if there are inputs
        if (input.name !== '' && input.calories !== '') {
            //Add item to the array and get the returned object
            let newItem = ItemCtrl.addItem(input.name, input.calories);

            //Persist to local Storage
            StorageCtrl.setItems(newItem);

            //Fetch items from data structure 
            const items = ItemCtrl.getItems();

            //Populate list with items
            UICtrl.populateItemList(items);

            //Clear the input
            UICtrl.clearInput();

            //Add to the total calories in the UI 
            //First get the total calories
            const totalCalories = ItemCtrl.getTotalCalories();

            //Then add
            UICtrl.showTotalCalories(totalCalories);


        } else {

            //To be done properly............................
            console.log('fill fields pls');
        }
        e.preventDefault();
    }

    //Edit icon event handler
    const itemEditSubmit = function(e){
        if(e.target.classList.contains('fa')){
            
            //Get id, name and calories from the clicked item and set 
            //the data as an object in the current item
            UICtrl.setDataToCurrentItem(e);
            
            //Add item to form
            UICtrl.addItemToForm();
            
            //Show the edit state
            UICtrl.editState();
        }
    }

    //Update event handler
    const itemUpdateSubmit = function(e){
        //Get the values
        let input = UICtrl.getItemsInput();

        //Update in the data
        ItemCtrl.updateItem(input.name, input.calories);

        //Repaint the UI with the data
        //Fetch items from data structure 
        const items = ItemCtrl.getItems();

        //Update local storage
        //The current item (which is the updated item in this case) is set when the edit icon is clicked
        let currentItem = ItemCtrl.getCurrentItem()
        StorageCtrl.updateItems(currentItem);

        //Populate list with items
        UICtrl.populateItemList(items);

        //Update the total calories
        //First get the total calories
        const totalCalories = ItemCtrl.getTotalCalories();

        //Then add
        UICtrl.showTotalCalories(totalCalories);

        //Clear Input
        UICtrl.clearInput();

        //Back to the initial state
        UICtrl.initialState();


        e.preventDefault();
    };

    //Delete event handler
    const deleteItemSubmit = function(e){
        //Get current item id
        const currentItem = ItemCtrl.getCurrentItem()

        //Delete from the data structure
        ItemCtrl.deleteItems(currentItem.id);

        //Delete from local storage
        StorageCtrl.delItems(currentItem);

        //Repaint the UI with the data
        //Fetch items from data structure 
        const items = ItemCtrl.getItems();

        //Populate list with items
        UICtrl.populateItemList(items);

        //Update the total calories
        //First get the total calories
        const totalCalories = ItemCtrl.getTotalCalories();

        //Then add
        UICtrl.showTotalCalories(totalCalories);

        //Clear Input
        UICtrl.clearInput();

        //Back to the initial state
        UICtrl.initialState();


        e.preventDefault();
    }

    const backToInit = function(e){
           
        //Back to the initial state
        UICtrl.initialState();

        //Clear Input
        UICtrl.clearInput();

        e.preventDefault();
    };


    //Public methods
    return {
        init: function () {
            //Set the initial state
            UICtrl.initialState();

            //Fetch items from data structure 
            let storageItems = StorageCtrl.getItems();

            //Copy to ItemCtrl
            //Necessary because the UICtrl fetches data from the ItemCtrl
            ItemCtrl.copyFromStorage(storageItems);

            //Populate list with items
            UICtrl.populateItemList(storageItems);

            //Load event listeners
            loadEventListeners();
        }
    }
})();

AppCtrl.init();

