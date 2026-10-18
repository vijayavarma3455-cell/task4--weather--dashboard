// 1. Get the HTML elements
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const filterButtons = document.querySelectorAll(".filter-btn");

// 2. Load saved tasks from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// 3. Set the current filter
let currentFilter = "all";

// 4. Save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 5. Display tasks on the webpage
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function(task) {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No tasks to display.";
        taskList.appendChild(emptyMessage);
    }

    filteredTasks.forEach(function(task) {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        // Create the checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.dataset.id = task.id;
        checkbox.className = "task-checkbox";
        checkbox.setAttribute("aria-label", "Mark task completed");

        // Create the task text
        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        // Create the Edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.dataset.action = "edit";
        editBtn.dataset.id = task.id;

        // Create the Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.dataset.action = "delete";
        deleteBtn.dataset.id = task.id;

        // Add elements to the task
        li.append(checkbox, span, editBtn, deleteBtn);
        taskList.appendChild(li);
    });

    // Update the remaining task count
    const remaining = tasks.filter(function(task) {
        return !task.completed;
    }).length;

    taskCount.textContent =
        remaining + (remaining === 1 ? " task remaining" : " tasks remaining");
}

// 6. Add a new task
function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task!");
        return;
    }

    const task = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        text: text,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

// Click the Add Task button
addBtn.addEventListener("click", addTask);

// Press Enter to add a task
taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});

// 7. Handle checkbox, Edit and Delete actions
// This is called event delegation.
taskList.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button || !taskList.contains(button)) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "delete") {
        tasks = tasks.filter(function(task) {
            return task.id !== id;
        });
    }

    if (action === "edit") {
        const task = tasks.find(function(task) {
            return task.id === id;
        });

        if (!task) {
            return;
        }

        const newText = prompt("Edit your task:", task.text);

        if (newText !== null && newText.trim() !== "") {
            task.text = newText.trim();
        } else if (newText !== null) {
            alert("Task cannot be empty!");
            return;
        } else {
            return;
        }
    }

    saveTasks();
    renderTasks();
});

// Handle checkbox changes
taskList.addEventListener("change", function(event) {
    if (!event.target.matches(".task-checkbox")) {
        return;
    }

    const id = event.target.dataset.id;

    const task = tasks.find(function(task) {
        return task.id === id;
    });

    if (task) {
        task.completed = event.target.checked;
        saveTasks();
        renderTasks();
    }
});

// 8. Filter tasks: All, Active, Completed
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        renderTasks();
    });
});

// 9. Display saved tasks when the page opens
renderTasks();