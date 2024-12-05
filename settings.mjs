/*
	Juan big class to hold current option states. Makes sure to keep the customization options
	sane during the darkest of nights. Keeps track of current choices, option max boundaries,
	and updates counters to display the correct number.
	*/

export class Settings {
  constructor() {
    this.species = 'human';
    this.gender = 'male';
    this.name;

    this.randomizeOptions = [
      'skinColor',
      'altOption',
      'hairOption',
      'headOption',
      'shirtOption',
      'shirtColor',
      'pantsOption',
      'pantsColor',
      'helmetOption',
    ];

    this.skinColor = 0;
    this.altOption = 0;
    this.hairOption = 0;
    this.headOption = 0;

    this.shirtOption = 0;
    this.shirtColor = 0;
    this.pantsOption = 0;
    this.pantsColor = 0;
    this.helmetOption = 0;

    this.poseOption = 0;

    this.skinColorMax;
    this.altOptionMax;
    this.hairOptionMax;
    this.headOptionMax;

    this.shirtOptionMax;
    this.shirtColorMax;
    this.pantsOptionMax;
    this.pantsColorMax;
    this.helmetOptionMax = 0;

    this.poseOptionMax;

    this.skinColorCounter = document.querySelectorAll('#variable-skinColor .option-buttons .option-counter > *');
    this.altOptionCounter = document.querySelectorAll('#variable-altOption .option-buttons .option-counter > *');
    this.hairOptionCounter = document.querySelectorAll('#variable-hairOption .option-buttons .option-counter > *');
    this.headOptionCounter = document.querySelectorAll('#variable-headOption .option-buttons .option-counter > *');
    this.shirtOptionCounter = document.querySelectorAll('#variable-shirtOption .option-buttons .option-counter > *');
    this.shirtColorCounter = document.querySelectorAll('#variable-shirtColor .option-buttons .option-counter > *');
    this.pantsOptionCounter = document.querySelectorAll('#variable-pantsOption .option-buttons .option-counter > *');
    this.pantsColorCounter = document.querySelectorAll('#variable-pantsColor .option-buttons .option-counter > *');
    this.helmetOptionCounter = document.querySelectorAll('#variable-helmetOption .option-buttons .option-counter > *');
    this.poseOptionCounter = document.querySelectorAll('#variable-poseOption .option-buttons .option-counter > *');
  }

  updateCounters() {
    // Skin color
    let skinTemp = (this.skinColor + 1) % 10;
    this.skinColorCounter[0].style.backgroundPosition = `-${this.skinColor - skinTemp + 1}px 0px`;
    this.skinColorCounter[1].style.backgroundPosition = `-${skinTemp * 10}px 0px`;

    // Alt option
    let altTemp = (this.altOption + 1) % 10;
    this.altOptionCounter[0].style.backgroundPosition = `-${this.altOption - altTemp + 1}px 0px`;
    this.altOptionCounter[1].style.backgroundPosition = `-${altTemp * 10}px 0px`;

    // Hair option
    let hairTemp = (this.hairOption + 1) % 10;
    this.hairOptionCounter[0].style.backgroundPosition = `-${this.hairOption - hairTemp + 1}px 0px`;
    this.hairOptionCounter[1].style.backgroundPosition = `-${hairTemp * 10}px 0px`;

    // Head option
    let headTemp = (this.headOption + 1) % 10;
    this.headOptionCounter[0].style.backgroundPosition = `-${this.headOption - headTemp + 1}px 0px`;
    this.headOptionCounter[1].style.backgroundPosition = `-${headTemp * 10}px 0px`;

    // Shirt option
    let shirtTemp = (this.shirtOption + 1) % 10;
    this.shirtOptionCounter[0].style.backgroundPosition = `-${this.shirtOption - shirtTemp + 1}px 0px`;
    this.shirtOptionCounter[1].style.backgroundPosition = `-${shirtTemp * 10}px 0px`;

    // Shirt color
    let shirtColorTemp = (this.shirtColor + 1) % 10;
    this.shirtColorCounter[0].style.backgroundPosition = `-${this.shirtColor - shirtColorTemp + 1}px 0px`;
    this.shirtColorCounter[1].style.backgroundPosition = `-${shirtColorTemp * 10}px 0px`;

    // Pants option
    let pantsTemp = (this.pantsOption + 1) % 10;
    this.pantsOptionCounter[0].style.backgroundPosition = `-${this.pantsOption - pantsTemp + 1}px 0px`;
    this.pantsOptionCounter[1].style.backgroundPosition = `-${pantsTemp * 10}px 0px`;

    // Pants color
    let pantsColorTemp = (this.pantsColor + 1) % 10;
    this.pantsColorCounter[0].style.backgroundPosition = `-${this.pantsColor - pantsColorTemp + 1}px 0px`;
    this.pantsColorCounter[1].style.backgroundPosition = `-${pantsColorTemp * 10}px 0px`;

    // Pose option
    let poseTemp = (this.poseOption + 1) % 10;
    this.poseOptionCounter[0].style.backgroundPosition = `-${this.poseOption - poseTemp + 1}px 0px`;
    this.poseOptionCounter[1].style.backgroundPosition = `-${poseTemp * 10}px 0px`;

    // Helmet option
    let helmetTemp = (this.helmetOption + 1) % 10;
    this.helmetOptionCounter[0].style.backgroundPosition = `-${this.helmetOption - helmetTemp + 1}px 0px`;
    this.helmetOptionCounter[1].style.backgroundPosition = `-${helmetTemp * 10}px 0px`;
  }

