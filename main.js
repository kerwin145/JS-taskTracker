let TodosToDOMMapping = [];
let lastScrolled = 0;
const NULL_CATEGORY = "0"
const NULL_COLOR = "#AEAEAE"

let selectedCategory = NULL_CATEGORY;

window.addEventListener('load', () =>{
    todos = JSON.parse(localStorage.getItem('todos'))|| []
    categories = JSON.parse(localStorage.getItem('categories')) || []
    DOMTodoItems = document.querySelectorAll(".todo-item")
    let isEditingCategory = false;

    const nameInput = document.querySelector('#name')
    const newTodoForm = document.querySelector('#new-todo-form')
    const editCategories = document.querySelector('.edit-category')
    const addCategory = document.querySelector('#add-category')
    const categorySelector = document.querySelector("#category-selector")
    const addButton = document.querySelector('#add-todo');

    const viewOptions = document.querySelector('.view-options-btn')
    const viewOptionsMenu = document.querySelector('.viewing-options-menu')
    const username = localStorage.getItem('username') || ''

    addCategory.style.display = "none";
    nameInput.value = username;
    nameInput.addEventListener('change', e => {
        localStorage.setItem('username', e.target.value)
    })

    //How category selection will work
    //At the very beginning , we will start with two default categories. We do this with a check of is categories is null. This set up will only occur once, because we will not allow the ability to delete a category if only one is remaining
    //If not null, we will load in the categories in categories list. 
    if(categories.length == 0){//we set up new categories
        console.log("Setting up new categories")
        const category1 = {
            id: "1",
            name: "Category 1",
            color: "hsl(216, 84%, 70%)",
            shadow: "0 0 4px 2px hsla(216, 84%, 58%, 75%)",
            selected: false
        }
        const category2 = {
            id: "2",
            name: "Category 2",
            color: "hsl(334, 93%, 59%)",
            shadow: "0 0 4px 2px hsla(334, 93%, 59%, 75%)",
            selected: false
        }
        categories = [category1, category2]
        //TODO remove this after categories have successfulty been implemented
        localStorage.setItem('categories', JSON.stringify(categories))

    }

    //load categories. MMmmm love passing in parameters
    DisplayCategories(categorySelector, addButton);

    //toggles edit category button
    const editCategoryIcon = document.querySelector('.edit-category-icon')
    editCategories.addEventListener('click', e=>{
        if(isEditingCategory){//turn off
            editCategoryIcon.classList = "fa-solid fa-pencil";
            document.querySelectorAll('.category-name').forEach(c => {
                c.setAttribute('readonly', true)
                c.style.opacity = "1"
            })
            addCategory.style.display = "none";
        }else{//turn on
            editCategoryIcon.classList = "fa-regular fa-circle-xmark";
            document.querySelectorAll('.category-name').forEach(c => {
                c.removeAttribute('readonly')
                c.style.opacity = ".55"
            })
            addCategory.style.display = "block";
        }
       isEditingCategory = !isEditingCategory
    })

    addCategory.addEventListener('click', e =>{
        const category = {

        }
    })

    //viewing options
    let viewOptionsOpen = false;
    viewOptions.addEventListener('click', e =>{
        viewOptionsOpen  = !viewOptionsOpen
        viewOptions.setAttribute("class", "view-options-btn")

        viewOptions.innerHTML = ""
        let div = document.createElement('div')
        div.innerHTML = "View Options"

        if(viewOptionsOpen){
            viewOptionsMenu.style.display = "flex"
          
            let open = document.createElement('i')
            open.classList.add("fa-solid")
            open.classList.add("fa-caret-left")
            viewOptions.append(div)
            viewOptions.appendChild(open)
        }else{
            viewOptionsMenu.style.display = "none"
            let close = document.createElement('i')
            close.classList.add("fa-solid")
            close.classList.add("fa-caret-right")
            viewOptions.append(div)
            viewOptions.appendChild(close)
        }
    })
    //Adding the task to the list
    newTodoForm.addEventListener('submit', e =>{
        e.preventDefault();
        
        const todo = {
            content: e.target.elements.content.value,
            category: categories[selectedCategory-1], 
            done: false,
            createdAt: new Date().getTime()
        }

        var validEntry = true;
        var regex = /^\s*$/;
        if(regex.test(todo.content)){
            validEntry = false;

            e.target.elements.content.classList.add('warning')
            setTimeout(()=>{
                e.target.elements.content.classList.remove('warning')
            }, 2000)
        }

        if(todo.category == ''){
            validEntry = false;
            let children = categorySelector.children;

            for(var i = 0; i < children.length; i++){
                const child = children[i]
                child.classList.add('warning')

                setTimeout(()=>{
                    child.classList.remove('warning')
                }, 2000)
            }

        }
        
        if(!validEntry)return;
        
        todos.unshift(todo)

        localStorage.setItem('todos', JSON.stringify(todos))

        //Will manually reset fields to preserve category
        e.target.elements.content.value = "";

        DisplayTodos()
    })  

    DisplayTodos();
})


