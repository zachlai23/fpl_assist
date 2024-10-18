
document.addEventListener('DOMContentLoaded', () => {
    loadTeams();

    const teamDropdown = document.getElementById('team-select');
    teamDropdown.addEventListener('change', (event) => {
        const selectedTeam = event.target.value;

        if(selectedTeam) {
            loadPlayers(selectedTeam);
        } 
        else {
            resetPlayerDropdown()
        }
    })
});

// async allows function to "pause" at certain points in the code
async function loadTeams() {
    try {
        // fetch - built in JS function used to make HTTP requests(like GET requests to APIs)
        // await tells js to wait for fetch to complete before moving on
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

async function loadPlayers(teamName) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/players/${teamName}`);
        const players = await response.json();

        const playerDropdown = document.getElementById('player-select');
        resetPlayerDropdown(); // Clear previous options

        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            playerDropdown.appendChild(option);
        });
        playerDropdown.disabled = false;
    }
    catch(error) {
        console.error('Error fetching players:', error);
    }
}

function displayPoints(message) {
    const pointsDisplay = document.getElementById('points-display');
    pointsDisplay.textContent = message; // Update the content
}

document.getElementById('player-select').addEventListener('change', (event) => {
    const selectedPlayer = event.target.value;
    const gw = document.getElementById('gameweek').value;

    if (selectedPlayer) {
        getPredictedPoints(selectedPlayer); // Get predicted points when a player is selected
    } else {
        displayPoints(''); // Clear the points display if no player is selected
    }
});

async function getPredictedPoints(playerName) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/predictedpoints/${playerName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Assuming data returns an object like { player_name: 'Player A', predicted_points: 5 }
        if (data.error) {
            displayPoints(`Error: ${data.error}`);
        } else {
            displayPoints(`Predicted Points for ${data.player_name} for Gameweek ${data.gw}: ${data.predicted_points}`);
        }
    } catch (error) {
        console.error('Error fetching predicted points:', error);
        displayPoints('Error fetching predicted points');
    }
}
    
document.getElementById('player-select').addEventListener('change', (event) => {
    const selectedPlayer = event.target.value; // Get the selected player // Get the value from the gameweek dropdown

    if (selectedPlayer) {
        console.log(`Fetching points for ${selectedPlayer}`); // Debug log
        getPredictedPoints(selectedPlayer); // Fetch predicted points for the selected player and gameweek
    } else {
        displayPoints(''); // Clear the points display if no player is selected
    }
});

function resetPlayerDropdown() {
    const playerDropdown = document.getElementById('player-select');
    playerDropdown.innerHTML = '<option value="">Select a player</option>';
    playerDropdown.disabled = true; // Disable dropdown until a team is selected
}

// Handle search bar
document.getElementById('search-button').addEventListener('click', async () => {
    const playerName = document.getElementById('player-search-input').value.trim().toLowerCase();

    if(playerName) {
        getPredictedPoints(playerName);
    }
    else {
        displayPoints('Please enter a player name.');
    }
});


// Key Handling - allows user to hit enter for search bar
document.getElementById('player-search-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('search-button').click();
    }
});

// Autocomplete for search bar
// let playerRecs = ["Erling Haaland", "Adam Webster", "Kaoru Mitoma", "William Saliba", "Bukayo Saka", "Ibrahima Konate", "Cole Palmer"];
let player_names = [];
// Fetch player names from the Flask API
async function fetchPlayerNames() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/players');
        player_names = await response.json();  // Convert to JSON and store in playerNames
    } catch (error) {
        console.error("Error fetching player names:", error);
    }
}

// Call the function to load player names when the page loads
fetchPlayerNames();

const resultsBox = document.querySelector(".result-box");
const inputBox = document.getElementById("player-search-input");

inputBox.onkeyup = function() {
    let result = [];
    let input = inputBox.value.trim().toLowerCase();
    if(input.length) {
        result = player_names.filter((keyword)=>{
            return keyword.toLowerCase().startsWith(input);
        });
        displayResult(result);

        if(!result.length) {
            resultsBox.innerHTML = '';
        }
    }
}

// Display suggesstions for search bar
function displayResult(result) {
    const content = result.map((list)=>{
        return "<li onclick=selectInput(this)>" + list + "</li>";
    });

    resultsBox.innerHTML = "<ul>" + content.join('') + "</ul>";
}

function selectInput(list) {
    inputBox.value = list.innerHTML;
    resultsBox.innerHTML = '';
}