  reset(species) {
    // Reset as few options as we have to, to preserve state
    if (species) {
      this.skinColor = 0;
      this.altOption = 0;
      this.hairOption = 0;
      this.headOption = 0;
    }

    // Remaining options will be capped by recalc
  }

  recalc(config) {
    let vars = config.species[this.species].variables;
    let armors = config.species[this.species].armors;

    // Skin color
    this.skinColorMax = vars.colors.skinColor.length;
    if (this.skinColor >= this.skinColorMax) this.skinColor = this.skinColorMax - 1;

    // Alt option
    if (vars.altOptionAsUndyColor) this.altOptionMax = vars.colors.undyColor.length;
    else if (vars.altOptionAsFacialMask) this.altOptionMax = vars.genders[this.gender].facialMask.count;
    else this.altOptionMax = 0;
    if (this.altOption >= this.altOptionMax) this.altOption = this.altOptionMax - 1;

    // Hair option
    this.hairOptionMax = vars.genders[this.gender].hair.count;
    if (this.hairOption >= this.hairOptionMax) this.hairOption = this.hairOptionMax - 1;

    // Head option
    if (vars.headOptionAsHairColor) this.headOptionMax = vars.colors.hairColor.length;
    else if (vars.headOptionAsFacialHair === true) this.headOptionMax = vars.genders[this.gender].facialHair.count;
    else this.headOptionMax = 0;
    if (this.headOption >= this.headOptionMax) this.headOption = this.headOptionMax - 1;

    // Shirt option(al)
    this.shirtOptionMax = armors.names.length;
    if (this.shirtOption >= this.shirtOptionMax) this.shirtOption = this.shirtOptionMax - 1;

    // Pants (also) option(al)
    this.pantsOptionMax = armors.names.length;
    if (this.pantsOption >= this.pantsOptionMax) this.pantsOption = this.pantsOptionMax - 1;

    // Shirt colour
    this.shirtColorMax = armors.armorColors.length;
    if (this.shirtColor >= this.shirtColorMax) this.shirtColor = this.shirtColorMax - 1;

    // Chest colour
    this.pantsColorMax = armors.armorColors.length;
    if (this.pantsColor >= this.pantsColorMax) this.pantsColor = this.pantsColorMax - 1;

    // Poses
    this.poseOptionMax = config.poses.length;
    if (this.poseOption >= this.poseOptionMax) this.poseOption = this.poseOptionMax - 1;

    // Helmet
    if (armors.names[armors.names.length - 1] !== null) {
      this.helmetOptionMax = config.extraArmorColor.length + 1;
      if (this.helmetOption >= this.helmetOptionMax) this.helmetOption = config.extraArmorColor.length;
    }
  }

