document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Build participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeader = document.createElement("h5");
        participantsHeader.textContent = "Participants";
        participantsSection.appendChild(participantsHeader);

        const participants = details.participants || [];

        if (participants.length > 0) {
          const list = document.createElement("ul");
          list.className = "participants-list";
          list.style.listStyle = "none";
          list.style.paddingLeft = "0";

          participants.forEach((p) => {
            const li = document.createElement("li");

            const avatar = document.createElement("span");
            avatar.className = "avatar";
            // derive initials from email or name-like string
            const namePart = (p || "").split("@")[0];
            const initials = namePart
              .split(/[-._]/)
              .map((s) => s[0] || "")
              .slice(0, 2)
              .join("")
              .toUpperCase();
            avatar.textContent = initials || "?";

            const info = document.createElement("div");
            info.className = "participant-info";

            const participantName = document.createElement("span");
            participantName.className = "participant-name";
            participantName.textContent = p;

            info.appendChild(participantName);

            // Delete icon
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant-btn";
            deleteBtn.title = "Remove participant";
            deleteBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#f44336"/><path d="M7 7L13 13M13 7L7 13" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
            deleteBtn.style.border = "none";
            deleteBtn.style.background = "none";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.style.marginLeft = "10px";

            deleteBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              deleteBtn.disabled = true;
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`, {
                  method: "POST"
                });
                if (response.ok) {
                  li.remove();
                } else {
                  deleteBtn.disabled = false;
                  alert("Failed to remove participant.");
                }
              } catch (err) {
                deleteBtn.disabled = false;
                alert("Error removing participant.");
              }
            });

            li.appendChild(avatar);
            li.appendChild(info);
            li.appendChild(deleteBtn);
            list.appendChild(li);
          });

          participantsSection.appendChild(list);
        } else {
          const empty = document.createElement("div");
          empty.className = "participants-empty";
          empty.textContent = "No participants yet. Be the first to sign up!";
          participantsSection.appendChild(empty);
        }

        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show new participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
