'use strict';

import { Settings } from './settings.js';
import { Painter } from './painter.js';

let config;

let painter;
let currentSettings;

let imageInfo = {};
let itemsToLoad = 0,
  itemsLoaded = 0;
let percentLoaded = 0.0;

let fadeDelay = 200;
let fadeStyle = 'fast';
let loopID;

let warpFrames = 16;
let warpCurrentFrame = 0;
let warpInterval = 50;

// Hook up our onload and schnitzel-witzel
document.addEventListener('DOMContentLoaded', () => {
  currentSettings = new Settings();
  currentSettings.updateCounters();

  fetch('webchargen.config.json')
    .then((response) => response.json())
    .then((data) => {
      console.log('Got JSON');
      return loadData(data, true);
    })
    .then(() => {
      painter = new Painter(document.getElementById('character-preview'));

      currentSettings.recalc(config);
      console.log('Loop started');
      loopID = setInterval(loadingLoop, 10);
      preLoad();
    })
    .catch((error) => console.error(error));

  // Click ALL the buttons!
  document.querySelectorAll('.big-button').forEach((button) => {
    button.addEventListener('click', () => {
      clickyDeselection();
      bigButtonClick(button);
    });
  });

  document.querySelectorAll('.button').forEach((button) => {
    button.addEventListener('click', () => {
      clickyDeselection();
      littleButtonClick(button);
    });
  });

  document.getElementById('button-randomize-look').addEventListener('click', () => {
    clickyDeselection();
    randomizeButtonClick();
  });

  document.getElementById('save-button').addEventListener('click', () => {
    saveImage();
  });

  document.getElementById('nameInput').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      checkName();
    }
  });

  document.getElementById('nameInput').addEventListener('blur', () => {
    checkName();
  });

  // 禁用文本选择
  document.onselectstart = () => false;
});

// After fetching our config file, set some basics up
function loadData(data) {
  config = data;
  console.log(`Loaded data with ${Object.size(config)} root nodes`);

  /*
    setOptionText();

    for (let v = 5; v <= 8; v++) {
        document.querySelector(`#variable-${v}`).querySelector(".label").style.backgroundImage = `url(images/text/${config.sharedOptions[v - 5]}.png)`;
    }
    */

  document.querySelector(`#species-${currentSettings.species}`).classList.add('selected');
  document.querySelector(`#gender-${currentSettings.gender}`).classList.add('selected');

  console.log('Hi mom');
}

