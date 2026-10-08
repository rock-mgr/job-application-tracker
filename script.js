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
}

displayApplications();


function deleteApplication(id) {
    applications = applications.filter(function (application) {
        return application.id !== id;
    });

    displayApplications();
}

// Handle Add Application form submission
let applicationForm = document.querySelector("#applicationForm");

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