//rendering and adding event listeners to each todo panel 
//Slight inefficiency because everything has to be re-rendered
//We can solve this problem by adding to a linked list of changed todos, and update only those that belong in that list
function DisplayTodos(){
    lastScrolled = document.documentElement.scrollTop || document.body.scrollTop

    const todoList = document.querySelector('.todo-list');
    todoList.innerHTML = '';
    TodosToDOMMapping = [];

    let spacing = 16, current = 0, height = 0;

    todos.forEach(todo => {
        TodosToDOMMapping.push([TodosToDOMMapping.length, TodosToDOMMapping.length]);

        const todoItem = document.createElement('div')
        todoItem.classList.add('todo-item')
        todoItem.id = todo.createdAt
        let c = categories.filter(x => x.id != todo.category.id)[0]

        const label = document.createElement('label')
        const content = document.createElement('div')
        const actions = document.createElement('div')
        const edit = document.createElement('button')
        const deleteButton = document.createElement('button')
    //  const moveUp = document.createElement('i')
    //  const moveDown = document.createElement('i')
        const moveDrag = document.createElement('i');
        const categoryChange = document.createElement('div');
        
        const input = document.createElement("input")
        input.type = "radio"
        input.checked = todo.done;
        const span = AddRadioButtonStyles(c.color, c.shadow, input, input.checked)
        
        content.classList.add('todo-content')
        actions.classList.add('actions')

        //actions
        edit.classList.add('edit')
        deleteButton.classList.add('delete')
        /*      
        moveUp.classList.add('fa-angle-up')
        moveDown.classList.add('fa-angle-down')
        moveUp.classList.add('fa-solid')
        moveDown.classList.add('fa-solid')
        moveUp.classList.add('icon')
        moveDown.classList.add('icon')
        */
        moveDrag.classList.add('icon')
        moveDrag.classList.add('fa-solid')
        moveDrag.classList.add('fa-arrows-up-down-left-right')
        moveDrag.classList.add('moveDrag')
        categoryChange.classList.add('category-change')
        categoryChange.innerHTML = "test"

        content.innerHTML = `<input type ="text" value="${todo.content}" readonly>`
        edit.innerHTML = 'Edit'
        deleteButton.innerHTML = 'Delete'

        label.appendChild(input)
        label.appendChild(span)
        actions.appendChild(categoryChange)
        actions.appendChild(edit)
        actions.appendChild(deleteButton)
        //actions.appendChild(moveUp)
        //actions.appendChild(moveDown)
        actions.appendChild(moveDrag)

        todoItem.appendChild(label)
        todoItem.appendChild(content)
        todoItem.appendChild(actions)

        todoItem.style.top = current;
        todoList.appendChild(todoItem)
        height = parseInt(todoItem.getBoundingClientRect().height);
        current += spacing + height;

        if(todo.done){todoItem.classList.add('done')}

        input.addEventListener('click', e => {
            todo.done = !todo.done
            localStorage.setItem('todos', JSON.stringify(todos))

            //some how this logic works and is able to remove strikethrough (Css is not the issue)
            if(todo.done){
                todoItem.classList.add('done')
            }else{
                todoItem.classList.add('done')
            }
            DisplayTodos();
        })

        edit.addEventListener('click', e => {
            const input = content.querySelector('input')
            input.removeAttribute('readonly')
            input.focus()
            input.addEventListener('blur', e => {
                input.setAttribute('readonly', true)
                todo.content = e.target.value;
                localStorage.setItem('todos', JSON.stringify(todos))
                DisplayTodos()//this actually causes the whole thing to blur
            })

            categoryChange.style.display = "flex"
            categoryChange.style.left = edit.style.position;
            console.log(edit.style.position)
            console.log("HI")
        })
        
        deleteButton.addEventListener('click', e =>{
            todos = todos.filter((t) => t!=todo)
            localStorage.setItem('todos', JSON.stringify(todos))
            DisplayTodos()       
        })


        function onDrag({clientY, pageY}){
            let index = currentDraggedIndex

            let curr = clientY;  //y position of the element.
            //prev next and curr are the middle heights of the neighboring todo items in the DOM
            let prev = -1, next = -1;

            //get the corresponding mapped item in the DOM. Using variable t for better readability
            if(index-1 >= 0){
                let t = DOMTodoItems[TodosToDOMMapping[index-1][1]]
                prev = parseInt(t.getBoundingClientRect().top)+parseInt(t.clientHeight)/2
            } 
            if(index+1 <= todos.length-1){
                let t = DOMTodoItems[TodosToDOMMapping[index+1][1]]
                next = parseInt(t.getBoundingClientRect().top)+parseInt(t.clientHeight)/2
            } 

            if(curr < prev && prev != -1){
                swapTodoItems(index,index-1, todos)
                currentDraggedIndex--;
            }
            else if(curr > next && next != -1){
                swapTodoItems(index,index+1, todos)
                currentDraggedIndex++;
            }
        }

        //not really keeping code clean, but not sure if i have any other choices
        let currentDraggedIndex = -1;
        moveDrag.addEventListener('mousedown', e =>{
                moveDrag.classList.add("iconMovingHighlight")
                id = todoItem.id
                for(let i = 0; i < todos.length; i++){
                    if(todos[i].createdAt == id){
                        currentDraggedIndex = i;
                        break;
                    }
                }
                window.addEventListener('mousemove', onDrag);
                todoList.classList.add("disable-select");
        })

        //these two mouse up listeners are the exact same
        window.addEventListener('mouseup', e =>{

                localStorage.setItem('todos', JSON.stringify(todos))

                window.removeEventListener('mousemove', onDrag)
                todoList.classList.remove("disable-select");

                moveDrag.classList.remove("iconMovingHighlight")                

        })

        /*
        moveUp.addEventListener('click', e =>{

            let index = todos.indexOf(todo);
            
            if(index > 0){
                //perform a visual swap (must do first)
                let items = document.querySelectorAll(".todo-item")
                let offset = todoList.getBoundingClientRect().top

                let current = items[index];
                let target = items[index-1];

                let temp = current.getBoundingClientRect().top-offset;
                current.style.top = target.getBoundingClientRect().top-offset;
                target.style.top = temp;
                
                //perform swap within the todos array
                temp = todos[index];
                todos[index] = todos[index-1]
                todos[index-1] = temp
            }
            localStorage.setItem('todos', JSON.stringify(todos))
            setTimeout(()=>{
                lastScrolled = document.documentElement.scrollTop || document.body.scrollTop
                DisplayTodos()  
                window.scrollTo(0,lastScrolled)
            }, 300)     
            
         })
         moveDown.addEventListener('click', e =>{
            lastScrolled = document.documentElement.scrollTop || document.body.scrollTop
            let index = todos.indexOf(todo);
            if(index < todos.length-1){
                //perform a visual swap (must do first)
                let items = document.querySelectorAll(".todo-item")
                let offset = todoList.getBoundingClientRect().top

                let current = items[index];
                let target = items[index+1];

                let temp = current.getBoundingClientRect().top-offset;
                current.style.top = target.getBoundingClientRect().top-offset;
                target.style.top = temp;
                
                //perform swap within the todos array
                temp = todos[index];
                todos[index] = todos[index+1]
                todos[index+1] = temp
            }
            localStorage.setItem('todos', JSON.stringify(todos))
            setTimeout(()=>{
                lastScrolled = document.documentElement.scrollTop || document.body.scrollTop
                DisplayTodos()  
                window.scrollTo(0,lastScrolled)
            }, 300)  
         })
         */
    })

    //this list has to be calcualted after all the todo items have been listed
    DOMTodoItems = document.querySelectorAll(".todo-item")
    window.scrollTo(0,lastScrolled)
    todoList.style.height = `${current}px`;
}

