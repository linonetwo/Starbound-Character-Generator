"use strict";

var config;

var painter;
var currentSettings;

var imageInfo = {};
var itemsToLoad = 0, itemsLoaded = 0;
var percentLoaded = 0.0;

var fadeDelay = 200;
var fadeStyle = "fast";
var loopID;

var warpFrames = 16;
var warpCurrentFrame = 0;
var warpInterval = 50;

// Hook up our onload and schnitzel-witzel
$( function ()
	{
		currentSettings = new Settings();
		currentSettings.updateCounters();
		
		$.getJSON( 'webchargen.config.json', function ( data )
			{
				console.log( "Got JSON" );
				
				$.when( loadData( data, true ) ).then( function ()
					{
						painter = new Painter( document.getElementById( "character-preview" ) );
						
						currentSettings.recalc( config );
						console.log( "Loop started" );
						loopID = window.setInterval( loadingLoop, 10 );
						preLoad();
					}
				);
			}
		);
		
		// Click ALL the buttons!
		$(".big-button").click(function () {
			clickyDeselection();
			bigButtonClick( this );
		});
		
		$(".button").click(function() {
			clickyDeselection();
			littleButtonClick( this );
		});
		
		$("#button-randomize-look").click( function() {
			clickyDeselection();
			randomizeButtonClick();
		});
		
		$("#save-button").click( function() {
			saveImage();
		});
		
		$("#nameInput").keyup( function( event ) {
			if ( event.which == 13 )
			{
				event.preventDefault();
				checkName();
			}
		});
		
		$("#nameInput").blur( function() {
			checkName();
		});
		
		// Disables text selection of our pretty images in... some browser. I don't remember.
		// I saw it on the internet, so it has to be true.
		document.onselectstart = function() { return false; }
	}
);

// After fetching our config file, set some basics up
function loadData( data )
{
	config = data;
	console.log( "Loaded data with " + Object.size( config ) + " root nodes" );
	
	/*
	setOptionText();
	
	for (var v = 5; v <= 8; v++) {
		$("#variable-" + v).find(".label").css(
			{ "background-image" : "url(images/text/" + config.sharedOptions[v - 5] + ".png)"}
		);
	}
	*/
	
	$("#species-" + currentSettings.species).addClass("selected");
	$("#gender-" + currentSettings.gender).addClass("selected");
	
	console.log( "Hi mom" );
}

