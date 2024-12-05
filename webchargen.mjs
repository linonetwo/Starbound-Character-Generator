import { Settings } from './settings.mjs';
import { Painter } from './painter.mjs';

export class CharacterGenerator {
  constructor() {
    this.config = null;
    this.painter = null;
    this.currentSettings = null;
    this.imageInfo = {};
    this.itemsToLoad = 0;
    this.itemsLoaded = 0;
    this.percentLoaded = 0.0;
    this.fadeDelay = 200;
    this.fadeStyle = 'fast';
    this.loopID = null;
    this.warpFrames = 16;
    this.warpCurrentFrame = 0;
    this.warpInterval = 50;
  }

  init() {
    this.currentSettings = new Settings();
    this.currentSettings.updateCounters();

    fetch('webchargen.config.json')
      .then((response) => response.json())
      .then((data) => {
        console.log('Got JSON');
        return this.loadData(data, true);
      })
      .then(() => {
        this.painter = new Painter(document.getElementById('character-preview'));

        this.currentSettings.recalc(this.config);
        console.log('Loop started');
        this.loopID = setInterval(() => this.loadingLoop(), 10);
        this.preLoad();
      })
      .catch((error) => console.error(error));

    document.querySelectorAll('.big-button').forEach((button) => {
      button.addEventListener('click', () => {
        this.clickyDeselection();
        this.bigButtonClick(button);
      });
    });

    document.querySelectorAll('.button').forEach((button) => {
      button.addEventListener('click', () => {
        this.clickyDeselection();
        this.littleButtonClick(button);
      });
    });

    document.getElementById('button-randomize-look').addEventListener('click', () => {
      this.clickyDeselection();
      this.randomizeButtonClick();
    });

    document.getElementById('save-button').addEventListener('click', () => {
      this.saveImage();
    });

    document.getElementById('nameInput').addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.checkName();
      }
    });

    document.getElementById('nameInput').addEventListener('blur', () => {
      this.checkName();
    });
  }

  loadData(data) {
    this.config = data;
    console.log(`Loaded data with ${Object.keys(this.config).length} root nodes`);

    document.querySelector(`#species-${this.currentSettings.species}`).classList.add('selected');
    document.querySelector(`#gender-${this.currentSettings.gender}`).classList.add('selected');

    console.log('Hi mom');
  }

  preLoad() {
    for (let t in this.config.sharedOptions) {
      let textImg = new Image();
      textImg.src = `images/text/${this.config.sharedOptions[t]}.png`;
      textImg.onload = () => this.incPercentLoaded();
      this.imageInfo[`text-${this.config.sharedOptions[t]}`] = textImg;

      this.itemsToLoad++;
    }

    for (let r in this.config.species) {
      if (r.charAt(0) == '_') continue;

      let headMaleImg = new Image();
      headMaleImg.src = `images/sheets/${r}/head-male.png`;
      headMaleImg.onload = () => this.incPercentLoaded();
      this.imageInfo[`${r}-head-male`] = headMaleImg;

      let headFemaleImg = new Image();
      headFemaleImg.src = `images/sheets/${r}/head-female.png`;
      headFemaleImg.onload = () => this.incPercentLoaded();
      this.imageInfo[`${r}-head-female`] = headFemaleImg;

      let bodyMaleImg = new Image();
      bodyMaleImg.src = `images/sheets/${r}/body-male.png`;
      bodyMaleImg.onload = () => this.incPercentLoaded();
      this.imageInfo[`${r}-body-male`] = bodyMaleImg;

      let bodyFemaleImg = new Image();
      bodyFemaleImg.src = `images/sheets/${r}/body-female.png`;
      bodyFemaleImg.onload = () => this.incPercentLoaded();
      this.imageInfo[`${r}-body-female`] = bodyFemaleImg;

      let bodyfrontArmImg = new Image();
      bodyfrontArmImg.src = `images/sheets/${r}/body-frontArm.png`;
      bodyfrontArmImg.onload = () => this.incPercentLoaded();
      this.imageInfo[`${r}-body-frontArm`] = bodyfrontArmImg;

      let bodybackArmImg = new Image();
      bodybackArmImg.src = `images/sheets/${r}/body-backArm.png`;
      bodybackArmImg.onload = () => this.incPercentLoaded();
      this.imageInfo[`${r}-body-backArm`] = bodybackArmImg;

      let bodyAccessoryImg = new Image();
      bodyAccessoryImg.src = `images/sheets/${r}/body-accessories.png`;
      bodyAccessoryImg.onload = () => this.incPercentLoaded();
      this.imageInfo[`${r}-body-accessory`] = bodyAccessoryImg;

      this.itemsToLoad += 5;

      for (let t in this.config.species[r].variables.names) {
        let labelName = this.config.species[r].variables.names[t];
        if (this.imageInfo[`text-${labelName}`] != null) continue;

        let textImg = new Image();
        textImg.src = `images/text/${labelName}.png`;
        textImg.onload = () => this.incPercentLoaded();
        this.imageInfo[`text-${labelName}`] = textImg;

        this.itemsToLoad++;
      }

      for (let a in this.config.species[r].armors.names) {
        let aName = this.config.species[r].armors.names[a];
        if (aName === null) continue;

        let armorMaleChestImg = new Image();
        armorMaleChestImg.src = `images/sheets/${r}/armor-${aName}-chestMale.png`;
        armorMaleChestImg.onload = () => this.incPercentLoaded();
        this.imageInfo[`${r}-armor-${aName}-maleChest`] = armorMaleChestImg;

        let armorFemaleChestImg = new Image();
        armorFemaleChestImg.src = `images/sheets/${r}/armor-${aName}-chestFemale.png`;
        armorFemaleChestImg.onload = () => this.incPercentLoaded();
        this.imageInfo[`${r}-armor-${aName}-femaleChest`] = armorFemaleChestImg;

        let armorMalePantsImg = new Image();
        armorMalePantsImg.src = `images/sheets/${r}/armor-${aName}-pantsMale.png`;
        armorMalePantsImg.onload = () => this.incPercentLoaded();
        this.imageInfo[`${r}-armor-${aName}-malePants`] = armorMalePantsImg;

        let armorFemalePantsImg = new Image();
        armorFemalePantsImg.src = `images/sheets/${r}/armor-${aName}-pantsFemale.png`;
        armorFemalePantsImg.onload = () => this.incPercentLoaded();
        this.imageInfo[`${r}-armor-${aName}-femalePants`] = armorFemalePantsImg;

        let armorFrontSleeveImg = new Image();
        armorFrontSleeveImg.src = `images/sheets/${r}/armor-${aName}-frontSleeve.png`;
        armorFrontSleeveImg.onload = () => this.incPercentLoaded();
        this.imageInfo[`${r}-armor-${aName}-frontSleeve`] = armorFrontSleeveImg;

        let armorBackSleeveImg = new Image();
        armorBackSleeveImg.src = `images/sheets/${r}/armor-${aName}-backSleeve.png`;
        armorBackSleeveImg.onload = () => this.incPercentLoaded();
        this.imageInfo[`${r}-armor-${aName}-backSleeve`] = armorBackSleeveImg;

        this.itemsToLoad += 5;
      }
    }

    let warpImg = new Image();
    warpImg.src = 'images/playerWarpIn.png';
    warpImg.onload = () => this.incPercentLoaded();
    this.imageInfo['warpIn'] = warpImg;

    this.itemsToLoad++;
  }

  incPercentLoaded() {
    this.itemsLoaded++;
    this.updateLoadingText();
  }

  updateLoadingText() {
    let percentLoaded = (this.itemsLoaded / this.itemsToLoad) * 100;
    document.getElementById('loading-text').innerHTML = `Loading...<br>${percentLoaded.toFixed(4)}%`;
  }

  loadingLoop() {
    let percentLoaded = (this.itemsLoaded / this.itemsToLoad) * 100;

    if (percentLoaded < 100) {
      this.updateLoadingText();
    } else {
      console.log('Image prefetch loop stopped.');
      clearInterval(this.loopID);
      document.getElementById('loading-text').innerHTML = 'Loading...<br>Done!';

      this.setOptionText();
      document.getElementById('loading-screen').style.display = 'none';
      this.loopID = setInterval(() => this.playWarp(), this.warpInterval);
    }
  }

  playWarp() {
    this.painter.CONTEXT.clearRect(
      0,
      0,
      this.painter.SPRITE_SIZE * this.painter.PREVIEW_MULTI,
      this.painter.SPRITE_SIZE * this.painter.PREVIEW_MULTI
    );

    if (this.warpCurrentFrame == this.warpFrames - 1) this.painter.repaint(this.config, this.currentSettings, this.imageInfo);

    this.painter.paintToCanvas(this.imageInfo['warpIn'], this.warpCurrentFrame, 0, 0, 0);
    this.warpCurrentFrame++;

    if (this.warpCurrentFrame == this.warpFrames) {
      clearInterval(this.loopID);
      this.painter.repaint(this.config, this.currentSettings, this.imageInfo);
    }
  }

  setOptionText() {
    const container = document.getElementById('character-options-container');
    Array.from(container.children).forEach((child, index) => {
      let variableName;
      if (index < 4) {
        variableName = this.config.species[this.currentSettings.species].variables.names[index];
      } else {
        variableName = this.config.sharedOptions[index - 4];
      }
      child.querySelector('.label').style.backgroundImage = `url(images/text/${variableName}.png)`;
    });
  }

  clickyDeselection() {
    if (window.getSelection) {
      if (window.getSelection().empty) window.getSelection().empty();
      else if (window.getSelection().removeAllRanges) window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
    }
  }

  bigButtonClick(obj) {
    if (obj.classList.contains('disabled')) {
      return true;
    }

    console.log('Clicked big button');

    if (obj.classList.contains('species-selection')) {
      let speciesName = obj.id.substring(8);

      console.log('Changing to species ' + speciesName);

      let shirtArmorName = this.config.species[this.currentSettings.species].armors.names[this.currentSettings.shirtOption];
      let pantsArmorName = this.config.species[this.currentSettings.species].armors.names[this.currentSettings.pantsOption];

      this.currentSettings.species = speciesName;
      this.currentSettings.reset(true);

      if (shirtArmorName == 'extra' || shirtArmorName == null)
        this.currentSettings.shirtOption = this.config.species[this.currentSettings.species].armors.names.indexOf(shirtArmorName);

      if (pantsArmorName == 'extra' || pantsArmorName == null)
        this.currentSettings.pantsOption = this.config.species[this.currentSettings.species].armors.names.indexOf(pantsArmorName);

      let iconOffset = this.config.species[this.currentSettings.species].variables.genders.iconOffset * 48;
      document.getElementById('gender-male').children[0].style.backgroundPosition = `0px -${iconOffset}px`;
      document.getElementById('gender-female').children[0].style.backgroundPosition = `-50px -${iconOffset}px`;
    } else {
      let genderName = obj.id.substring(7);

      console.log('Changing to gender ' + genderName);
      this.currentSettings.gender = genderName;
      this.currentSettings.reset(false);
    }

    document.querySelectorAll('.species-selection').forEach((el) => el.classList.remove('selected'));
    document.querySelectorAll('.gender-selection').forEach((el) => el.classList.remove('selected'));

    document.getElementById(`species-${this.currentSettings.species}`).classList.add('selected');
    document.getElementById(`gender-${this.currentSettings.gender}`).classList.add('selected');
    this.setOptionText();

    this.currentSettings.recalc(this.config);
    this.currentSettings.updateCounters();
    this.painter.repaint(this.config, this.currentSettings, this.imageInfo);
  }

  littleButtonClick(obj) {
    console.log('Clicked widdle button');

    let optionName = obj.parentNode.parentNode.id.substring(9);
    console.log('Changing option ' + optionName);

    let optionMax = this.currentSettings[optionName + 'Max'];

    if (obj.classList.contains('left-button')) {
      console.log(`Clicked option ${optionName} going backwards at ${this.currentSettings[optionName]} with max ${optionMax}`);

      this.currentSettings[optionName] -= 1;
      if (this.currentSettings[optionName] < 0) this.currentSettings[optionName] = optionMax - 1;
    } else {
      console.log(`Clicked option ${optionName} going onwards(!) at ${this.currentSettings[optionName]} with max ${optionMax}`);

      this.currentSettings[optionName] += 1;
      if (this.currentSettings[optionName] >= optionMax) this.currentSettings[optionName] = 0;
    }

    this.currentSettings.recalc(this.config);
    this.currentSettings.updateCounters();
    this.painter.repaint(this.config, this.currentSettings, this.imageInfo);
  }

  randomizeButtonClick() {
    this.currentSettings.randomize();

    this.currentSettings.recalc(this.config);
    this.currentSettings.updateCounters();
    this.painter.repaint(this.config, this.currentSettings, this.imageInfo);
  }

  saveImage() {
    let img = document.getElementById('character-preview').toDataURL('image/png');
    window.location.href = img.replace('image/png', 'image/octet-stream');
  }

  checkName() {
    this.currentSettings.setName(document.getElementById('nameInput').value);
  }
}
