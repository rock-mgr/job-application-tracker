
// Format dates as DD MMM YYYY
function formatDate(dateString) {
    // Check date and end format if not date
    if (!dateString) {
        return "-";
    }

    let date = new Date(dateString);

    //refer example: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function countOffers() {
    return applications.filter(function (application) {
        return application.status === "Offer";
    }).length;
}

function displayOffers(total) {
    document.querySelector("#totalOffers").innerText = total;
}

// Update dashboard 
function updateDashboard() {
    document.querySelector("#totalApplications").innerText = applications.length;

    displayOffers(countOffers());

    let totalRejected = applications.filter(function (application) {
        return application.status === "Rejected";
    }).length;

    document.querySelector("#totalRejected").innerText = totalRejected;

    // To match with our application - YYYY-MM-DD format
    let now = new Date();
    let today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    // Interviews > equal today date is counted
    // those past date is not counted
    let upcomingInterviews = applications.filter(function (application) {
        return application.status === "Interview" &&
            application.interviewDate &&
            application.interviewDate >= today;
    }).length;

    document.querySelector("#upcomingInterviews").innerText = upcomingInterviews;
}

// To display the applications 
function displayApplications() {
    let applicationList = document.querySelector("#applicationList");
    applicationList.innerHTML = "";

    // Mobile responsive
    let mobileApplicationList = document.querySelector("#mobileApplicationList");
    mobileApplicationList.innerHTML = "";

    // This will copy another set without making changes - no parameter in slice()
    let displayedApplications = applications.slice();
    let sortBy = document.querySelector("#sortBy").value;

    // Check sort that match the options
    // refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    if (sortBy === "date-desc") {
        displayedApplications.sort(function (a, b) {
            if (a.appliedDate > b.appliedDate) {
                return -1;
            } else if (a.appliedDate < b.appliedDate) {
                return 1;
            }
            return 0;
        });
    } else if (sortBy === "date-asc") {
        displayedApplications.sort(function (a, b) {
            if (a.appliedDate < b.appliedDate) {
                return -1;
            } else if (a.appliedDate > b.appliedDate) {
                return 1;
            }
            return 0;
        });
    } else if (sortBy === "company-asc") {
        displayedApplications.sort(function (a, b) {
            if (a.company < b.company) {
                return -1;
            } else if (a.company > b.company) {
                return 1;
            }
            return 0;
        });
    } else if (sortBy === "company-desc") {
        displayedApplications.sort(function (a, b) {
            if (a.company > b.company) {
                return -1;
            } else if (a.company < b.company) {
                return 1;
            }
            return 0;
        });
    }

    for (let application of displayedApplications) {
        let searchText = document.querySelector("#searchInput").value.toLowerCase();
        if (!application.company.toLowerCase().includes(searchText) &&
            !application.position.toLowerCase().includes(searchText)) {
            continue;
        }

        let selectedStatus = document.querySelector("#statusFilter").value;
        if (selectedStatus !== "All" && application.status !== selectedStatus) {
            continue;
        }

        // Create a mobile application card
        let mobileCard = document.createElement("div");
        mobileCard.className = "card mb-3";
        mobileCard.innerHTML = `
            <div class="card-body">
                <h3 class="h5 mb-1">${application.company}</h3>
                <p class="text-muted mb-1">${application.position}</p>
                <p class="mb-0">Status: ${application.status}</p>

                <button type="button" class="btn btn-sm btn-outline-secondary mt-2"
                    data-bs-toggle="collapse"
                    data-bs-target="#details${application.id}">
                    View Details
                </button>

                <div class="collapse mt-3" id="details${application.id}">
                    <hr>
                    <p class="mb-2">
                        <strong>Interview Date:</strong>
                        ${formatDate(application.interviewDate)}
                    </p>

                    <p class="mb-2">
                        <strong>Job Link:</strong>
                        ${application.jobLink
                ? `<a href="${application.jobLink}" target="_blank" rel="noopener noreferrer">View Job</a>`
                : "Not provided"}
                    </p>

                    <p class="mb-2">
                        <strong>Notes:</strong>
                        ${application.notes || "No notes added"}
                    </p>

                    <div class="d-flex gap-2 mt-3">
                        <button type="button" class="btn btn-sm btn-outline-primary mobile-edit">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>

                        <button type="button" class="btn btn-sm btn-outline-danger mobile-delete">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        mobileApplicationList.appendChild(mobileCard);

        // Mobile Edit button event
        let mobileEditButton = mobileCard.querySelector(".mobile-edit");
        mobileEditButton.addEventListener("click", function () {
            editingApplicationId = application.id;

            document.querySelector("#editCompany").value = application.company;
            document.querySelector("#editPosition").value = application.position;
            document.querySelector("#editStatus").value = application.status;
            document.querySelector("#editAppliedDate").value = application.appliedDate;
            document.querySelector("#editInterviewDate").value = application.interviewDate;
            document.querySelector("#editJobLink").value = application.jobLink;
            document.querySelector("#editNotes").value = application.notes;

            let editOffcanvas = new bootstrap.Offcanvas(
                document.querySelector("#editApplicationOffcanvas")
            );

            editOffcanvas.show();
        });

        // Mobile Delete button event
        let mobileDeleteButton = mobileCard.querySelector(".mobile-delete");
        mobileDeleteButton.addEventListener("click", function () {
            Swal.fire({
                title: "Delete Application?",
                text: `Are you sure you want to delete ${application.company}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Delete",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#dc3545"
            }).then(function (result) {
                if (result.isConfirmed) {
                    deleteApplication(application.id);
                }
            });
        });

        let row = document.createElement("tr");
        let badgeColor = "bg-secondary";

        if (application.status === "Applied") {
            badgeColor = "bg-primary";
        } else if (application.status === "Interview") {
            badgeColor = "bg-success";
        } else if (application.status === "Offer") {
            badgeColor = "bg-warning text-dark";
        } else if (application.status === "Rejected") {
            badgeColor = "bg-danger";
        }

        row.innerHTML = `
            <td>${application.company}</td>
            <td>${application.position}</td>
            <td><span class="badge ${badgeColor}">${application.status}</span></td>
            <td>${formatDate(application.appliedDate)}</td>
            <td>${formatDate(application.interviewDate)}</td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-primary me-2">
                    <i class="bi bi-pencil-square"></i> Edit
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;

        applicationList.appendChild(row);

        let editButton = row.querySelector(".btn-outline-primary");

        // refer: https://getbootstrap.com/docs/5.3/components/offcanvas/
        // Edit button clicked event
        editButton.addEventListener("click", function () {
            let editOffcanvas = new bootstrap.Offcanvas(
                document.querySelector("#editApplicationOffcanvas")
            );

            editingApplicationId = application.id;

            document.querySelector("#editCompany").value = application.company;
            document.querySelector("#editPosition").value = application.position;
            document.querySelector("#editStatus").value = application.status;
            document.querySelector("#editAppliedDate").value = application.appliedDate;
            document.querySelector("#editInterviewDate").value = application.interviewDate;
            document.querySelector("#editJobLink").value = application.jobLink;
            document.querySelector("#editNotes").value = application.notes;

            editOffcanvas.show();
        });

        let deleteButton = row.querySelector(".btn-outline-danger");

        // Delete button clicked event
        deleteButton.addEventListener("click", function () {
            Swal.fire({
                title: "Delete Application?",
                text: `Are you sure you want to delete ${application.company}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Delete",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#dc3545"
            }).then(function (result) {
                if (result.isConfirmed) {
                    deleteApplication(application.id);
                }
            });
        });
        // End of delete click event

    }
    updateDashboard();
}

