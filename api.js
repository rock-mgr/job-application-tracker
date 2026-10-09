// JobTrack JSONBin API
let apiUrl = "https://api.jsonbin.io/v3/b/6ac84245ac6210605a2134c2";

// Load applications from JSONBin
async function loadApplications() {
    let response = await axios.get(apiUrl + "/latest");

    applications = response.data.record.applications;
    displayApplications();
}

// Load applications when JobTrack starts
loadApplications();

// Save applications to JSONBin
async function saveApplications() {
    let response = await axios.put(apiUrl, {
        applications: applications
    });

    return response;
}