// Prefetch all our images. ALL OF ZEM.
function preLoad()
{
	for ( var t in config.sharedOptions )
	{
		var textImg = new Image();
		textImg.src = "images/text/" + config.sharedOptions[t] + ".png";
		textImg.onload = function() { incPercentLoaded(); }
		imageInfo["text-" + config.sharedOptions[t]] = textImg;
		
		itemsToLoad++;
	}
	
	for ( var r in config.species )
	{
		if ( r.charAt(0) == '_' )
			continue;
		
		// Prefetch male body sheet
		var bodyMaleImg = new Image();
		bodyMaleImg.src = "images/sheets/" + r + "/body-male.png";
		bodyMaleImg.onload = function() { incPercentLoaded(); }
		imageInfo[r + "-body-male"] = bodyMaleImg;
		
		// Prefetch female body sheet
		var bodyFemaleImg = new Image();
		bodyFemaleImg.src = "images/sheets/" + r + "/body-female.png";
		bodyFemaleImg.onload = function() { incPercentLoaded(); }
		imageInfo[r + "-body-female"] = bodyFemaleImg;
		
		// Prefetch front arm sheet
		var bodyfrontArmImg = new Image();
		bodyfrontArmImg.src = "images/sheets/" + r + "/body-frontArm.png";
		bodyfrontArmImg.onload = function() { incPercentLoaded(); }
		imageInfo[r + "-body-frontArm"] = bodyfrontArmImg;
		
		// Prefetch back arm sheet
		var bodybackArmImg = new Image();
		bodybackArmImg.src = "images/sheets/" + r + "/body-backArm.png";
		bodybackArmImg.onload = function() { incPercentLoaded(); }
		imageInfo[r + "-body-backArm"] = bodybackArmImg;
		
		// Prefetch accessory (hair) sheet
		var bodyMaleImg = new Image();
		bodyMaleImg.src = "images/sheets/" + r + "/body-accessories.png";
		bodyMaleImg.onload = function() { incPercentLoaded(); }
		imageInfo[r + "-body-accessory"] = bodyMaleImg;
		
		itemsToLoad += 5;
		
		for ( var t in config.species[r].variables.names )
		{
			var labelName = config.species[r].variables.names[t];
			if ( imageInfo["text-" + labelName] != null )
				continue;
			
			var textImg = new Image();
			textImg.src = "images/text/" + labelName + ".png";
			textImg.onload = function() { incPercentLoaded(); }
			imageInfo["text-" + labelName] = textImg;
			
			itemsToLoad++;
		}
		
		for ( var a in config.species[r].armors.names )
		{
			var aName = config.species[r].armors.names[a];
			if ( aName === null )
				continue;
			
			// Load male chest sheet
			var armorMaleChestImg = new Image();
			armorMaleChestImg.src = "images/sheets/" + r + "/armor-" + aName + "-chestMale.png";
			armorMaleChestImg.onload = function() { incPercentLoaded(); }
			imageInfo[r + "-armor-" + aName + "-maleChest"] = armorMaleChestImg;
			
			// Load female chest sheet
			var armorFemaleChestImg = new Image();
			armorFemaleChestImg.src = "images/sheets/" + r + "/armor-" + aName + "-chestFemale.png";
			armorFemaleChestImg.onload = function() { incPercentLoaded(); }
			imageInfo[r + "-armor-" + aName + "-femaleChest"] = armorFemaleChestImg;
			
			// Load male pants sheet
			var armorMalePantsImg = new Image();
			armorMalePantsImg.src = "images/sheets/" + r + "/armor-" + aName + "-pantsMale.png";
			armorMalePantsImg.onload = function() { incPercentLoaded(); }
			imageInfo[r + "-armor-" + aName + "-malePants"] = armorMalePantsImg;
			
			// Load female pants sheet
			var armorFemalePantsImg = new Image();
			armorFemalePantsImg.src = "images/sheets/" + r + "/armor-" + aName + "-pantsFemale.png";
			armorFemalePantsImg.onload = function() { incPercentLoaded(); }
			imageInfo[r + "-armor-" + aName + "-femalePants"] = armorFemalePantsImg;
			
			// Load front sleeve sheet
			var armorFrontSleeveImg = new Image();
			armorFrontSleeveImg.src = "images/sheets/" + r + "/armor-" + aName + "-frontSleeve.png";
			armorFrontSleeveImg.onload = function() { incPercentLoaded(); }
			imageInfo[r + "-armor-" + aName + "-frontSleeve"] = armorFrontSleeveImg;
			
			// Load back sleeve sheet
			var armorBackSleeveImg = new Image();
			armorBackSleeveImg.src = "images/sheets/" + r + "/armor-" + aName + "-backSleeve.png";
			armorBackSleeveImg.onload = function() { incPercentLoaded(); }
			imageInfo[r + "-armor-" + aName + "-backSleeve"] = armorBackSleeveImg;
			
			itemsToLoad += 5;
		}
		
	}
	
	// Load warp-in
	var warpImg = new Image();
	warpImg.src = "images/playerWarpIn.png";
	warpImg.onload = function() { incPercentLoaded(); }
	imageInfo["warpIn"] = warpImg;
	
	itemsToLoad++;
}

// Use entire function to increment one number. Like a boss.
function incPercentLoaded()
{
	itemsLoaded++;
}

// Poll our completion status, make everything ready once we're all set
function loadingLoop()
{
	var percentLoaded = ( itemsLoaded / itemsToLoad ) * 100;
	
	if (percentLoaded < 100 )
	{
		$("#loading-text").html( "Loading...<br>" + percentLoaded.toFixed(4) + "%" );
	}
	else
	{
		console.log( "Image prefetch loop stopped." );
		window.clearInterval( loopID );
		$("#loading-text").html( "Loading...<br>Done!" );
		
		setOptionText();
		//painter.repaint( config, currentSettings, imageInfo );
		
		$.when( $("#loading-screen").delay( fadeDelay ).fadeOut( fadeStyle ) ).then( function() { loopID = window.setInterval( playWarp, warpInterval ) } );
	}
}

function playWarp()
{
	painter.CONTEXT.clearRect( 0, 0, painter.SPRITE_SIZE * painter.PREVIEW_MULTI, painter.SPRITE_SIZE * painter.PREVIEW_MULTI );
	
	if ( warpCurrentFrame == warpFrames - 1 )
		painter.repaint( config, currentSettings, imageInfo );
	
	painter.paintToCanvas( imageInfo["warpIn"], warpCurrentFrame, 0, 0, 0, null, painter.bodyCanvas );
	warpCurrentFrame++;
	
	if ( warpCurrentFrame == warpFrames )
	{
		window.clearInterval( loopID );
		painter.repaint( config, currentSettings, imageInfo );
	}
}

// Tell the users what all those cute little buttons do. Otherwise they get cranky.
// The users, that is. Not the buttons.
// I assume.
function setOptionText()
{
	$("#character-options-container").children().each( function( index )
		{
			var variableName;
			if ( index < 4 )
				variableName = config.species[currentSettings.species].variables.names[index];
			else
				variableName = config.sharedOptions[index-4];
			
			//console.log( "Setting option " + index + " to " + variableName );
			$(this).children(".label").css( { "background-image" : "url(images/text/" + variableName + ".png)" } );
		}
	);
}

