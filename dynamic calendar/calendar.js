document.addEventListener("DOMContentLoaded", function() {
    let csrfToken = 0;
    fetch("token.php", {
        method: 'POST',
        body: JSON.stringify(),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then (data => {
        csrfToken = data.token;
    })
    .catch(error => console.error('Error:',error));

    document.querySelectorAll('#category-filters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', loadEvents);
    });
    
    function loadEvents() {
        fetch("get_events.php", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not okay.");
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Clear all events from the calendar first
                document.querySelectorAll('.calendar-day').forEach(day => {
                    day.innerHTML = day.dataset.date.split("-")[2]; // Reset the day to just the number
                });
    
                // Get the checked event categories
                const checkedCategories = Array.from(document.querySelectorAll('#category-filters input[type="checkbox"]:checked'))
                    .map(checkbox => checkbox.value);
    
                // Display events based on checked categories
                data.events.forEach(event => {
                    if (checkedCategories.includes(event.category)) {
                        const eventDate = new Date(`${event.date}T00:00:00`);  
                        const formattedDate = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}-${eventDate.getDate()}`;
                        const eventDay = document.querySelector(`[data-date="${formattedDate}"]`);
    
                        if (eventDay) {
                            const eventEl = document.createElement("div");
                            eventEl.innerText = `${event.title}: ${event.time}`;
                            eventEl.classList.add("event-entry"); 
    
                            // Change the box colors based on category
                            switch (event.category) {
                                case 'meeting':
                                    eventEl.classList.add("meeting-box");
                                    break;
                                case 'work':
                                    eventEl.classList.add("work-box");
                                    break;
                                case 'personal':
                                    eventEl.classList.add("personal-box");
                                    break;
                                case 'appointment':
                                    eventEl.classList.add("appointment-box");
                                    break;
                                case 'other':
                                    eventEl.classList.add("other-box");
                                    break;
                            }
    
                            // Delete button
                            const deleteBtn = document.createElement("button");
                            deleteBtn.innerText = "Delete";
                            deleteBtn.onclick = (e) => deleteEvent(event.event_id, e);
    
                            // Edit button
                            const editBtn = document.createElement("button");
                            editBtn.innerText = "Edit";
                            editBtn.onclick = (e) => showEditForm(event.event_id, event.title, event.date, event.time, event.category, e);
    
                            eventEl.appendChild(deleteBtn);
                            eventEl.appendChild(editBtn);
                            eventDay.appendChild(eventEl);
                        }
                    }
                });
            } else {
                console.log("Error fetching events: ", data.message);
            }
        })
        .catch(err => console.error("Loading Event error:", err));
    }

    function loginAjax(event) {
        const username = document.getElementById("username").value; 
        const password = document.getElementById("password").value;

        const data = {
            'username': username,
            'password': password
        };

        fetch("login_ajax.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            csrfToken = data.token;
            if (data.success) {
                console.log("Successfully logged in!");
                document.getElementById("login_div").style.display = "none"; // Hide login form
                document.getElementById("register_div").style.display = "none";
                document.getElementById("logout-div").style.display = "block"; // Show logout button
                loadEvents(); // Load user-specific events after login
            } else {
                alert(`You were not logged in: ${data.message}`);
            }
        })
        .catch(err => console.error("Login error:", err));
    }

    function logoutAjax() {
        fetch("logout.php", {
            method: 'POST',
            body: JSON.stringify(),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            csrfToken = data.token;
            if (data.success) {
                console.log("successfully Logged out!");
                document.getElementById("login_div").style.display = "block"; // Show login form
                document.getElementById("register_div").style.display = "block";
                document.getElementById("logout-div").style.display = "none"; // Hide logout button
                location.reload(); 
            } else {
                console.log("Failed to logout.");
            }
        })
        .catch(err => console.error("Logout error:", err));
    }

    function checkLoginStatus() {
        fetch("login_status.php", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.loggedIn) {
                // Show logout button and hide login form
                document.getElementById("login_div").style.display = "none";
                document.getElementById("register_div").style.display = "none";
                document.getElementById("logout-div").style.display = "block";
                loadEvents();
            } else {
                // Show login form and hide logout button
                document.getElementById("login_div").style.display = "block";
                document.getElementById("register_div").style.display = "block";
                document.getElementById("logout-div").style.display = "none";
            }
        })
        .catch(err => console.error("Error checking login status:", err));
    }

    function registerAjax(event) {
        const new_username = document.getElementById("new_username").value; 
        const new_password = document.getElementById("new_password").value; 
        const data = {
            'new_username': new_username,
            'new_password': new_password
        };

        fetch("register.php", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'content-type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("You are successfully registered.");
                } else {
                    alert(`Error: ${data.message}`);
                }
            })
            .catch(err => console.error("Register error:", err));
    }

    document.getElementById("login_btn").addEventListener("click", loginAjax, false);
    document.getElementById("logout-btn").addEventListener("click", logoutAjax, false);
    document.getElementById("register_btn").addEventListener("click", registerAjax, false); 
    
    // Display "share with" options only when group event checkbox is checked.
    document.getElementById('group-event-checkbox').addEventListener('change', function() {
        const shareWithContainer = document.getElementById('share-with-container');
        shareWithContainer.style.display = this.checked ? 'block' : 'none';
    });

    function addEvent(date) {
        const eventTitle = document.getElementById("event-title");
        const eventTime = document.getElementById("event-time");
        const eventCategory = document.getElementById("event-category");
        const isGroup = document.getElementById('group-event-checkbox').checked ? 1 : 0;
        const shareWith = isGroup === 1 ? document.getElementById('share-with').value.split(',').map(user => user.trim()).filter(user => user) : [];
        
        if (!eventTitle.value || !eventTime.value || eventCategory.value == '') {
            alert("Please fill out the event title, time, and category.");
            return;
        }

        const eventData = {
            event_title: eventTitle.value,
            event_date: date,
            event_time: eventTime.value,
            event_category: eventCategory.value,
            isGroup: isGroup,
            shareWith: shareWith,
            token: csrfToken
        };

        fetch("add_event.php", {
            method: 'POST',
            body: JSON.stringify(eventData),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Event added!");
                loadEvents();
            } else {
                alert(data.message);
            }
        })
        .catch(err => console.error("Error adding event:", err));
    }
        
    function deleteEvent(eventId, event) {
        event.stopPropagation(); 
    
        fetch("delete_event.php", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'event_id': eventId,
                'token': csrfToken
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Event deleted!");
                loadEvents(); // Reload events after deletion
            } else {
                alert("Failed to delete event: " + data.message);
            }
        })
        .catch(err => console.error("Error deleting event:", err));
    }

    // Display "share with" options only when group event checkbox is checked.
    document.getElementById('edit-group-event-checkbox').addEventListener('change', function() {
        const shareWithContainer = document.getElementById('edit-share-with-container');
        shareWithContainer.style.display = this.checked ? 'block' : 'none';
    });

    // Function to show edit form and pre-fill event data
    function showEditForm(eventId, currentTitle, currentDate, currentTime, currentCategory, event) {
        event.stopPropagation(); // Prevent day click event

        document.getElementById('event-form').style.display = 'none';
        document.getElementById('edit-event-form').style.display = 'block';

        document.getElementById('edit-event-id').value = eventId;
        document.getElementById('edit-event-title').value = currentTitle;
        document.getElementById('edit-event-date').value = currentDate;
        document.getElementById('edit-event-time').value = currentTime;
        document.getElementById('edit-event-category').value = currentCategory; 

        document.getElementById('save-edit-event-btn').onclick = editEvent;
    }

    function editEvent() {
        const eventId = document.getElementById('edit-event-id').value;
        const updatedTitle = document.getElementById('edit-event-title').value;
        const updatedDate = document.getElementById('edit-event-date').value;
        const updatedTime = document.getElementById('edit-event-time').value;
        const updatedCategory = document.getElementById('edit-event-category').value;
        const updatedIsGroup = document.getElementById('edit-group-event-checkbox').checked ? 1 : 0;
        const updatedShareWith = updatedIsGroup === 1 ? document.getElementById('edit-share-with').value.split(',').map(user => user.trim()).filter(user => user) : [];
                
        fetch("edit_event.php", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'event_id': eventId,
                'event_title': updatedTitle,
                'event_date': updatedDate,
                'event_time': updatedTime,
                'event_category': updatedCategory, 
                'isGroup': updatedIsGroup,
                'shareWith': updatedShareWith,
                'token': csrfToken  
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Event updated!");
                loadEvents();
                document.getElementById('edit-event-form').style.display = 'none';  // Hide edit form
                document.getElementById('event-form').style.display = 'block';  // Show add event form again
            } else {
                alert("Failed to update event: " + data.message);
            }
        })
        .catch(error => console.error('Error updating event:', error));
    }    

    function shareCalendar() {
        const recipientUsername = document.getElementById('recipient').value.trim();
        if (!recipientUsername) {
            alert("Please enter a username to share with.");
            return;
        }

        const shareData = {
            recipient: recipientUsername,
            token: csrfToken
        };

        fetch('share_calendar.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(shareData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Calendar shared successfully!');
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error sharing calendar:', error);
            alert('An error occurred while sharing the calendar.');
        });
    }    

    // Load the calendar and check if the user is logged in
    function loadCalendar() {
        let currentDate = new Date();
        const calendarBody = document.getElementById("calendar-body");
        const currentMonth = document.getElementById("current-month");

        function renderCalendar(date) {
            const year = date.getFullYear();
            const month = date.getMonth();

            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            currentMonth.innerText = `${monthNames[month]} ${year}`;
            calendarBody.innerHTML = ""; // Clear the calendar

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            let day = 1;
            for (let i = 0; i < 6; i++) { // 6 rows (weeks) in the calendar
                const row = document.createElement("tr");

                for (let j = 0; j < 7; j++) { // 7 columns (days) in a week
                    const cell = document.createElement("td");

                    if (i === 0 && j < firstDay) {
                        row.appendChild(cell); // Empty cells before the 1st of the month
                    } else if (day > daysInMonth) {
                        break; 
                    } else {
                        cell.innerText = day;
                        cell.classList.add("calendar-day");
                        cell.dataset.date = `${year}-${month + 1}-${day}`;
                        row.appendChild(cell);
                        day++;
                    }
                }
                calendarBody.appendChild(row);
            }

            // Click event listener for adding events
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.addEventListener('click', function() {
                    const date = this.dataset.date;
                    addEvent(date); // Call addEvent when a day is clicked
                });
            });
        }

        renderCalendar(currentDate);

        // Event listeners for next/previous month buttons
        document.getElementById("prev-month-btn").addEventListener("click", function() {
            currentDate.setMonth(currentDate.getMonth()-1);
            renderCalendar(currentDate);
            loadEvents(); 
        });
        document.getElementById("next-month-btn").addEventListener("click", function() {
            currentDate.setMonth(currentDate.getMonth()+1);
            renderCalendar(currentDate);
            loadEvents(); 
        });

        loadEvents(); 
    }

    document.getElementById("share-calendar-btn").addEventListener("click", shareCalendar);

    checkLoginStatus();
    loadCalendar();
});