function DisplayCategories(categorySelector, addButton){
    //insantiate the categories
    //Create the elements in dom
    let index = 1;
    categories.forEach(c =>{    
        const label = document.createElement("label")

        const radiobtn = document.createElement("input")
        radiobtn.type = "radio"
        radiobtn.name = c.id
        radiobtn.id  = c.id;
        radiobtn.value = c.name;
        
        const input = document.createElement("input")
        input.classList.add("category-name")
        input.value = c.name;
        input.setAttribute("placeholder", "Category " + index);
        input.setAttribute('readonly', true)

        input.addEventListener('input', e =>{
            c.name = input.value
            localStorage.setItem('categories', JSON.stringify(categories))
        })
        
        //click behavior of radiobutton
        radiobtn.addEventListener('click', e =>{
             //if your element was preivosuly unselected, have it selected
            if(selectedCategory != c.id){
                //find and remove the other bubble that is checked
                document.querySelectorAll("#category-selector .bubble-checked").forEach(el => {el.classList.remove("bubble-checked")})
                selectedCategory = c.id;
                addButton.style.backgroundColor = c.color;
                //unselect every other radio button
                categories.forEach(cc => {cc.selected = false});
            }else{
                selectedCategory = NULL_CATEGORY
                addButton.style.backgroundColor = NULL_COLOR;
            }
        })
        
        //very important that this span line is after the radio button click event listener
        const span = AddRadioButtonStyles(c.color, c.shadow, radiobtn, false)

       // radiobtn.appendChild(span)
        label.appendChild(radiobtn)
        label.appendChild(span)
        label.appendChild(input)

        //adding styles via js >:(
        span.style.border = "2px solid" + c.color;
        span.style.boxShadow = c.shadow;
        
        categorySelector.appendChild(label);
        //make a new option for allowing the button to be selected, with the css controls by this
        index++;
    })

}

