document.addEventListener("DOMContentLoaded", () => {
    // Get references to all required DOM elements
    const taskInput = document.getElementById("task-input");
    const addTaskButton = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");
    const deleteSelectedButton = document.getElementById("delete-selected");
    const totalTasksCounter = document.getElementById("total-tasks");
    const completedTasksCounter = document.getElementById("completed-tasks");
    const deletedTasksCounter = document.getElementById("deleted-tasks");
    const editedTasksCounter = document.getElementById("edited-tasks");
    const themeToggle = document.getElementById("theme-toggle");
    const sortAscButton = document.getElementById("sort-asc");
    const sortDescButton = document.getElementById("sort-desc");
    const resetOrderButton = document.getElementById("reset-order");

    // Initialize task array from localStorage or empty array
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let originalOrder = [...tasks]; // Store original task order
    let deletedCount = 0;
    let editedCount = 0;
    let draggedTaskIndex = null; // Variable to store index of dragged task

    /**
     * Function to render tasks in the UI
     * - Clears the task list and re-renders it
     * - Adds event listeners for drag-and-drop, edit, delete, and completion toggle
     */
    function renderTasks() {
        taskList.innerHTML = ""; // Clear task list before rendering
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.draggable = true;
            li.dataset.index = index;

            // Drag-and-Drop Events
            li.addEventListener("dragstart", () => {
                draggedTaskIndex = index;
                li.classList.add("dragging");
            });

            li.addEventListener("dragover", (e) => {
                e.preventDefault(); // Allow dropping
                const draggingOverElement = e.target.closest("li");
                if (draggingOverElement) {
                    const overIndex = Number(draggingOverElement.dataset.index);
                    swapTasks(draggedTaskIndex, overIndex);
                    draggedTaskIndex = overIndex;
                }
            });

            li.addEventListener("dragend", () => {
                li.classList.remove("dragging");
                saveTasks(); // Save updated order to localStorage
            });

            // Checkbox to toggle task completion
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            checkbox.addEventListener("change", () => toggleTaskCompletion(index));

            // Task text (double-click to edit)
            const taskText = document.createElement("span");
            taskText.textContent = task.text;
            taskText.className = "task-text";
            if (task.completed) taskText.classList.add("completed");

            taskText.addEventListener("dblclick", () => editTask(index));

            // Delete button to remove task
            const removeButton = document.createElement("button");
            removeButton.textContent = "❌";
            removeButton.addEventListener("click", () => deleteTask(index));

            // Append elements to task list item
            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(removeButton);
            taskList.appendChild(li);
        });

        updateCounters(); // Update task statistics
        saveTasks(); // Save tasks in localStorage
    }

    /**
     * Function to swap two tasks when dragging
     */
    function swapTasks(fromIndex, toIndex) {
        [tasks[fromIndex], tasks[toIndex]] = [tasks[toIndex], tasks[fromIndex]];
        renderTasks();
    }

    /**
     * Function to save tasks to localStorage
     */
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    /**
     * Function to update the task counters (total, completed, deleted, edited)
     */
    function updateCounters() {
        totalTasksCounter.textContent = tasks.length;
        completedTasksCounter.textContent = tasks.filter(t => t.completed).length;
        deletedTasksCounter.textContent = deletedCount;
        editedTasksCounter.textContent = editedCount;
    }

    /**
     * Function to add a new task
     * - Checks for duplicate tasks and empty input
     */
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
        originalOrder = [...tasks]; // Update original order
        taskInput.value = ""; // Clear input field
        renderTasks();
    }

    /**
     * Function to delete a task
     * - Asks for confirmation before deleting
     */
    function deleteTask(index) {
        if (confirm(`Delete task: "${tasks[index].text}"?`)) {
            tasks.splice(index, 1);
            deletedCount++;
            originalOrder = [...tasks]; // Update original order
            renderTasks();
        }
    }

    /**
     * Function to delete all completed tasks
     */
    function deleteSelectedTasks() {
        const completedTasks = tasks.filter(task => task.completed);
        if (completedTasks.length === 0) return alert("No completed tasks to delete.");
        if (confirm(`Delete ${completedTasks.length} completed task(s)?`)) {
            tasks = tasks.filter(task => !task.completed);
            deletedCount += completedTasks.length;
            originalOrder = [...tasks]; // Update original order
            renderTasks();
        }
    }

    /**
     * Function to toggle task completion
     */
    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    }

    /**
     * Function to edit a task
     * - Prevents empty edits and duplicate names
     */
    function editTask(index) {
        const newText = prompt("Edit Task:", tasks[index].text).trim();
        if (!newText) {
            alert("Task cannot be empty!");
            return;
        }
        if (tasks.some(t => t.text.toLowerCase() === newText.toLowerCase())) {
            alert("Task already exists!");
            return;
        }

        tasks[index].text = newText;
        editedCount++;
        originalOrder = [...tasks]; // Update original order
        renderTasks();
    }

    /**
     * Function to sort tasks in ascending order (A-Z)
     */
    function sortTasksAsc() {
        tasks.sort((a, b) => a.text.localeCompare(b.text));
        renderTasks();
    }

    /**
     * Function to sort tasks in descending order (Z-A)
     */
    function sortTasksDesc() {
        tasks.sort((a, b) => b.text.localeCompare(a.text));
        renderTasks();
    }

    /**
     * Function to reset the task order to the original order
     */
    function resetTaskOrder() {
        tasks = [...originalOrder]; // Restore from original order
        renderTasks();
    }

    /**
     * Function to toggle dark mode theme
     */
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    // Event Listeners for user actions
    addTaskButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", e => { if (e.key === "Enter") addTask(); });
    deleteSelectedButton.addEventListener("click", deleteSelectedTasks);
    sortAscButton.addEventListener("click", sortTasksAsc);
    sortDescButton.addEventListener("click", sortTasksDesc);
    resetOrderButton.addEventListener("click", resetTaskOrder);

    renderTasks(); // Initial render of tasks when page loads
});