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

  repaint(config, currentSettings, imageInfo) {
    console.log('Painting sprite with ' + Object.size(config) + ', ' + currentSettings.toString());

    // Clean up old gunk
    this.CONTEXT.clearRect(0, 0, this.SPRITE_SIZE * this.PREVIEW_MULTI, this.SPRITE_SIZE * this.PREVIEW_MULTI);

    // For typing convenience!
    var speciesVars = config.species[currentSettings.species].variables;
    var armorVars = config.species[currentSettings.species].armors;

    // Determine the three sheets we need - body parts, shirt and pants
    var bodySheet = imageInfo[currentSettings.species + '-body-' + currentSettings.gender];
    var accessorySheet = imageInfo[currentSettings.species + '-body-accessory'];
    var frontArmSheet = imageInfo[currentSettings.species + '-body-frontArm'];
    var backArmSheet = imageInfo[currentSettings.species + '-body-backArm'];

    var shirtArmorSheet, pantsArmorSheet, frontSleeveSheet, backSleeveSheet, helmetArmorSheet, helmetMaskSheet;
    var shirtArmorName = config.species[currentSettings.species].armors.names[currentSettings.shirtOption];
    var pantsArmorName = config.species[currentSettings.species].armors.names[currentSettings.pantsOption];

    if (shirtArmorName == 'extra') {
      shirtArmorSheet = imageInfo['extra-' + currentSettings.gender + 'Chest'];
      frontSleeveSheet = imageInfo['extra-frontSleeve'];
      backSleeveSheet = imageInfo['extra-backSleeve'];
    } else {
      shirtArmorSheet =
        imageInfo[currentSettings.species + '-armor-' + shirtArmorName + '-' + currentSettings.gender + 'Chest'];
      frontSleeveSheet = imageInfo[currentSettings.species + '-armor-' + shirtArmorName + '-frontSleeve'];
      backSleeveSheet = imageInfo[currentSettings.species + '-armor-' + shirtArmorName + '-backSleeve'];
    }

    if (pantsArmorName == 'extra') pantsArmorSheet = imageInfo['extra-' + currentSettings.gender + 'Pants'];
    else
      pantsArmorSheet =
        imageInfo[currentSettings.species + '-armor-' + pantsArmorName + '-' + currentSettings.gender + 'Pants'];

    if (config.extraArmorColor != null && currentSettings.helmetOption != currentSettings.helmetOptionMax) {
      helmetArmorSheet = imageInfo['extra-helmet'];
      helmetMaskSheet = imageInfo['extra-mask'];
    }

    // Which palette swaps should be used varies with species, set them up here
    var bodyPalettes, hairPalette, shirtPalette, pantsPalette, helmetPalette;

    bodyPalettes = new Array(speciesVars.colors.skinColor[currentSettings.skinColor]);
    if (speciesVars.altOptionAsUndyColor)
      bodyPalettes = bodyPalettes.concat(speciesVars.colors.undyColor[currentSettings.altOption]);
    if (speciesVars.hairColorAsBodySubColor)
      bodyPalettes = bodyPalettes.concat(speciesVars.colors.hairColor[currentSettings.headOption]);

    hairPalette = new Array();
    if (speciesVars.headOptionAsHairColor)
      hairPalette = hairPalette.concat(speciesVars.colors.hairColor[currentSettings.headOption]);
    else hairPalette = hairPalette.concat(bodyPalettes);

    if (speciesVars.altOptionAshairColor)
      hairPalette = hairPalette.concat(speciesVars.colors.undyColor[currentSettings.altOption]);

    // Select the armor palettes to use, only one per
    if (armorVars.names[currentSettings.shirtOption] == 'extra')
      shirtPalette = new Array(config.extraArmorColor[currentSettings.shirtColor]);
    else if (armorVars.names[currentSettings.shirtOption] != null)
      shirtPalette = new Array(armorVars.armorColors[currentSettings.shirtColor]);

    if (armorVars.names[currentSettings.pantsOption] == 'extra')
      pantsPalette = new Array(config.extraArmorColor[currentSettings.pantsColor]);
    else if (armorVars.names[currentSettings.pantsOption] != null)
      pantsPalette = new Array(armorVars.armorColors[currentSettings.pantsColor]);

    if (helmetArmorSheet != null && currentSettings.helmetOption != currentSettings.helmetOptionMax)
      helmetPalette = new Array(config.extraArmorColor[currentSettings.helmetOption]);

    // Offset certain sprites by gender - ie pants and shirt
    var genderOffset = currentSettings.gender == 'male' ? 0 : 1;
    var hairOffset = speciesVars.genders[currentSettings.gender].hair.offsetY;
    var headOffset = speciesVars.genders[currentSettings.gender].facialHair.offsetY;
    var altOffset = speciesVars.genders[currentSettings.gender].facialMask.offsetY;

    // Pose config
    var poseConfig = config.poses[currentSettings.poseOption];

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
    if (helmetArmorSheet == null || currentSettings.helmetOption == currentSettings.helmetOptionMax - 1)
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

  paintToCanvas(sheet, offsetX, offsetY, nudgeX, nudgeY, paletteSwaps) {
    var tempCtx = this.tempCanvas.getContext('2d');

    // Make sure to wrap too large offsetXs
    while (offsetX > 21) {
      offsetX -= 22;
      offsetY++;
    }

    // Clear out the temp canvas and splot our basic sheet onto it
    tempCtx.clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);
    tempCtx.drawImage(sheet, -offsetX * this.SPRITE_SIZE, -offsetY * this.SPRITE_SIZE);

    var imageData = tempCtx.getImageData(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE).data;

    // Go through each pixel in data
    var px = this.SPRITE_SIZE * this.SPRITE_SIZE;
    var posX = this.SPRITE_SIZE - 1,
      posY = this.SPRITE_SIZE - 1;

    while (px--) {
      if (imageData[4 * px + 3] != 0) {
        var colorHex = this.rgbToHex(imageData[4 * px], imageData[4 * px + 1], imageData[4 * px + 2]);

        for (let swap in paletteSwaps) {
          for (let color in paletteSwaps[swap]) {
            if (color == colorHex) {
              colorHex = paletteSwaps[swap][color];
            }
          }
        }

        this.CONTEXT.fillStyle = '#' + colorHex;
        this.CONTEXT.strokeStyle = '#' + colorHex;

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

  paintWithMask(sheet, offsetX, offsetY, nudgeX, nudgeY, paletteSwaps, mask) {
    console.log(
      'Painting sprite with mask at ' +
        offsetX * this.SPRITE_SIZE +
        ',' +
        offsetY * this.SPRITE_SIZE +
        ' with ' +
        paletteSwaps.length +
        ' swaps, of sheet ' +
        sheet.src
    );
    var tempCtx = this.tempCanvas.getContext('2d');

    // Make sure to wrap too large offsetXs
    while (offsetX > 21) {
      offsetX -= 22;
      offsetY++;
    }

    // Clear out the temp canvas and splot our basic sheet onto it
    tempCtx.clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);
    tempCtx.drawImage(mask, 0, 0);

    var maskData = tempCtx.getImageData(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE).data;

    // Clear out the temp canvas and splot our basic sheet onto it
    tempCtx.clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);
    tempCtx.drawImage(sheet, -offsetX * this.SPRITE_SIZE, -offsetY * this.SPRITE_SIZE);

    var imageData = tempCtx.getImageData(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE).data;

    // Go through each pixel in data
    var px = this.SPRITE_SIZE * this.SPRITE_SIZE;
    var posX = this.SPRITE_SIZE - 1,
      posY = this.SPRITE_SIZE - 1;

    while (px--) {
      if (imageData[4 * px + 3] != 0 && maskData[4 * px] == 255) {
        var colorHex = this.rgbToHex(imageData[4 * px], imageData[4 * px + 1], imageData[4 * px + 2]);
        for (let swap in paletteSwaps) {
          for (let color in paletteSwaps[swap]) {
            if (color == colorHex) {
              colorHex = paletteSwaps[swap][color];
            }
          }
        }

        this.CONTEXT.fillStyle = '#' + colorHex;
        this.CONTEXT.strokeStyle = '#' + colorHex;

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

  rgbToHex(r, g, b) {
    var rs = r.toString(16);
    if (rs.length == 1) rs = '0' + rs;

    var gs = g.toString(16);
    if (gs.length == 1) gs = '0' + gs;

    var bs = b.toString(16);
    if (bs.length == 1) bs = '0' + bs;

    return rs + gs + bs;
  }
}
