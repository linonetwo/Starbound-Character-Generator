/*
	Juan big class to hold current option states. Makes sure to keep the customization options
	sane during the darkest of nights. Keeps track of current choices, option max boundaries,
	and updates counters to display the correct number.
	*/


function Settings()
{
	this.species				= "human";
	this.gender					= "male";
	this.name;
	
	this.randomizeOptions		= [ "skinColor", "altOption", "hairOption", "headOption", "shirtOption", "shirtColor", "pantsOption", "pantsColor", "helmetOption" ];
	
	this.skinColor				= 0;
	this.altOption				= 0;
	this.hairOption				= 0;
	this.headOption				= 0;
	
	this.shirtOption			= 0;
	this.shirtColor				= 0;
	this.pantsOption			= 0;
	this.pantsColor				= 0;
	this.helmetOption			= 0;
	
	this.poseOption				= 0;
	
	this.skinColorMax;
	this.altOptionMax;
	this.hairOptionMax;
	this.headOptionMax;
	
	this.shirtOptionMax;
	this.shirtColorMax;
	this.pantsOptionMax;
	this.pantsColorMax;
	this.helmetOptionMax		= 0;
	
	this.poseOptionMax;
	
	this.skinColorCounter		= $("#variable-skinColor").children(".option-buttons").children(".option-counter").children();
	this.altOptionCounter		= $("#variable-altOption").children(".option-buttons").children(".option-counter").children();
	this.hairOptionCounter		= $("#variable-hairOption").children(".option-buttons").children(".option-counter").children();
	this.headOptionCounter		= $("#variable-headOption").children(".option-buttons").children(".option-counter").children();
	this.shirtOptionCounter		= $("#variable-shirtOption").children(".option-buttons").children(".option-counter").children();
	this.shirtColorCounter		= $("#variable-shirtColor").children(".option-buttons").children(".option-counter").children();
	this.pantsOptionCounter		= $("#variable-pantsOption").children(".option-buttons").children(".option-counter").children();
	this.pantsColorCounter		= $("#variable-pantsColor").children(".option-buttons").children(".option-counter").children();
	this.helmetOptionCounter	= $("#variable-helmetOption").children(".option-buttons").children(".option-counter").children();
	this.poseOptionCounter		= $("#variable-poseOption").children(".option-buttons").children(".option-counter").children();
};

Settings.prototype.updateCounters = function()
{
	// Skin color
	var skinTemp = ( this.skinColor + 1 ) % 10;
	this.skinColorCounter.eq(0).css( "backgroundPosition", -( this.skinColor - skinTemp + 1 ) + "px 0px" );
	this.skinColorCounter.eq(1).css( "backgroundPosition", -( skinTemp * 10 ) + "px 0px" );
	
	// Alt option
	var altTemp = ( this.altOption + 1 ) % 10;
	this.altOptionCounter.eq(0).css( "backgroundPosition", -( this.altOption - altTemp + 1 ) + "px 0px" );
	this.altOptionCounter.eq(1).css( "backgroundPosition", -( altTemp * 10 ) + "px 0px" );
	
	// Hair option
	var hairTemp = ( this.hairOption + 1 ) % 10;
	this.hairOptionCounter.eq(0).css( "backgroundPosition", -( this.hairOption - hairTemp + 1 ) + "px 0px" );
	this.hairOptionCounter.eq(1).css( "backgroundPosition", -( hairTemp * 10 ) + "px 0px" );
	
	// Head option
	var headTemp = ( this.headOption + 1 ) % 10;
	this.headOptionCounter.eq(0).css( "backgroundPosition", -( this.headOption - headTemp + 1 ) + "px 0px" );
	this.headOptionCounter.eq(1).css( "backgroundPosition", -( headTemp * 10 ) + "px 0px" );
	
	// Shirt option
	var shirtTemp = ( this.shirtOption + 1 ) % 10;
	this.shirtOptionCounter.eq(0).css( "backgroundPosition", -( this.shirtOption - shirtTemp + 1 ) + "px 0px" );
	this.shirtOptionCounter.eq(1).css( "backgroundPosition", -( shirtTemp * 10 ) + "px 0px" );
	
	// Shirt color
	var shirtColorTemp = ( this.shirtColor + 1 ) % 10;
	this.shirtColorCounter.eq(0).css( "backgroundPosition", -( this.shirtColor - shirtColorTemp + 1 ) + "px 0px" );
	this.shirtColorCounter.eq(1).css( "backgroundPosition", -( shirtColorTemp * 10 ) + "px 0px" );
	
	// Pants option
	var pantsTemp = ( this.pantsOption + 1 ) % 10;
	this.pantsOptionCounter.eq(0).css( "backgroundPosition", -( this.pantsOption - pantsTemp + 1 ) + "px 0px" );
	this.pantsOptionCounter.eq(1).css( "backgroundPosition", -( pantsTemp * 10 ) + "px 0px" );
	
	// Pants color
	var pantsColorTemp = ( this.pantsColor + 1 ) % 10;
	this.pantsColorCounter.eq(0).css( "backgroundPosition", -( this.pantsColor - pantsColorTemp + 1 ) + "px 0px" );
	this.pantsColorCounter.eq(1).css( "backgroundPosition", -( pantsColorTemp * 10 ) + "px 0px" );
	
	// Pose option
	var poseTemp = ( this.poseOption + 1 ) % 10;
	this.poseOptionCounter.eq(0).css( "backgroundPosition", -( this.poseOption - poseTemp + 1 ) + "px 0px" );
	this.poseOptionCounter.eq(1).css( "backgroundPosition", -( poseTemp * 10 ) + "px 0px" );
	
	// Helmet option
	var helmetTemp = ( this.helmetOption + 1 ) % 10;
	this.helmetOptionCounter.eq(0).css( "backgroundPosition", -( this.helmetOption - helmetTemp + 1 ) + "px 0px" );
	this.helmetOptionCounter.eq(1).css( "backgroundPosition", -( helmetTemp * 10 ) + "px 0px" );
};

