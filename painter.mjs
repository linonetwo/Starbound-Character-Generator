import { Settings } from './settings.mjs';

export class Painter {
  constructor(canvas) {
    this.SPRITE_SIZE = 43;
    this.PREVIEW_MULTI = 3;
    this.CANVAS = canvas;

    if (window.G_vmlCanvasManager) window.G_vmlCanvasManager.initElement(canvas);

    if (canvas.getContext) this.CONTEXT = canvas.getContext('2d');

    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = this.SPRITE_SIZE;
    this.tempCanvas.height = this.SPRITE_SIZE;
    this.tempCanvas.style.display = 'none';
  }

  /**
   * Repaints the canvas with the given configuration, settings, and image information.
   * @param {Object} config - The configuration object.
   * @param {Settings} currentSettings - The current settings object.
   * @param {Object} imageInfo - The image information object.
   */
  repaint(config, currentSettings, imageInfo) {
    console.log(`Painting sprite with ${Object.keys(config).length}, ${currentSettings.toString()}`);

    // Clean up old gunk
    this.CONTEXT.clearRect(0, 0, this.SPRITE_SIZE * this.PREVIEW_MULTI, this.SPRITE_SIZE * this.PREVIEW_MULTI);

    // For typing convenience!
    const speciesVars = config.species[currentSettings.species].variables;
    const armorVars = config.species[currentSettings.species].armors;

    // Determine the four sheets we need - head, body parts, shirt and pants
    const headSheet = imageInfo[`${currentSettings.species}-head-${currentSettings.gender}`];
    const bodySheet = imageInfo[`${currentSettings.species}-body-${currentSettings.gender}`];
    const accessorySheet = imageInfo[`${currentSettings.species}-body-accessory`];
    const frontArmSheet = imageInfo[`${currentSettings.species}-body-frontArm`];
    const backArmSheet = imageInfo[`${currentSettings.species}-body-backArm`];

    let shirtArmorSheet, pantsArmorSheet, frontSleeveSheet, backSleeveSheet, helmetArmorSheet, helmetMaskSheet;
    const shirtArmorName = config.species[currentSettings.species].armors.names[currentSettings.shirtOption];
    const pantsArmorName = config.species[currentSettings.species].armors.names[currentSettings.pantsOption];

    if (shirtArmorName === 'extra') {
      shirtArmorSheet = imageInfo[`extra-${currentSettings.gender}Chest`];
      frontSleeveSheet = imageInfo['extra-frontSleeve'];
      backSleeveSheet = imageInfo['extra-backSleeve'];
    } else {
      shirtArmorSheet = imageInfo[`${currentSettings.species}-armor-${shirtArmorName}-${currentSettings.gender}Chest`];
      frontSleeveSheet = imageInfo[`${currentSettings.species}-armor-${shirtArmorName}-frontSleeve`];
      backSleeveSheet = imageInfo[`${currentSettings.species}-armor-${shirtArmorName}-backSleeve`];
    }

    if (pantsArmorName === 'extra') pantsArmorSheet = imageInfo[`extra-${currentSettings.gender}Pants`];
    else pantsArmorSheet = imageInfo[`${currentSettings.species}-armor-${pantsArmorName}-${currentSettings.gender}Pants`];

    if (config.extraArmorColor != null && currentSettings.helmetOption !== currentSettings.helmetOptionMax) {
      helmetArmorSheet = imageInfo['extra-helmet'];
      helmetMaskSheet = imageInfo['extra-mask'];
    }

    // Which palette swaps should be used varies with species, set them up here
    let bodyPalettes = [speciesVars.colors.skinColor[currentSettings.skinColor]];
    if (speciesVars.altOptionAsUndyColor)
      bodyPalettes = bodyPalettes.concat(speciesVars.colors.undyColor[currentSettings.altOption]);
    if (speciesVars.hairColorAsBodySubColor)
      bodyPalettes = bodyPalettes.concat(speciesVars.colors.hairColor[currentSettings.headOption]);

    let hairPalette = [];
    if (speciesVars.headOptionAsHairColor)
      hairPalette = hairPalette.concat(speciesVars.colors.hairColor[currentSettings.headOption]);
    else hairPalette = hairPalette.concat(bodyPalettes);

    if (speciesVars.altOptionAshairColor)
      hairPalette = hairPalette.concat(speciesVars.colors.undyColor[currentSettings.altOption]);

    // Select the armor palettes to use, only one per
    let shirtPalette = [];
    if (armorVars.names[currentSettings.shirtOption] === 'extra')
      shirtPalette = [config.extraArmorColor[currentSettings.shirtColor]];
    else if (armorVars.names[currentSettings.shirtOption] != null)
      shirtPalette = [armorVars.armorColors[currentSettings.shirtColor]];

    let pantsPalette = [];
    if (armorVars.names[currentSettings.pantsOption] === 'extra')
      pantsPalette = [config.extraArmorColor[currentSettings.pantsColor]];
    else if (armorVars.names[currentSettings.pantsOption] != null)
      pantsPalette = [armorVars.armorColors[currentSettings.pantsColor]];

    let helmetPalette = [];
    if (helmetArmorSheet != null && currentSettings.helmetOption !== currentSettings.helmetOptionMax)
      helmetPalette = [config.extraArmorColor[currentSettings.helmetOption]];

    // Offset certain sprites by gender - ie pants and shirt
    const genderOffset = currentSettings.gender === 'male' ? 0 : 1;
    const hairOffset = speciesVars.genders[currentSettings.gender].hair.offsetY;
    const headOffset = speciesVars.genders[currentSettings.gender].facialHair.offsetY;
    const altOffset = speciesVars.genders[currentSettings.gender].facialMask.offsetY;

    // Pose config
    const poseConfig = config.poses[currentSettings.poseOption];

    // Paint erryting!
    // Back Arm
    this.paintToCanvas(
      backArmSheet,
      poseConfig.sleeveIndex[0],
      poseConfig.sleeveIndex[1],
      poseConfig.sleeveOffset[0],
      poseConfig.sleeveOffset[1],
      bodyPalettes
    );

    // Back Sleeve Armor
    if (backSleeveSheet != null)
      this.paintToCanvas(
        backSleeveSheet,
        poseConfig.sleeveIndex[0],
        poseConfig.sleeveIndex[1],
        poseConfig.sleeveOffset[0],
        poseConfig.sleeveOffset[1],
        shirtPalette
      );

    // Body
    this.paintToCanvas(
      bodySheet,
      poseConfig.bodyIndex[0],
      poseConfig.bodyIndex[1],
      0,
      0,
      bodyPalettes
    );

    // Head
    this.paintToCanvas(
      headSheet,
      1,
      0,
      poseConfig.hairOffset[0],
      poseConfig.hairOffset[1],
      bodyPalettes
    );

    // Pants Armor
    if (pantsArmorSheet != null)
      this.paintToCanvas(
        pantsArmorSheet,
        poseConfig.bodyIndex[0],
        poseConfig.bodyIndex[1],
        0,
        0,
        pantsPalette
      );

    // Shirt Armor
    if (shirtArmorSheet != null)
      this.paintToCanvas(
        shirtArmorSheet,
        poseConfig.chestIndex[0],
        poseConfig.chestIndex[1],
        poseConfig.chestOffset[0],
        poseConfig.chestOffset[1],
        shirtPalette
      );

    // Hair
    if (helmetArmorSheet == null || currentSettings.helmetOption === currentSettings.helmetOptionMax - 1)
      this.paintToCanvas(
        accessorySheet,
        currentSettings.hairOption,
        hairOffset,
        poseConfig.hairOffset[0],
        poseConfig.hairOffset[1],
        hairPalette
      );
    else
      this.paintWithMask(
        accessorySheet,
        currentSettings.hairOption,
        hairOffset,
        poseConfig.hairOffset[0],
        poseConfig.hairOffset[1],
        hairPalette,
        helmetMaskSheet
      );

    // Head
    if (speciesVars.headOptionAsFacialHair)
      this.paintToCanvas(
        accessorySheet,
        currentSettings.headOption,
        headOffset,
        poseConfig.hairOffset[0],
        poseConfig.hairOffset[1],
        bodyPalettes
      );

    // Alt
    if (speciesVars.altOptionAsFacialMask)
      this.paintToCanvas(
        accessorySheet,
        currentSettings.altOption,
        altOffset,
        poseConfig.hairOffset[0],
        poseConfig.hairOffset[1],
        bodyPalettes
      );

    // Helmet
    if (helmetArmorSheet != null && currentSettings.helmetOption < currentSettings.helmetOptionMax - 1)
      this.paintToCanvas(
        helmetArmorSheet,
        1,
        0,
        poseConfig.hairOffset[0],
        poseConfig.hairOffset[1],
        helmetPalette
      );

    // Front Arm
    this.paintToCanvas(
      frontArmSheet,
      poseConfig.sleeveIndex[0],
      poseConfig.sleeveIndex[1],
      poseConfig.sleeveOffset[0],
      poseConfig.sleeveOffset[1],
      bodyPalettes
    );

    // Front Sleeve Armor
    if (frontSleeveSheet != null)
      this.paintToCanvas(
        frontSleeveSheet,
        poseConfig.sleeveIndex[0],
        poseConfig.sleeveIndex[1],
        poseConfig.sleeveOffset[0],
        poseConfig.sleeveOffset[1],
        shirtPalette
      );
  }