  randomize() {
    console.log('Randomizing options');
    for (let optName of this.randomizeOptions) {
      console.log('Randomizing option ' + optName);
      this[optName] = Math.floor(Math.random() * this[optName + 'Max']);
    }

    // Pose is a special case, and should have some weighting applied
    let poseWeight = 50;
    let poseRandom = Math.floor(Math.random() * poseWeight);
    if (poseRandom > poseWeight - this.poseOptionMax) {
      poseRandom = poseRandom - poseWeight + this.poseOptionMax;
      this.poseOption = poseRandom;
    } else {
      poseRandom = poseRandom % 5;
      this.poseOption = poseRandom;
    }

    // Helmet also deserves a special treatment
    if (this.helmetOptionMax > 0 && Math.random() < 0.8) this.helmetOption = this.helmetOptionMax - 1;
  }

  setName(name) {
    if (this.name === name) return;

    this.name = name;

    fetch(`images/sheets/${toHash(name)}/data.json`)
      .then((response) => response.json())
      .then((data) => currentSettings.checkName(data));
  }

  toString() {
    return (
      'Settings[species=' +
      this.species +
      ', gender=' +
      this.gender +
      ', skinColor=' +
      this.skinColor +
      ', altOption=' +
      this.altOption +
      ', headOption=' +
      this.headOption +
      ', hairOption=' +
      this.hairOption +
      ', shirtOption=' +
      this.shirtOption +
      ', shirtColor=' +
      this.shirtColor +
      ', pantsOption=' +
      this.pantsOption +
      ', pantsColor=' +
      this.pantsColor +
      ', poseOption=' +
      this.poseOption +
      ', helmetOption=' +
      this.helmetOption +
      ', skinColorMax=' +
      this.skinColorMax +
      ', altOptionMax=' +
      this.altOptionMax +
      ', hairOptionMax=' +
      this.hairOptionMax +
      ', headOptionMax=' +
      this.headOptionMax +
      ', shirtOptionMax=' +
      this.shirtOptionMax +
      ', shirtColorMax=' +
      this.shirtColorMax +
      ', pantsOptionMax=' +
      this.pantsOptionMax +
      ', pantsColorMax=' +
      this.pantsColorMax +
      ', poseOptionMax=' +
      this.poseOptionMax +
      ', helmetOptionMax=' +
      this.helmetOptionMax +
      ']'
    );
  }

  checkName(data) {
    if (!data || !data.armorColor) return;

    console.log('Checked ' + toHash(currentSettings.name) + ' with return ' + data);

    for (let r in config.species) {
      let armors = config.species[r].armors;
      if (armors.names[armors.names.length - 1] !== null) {
        armors.names[armors.names.length] = 'extra';
      }
    }

    config.extraArmorColor = data.armorColor;
    config.extraHelmet = data.helmet;

    for (let name of data.names) {
      console.log('Loading extra sheet ' + name);
      let img = new Image();
      img.src = 'images/sheets/' + toHash(this.name) + '/' + name + '.png';
      img.onload = function () {
        painter.repaint(config, currentSettings, imageInfo);
      };
      imageInfo['extra-' + name] = img;
    }

    this.recalc(config);
    this.shirtOption = this.shirtOptionMax - 1;
    this.shirtColorOption = 0;
    this.pantsOption = this.pantsOptionMax - 1;
    this.pantsColorOption = 0;
    this.helmetOption = 0;

    this.updateCounters();
    document.querySelector('#variable-helmetOption').style.display = 'inline-block';
  }
}

function toHash(string) {
  let hash = 17;

  for (let i = 0; i < string.length; i++) {
    hash = (hash << 5) - hash + string.charCodeAt(i);
    hash = hash & hash;
  }

  return hash.toString(16);
}