Settings.prototype.reset = function( species )
{
	// Reset as few options as we have to, to preserve state
	if ( species )
	{
		this.skinColor			= 0;
		this.altOption			= 0;
		this.hairOption			= 0;
		this.headOption			= 0;
	}
	
	// Remaining options will be capped by recalc
};

Settings.prototype.recalc = function( config )
{
	var vars					= config.species[this.species].variables;
	var armors					= config.species[this.species].armors;
	
	// Skin color
	this.skinColorMax			= vars.colors.skinColor.length;
	if ( this.skinColor >= this.skinColorMax )
		this.skinColor = this.skinColorMax -1;
	
	// Alt option
	if ( vars.altOptionAsUndyColor )
		this.altOptionMax		= vars.colors.undyColor.length;
	else if ( vars.altOptionAsFacialMask )
		this.altOptionMax		= vars.genders[this.gender].facialMask.count;
	else
		this.altOptionMax		= 0;
	if ( this.altOption >= this.altOptionMax )
		this.altOption = this.altOptionMax -1;
	
	// Hair option
	this.hairOptionMax			= vars.genders[this.gender].hair.count;
	if ( this.hairOption >= this.hairOptionMax )
		this.hairOption = this.hairOptionMax -1;
	
	// Head option
	if ( vars.headOptionAsHairColor )
		this.headOptionMax		= vars.colors.hairColor.length;
	else if ( vars.headOptionAsFacialHair === true )
		this.headOptionMax		= vars.genders[this.gender].facialHair.count;
	else
		this.headOptionMax		= 0;
	if ( this.headOption >= this.headOptionMax )
		this.headOption = this.headOptionMax -1;
	
	// Shirt option(al)
	this.shirtOptionMax			= armors.names.length;
	if ( this.shirtOption >= this.shirtOptionMax )
		this.shirtOption = this.shirtOptionMax -1;
	
	// Pants (also) option(al)
	this.pantsOptionMax			= armors.names.length;
	if ( this.pantsOption >= this.pantsOptionMax )
		this.pantsOption = this.pantsOptionMax -1;
	
	// Shirt colour
	this.shirtColorMax		= armors.armorColors.length;
	if ( this.shirtColor >= this.shirtColorMax )
		this.shirtColor = this.shirtColorMax -1;
	
	// Chest colour
	this.pantsColorMax		= armors.armorColors.length;
	if ( this.pantsColor >= this.pantsColorMax )
		this.pantsColor = this.pantsColorMax -1;
	
	// Poses
	this.poseOptionMax			= config.poses.length;
	if ( this.poseOption >= this.poseOptionMax )
		this.poseOption = this.poseOptionMax -1;
	
	// Helmet
	if ( armors.names[armors.names.length-1] !== null )
	{
		this.helmetOptionMax	= config.extraArmorColor.length + 1;
		if ( this.helmetOption >= this.helmetOptionMax )
			this.helmetOption = config.extraArmorColor.length;
	}
};

