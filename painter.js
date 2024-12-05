class Painter {
  constructor(canvas) {
    this.SPRITE_SIZE = 43;
    this.PREVIEW_MULTI = 3;
    this.CANVAS = canvas;

    if (window.G_vmlCanvasManager) window.G_vmlCanvasManager.initElement(canvas);

    if (canvas.getContext) this.CONTEXT = canvas.getContext('2d');

    this.backArmCanvas = document.getElementById('tempCanvas1');
    this.backSleeveCanvas = document.getElementById('tempCanvas2');
    this.hairCanvas = document.getElementById('tempCanvas3');
    this.bodyCanvas = document.getElementById('tempCanvas4');
    this.pantsCanvas = document.getElementById('tempCanvas5');
    this.shirtCanvas = document.getElementById('tempCanvas6');
    this.helmetCanvas = document.getElementById('tempCanvas7');
    this.altCanvas = document.getElementById('tempCanvas8');
    this.headCanvas = document.getElementById('tempCanvas9');
    this.frontArmCanvas = document.getElementById('tempCanvas10');
    this.frontSleeveCanvas = document.getElementById('tempCanvas11');
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
    //console.log( "Selecting sheets " + bodySheet.src + ", " + shirtArmorSheet.src + ", " + pantsArmorSheet.src );

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
      bodyPalettes,
      this.backArmCanvas
    );

    // Back Sleeve Armor
    if (backSleeveSheet != null)
      this.paintToCanvas(
        backSleeveSheet,
        poseConfig.sleeveIndex[0],
        poseConfig.sleeveIndex[1],
        poseConfig.sleeveOffset[0],
        poseConfig.sleeveOffset[1],
        shirtPalette,
        this.backSleeveCanvas
      );
    else this.backSleeveCanvas.getContext('2d').clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);

    // Body
    this.paintToCanvas(
      bodySheet,
      poseConfig.bodyIndex[0],
      poseConfig.bodyIndex[1],
      0,
      0,
      bodyPalettes,
      this.bodyCanvas
    );

    // Pants Armor
    if (pantsArmorSheet != null)
      this.paintToCanvas(
        pantsArmorSheet,
        poseConfig.bodyIndex[0],
        poseConfig.bodyIndex[1],
        0,
        0,
        pantsPalette,
        this.pantsCanvas
      );
    else this.pantsCanvas.getContext('2d').clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);

    // Shirt Armor
    if (shirtArmorSheet != null)
      this.paintToCanvas(
        shirtArmorSheet,
        poseConfig.chestIndex[0],
        poseConfig.chestIndex[1],
        poseConfig.chestOffset[0],
        poseConfig.chestOffset[1],
        shirtPalette,
        this.shirtCanvas
      );
    else this.shirtCanvas.getContext('2d').clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);

    // Hair
    if (helmetArmorSheet == null || currentSettings.helmetOption == currentSettings.helmetOptionMax - 1)
      this.paintToCanvas(
        accessorySheet,
        currentSettings.hairOption,
        hairOffset,
        poseConfig.hairOffset[0],
        poseConfig.hairOffset[1],
        hairPalette,
        this.hairCanvas
      );
    //this.hairCanvas.getContext( "2d" ).clearRect( 0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE );
    else
      this.paintWithMask(
        accessorySheet,
        currentSettings.hairOption,
        hairOffset,
        poseConfig.hairOffset[0],
        poseConfig.hairOffset[1],
        hairPalette,
        this.hairCanvas,
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
        bodyPalettes,
        this.headCanvas
      );
    else this.headCanvas.getContext('2d').clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);

    // Alt
    if (speciesVars.altOptionAsFacialMask)
      this.paintToCanvas(
        accessorySheet,
        currentSettings.altOption,
        altOffset,
        poseConfig.hairOffset[0],
        poseConfig.hairOffset[1],
        bodyPalettes,
        this.altCanvas
      );
    else this.altCanvas.getContext('2d').clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);

    // Helmet
    if (helmetArmorSheet != null && currentSettings.helmetOption < currentSettings.helmetOptionMax - 1)
      this.paintToCanvas(
        helmetArmorSheet,
        1,
        0,
        poseConfig.hairOffset[0],
        poseConfig.hairOffset[1],
        helmetPalette,
        this.helmetCanvas
      );

    // Front Arm
    this.paintToCanvas(
      frontArmSheet,
      poseConfig.sleeveIndex[0],
      poseConfig.sleeveIndex[1],
      poseConfig.sleeveOffset[0],
      poseConfig.sleeveOffset[1],
      bodyPalettes,
      this.frontArmCanvas
    );

    // Front Sleeve Armor
    if (frontSleeveSheet != null)
      this.paintToCanvas(
        frontSleeveSheet,
        poseConfig.sleeveIndex[0],
        poseConfig.sleeveIndex[1],
        poseConfig.sleeveOffset[0],
        poseConfig.sleeveOffset[1],
        shirtPalette,
        this.frontSleeveCanvas
      );
    else this.frontSleeveCanvas.getContext('2d').clearRect(0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);
  }

  paintToCanvas(sheet, offsetX, offsetY, nudgeX, nudgeY, paletteSwaps, tempCanvas) {
    //console.log( "Painting sprite at " + offsetX * this.SPRITE_SIZE + "," + offsetY * this.SPRITE_SIZE + " with " + paletteSwaps.length + " swaps, of sheet " + sheet.src );
    var tempCtx = tempCanvas.getContext('2d');

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
      //console.log( "Painting pixel " + px + " (" + posX + "," + posY + ")" );
      if (imageData[4 * px + 3] != 0) {
        var colorHex = this.rgbToHex(imageData[4 * px], imageData[4 * px + 1], imageData[4 * px + 2]);

        //for ( var swap = 0; swap < paletteSwaps.length; swap++ )
        for (let swap in paletteSwaps) {
          //console.log( paletteSwaps[swap] );
          for (let color in paletteSwaps[swap]) {
            if (color == colorHex) {
              //for ( var swap2 = 0; swap2 < paletteSwaps[swap].length; swap2++ )
              //console.log( "	Translating " + colorHex + " to " + paletteSwaps[swap][color] );
              colorHex = paletteSwaps[swap][color];
            }
          }
        }

        this.CONTEXT.fillStyle = '#' + colorHex;
        this.CONTEXT.strokeStyle = '#' + colorHex;
        tempCtx.fillStyle = '#' + colorHex;
        tempCtx.strokeStyle = '#' + colorHex;

        //tempCtx.clearRect( posX, posY, 1, 1 );
        //tempCtx.fillRect( posX + nudgeX, posY + nudgeY, 1, 1 );

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

  paintWithMask(sheet, offsetX, offsetY, nudgeX, nudgeY, paletteSwaps, tempCanvas, mask) {
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
    var tempCtx = tempCanvas.getContext('2d');

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
      //console.log( "Painting pixel " + px + " (" + posX + "," + posY + ")" );
      if (imageData[4 * px + 3] != 0 && maskData[4 * px] == 255) {
        var colorHex = this.rgbToHex(imageData[4 * px], imageData[4 * px + 1], imageData[4 * px + 2]);

        //for ( var swap = 0; swap < paletteSwaps.length; swap++ )
        for (let swap in paletteSwaps) {
          //console.log( paletteSwaps[swap] );
          for (let color in paletteSwaps[swap]) {
            if (color == colorHex) {
              //for ( var swap2 = 0; swap2 < paletteSwaps[swap].length; swap2++ )
              //console.log( "	Translating " + colorHex + " to " + paletteSwaps[swap][color] );
              colorHex = paletteSwaps[swap][color];
            }
          }
        }

        this.CONTEXT.fillStyle = '#' + colorHex;
        this.CONTEXT.strokeStyle = '#' + colorHex;
        tempCtx.fillStyle = '#' + colorHex;
        tempCtx.strokeStyle = '#' + colorHex;

        //tempCtx.clearRect( posX, posY, 1, 1 );
        //tempCtx.fillRect( posX + nudgeX, posY + nudgeY, 1, 1 );

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