// Prefetch all our images. ALL OF ZEM.
function preLoad() {
  for (let t in config.sharedOptions) {
    let textImg = new Image();
    textImg.src = `images/text/${config.sharedOptions[t]}.png`;
    textImg.onload = function () {
      incPercentLoaded();
    };
    imageInfo[`text-${config.sharedOptions[t]}`] = textImg;

    itemsToLoad++;
  }

  for (let r in config.species) {
    if (r.charAt(0) == '_') continue;

    // Prefetch male body sheet
    let bodyMaleImg = new Image();
    bodyMaleImg.src = `images/sheets/${r}/body-male.png`;
    bodyMaleImg.onload = function () {
      incPercentLoaded();
    };
    imageInfo[`${r}-body-male`] = bodyMaleImg;

    // Prefetch female body sheet
    let bodyFemaleImg = new Image();
    bodyFemaleImg.src = `images/sheets/${r}/body-female.png`;
    bodyFemaleImg.onload = function () {
      incPercentLoaded();
    };
    imageInfo[`${r}-body-female`] = bodyFemaleImg;

    // Prefetch front arm sheet
    let bodyfrontArmImg = new Image();
    bodyfrontArmImg.src = `images/sheets/${r}/body-frontArm.png`;
    bodyfrontArmImg.onload = function () {
      incPercentLoaded();
    };
    imageInfo[`${r}-body-frontArm`] = bodyfrontArmImg;

    // Prefetch back arm sheet
    let bodybackArmImg = new Image();
    bodybackArmImg.src = `images/sheets/${r}/body-backArm.png`;
    bodybackArmImg.onload = function () {
      incPercentLoaded();
    };
    imageInfo[`${r}-body-backArm`] = bodybackArmImg;

    // Prefetch accessory (hair) sheet
    let bodyAccessoryImg = new Image();
    bodyAccessoryImg.src = `images/sheets/${r}/body-accessories.png`;
    bodyAccessoryImg.onload = function () {
      incPercentLoaded();
    };
    imageInfo[`${r}-body-accessory`] = bodyAccessoryImg;

    itemsToLoad += 5;

    for (let t in config.species[r].variables.names) {
      let labelName = config.species[r].variables.names[t];
      if (imageInfo[`text-${labelName}`] != null) continue;

      let textImg = new Image();
      textImg.src = `images/text/${labelName}.png`;
      textImg.onload = function () {
        incPercentLoaded();
      };
      imageInfo[`text-${labelName}`] = textImg;

      itemsToLoad++;
    }

    for (let a in config.species[r].armors.names) {
      let aName = config.species[r].armors.names[a];
      if (aName === null) continue;

      // Load male chest sheet
      let armorMaleChestImg = new Image();
      armorMaleChestImg.src = `images/sheets/${r}/armor-${aName}-chestMale.png`;
      armorMaleChestImg.onload = function () {
        incPercentLoaded();
      };
      imageInfo[`${r}-armor-${aName}-maleChest`] = armorMaleChestImg;

      // Load female chest sheet
      let armorFemaleChestImg = new Image();
      armorFemaleChestImg.src = `images/sheets/${r}/armor-${aName}-chestFemale.png`;
      armorFemaleChestImg.onload = function () {
        incPercentLoaded();
      };
      imageInfo[`${r}-armor-${aName}-femaleChest`] = armorFemaleChestImg;

      // Load male pants sheet
      let armorMalePantsImg = new Image();
      armorMalePantsImg.src = `images/sheets/${r}/armor-${aName}-pantsMale.png`;
      armorMalePantsImg.onload = function () {
        incPercentLoaded();
      };
      imageInfo[`${r}-armor-${aName}-malePants`] = armorMalePantsImg;

      // Load female pants sheet
      let armorFemalePantsImg = new Image();
      armorFemalePantsImg.src = `images/sheets/${r}/armor-${aName}-pantsFemale.png`;
      armorFemalePantsImg.onload = function () {
        incPercentLoaded();
      };
      imageInfo[`${r}-armor-${aName}-femalePants`] = armorFemalePantsImg;

      // Load front sleeve sheet
      let armorFrontSleeveImg = new Image();
      armorFrontSleeveImg.src = `images/sheets/${r}/armor-${aName}-frontSleeve.png`;
      armorFrontSleeveImg.onload = function () {
        incPercentLoaded();
      };
      imageInfo[`${r}-armor-${aName}-frontSleeve`] = armorFrontSleeveImg;

      // Load back sleeve sheet
      let armorBackSleeveImg = new Image();
      armorBackSleeveImg.src = `images/sheets/${r}/armor-${aName}-backSleeve.png`;
      armorBackSleeveImg.onload = function () {
        incPercentLoaded();
      };
      imageInfo[`${r}-armor-${aName}-backSleeve`] = armorBackSleeveImg;

      itemsToLoad += 5;
    }
  }

  // Load warp-in
  let warpImg = new Image();
  warpImg.src = 'images/playerWarpIn.png';
  warpImg.onload = function () {
    incPercentLoaded();
  };
  imageInfo['warpIn'] = warpImg;

  itemsToLoad++;
}

// Use entire function to increment one number. Like a boss.
function incPercentLoaded() {
  itemsLoaded++;
  updateLoadingText();
}

function updateLoadingText() {
  let percentLoaded = (itemsLoaded / itemsToLoad) * 100;
  document.getElementById('loading-text').innerHTML = `Loading...<br>${percentLoaded.toFixed(4)}%`;
}

// Poll our completion status, make everything ready once we're all set
function loadingLoop() {
  let percentLoaded = (itemsLoaded / itemsToLoad) * 100;

  if (percentLoaded < 100) {
    updateLoadingText();
  } else {
    console.log('Image prefetch loop stopped.');
    clearInterval(loopID);
    document.getElementById('loading-text').innerHTML = 'Loading...<br>Done!';

    setOptionText();
    //painter.repaint(config, currentSettings, imageInfo);

    document.getElementById('loading-screen').style.display = 'none';
    loopID = setInterval(playWarp, warpInterval);
  }
}

function playWarp() {
  painter.CONTEXT.clearRect(
    0,
    0,
    painter.SPRITE_SIZE * painter.PREVIEW_MULTI,
    painter.SPRITE_SIZE * painter.PREVIEW_MULTI
  );

  if (warpCurrentFrame == warpFrames - 1) painter.repaint(config, currentSettings, imageInfo);

  painter.paintToCanvas(imageInfo['warpIn'], warpCurrentFrame, 0, 0, 0, null, painter.bodyCanvas);
  warpCurrentFrame++;

  if (warpCurrentFrame == warpFrames) {
    clearInterval(loopID);
    painter.repaint(config, currentSettings, imageInfo);
  }
}

// Tell the users what all those cute little buttons do. Otherwise they get cranky.
// The users, that is. Not the buttons.
// I assume.
function setOptionText() {
  const container = document.getElementById('character-options-container');
  Array.from(container.children).forEach((child, index) => {
    let variableName;
    if (index < 4) {
      variableName = config.species[currentSettings.species].variables.names[index];
    } else {
      variableName = config.sharedOptions[index - 4];
    }
    child.querySelector('.label').style.backgroundImage = `url(images/text/${variableName}.png)`;
  });
}

