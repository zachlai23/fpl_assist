const MAX_BUDGET = 100;
const MAX_PLAYERS = 15;
const POS_LIMITS ={"GK": 2, "DEF": 5, "MID": 5, "FWD": 3}

let team = [];
let teamPrice = 0;
let currentPlayer = null;


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

function displayPlayerData(data) {
    if (data.points) displayPoints(data.points);
    if (data.price) displayPrice(data.price);
}

function displayPoints(message) {
    const pointsDisplay = document.getElementById('points-display');
    pointsDisplay.textContent = message;
}

function displayPrice(message) {
    const priceDisplay = document.getElementById('price-display');
    priceDisplay.textContent = message;
}


document.getElementById('player-select').addEventListener('change', (event) => {
    const selectedPlayer = event.target.value;

    if (selectedPlayer) {
        getPlayerData(selectedPlayer);
    } else {
        displayPlayerData({});
    }
});

async function getPlayerData(playerName) {
    try {
        const [pointsRes, priceRes, positionRes, teamRes] = await Promise.all([
            fetch(`http://127.0.0.1:5000/api/predictedpoints/${playerName}`),
            fetch(`http://127.0.0.1:5000/api/prices/${playerName}`),
            fetch(`http://127.0.0.1:5000/api/position/${playerName}`),
            fetch(`http://127.0.0.1:5000/api/team/${playerName}`)
        ]);

        if (!pointsRes.ok || !priceRes.ok || !positionRes.ok || !teamRes.ok) {
            throw new Error('One or more requests failed');
        }

        const pointsData = await pointsRes.json();
        const priceData = await priceRes.json();
        const positionData = await positionRes.json();
        const teamData = await teamRes.json();

        currentPlayer = {
            name: pointsData.player_name,
            team: teamData.team,
            predictedPoints: pointsData.predicted_points,
            price: priceData.price,
            position: positionData.position
        };

        displayPlayerData({
            points: pointsData.predicted_points ? `Predicted Points for ${capitalizeName(pointsData.player_name)}(${positionData.position}) for Gameweek ${pointsData.gw + 1}: ${pointsData.predicted_points}` : `Error: ${pointsData.error}`,
            price: priceData.price ? `Price: ${priceData.price}` : `Error: ${priceData.error}`,
        }); 
    } catch (error) {
        console.error('Error fetching player data:', error);
        displayPlayerData({ points: 'Error fetching player data' });
    }
}

function resetPlayerDropdown() {
    const playerDropdown = document.getElementById('player-select');
    playerDropdown.innerHTML = '<option value="">Select a player</option>';
    playerDropdown.disabled = true; // Disable dropdown until a team is selected
}

// Handle search bar
document.getElementById('search-button').addEventListener('click', async () => {
    const playerName = document.getElementById('player-search-input').value.trim().toLowerCase();

    if(playerName) {
        getPlayerData(playerName);
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
        result = player_names.filter((player)=>{
        return player.toLowerCase().split(" ").some(word => word.startsWith(input));
        });
        displayResult(result);

        if(!result.length) {
            resultsBox.innerHTML = '';
        }
    }
}

function capitalizeName(name) {
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
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

function countPlayersFromSameTeam(teamName) {
    return team.filter(player => player.team === teamName).length;
}

function countPlayersByPosition(position) {
    return team.filter(player => player.position === position).length;
}

function addToTeam() {
    if (currentPlayer && !team.includes(currentPlayer)) {
        if(countPlayersFromSameTeam(currentPlayer.team) < 3 
            && team.length < MAX_PLAYERS 
            && countPlayersByPosition(currentPlayer.position) < POS_LIMITS[currentPlayer.position]
        ) {
            currentPlayer.name = capitalizeName(currentPlayer.name);
            team.push(currentPlayer);
            teamPrice += currentPlayer.price;
    
            displayTeam();
        }

    } else {
        console.log("No current player");
    }
}

// Display users team from 'add team' button
function displayTeam() {
    const teamContainer = document.getElementById("team-container")
    teamContainer.innerHTML = '';

    let teamPrice = 0;
    let teamPredictedPoints = 0;

    // For each player in team lsit create a list element and add
    team.forEach((player, index) => {
        if(teamPrice + player.price < MAX_BUDGET) {
            const playerElement = document.createElement("div");

            playerElement.classList.add('team-player');
            
            playerElement.innerHTML = `
                <span>${player.name} - ${player.position} - Predicted Points: ${player.predictedPoints} - Price: ${player.price}</span>
                <button onclick="removePlayer(${index})">Remove</button>
            `;
    
            teamContainer.appendChild(playerElement);
    
            teamPrice += player.price;
            teamPredictedPoints += player.predictedPoints;
        } else {
            team.splice(index, 1);
        }

    });

    // Update team price
    teamPrice = teamPrice.toFixed(1);
    const priceDisplay = document.getElementById("user-team-price");
    priceDisplay.textContent = `Team Price: ${teamPrice}`;

    // Update team predicted points
    teamPredictedPoints = teamPredictedPoints.toFixed(1);
    const predictedPointsDisplay = document.getElementById("user-team-predicted-points");
    predictedPointsDisplay.textContent = `Team Predicted Points: ${teamPredictedPoints}`;
}

function removePlayer(index) {
    team.splice(index, 1);
    displayTeam(); 
}

function resetTeam() {
    team = [];
    displayTeam();
}

document.getElementById("resetTeam-button").addEventListener("click",() => {
    resetTeam();
});

// Add current selected player to team when 'add to team' button is clicked
document.getElementById("addToTeam-button").addEventListener("click", () => {
    addToTeam();
});