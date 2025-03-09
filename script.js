document.addEventListener("DOMContentLoaded", () => {
    // Select Elements
    const taskInput = document.getElementById("task-input");
    const addTaskButton = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");
    const themeToggle = document.getElementById("theme-toggle");
    const deleteSelectedButton = document.getElementById("delete-selected");

    const totalTasksCounter = document.getElementById("total-tasks");
    const completedTasksCounter = document.getElementById("completed-tasks");
    const deletedTasksCounter = document.getElementById("deleted-tasks");
    const editedTasksCounter = document.getElementById("edited-tasks");
    const sortAscButton = document.getElementById("sort-asc");
    const sortDescButton = document.getElementById("sort-desc");
    const resetOrderButton = document.getElementById("reset-order");

    // Variables
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let originalTasks = [...tasks]; // Save original order
    let deletedCount = parseInt(localStorage.getItem("deletedCount")) || 0;
    let editedCount = parseInt(localStorage.getItem("editedCount")) || 0;
    let draggedTaskIndex = null;

    // Function to render tasks in the UI
    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.dataset.index = index;
            li.draggable = true;
            li.addEventListener("dragstart", handleDragStart);
            li.addEventListener("dragover", handleDragOver);
            li.addEventListener("drop", handleDrop);

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            checkbox.classList.add("task-checkbox");
            checkbox.addEventListener("change", () => toggleTaskCompletion(index));

            const taskText = document.createElement("span");
            taskText.textContent = task.text;
            taskText.className = "task-text";

            // Ensure completed tasks get a line-through effect
            if (task.completed) {
                taskText.classList.add("completed");
                li.classList.add("task-completed");
            } else {
                taskText.classList.remove("completed");
                li.classList.remove("task-completed");
            }

            taskText.addEventListener("dblclick", () => editTask(index, taskText));

            const removeButton = document.createElement("button");
            removeButton.textContent = "❌";
            removeButton.addEventListener("click", () => deleteTask(index));

            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(removeButton);
            taskList.appendChild(li);
        });

        updateCounters();
        saveTasks();
    }

    function updateCounters() {
        totalTasksCounter.textContent = tasks.length;
        completedTasksCounter.textContent = tasks.filter(task => task.completed).length;
        deletedTasksCounter.textContent = deletedCount;
        editedTasksCounter.textContent = editedCount;
    }

    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    }

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

        tasks.push({ text, completed: false });

        // ✅ Update originalTasks to match the latest task list
        originalTasks = [...tasks];

        taskInput.value = "";
        renderTasks();
    }

    function deleteTask(index) {
        if (confirm(`Delete task: "${tasks[index].text}"?`)) {
            tasks.splice(index, 1);
            deletedCount++;  // ✅ Increase deleted counter
            localStorage.setItem("deletedCount", deletedCount);
            originalTasks = [...tasks];
            renderTasks();
        }
    }

    function deleteSelectedTasks() {
        const checkedBoxes = document.querySelectorAll(".task-checkbox:checked");
        if (checkedBoxes.length === 0) {
            alert("No tasks selected for deletion.");
            return;
        }

        if (confirm("Are you sure you want to delete the selected tasks?")) {
            const initialLength = tasks.length;
            tasks = tasks.filter((_, index) => !checkedBoxes[index]?.checked);
            deletedCount += (initialLength - tasks.length); // ✅ Track deleted tasks
            localStorage.setItem("deletedCount", deletedCount);
            originalTasks = [...tasks];
            renderTasks();
        }
    }

    function editTask(index, taskElement) {
        const oldText = tasks[index].text;
        const input = document.createElement("input");
        input.type = "text";
        input.value = oldText;
        input.classList.add("edit-input");

        taskElement.replaceWith(input);
        input.focus();

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") saveEdit(index, input);
        });

        input.addEventListener("blur", () => saveEdit(index, input));
    }

    function saveEdit(index, inputElement) {
        const newText = inputElement.value.trim();
        if (!newText) {
            alert("Task cannot be empty!");
            renderTasks();
            return;
        }

        if (tasks.some((t, i) => t.text.toLowerCase() === newText.toLowerCase() && i !== index)) {
            alert("Task already exists!");
            renderTasks();
            return;
        }

        if (tasks[index].text !== newText) {
            editedCount++; // ✅ Increase edited counter
            localStorage.setItem("editedCount", editedCount);
        }

        tasks[index].text = newText;
        renderTasks();
    }

    function sortTasks(order) {
        if (order === "asc") {
            tasks.sort((a, b) => a.text.localeCompare(b.text));
        } else if (order === "desc") {
            tasks.sort((a, b) => b.text.localeCompare(a.text));
        }
        renderTasks();
    }

    function resetTasks() {
        tasks = [...originalTasks];
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    }

    function loadDarkMode() {
        if (JSON.parse(localStorage.getItem("darkMode"))) {
            document.body.classList.add("dark-mode");
        }
    }

    // Drag and Drop Handlers
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

        if (draggedTaskIndex !== null && targetIndex !== null) {
            const movedTask = tasks.splice(draggedTaskIndex, 1)[0];
            tasks.splice(targetIndex, 0, movedTask);
            renderTasks();
        }
    }

    // Event Listeners
    addTaskButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addTask(); });
    deleteSelectedButton.addEventListener("click", deleteSelectedTasks);
    sortAscButton.addEventListener("click", () => sortTasks("asc"));
    sortDescButton.addEventListener("click", () => sortTasks("desc"));
    resetOrderButton.addEventListener("click", resetTasks);
    themeToggle.addEventListener("click", toggleDarkMode);

    // Initialize Tasks & Dark Mode
    renderTasks();
    loadDarkMode();
});