let editingApplicationId = null;
displayApplications();

// Delete function to remove application by id
async function deleteApplication(id) {

    // Backup applications before deleting
    let originalApplications = applications.slice();

    applications = applications.filter(function (application) {
        return application.id !== id;
    });

    // Save deletion to JSONBin
    try {
        await saveApplications();
    } catch (error) {
        applications = originalApplications;
        Swal.fire("Error", "Unable to delete application.", "error");
        return;
    }

    displayApplications();

    Swal.fire({
        icon: "success",
        title: "Application Deleted!",
        text: "The application has been deleted successfully.",
        timer: 1500,
        showConfirmButton: false
    });
}

// Handle Add Application form submission
let applicationForm = document.querySelector("#applicationForm");

// Submit button - adding applications
applicationForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    let company = document.querySelector("#company").value.trim();
    let position = document.querySelector("#position").value.trim();
    let status = document.querySelector("#status").value;
    let appliedDate = document.querySelector("#appliedDate").value;
    let interviewDate = document.querySelector("#interviewDate").value;
    let jobLink = document.querySelector("#jobLink").value.trim();
    let notes = document.querySelector("#notes").value.trim();

    // Validate interview date
    if (interviewDate && interviewDate < appliedDate) {
        Swal.fire({
            icon: "error",
            title: "Invalid Interview Date",
            text: "Interview date cannot be earlier than the applied date."
        });

        return;
    }

    let newApplication = {
        id: Date.now(),
        company: company,
        position: position,
        status: status,
        appliedDate: appliedDate,
        interviewDate: interviewDate,
        jobLink: jobLink,
        notes: notes
    };

    applications.push(newApplication);

    // Safe check to catch error when trying to add application
    try {
        await saveApplications();
    } catch (error) {
        applications.pop();
        Swal.fire("Error", "Unable to save application.", "error");
        return;
    }

    displayApplications();

    // Close of bootstrap modal
    let addModal = bootstrap.Modal.getInstance(
        document.querySelector("#addApplicationModal")
    );
    addModal.hide();

    // Clear the form
    applicationForm.reset();

    // Notify user that the application was added successfully
    Swal.fire({
        icon: "success",
        title: "Application Added!",
        text: `${company} has been added successfully.`,
        timer: 2000,
        showConfirmButton: false
    });
});