// The measure of a man is in how quickly he can click on small buttons on a computer monitor.
// If he were to click too quickly, he would have selected a fraction of the page.
// Knock that off, man.
function clickyDeselection() {
  // Strong enough for a man. Gentle enough for a woman.
  if (window.getSelection) {
    if (window.getSelection().empty)
      // Chrome
      window.getSelection().empty();
    else if (window.getSelection().removeAllRanges)
      // Firefox
      window.getSelection().removeAllRanges();
  } else if (document.selection) {
    // "Misc"
    document.selection.empty();
  }
}

// Them button what be big. When user clicks this, big things be happening.
function bigButtonClick(obj) {
  if (obj.classList.contains('disabled')) {
    return true;
  }

  console.log('Clicked big button');

  // User wants to be another species. Weirdo.
  if (obj.classList.contains('species-selection')) {
    let speciesName = obj.id.substring(8);

    console.log('Changing to species ' + speciesName);

    // First of all we need to check for armor special options and preserve those, since they can vary between species
    let shirtArmorName = config.species[currentSettings.species].armors.names[currentSettings.shirtOption];
    let pantsArmorName = config.species[currentSettings.species].armors.names[currentSettings.pantsOption];

    currentSettings.species = speciesName;
    currentSettings.reset(true);

    if (shirtArmorName == 'extra' || shirtArmorName == null)
      currentSettings.shirtOption = config.species[currentSettings.species].armors.names.indexOf(shirtArmorName);

    if (pantsArmorName == 'extra' || pantsArmorName == null)
      currentSettings.pantsOption = config.species[currentSettings.species].armors.names.indexOf(pantsArmorName);

    // Make sure we show the right gender button icons
    let iconOffset = config.species[currentSettings.species].variables.genders.iconOffset * 48;
    document.getElementById('gender-male').children[0].style.backgroundPosition = `0px -${iconOffset}px`;
    document.getElementById('gender-female').children[0].style.backgroundPosition = `-50px -${iconOffset}px`;
  } else {
    // And now they want to be another gender. Who do they think they are, some kind of pixel sized Tiresias?
    let genderName = obj.id.substring(7);

    console.log('Changing to gender ' + genderName);
    currentSettings.gender = genderName;
    currentSettings.reset(false);
  }

  // Highlightificationcoulrophobiaafearofstilts
  document.querySelectorAll('.species-selection').forEach((el) => el.classList.remove('selected'));
  document.querySelectorAll('.gender-selection').forEach((el) => el.classList.remove('selected'));

  document.getElementById(`species-${currentSettings.species}`).classList.add('selected');
  document.getElementById(`gender-${currentSettings.gender}`).classList.add('selected');
  setOptionText();

  currentSettings.recalc(config);
  currentSettings.updateCounters();
  painter.repaint(config, currentSettings, imageInfo);
}

// Big button's younger brother. He dreams of one day growing up to become the biggest, most buttonest kid on the playground. An iPad interface.
function littleButtonClick(obj) {
  console.log('Clicked widdle button');

  let optionName = obj.parentNode.parentNode.id.substring(9);
  console.log('Changing option ' + optionName);

  let optionMax = currentSettings[optionName + 'Max'];

  if (obj.classList.contains('left-button')) {
    console.log(`Clicked option ${optionName} going backwards at ${currentSettings[optionName]} with max ${optionMax}`);

    currentSettings[optionName] -= 1;
    if (currentSettings[optionName] < 0) currentSettings[optionName] = optionMax - 1;
  } else {
    console.log(
      `Clicked option ${optionName} going onwards(!) at ${currentSettings[optionName]} with max ${optionMax}`
    );

    currentSettings[optionName] += 1;
    if (currentSettings[optionName] >= optionMax) currentSettings[optionName] = 0;
  }

  // Recalculate our options, update counters, then draw our sprite
  currentSettings.recalc(config);
  currentSettings.updateCounters();
  painter.repaint(config, currentSettings, imageInfo);
}

// BREAK GLASS IN CASE OF MIDLIFE CRISIS
function randomizeButtonClick() {
  currentSettings.randomize();

  // Recalculate our options, update counters, then draw our sprite
  currentSettings.recalc(config);
  currentSettings.updateCounters();
  painter.repaint(config, currentSettings, imageInfo);
}

// Never before in history has so few lines made so many people sacrifice so much gray matter.
function saveImage() {
  let img = document.getElementById('character-preview').toDataURL('image/png');
  window.location.href = img.replace('image/png', 'image/octet-stream');
}

function checkName() {
  currentSettings.setName(document.getElementById('nameInput').value);
}

// Since object is mathematically challenged, we have to help it along a bit.
Object.size = function (obj) {
  let size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

// Brazenly stolen from SO
function toHash(string) {
  let hash = 17;

  for (let i = 0; i < string.length; i++) {
    hash = (hash << 5) - hash + string.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  return hash.toString(16);
}