Settings.prototype.randomize = function()
{
	console.log( "Randomizing options" );
	for ( var opt in this.randomizeOptions )
	{
		var optName				= this.randomizeOptions[opt];
		console.log( "Randomizing option " + optName );
		this[optName]			= Math.floor( Math.random() * this[optName + "Max"] );
	}
	
	// Pose is a special case, and should have some weighting applied
	var poseWeight				= 50;
	var poseRandom				= Math.floor( Math.random() * poseWeight );
	if ( poseRandom > poseWeight - this.poseOptionMax )
	{
		poseRandom = poseRandom - poseWeight + this.poseOptionMax;
		this.poseOption = poseRandom;
	}
	else
	{
		poseRandom = poseRandom % 5;
		this.poseOption = poseRandom;
	}
	
	// Helmet also deserves a special treatment
	if ( this.helmetOptionMax > 0 && Math.random() < 0.8 )
		this.helmetOption = this.helmetOptionMax - 1;
};


Settings.prototype.setName = function( name )
{
	if ( this.name === name )
		return;
	
	this.name = name;
	
	$.getJSON( "images/sheets/" + toHash( name ) + "/data.json", function ( data ) { currentSettings.checkName( data ); } );
};

Settings.prototype.toString = function()
{
	return "Settings[species=" + this.species + ", gender=" + this.gender + ", skinColor=" + this.skinColor +
			", altOption=" + this.altOption + ", headOption=" + this.headOption + ", hairOption=" +
			this.hairOption + ", shirtOption=" + this.shirtOption + ", shirtColor=" + this.shirtColor +
			", pantsOption=" + this.pantsOption + ", pantsColor=" + this.pantsColor +
			", poseOption=" + this.poseOption + ", helmetOption=" + this.helmetOption +
			", skinColorMax=" + this.skinColorMax + ", altOptionMax=" + this.altOptionMax +
			", hairOptionMax=" + this.hairOptionMax + ", headOptionMax=" + this.headOptionMax +
			", shirtOptionMax=" + this.shirtOptionMax + ", shirtColorMax=" + this.shirtColorMax +
			", pantsOptionMax=" + this.pantsOptionMax + ", pantsColorMax=" + this.pantsColorMax +
			", poseOptionMax=" + this.poseOptionMax + ", helmetOptionMax=" + this.helmetOptionMax + "]";
};

Settings.prototype.checkName = function( data )
{
	if ( data == null || data.armorColor == null )
		return;
	
	console.log( "Checked " + toHash( currentSettings.name ) + " with return " + data );
	
	for ( var r in config.species )
	{
		var armors = config.species[r].armors
		if ( armors.names[armors.names.length-1] !== "extra" )
		{
			armors.names[armors.names.length] = "extra";
		}
	}
	
	config.extraArmorColor = data.armorColor;
	config.extraHelmet = data.helmet;
	
	for ( var n in data.names )
	{
		var name = data.names[n];
		console.log( "Loading extra sheet " + name );
		var img = new Image();
		img.src = "images/sheets/" + toHash( this.name ) + "/" + name + ".png";
		img.onload = function() { painter.repaint( config, currentSettings, imageInfo ); };
		imageInfo["extra-" + name] = img;
	}
	
	this.recalc( config );
	this.shirtOption = this.shirtOptionMax - 1;
	this.shirtColorOption = 0;
	this.pantsOption = this.pantsOptionMax - 1;
	this.pantsColorOption = 0;
	this.helmetOption = 0;
	
	this.updateCounters();
	$("#variable-helmetOption").css( "display", "inline-block" );
}