// The measure of a man is in how quickly he can click on small buttons on a computer monitor.
// If he were to click too quickly, he would have selected a fraction of the page.
// Knock that off, man.
function clickyDeselection()
{
	// Strong enough for a man. Gentle enough for a woman.
	if ( window.getSelection )
	{
		if ( window.getSelection().empty ) // Chrome
			window.getSelection().empty();
		else if ( window.getSelection().removeAllRanges ) // Firefox
			window.getSelection().removeAllRanges();
	}
	else if (document.selection) // "Misc"
	{
		document.selection.empty();
	}
}

// Them button what be big. When user clicks this, big things be happening.
function bigButtonClick( obj )
{
	if ( $(obj).hasClass( "disabled" ) )
	{
		return true;
	}
	
	console.log( "Clicked big button" );
	
	// User wants to be another species. Weirdo.
	if ( $(obj).hasClass( "species-selection" ) )
	{
		var speciesName = obj.id.substring( 8 );
		
		console.log( "Changing to species " + speciesName );
		
		// First of all we need to check for armor special options and preserve those, since they can vary between species
		var shirtArmorName = config.species[currentSettings.species].armors.names[currentSettings.shirtOption];
		var pantsArmorName = config.species[currentSettings.species].armors.names[currentSettings.pantsOption];
		
		currentSettings.species = speciesName;
		currentSettings.reset( true );
		
		if ( shirtArmorName == "extra" || shirtArmorName == null )
			currentSettings.shirtOption = config.species[currentSettings.species].armors.names.indexOf( shirtArmorName );
		
		if ( pantsArmorName == "extra" || pantsArmorName == null )
			currentSettings.pantsOption = config.species[currentSettings.species].armors.names.indexOf( pantsArmorName );
		
		// Make sure we show the right gender button icons
		var iconOffset = config.species[currentSettings.species].variables.genders.iconOffset * 48;
		$("#gender-male").children().css( "backgroundPosition", "0px -" + iconOffset + "px" );
		$("#gender-female").children().css( "backgroundPosition", "-50px -" + iconOffset + "px" );
	}
	else // And now they want to be another gender. Who do they think they are, some kind of pixel sized Tiresias?
	{
		var genderName = obj.id.substring( 7 );
		
		console.log( "Changing to gender " + genderName );
		currentSettings.gender = genderName;
		currentSettings.reset( false );
	}
	
	// Highlightificationcoulrophobiaafearofstilts
	$(".species-selection").removeClass( "selected" );
	$(".gender-selection").removeClass( "selected" );
	
	$("#species-" + currentSettings.species).addClass("selected");
	$("#gender-" + currentSettings.gender).addClass("selected");
	setOptionText();
	
	currentSettings.recalc( config );
	currentSettings.updateCounters();
	painter.repaint( config, currentSettings, imageInfo );
}

// Big button's younger brother. He dreams of one day growing up to become the biggest, most buttonest kid on the playground. An iPad interface.
function littleButtonClick( obj )
{
	console.log( "Clicked widdle button" );
	
	var optionName = obj.parentNode.parentNode.id.substring( 9 );
	console.log( "Changing option " + optionName );
	
	var optionMax = currentSettings[optionName + "Max"];
	
	if ( $(obj).hasClass( "left-button" ) )
	{
		console.log( "Clicked option " + optionName + " going backwards at " + currentSettings[optionName] + " with max " + optionMax );
		
		currentSettings[optionName] -= 1;
		if ( currentSettings[optionName] < 0 )
			currentSettings[optionName] = optionMax - 1;
	}
	else 
	{
		console.log( "Clicked option " + optionName + " going onwards(!) at " + currentSettings[optionName] + " with max " + optionMax );
		
		currentSettings[optionName] += 1;
		if ( currentSettings[optionName] >= optionMax )
			currentSettings[optionName] = 0;
	}
	
	// Recalculate our options, update counters, then draw our sprite
	currentSettings.recalc( config );
	currentSettings.updateCounters();
	painter.repaint( config, currentSettings, imageInfo );
}

// BREAK GLASS IN CASE OF MIDLIFE CRISIS
function randomizeButtonClick()
{
	currentSettings.randomize();
	
	// Recalculate our options, update counters, then draw our sprite
	currentSettings.recalc( config );
	currentSettings.updateCounters();
	painter.repaint( config, currentSettings, imageInfo );
}


// Never before in history has so few lines made so many people sacrifice so much gray matter.
function saveImage()
{
	var img = document.getElementById( "character-preview" ).toDataURL( "image/png" );
	window.location.href = img.replace( "image/png", "image/octet-stream" );
}

function checkName()
{
	currentSettings.setName( $("#nameInput").val() );
}

// Since object is mathematically challenged, we have to help it along a bit.
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// Brazenly stolen from SO
function toHash( string )
{
	var hash = 17;
	
	for ( var i = 0; i < string.length; i++ )
	{
		hash = ( ( hash << 5 ) - hash ) + string.charCodeAt( i );
		hash = hash & hash; // Convert to 32bit integer
	}
	
	return hash.toString( 16 );
}
