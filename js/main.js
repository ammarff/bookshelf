const books = [];
const RENDER_EVENT = "render-todo";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const todoObject = generateTodoObject(generatedID, bookTitle, bookAuthor, bookYear, bookComplete, false);
  books.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateTodoObject(id, title, author, year, bookread, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    bookread,
    isCompleted,
  };
}

function findTodoIndex(todoId) {
  for (const index in books) {
    if (books[index].id === todoId) {
      return index;
    }
  }

  return -1;
}

const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      books.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  books.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(todoObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = todoObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = todoObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = todoObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${todoObject.id}`);

  if (todoObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(todoObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(todoObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(todoObject.id);
    });

    container.append(checkButton);
  }

  return container;
}

function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findTodo(todoId) {
  for (const todoItem of books) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

document.addEventListener(RENDER_EVENT, function () {
  //console.log(todos);

  const uncompletedTODOList = document.getElementById("incompleteBookshelfList");
  uncompletedTODOList.innerHTML = "";

  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const todoElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedTODOList.append(todoElement);
    } else {
      completedBookList.append(todoElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function RenderBookList(bookData) {
  if (bookData === null) {
    return;
  }

  const containerIncomplete = document.getElementById("incompleteBookshelfList");
  const containerComplete = document.getElementById("completeBookshelfList");

  containerIncomplete.innerHTML = "";
  containerComplete.innerHTML = "";
  for (let book of bookData) {
    const id = book.id;
    const title = book.title;
    const author = book.author;
    const year = book.year;
    const isComplete = book.isComplete;

    //create isi item
    let bookItem = document.createElement("article");
    bookItem.classList.add("book_item", "select_item");
    bookItem.innerHTML = "<h3 name = " + id + ">" + title + "</h3>";
    bookItem.innerHTML += "<p>Penulis: " + author + "</p>";
    bookItem.innerHTML += "<p>Tahun: " + year + "</p>";

    //container action item
    let containerActionItem = document.createElement("div");
    containerActionItem.classList.add("action");

    //green button
    const greenButton = CreateGreenButton(book, function (event) {
      isCompleteBookHandler(event.target.parentElement.parentElement);

      const bookData = GetBookList();
      ResetAllForm();
      RenderBookList(bookData);
    });

    //red button
    const redButton = CreateRedButton(function (event) {
      DeleteAnItem(event.target.parentElement.parentElement);

      const bookData = GetBookList();
      ResetAllForm();
      RenderBookList(bookData);
    });

    containerActionItem.append(greenButton, redButton);

    bookItem.append(containerActionItem);

    //incomplete book
    if (isComplete === false) {
      containerIncomplete.append(bookItem);
      bookItem.childNodes[0].addEventListener("click", function (event) {
        UpdateAnItem(event.target.parentElement);
      });

      continue;
    }

    //complete book
    containerComplete.append(bookItem);

    bookItem.childNodes[0].addEventListener("click", function (event) {
      UpdateAnItem(event.target.parentElement);
    });
  }
}
