document.addEventListener("DOMContentLoaded", () => {
    // Select Elements
    const taskInput = document.getElementById("task-input");
    const addTaskButton = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");
    const themeToggle = document.getElementById("theme-toggle");
    const deleteSelectedButton = document.getElementById("delete-selected");
    const sortAscButton = document.getElementById("sort-asc");
    const sortDescButton = document.getElementById("sort-desc");
    const resetOrderButton = document.getElementById("reset-order");

    const totalTasksCounter = document.getElementById("total-tasks");
    const completedTasksCounter = document.getElementById("completed-tasks");
    const deletedTasksCounter = document.getElementById("deleted-tasks");
    const editedTasksCounter = document.getElementById("edited-tasks");

    // Load Data from localStorage
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let originalTasks = JSON.parse(localStorage.getItem("originalTasks")) || [...tasks];
    let deletedCount = parseInt(localStorage.getItem("deletedCount")) || 0;
    let editedCount = parseInt(localStorage.getItem("editedCount")) || 0;
    let draggedTaskIndex = null; 

    // Render tasks on the page
    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.dataset.index = index;
            li.draggable = true; 
            li.addEventListener("dragstart", handleDragStart);
            li.addEventListener("dragover", handleDragOver);
            li.addEventListener("drop", handleDrop);

            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("task-checkbox");
            checkbox.checked = task.selected || false;

            checkbox.addEventListener("change", () => {
                tasks[index].selected = checkbox.checked;
                saveTasks();
            });

            // Task Text (Double-click to edit)
            const taskText = document.createElement("span");
            taskText.textContent = task.text;
            taskText.className = "task-text";
            taskText.addEventListener("dblclick", () => enableEditing(taskText, index));

            if (task.completed) {
                taskText.classList.add("completed");
                li.classList.add("task-completed");
            }

            const checkIcon = document.createElement("span");
            checkIcon.textContent = "✔️";
            checkIcon.classList.add("check-icon");
            checkIcon.addEventListener("click", () => toggleTaskCompletion(index));

            // Remove button
            const removeButton = document.createElement("button");
            removeButton.textContent = "❌";
            removeButton.addEventListener("click", () => deleteTask(index));

            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(checkIcon);
            li.appendChild(removeButton);
            taskList.appendChild(li);
        });

        updateCounters();
        saveTasks();
    }

    // Enable editing on double-click
    function enableEditing(taskText, index) {
        const originalText = taskText.textContent;
        const input = document.createElement("input");
        input.type = "text";
        input.value = originalText;
        input.className = "task-edit-input";

        input.addEventListener("blur", () => saveEditedTask(input, index));
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") saveEditedTask(input, index);
        });

        taskText.replaceWith(input);
        input.focus();
    }

    // Save edited task
function saveEditedTask(input, index) {
    const newText = input.value.trim();
    const parentLi = input.closest("li");

    if (!newText) {
        alert("Task cannot be empty!");
        
        // Revert back to original task text
        const originalSpan = document.createElement("span");
        originalSpan.textContent = tasks[index].text;
        originalSpan.className = "task-text";
        originalSpan.addEventListener("dblclick", () => enableEditing(originalSpan, index));

        input.replaceWith(originalSpan);
        return;
    }

    if (tasks[index].text !== newText) {
        tasks[index].text = newText;
        editedCount++;
    }

    const newSpan = document.createElement("span");
    newSpan.textContent = newText;
    newSpan.className = "task-text";
    newSpan.addEventListener("dblclick", () => enableEditing(newSpan, index));

    input.replaceWith(newSpan);

    saveTasks();
}

    // Drag-and-Drop Handlers
    function handleDragStart(event) {
        draggedTaskIndex = event.target.dataset.index;
        event.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        event.preventDefault();
        const targetIndex = event.target.closest("li").dataset.index;

        if (draggedTaskIndex !== null && targetIndex !== null && draggedTaskIndex !== targetIndex) {
            const movedTask = tasks.splice(draggedTaskIndex, 1)[0];
            tasks.splice(targetIndex, 0, movedTask);
            draggedTaskIndex = null;
            saveTasks();
            renderTasks();
        }
    }

    // Toggle task completion
    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    // Update task counters
    function updateCounters() {
        totalTasksCounter.textContent = tasks.length;
        completedTasksCounter.textContent = tasks.filter(task => task.completed).length;
        deletedTasksCounter.textContent = deletedCount;
        editedTasksCounter.textContent = editedCount;
        localStorage.setItem("deletedCount", deletedCount);
        localStorage.setItem("editedCount", editedCount);
    }

    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        if (!text) {
            alert("Task cannot be empty!");
            return;
        }
        if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
            alert("Task already exists!");
            return;
        }

        const newTask = { text, completed: false, selected: false };
        tasks.push(newTask);
        originalTasks.push(newTask);  
        taskInput.value = "";
        saveTasks();
        renderTasks();
    }

    // Delete one task 
    function deleteTask(index) {
        if (confirm(`Delete task: "${tasks[index].text}"?`)) {
            tasks.splice(index, 1);
            originalTasks = originalTasks.filter((_, i) => i !== index);
            deletedCount++;
            saveTasks();
            renderTasks();
        }
    }

    // Delete multiple selected tasks
    function deleteSelectedTasks() {
        const selectedTasks = tasks.filter(task => task.selected);
        const selectedCount = selectedTasks.length;

        if (selectedCount === 0) {
            alert("No tasks selected for deletion.");
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedCount} selected task(s)?`)) {
            tasks = tasks.filter(task => !task.selected);
            originalTasks = originalTasks.filter(task => !task.selected);
            deletedCount += selectedCount;

            saveTasks();
            renderTasks();
        }
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("originalTasks", JSON.stringify(originalTasks));
        updateCounters();
    }

    // Toggle dark mode
    function toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    }

    function loadDarkMode() {
        if (localStorage.getItem("darkMode") === "enabled") {
            document.body.classList.add("dark-mode");
        }
    }

    // Sorting Functions
    function sortTasksAsc() {
        tasks.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
        saveTasks();
        renderTasks();
    }

    function sortTasksDesc() {
        tasks.sort((a, b) => b.text.toLowerCase().localeCompare(a.text.toLowerCase()));
        saveTasks();
        renderTasks();
    }

    function resetTaskOrder() {
        tasks = [...originalTasks];
        saveTasks();
        renderTasks();
    }

    // Event Listeners
    addTaskButton.addEventListener("click", addTask);
    deleteSelectedButton.addEventListener("click", deleteSelectedTasks);
    document.addEventListener("keydown", (event) => {
    if (event.key === "Delete") {
        deleteSelectedTasks();
    }
});

    themeToggle.addEventListener("click", toggleDarkMode);
    taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addTask(); });

    sortAscButton.addEventListener("click", sortTasksAsc);
    sortDescButton.addEventListener("click", sortTasksDesc);
    resetOrderButton.addEventListener("click", resetTaskOrder);

    // Load settings
    loadDarkMode();
    renderTasks();
});