  /**
   * Paints a sprite sheet onto the canvas with optional palette swaps.
   * @param {HTMLImageElement} sheet - The sprite sheet image.
   * @param {number} offsetX - The x offset in the sprite sheet.
   * @param {number} offsetY - The y offset in the sprite sheet.
   * @param {number} nudgeX - The x nudge for positioning.
   * @param {number} nudgeY - The y nudge for positioning.
   * @param {Array<Object>} [paletteSwaps=[]] - The palette swaps to apply.
   */
  paintToCanvas(sheet, offsetX, offsetY, nudgeX, nudgeY, paletteSwaps = []) {
    const tempCtx = this.tempCanvas.getContext('2d');

    // Make sure to wrap too large offsetXs
    while (offsetX > 21) {
      offsetX -= 22;
      offsetY++;
    }

    // Clear out the temp canvas and splot our basic sheet onto it
    tempCtx.clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);
    tempCtx.drawImage(sheet, -offsetX * this.SPRITE_SIZE, -offsetY * this.SPRITE_SIZE);

    const imageData = tempCtx.getImageData(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE).data;

    // Go through each pixel in data
    let px = this.SPRITE_SIZE * this.SPRITE_SIZE;
    let posX = this.SPRITE_SIZE - 1,
      posY = this.SPRITE_SIZE - 1;

