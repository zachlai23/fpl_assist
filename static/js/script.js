// async allows function to "pause" at certain points in the code
async function loadTeams() {
    try {
        // fetch - built in JS function used to make HTTP requests(like GET requests to APIs)
        // await tells js to wait fro fetch to complete before moving on
        const response = await fetch('http://127.0.0.1:5000/api/teams');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const teams = await response.json();    // response.josn() extracts JSON data from HTTP response

        // creates a variable for 'team-select' item in HTML
        const teamDropdown = document.getElementById('team-select');
        // for each team in teams, create an HTML option with the team name and append it to the dropdown
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team;
            teamDropdown.appendChild(option);
        });
    }
    catch(error) {
        console.error('Error fetching teams:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
});