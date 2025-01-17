const buttons = document.querySelectorAll('.bet-buttons > button');

var current_bet = null;
var scores = {};
const undo = [];

const table = document.getElementById("results");
let newtable = true;

let names = ["Misere", "Double Misere", "Poignee", 
        "Double Poignee", "Triple Poignee"];
let values = {
  "Misere" : 10,
  "Double Misere": 20,
  "Poignee": 10,
  "Double Poignee": 20,
  "Triple Poignee": 30
};

let points = {
  'Petite': 20,
  'Garde' : 40,
  'Garde sans': 80,
  'Garde contre': 160,
  'Petit chelem': 500,
  'Grand chelem': 1000
}

function undofun(){
  if (undo.length > 0){
    whatundo = undo.pop()
    scores = Object.entries(scores).reduce((result, [key, value]) => {
    result[key] = value - whatundo[key]; 
    return result;
    }, {});
    remove_row();
  }
}

function calculate(){
  let cur_points = points[current_bet];
  const curdict = Object.fromEntries(
    Object.entries(scores).map(([key]) => [key, 0])
  );  
  let pass = document.getElementById("score").value;
  if (pass < 0){
    cur_points *= -1;
  }
  if (pass == -1){
    pass = 0;
  }
  cur_points = +cur_points + +pass;
  cur_points = +cur_points + +document.getElementById("petit").value;
  const activeButtons = document.querySelectorAll('.playerButton.active');
  const notactiveButtons = document.querySelectorAll('.playerButton:not(.active)');
  notactiveButtons.forEach((btn) => curdict[btn.textContent] += -cur_points);
  const sum = Object.values(curdict).reduce((accumulator, value) => accumulator + value, 0);
  if (activeButtons.length == 1){
    curdict[activeButtons[0].textContent] = -sum;
  }else{
    activeButtons.forEach((btn) => curdict[btn.textContent] += -sum/2)
  }
  scores = Object.entries(scores).reduce((result, [key, value]) => {
  result[key] = value + curdict[key]; 
  return result;
  }, {});
  undo.push(curdict);
  // console.log(activeButtons.forEach((btn) => btn.textContent))
  add_row(scores, Array.from(activeButtons).map(button => button.textContent).join(', '), current_bet);
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    // Deactivate all buttons
    buttons.forEach(btn => btn.classList.remove('active'));
    // Activate the clicked button
    button.classList.add('active');
    current_bet = button.textContent || button.innerText;;
  });
});

const transformButton = document.getElementById('lockin');
const inputContainer = document.getElementById('player-inputs');
const resultContainer = document.getElementById('results');

function singlebutton(event){
  const clickedButton = event.target;
  const hiddenValue = clickedButton.dataset.hiddenValue;
  const curdict = Object.fromEntries(
    Object.entries(scores).map(([key]) => [key, 0])
  );  
  const curname = clickedButton.textContent;
  var others = Object.keys(curdict).filter(name => name != hiddenValue);
  others.forEach((name) => curdict[name] -= values[curname]);
  curdict[hiddenValue] += values[curname] * others.length;

  scores = Object.entries(scores).reduce((result, [key, value]) => {
  result[key] = value + curdict[key]; 
  return result;
  }, {});
  undo.push(curdict);
  add_row(scores, hiddenValue, curname);
}

function add_row(row, players, bet){
  if (newtable){
    remove_row();
    newtable = false;
  }
  const dataRow = table.insertRow();
  for (const value of Object.values(row)) {
    const dataCell = dataRow.insertCell();
    dataCell.textContent = (value > 0 ? "+" : "") + value;
  }
  let pass = document.getElementById("score").value;
  if (pass == "0"){
    pass = "+0";
  }
  if (pass == "-1"){
    pass = "-0";
  }
  dataRow.insertCell().textContent = players + " " + current_bet + " " + pass;
}

function remove_row(){
  if (table.rows.length > 1){
    table.deleteRow(table.rows.length - 1);
  }
}

function lockin() {
  document.getElementById("afterPlayers").style.display = "flex";
  const inputFields = inputContainer.querySelectorAll('.player');
  let filledInputs = 0; // Counter for filled inputs

  // Count filled inputs
  inputFields.forEach(input => {
    if (input.value.trim() !== '') {
      filledInputs++;
    }
  });

  if (filledInputs < 3){
    alert("Please fill in at least 3 players.")
    return;
  }
  
  for (let i = 0; i < inputFields.length; ++i){
    const button = document.createElement('button');
    button.classList.add('playerButton');

    if (inputFields[i].value.trim() !== '') { // Check if input has text
      button.textContent = inputFields[i].value;
      scores[inputFields[i].value] = 0;
      inputFields[i].replaceWith(button); // Replace input with button
      button.addEventListener('click', () => {
        let total = 1;
        if (document.querySelectorAll('.playerButton').length == 5){
          total++;
        }
        const activeButtons = document.querySelectorAll('.playerButton.active');
        if (button.classList.contains('active')) {
          button.classList.remove('active'); // Deactivate if already active
        } else if (activeButtons.length < total) {
          button.classList.add('active');    // Activate if less than 2 are active
        } else {
          activeButtons[0].classList.remove('active'); // Deactivate oldest if 2 are active
          button.classList.add('active');
        }
      })
      // Create the grid container
      const gridContainer = document.createElement('div');
      gridContainer.classList.add('button-grid');

      for (let j = 0; j < 5; ++j){
        const smallButton = document.createElement('button');
        smallButton.textContent = names[j]; // Or any label you prefer
        smallButton.classList.add('small-button');
        smallButton.dataset.hiddenValue = inputFields[i].value;
        smallButton.addEventListener('click', singlebutton)
        gridContainer.appendChild(smallButton);
      }



      // Append the grid to the parent of the big button
      button.parentNode.insertBefore(gridContainer, button.nextSibling); 

    } else {
      inputFields[i].remove(); // Remove empty input
    }
  };
  // Create table header row
  const curdict = Object.fromEntries(
    Object.entries(scores).map(([key]) => [key, 0])
  );  
  const headerRow = table.insertRow();
  for (const key in curdict) {
    const headerCell = headerRow.insertCell();
    headerCell.textContent = key;
  }
  headerRow.insertCell().textContent = "Historique"
  const dataRow = table.insertRow();
  for (const value of Object.values(curdict)) {
    const dataCell = dataRow.insertCell();
    dataCell.textContent = value;
  }

  transformButton.remove()
};

function reset() {
  window.location.reload("Refresh")
}