// Handle Edit Application form submission
let editApplicationForm = document.querySelector("#editApplicationForm");

// Submit edited application event
editApplicationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    let application = applications.find(function (application) {
        return application.id === editingApplicationId;
    });

    // Check valid dates
    let appliedDate = document.querySelector("#editAppliedDate").value;
    let interviewDate = document.querySelector("#editInterviewDate").value;

    if (interviewDate && interviewDate < appliedDate) {
        Swal.fire({
            icon: "error",
            title: "Invalid Interview Date",
            text: "Interview date cannot be earlier than the applied date."
        });
        return;
    }

    // Backup original application data
    let originalCompany = application.company;
    let originalPosition = application.position;
    let originalStatus = application.status;
    let originalAppliedDate = application.appliedDate;
    let originalInterviewDate = application.interviewDate;
    let originalJobLink = application.jobLink;
    let originalNotes = application.notes;

    // Update the selected application
    application.company = document.querySelector("#editCompany").value.trim();
    application.position = document.querySelector("#editPosition").value.trim();
    application.status = document.querySelector("#editStatus").value;
    application.appliedDate = document.querySelector("#editAppliedDate").value;
    application.interviewDate = document.querySelector("#editInterviewDate").value;
    application.jobLink = document.querySelector("#editJobLink").value.trim();
    application.notes = document.querySelector("#editNotes").value.trim();

    // Save edited application to JSONBin
    try {
        await saveApplications();
    } catch (error) {
        application.company = originalCompany;
        application.position = originalPosition;
        application.status = originalStatus;
        application.appliedDate = originalAppliedDate;
        application.interviewDate = originalInterviewDate;
        application.jobLink = originalJobLink;
        application.notes = originalNotes;
        Swal.fire("Error", "Unable to update application.", "error");
        return;
    }

    // Close the Edit offcanvas
    let editOffcanvas = bootstrap.Offcanvas.getInstance(
        document.querySelector("#editApplicationOffcanvas")
    );

    editOffcanvas.hide();

    // Notify user that the application was updated
    Swal.fire({
        icon: "success",
        title: "Application Updated!",
        text: `${application.company} has been updated successfully.`,
        timer: 2000,
        showConfirmButton: false
    });

    // Refresh the applications table
    displayApplications();
});

// Search applications via input field
let searchInput = document.querySelector("#searchInput");

// Search input event 
searchInput.addEventListener("input", function () {
    displayApplications();
});

// Status filter 
let statusFilter = document.querySelector("#statusFilter");

// Status filter select event
statusFilter.addEventListener("change", function () {
    displayApplications();
});

// Order sorting 
let sortByInput = document.querySelector("#sortBy");

// Sort selection event
sortByInput.addEventListener("change", function () {
    displayApplications();
});


