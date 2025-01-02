import React, { useState, useEffect, useCallback } from 'react';
import {Helmet} from "react-helmet";

import TeamDropdown from './components/TeamDropdown';
import PlayerDropdown from './components/PlayerDropdown';
import PlayerStats from './components/PlayerStats';
import { SearchBar } from './components/SearchBar';
import { SearchResultList } from './components/SearchResultList';
import { MdDeleteOutline } from "react-icons/md";

import "./App.css";

function App() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");

  const [playerPredPoints, setPlayerPredPoints] = useState(0);
  const [playerPrice, setPlayerPrice] = useState(0);
  const [playerPosition, setPlayerPosition]= useState("");
  const [results, setResults] = useState([]);
  const [team, setTeam] = useState([]);
  const [starters, setStarters] = useState({});
  const [bench, setBench] = useState([]);
  const [captain, setCaptain] = useState("");
  const [viceCaptain, setViceCaptain] = useState("");

  const [playerCount, setPlayerCount] = useState(0);
  const [teamValue, setTeamValue] = useState(0);
  const [teamPredPoints, setTeamPredPoints] = useState(0);
  const [playerTeam, setPlayerTeam] = useState("");
  const [teamCounts, setTeamCounts] = useState({});
  const [positionCounts, setPositionCounts] = useState({});

  // Fetch list of teams from api
  useEffect(() => {
    fetch("http://localhost:5000/api/teams").then((res) =>
      res.json()).then((data) =>
        setTeams(data))
        .catch((error) => console.error('Error fetching data:', error)); // Error handling
  }, []);

  // Fetch list of players from selected team
  useEffect(() => {
    setSelectedPlayer('');
    fetch(`http://localhost:5000/api/players/${selectedTeam}`).then((res) =>
      res.json()).then((data) =>
        setPlayers(data))
        .catch((error) => console.error('Error fetching data:', error));
  }, [selectedTeam]);

  // Fetch predicted points for selected player
  useEffect(() => {
    fetch(`http://localhost:5000/api/predictedpoints/${selectedPlayer}`).then((res) =>
      res.json()).then((data) =>
        setPlayerPredPoints(data.predicted_points))
        .catch((error) => console.error('Error fetching data:', error));
  }, [selectedPlayer]);

  // Fetch price for selected player
  useEffect(() => {
    fetch(`http://localhost:5000/api/prices/${selectedPlayer}`).then((res) =>
    res.json()).then((data) =>
      setPlayerPrice(data.price))
      .catch((error) => console.error('Error fetching data:', error));
  }, [selectedPlayer]);

  // Fetch team for selected player
  useEffect(() => {
    fetch(`http://localhost:5000/api/team/${selectedPlayer}`).then((res) =>
    res.json()).then((data) =>
      setPlayerTeam(data.team))
      .catch((error) => console.error('Error fetching data:', error));
  }, [selectedPlayer]);

    // Fetch position for selected player
    useEffect(() => {
      fetch(`http://localhost:5000/api/position/${selectedPlayer}`).then((res) =>
      res.json()).then((data) =>
        setPlayerPosition(data.position))
        .catch((error) => console.error('Error fetching data:', error));
    }, [selectedPlayer]);

  // Update selectedTeam whenever a new team is slected
  const handleTeamChange = (team) => {
    setSelectedTeam(team);
  }

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setResults([]);
  };

  const findStarters = useCallback((team) => {
    var gk = [];
    let def = [];
    var mid = [];
    var fwd = [];

    // Sort team descending by predicted points
    const sortedTeam = [...team].sort((a, b) => b.predPoints - a.predPoints);

    // Sort team into arrays based on position
    sortedTeam.forEach((player) => {
      if (player.position === "GK") gk.push(player);
      else if (player.position === "DEF") def.push(player);
      else if (player.position === "MID") mid.push(player);
      else if (player.position === "FWD") fwd.push(player);
    });

    var starters = {GK: [], DEF: [], MID: [], FWD: []};
    var bench = [];

    if(gk[0]) starters.GK.push(gk[0]);
    if(gk[1]) bench.push(gk[1]);

    starters.DEF.push(...def.slice(0,3));
    bench.push(...def.slice(3,5));

    starters.MID.push(...mid.slice(0,2));
    bench.push(...mid.slice(2,5));

    if (fwd[0]) starters.FWD.push(fwd[0]);
    bench.push(...fwd.slice(1,3));

    bench.sort((a, b) => b.predPoints - a.predPoints);

    const benchToStarter = bench.splice(0,4);

    benchToStarter.forEach((player) => {
      console.log(player);

      if (player.position === "DEF") {
        starters.DEF.push(player);
      }
      else if (player.position === "MID") {
        starters.MID.push(player);
      }
      else if (player.position === "FWD") {
        starters.FWD.push(player);
      }
    });

    return { starters, bench };
  }, []);

  useEffect(() => {
    const updatedTeam = assignCaptain(team);
    const { starters, bench } = findStarters(updatedTeam);
    setStarters(starters);
    setBench(bench);
  }, [team, findStarters]);

  // Check if the player is able to be added to the team
  const canAddPlayer = () => {
    if (!selectedPlayer) return false;
    if (team.some((player) => player.name.toLowerCase().trim() === selectedPlayer.toLowerCase().trim())) return false;
    if (playerCount >= 16) return false;
    if (teamCounts[playerTeam] > 2) return false;
    if ((playerPosition === "DEF" || playerPosition === "MID") && positionCounts[playerPosition] >= 5) return false;
    if(playerPosition === "FWD" && positionCounts[playerPosition] >= 3) return false;
    if(playerPosition === "GK" && positionCounts[playerPosition] >= 2) return false;
    if (teamValue + playerPrice > 100) return false;
    return true;
  }

  // Add a player to users team
  const handleAddPlayer = () => {
      if (!canAddPlayer()) return;

      setTeam((prevTeam) => [...prevTeam, {name: selectedPlayer, predPoints: playerPredPoints, price: playerPrice, playerTeam: playerTeam, position: playerPosition}]);
      setPlayerCount((prevCount) => prevCount + 1);
      setTeamValue((prevTeamValue) => Math.round((prevTeamValue + playerPrice)*10)/10);
      setTeamPredPoints((prevTeamPoints) => Math.round((prevTeamPoints + playerPredPoints)*10)/10);

      setTeamCounts((prevTeamCounts) => {
        const newCounts = {...prevTeamCounts};
        newCounts[playerTeam] = (newCounts[playerTeam] || 0) + 1;
        return newCounts;
      });

      setPositionCounts((prevPosCounts) => {
        const newCounts = {...prevPosCounts};
        newCounts[playerPosition] = (newCounts[playerPosition] || 0) + 1;
        return newCounts;
      });
    }

  const assignCaptain = (team) => {
    if (!Array.isArray(team) || team.length === 0) return team;

    // sort team
    const sortedTeam = [...team].sort((a,b) => b.predPoints - a.predPoints);

    // Set captain to player with highest predicted points, vice captain to second highest
    if (sortedTeam[0]) setCaptain(sortedTeam[0].name);
    if (sortedTeam[1]) setViceCaptain(sortedTeam[1].name);

    return sortedTeam;
  }

  // Removes player from team, updates price and predicted points
  const removeFromTeam = (playerToRemove, team) => {
    setTeamValue(teamValue - playerToRemove.price);
    setTeamPredPoints((Math.round((teamPredPoints)*10)/10) - (Math.round((playerToRemove.predPoints)*10)/10));

    // Update team counts
    const updatedTeamCounts = { ...teamCounts };
    if (updatedTeamCounts[playerToRemove.playerTeam] > 0) {
      updatedTeamCounts[playerToRemove.playerTeam] -= 1;
    }
    setTeamCounts(updatedTeamCounts);

    // Update position counts
    const updatedPosCounts = { ...positionCounts };
    if (updatedPosCounts[playerToRemove.position] > 0) {
      updatedPosCounts[playerToRemove.position] -= 1;
    }

    setPositionCounts(updatedPosCounts);

    // Remove player from team
    const updatedTeam = team.filter(player => player.name !== playerToRemove.name);
    setTeam(updatedTeam);
  }

  const resetTeam = (team) => {
    setTeam([]);
    setTeamValue(0);
    setTeamPredPoints(0);
    setTeamCounts({});
    setPositionCounts({});  
  }

  return (
    <div className="app-container">
      <div className="middle-third">
        <Helmet>
          <title>FPL Assist</title>
        </Helmet>
        <h1>FPL Assist</h1>
        <div className="search-bar-container">
          <SearchBar setResults = {setResults} onPlayerSelect={handlePlayerSelect} />
          <SearchResultList results={results} onSelect={handlePlayerSelect}/>
        </div>
        <div className="dropdown-section">
          <TeamDropdown
            teams={teams}
            selectedTeam={selectedTeam}
            handleTeamChange={handleTeamChange}
          />
          <PlayerDropdown
            players={players}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
            disabled={!selectedTeam}
          />
        </div>
        <div className="player-stats-section">
          {selectedPlayer && (
            <PlayerStats 
              playerName={selectedPlayer}
              position={playerPosition}
              team={playerTeam}
              predPoints={playerPredPoints}
              price = {playerPrice}
            />
          )}
          <div className="playerStatsButtons">
            {selectedPlayer &&
              <button className="add-button" onClick={handleAddPlayer}>Add to team</button>
            }
            {team.length > 0 && 
              <button className="reset-button" onClick={ resetTeam }>Reset team</button>
            }
          </div>
        </div>
        <div className="user-team">
          <div className="team-stats">
            <p><strong>Team value: {teamValue.toFixed(1)}</strong></p>
            <p><strong>Predicted Points: {teamPredPoints.toFixed(1)}</strong></p>
          </div>
          <h4>Starters:</h4>

          {Object.keys(starters).map((position) => {
            const players = starters[position];
            if (players.length === 0) return <div key={position}></div>;
            return (
              <div key ={position}>
                <h4>{position}</h4>
                <ul>
                  {players.map((player, index) => (
                    <li key={index}>
                      <PlayerStats
                        // playerName={player.displayName || player.name}
                        playerName={
                          (player.name === captain ? `${player.name} (C)` : player.name === viceCaptain ? `${player.name} (V)` : player.name)
                        }
                        position={player.position}
                        team={player.playerTeam}
                        predPoints={player.predPoints}
                        price = {player.price}
                      />
                      <MdDeleteOutline id="removeButton" onClick={() => removeFromTeam(player, team)}></MdDeleteOutline>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <h4>Bench:</h4>
          <ul>
            {bench.map((player, index) => (
              <li key={index}>
              <PlayerStats
                playerName={player.name}
                position={player.position}
                team={player.playerTeam}
                predPoints={player.predPoints}
                price = {player.price}
              />
              <MdDeleteOutline id="removeButton" onClick={() => removeFromTeam(player, team)}></MdDeleteOutline>
            </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;