    while (px--) {
      if (imageData[4 * px + 3] !== 0) {
        let colorHex = this.rgbToHex(imageData[4 * px], imageData[4 * px + 1], imageData[4 * px + 2]);

        for (const swap of paletteSwaps) {
          for (const color in swap) {
            if (color === colorHex) {
              colorHex = swap[color];
            }
          }
        }

        this.CONTEXT.fillStyle = `#${colorHex}`;
        this.CONTEXT.strokeStyle = `#${colorHex}`;

        this.CONTEXT.fillRect(
          (posX + nudgeX) * this.PREVIEW_MULTI,
          (posY + nudgeY) * this.PREVIEW_MULTI,
          this.PREVIEW_MULTI,
          this.PREVIEW_MULTI
        );
      }

      posX--;
      if (posX < 0) {
        posX = this.SPRITE_SIZE - 1;
        posY--;
      }
    }
  }

  /**
   * Paints a sprite sheet onto the canvas with a mask and optional palette swaps.
   * @param {HTMLImageElement} sheet - The sprite sheet image.
   * @param {number} offsetX - The x offset in the sprite sheet.
   * @param {number} offsetY - The y offset in the sprite sheet.
   * @param {number} nudgeX - The x nudge for positioning.
   * @param {number} nudgeY - The y nudge for positioning.
   * @param {Array<Object>} [paletteSwaps=[]] - The palette swaps to apply.
   * @param {HTMLImageElement} mask - The mask image.
   */
  paintWithMask(sheet, offsetX, offsetY, nudgeX, nudgeY, paletteSwaps = [], mask) {
    console.log(
      `Painting sprite with mask at ${offsetX * this.SPRITE_SIZE},${offsetY * this.SPRITE_SIZE} with ${paletteSwaps.length} swaps, of sheet ${sheet.src}`
    );
    const tempCtx = this.tempCanvas.getContext('2d');

    // Make sure to wrap too large offsetXs
    while (offsetX > 21) {
      offsetX -= 22;
      offsetY++;
    }

    // Clear out the temp canvas and splot our basic sheet onto it
    tempCtx.clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);
    tempCtx.drawImage(mask, 0, 0);

    const maskData = tempCtx.getImageData(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE).data;

    // Clear out the temp canvas and splot our basic sheet onto it
    tempCtx.clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);
    tempCtx.drawImage(sheet, -offsetX * this.SPRITE_SIZE, -offsetY * this.SPRITE_SIZE);

    const imageData = tempCtx.getImageData(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE).data;

    // Go through each pixel in data
    let px = this.SPRITE_SIZE * this.SPRITE_SIZE;
    let posX = this.SPRITE_SIZE - 1,
      posY = this.SPRITE_SIZE - 1;

    while (px--) {
      if (imageData[4 * px + 3] !== 0 && maskData[4 * px] === 255) {
        let colorHex = this.rgbToHex(imageData[4 * px], imageData[4 * px + 1], imageData[4 * px + 2]);
        for (const swap of paletteSwaps) {
          for (const color in swap) {
            if (color === colorHex) {
              colorHex = swap[color];
            }
          }
        }

        this.CONTEXT.fillStyle = `#${colorHex}`;
        this.CONTEXT.strokeStyle = `#${colorHex}`;

        this.CONTEXT.fillRect(
          (posX + nudgeX) * this.PREVIEW_MULTI,
          (posY + nudgeY) * this.PREVIEW_MULTI,
          this.PREVIEW_MULTI,
          this.PREVIEW_MULTI
        );
      }

      posX--;
      if (posX < 0) {
        posX = this.SPRITE_SIZE - 1;
        posY--;
      }
    }
  }

  /**
   * Converts RGB values to a hexadecimal color string.
   * @param {number} r - The red component (0-255).
   * @param {number} g - The green component (0-255).
   * @param {number} b - The blue component (0-255).
   * @returns {string} The hexadecimal color string.
   */
  rgbToHex(r, g, b) {
    let rs = r.toString(16);
    if (rs.length === 1) rs = '0' + rs;

    let gs = g.toString(16);
    if (gs.length === 1) gs = '0' + gs;

    let bs = b.toString(16);
    if (bs.length === 1) bs = '0' + bs;

    return rs + gs + bs;
  }
}
