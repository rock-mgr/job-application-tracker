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

// Update dashboard 
function updateDashboard() {
    document.querySelector("#totalApplications").innerText = applications.length;

    let totalOffers = applications.filter(function (application) {
        return application.status === "Offer";
    }).length;

    document.querySelector("#totalOffers").innerText = totalOffers;

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

    for (let application of applications) {
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
function deleteApplication(id) {
    applications = applications.filter(function (application) {
        return application.id !== id;
    });

    displayApplications();
}

// Handle Add Application form submission
let applicationForm = document.querySelector("#applicationForm");

// Submit button - adding applications
applicationForm.addEventListener("submit", function (event) {
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
editApplicationForm.addEventListener("submit", function (event) {
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

    // Update the selected application
    application.company = document.querySelector("#editCompany").value.trim();
    application.position = document.querySelector("#editPosition").value.trim();
    application.status = document.querySelector("#editStatus").value;
    application.appliedDate = document.querySelector("#editAppliedDate").value;
    application.interviewDate = document.querySelector("#editInterviewDate").value;
    application.jobLink = document.querySelector("#editJobLink").value.trim();
    application.notes = document.querySelector("#editNotes").value.trim();

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