//input is the two item positions in the todoArray. Used in the moveDrag, onDrag method
function swapTodoItems(a, b, todos){
    if(a < 0 || b > todos.length){
        console.log("can't swap out of bounds")
        return
    }
    //swap positions of elements
    let temp = parseInt(DOMTodoItems[TodosToDOMMapping[a][1]].style.top);
    DOMTodoItems[TodosToDOMMapping[a][1]].style.top = DOMTodoItems[TodosToDOMMapping[b][1]].style.top
    DOMTodoItems[TodosToDOMMapping[b][1]].style.top = temp

    //swap elements in mapping
    temp = TodosToDOMMapping[a][1];
    TodosToDOMMapping[a][1] = TodosToDOMMapping[b][1];
    TodosToDOMMapping[b][1] = temp;
    //Lastly, swap elements in todo list
    temp = todos[a];
    todos[a] = todos[b];
    todos[b] = temp;

    console.log(todos)
}

//the radiobutton functionality is rather decoupled :-(
function AddRadioButtonStyles(color, shadow, radioBtn, defaultChecked){
    let bubbleFilling = document.createElement("div")
    bubbleFilling.classList.add("bubble-filling")
    bubbleFilling.style.backgroundColor = color

    let span = document.createElement("span")
    span.classList.add("bubble")
    //we also have to add that bubble color
    span.style.boxShadow = shadow
    span.appendChild(bubbleFilling);

    if(defaultChecked){
        if(!bubbleFilling.classList.contains("bubble-checked"))
                bubbleFilling.classList.add("bubble-checked")
    }
    if(radioBtn != null){
        radioBtn.addEventListener('click', e=>{

            if(bubbleFilling.classList.contains("bubble-checked"))
                bubbleFilling.classList.remove("bubble-checked")
    
            else bubbleFilling.classList.add("bubble-checked")
        })
    }else{
        span.addEventListener('click', e=>{

            if(bubbleFilling.classList.contains("bubble-checked"))
                bubbleFilling.classList.remove("bubble-checked")

            else {
                bubbleFilling.classList.add("bubble-checked")
            }
        })
    }

    return span;
}