/*
Basic Blank Javascript Template


Script Name: Color Blocks 3.0
Author: William Dowling
Build Date: 13 September, 2016
Description: Add solid fill rectangles under artwork so that rip software can read colors inside pattern fills.
			 Remove sew lines from document.
			 Check for unsavory colors and alert user to the existence of undesirable print colors.
Build number: 3.0

Progress:

	Version 3.001
		13 September, 2016
		Initial rebuild

*/

function container()
{

	/*****************************************************************************/

	///////Begin/////////
	///Logic Container///
	/////////////////////

	//removeBlockLayer Function Description
	//check for the existence of a block layer and remove it if necessary.
	//this ensures that on each execution of the script, there is a blank slate.
	function removeBlockLayer()
	{
		var localValid = false;
		try
		{
			for(var BL=layers.length-1;BL>-1;BL--)
			{
				if(layers[BL].name.indexOf("Block")>-1)
				{
					layers[BL].locked = false;
					layers[BL].remove();
				}
			}
			localValid = true;
		}
		catch(e)
		{
			errorList.push("System: " + e);
			errorList.push("Failed removing Block Layer.");
			localValid = false;
		}
		return localValid;
	}



	//exterminateDefault Function Description
	//remove all Illustrator default swatches from swatch panel.
	function exterminateDefault()
	{
		for(var ed=swatches.length-1;ed>-1;ed--)
		{
			if(swatches[ed].name.indexOf("C=")>-1 || swatches[ed].name.indexOf("CMYK">-1))
			{
				$.writeln("Removing " + swatches[ed].name);
				removeSwatch(swatches[ed]);
			}
			else
			{
				for(var ld=0;ld<library.defaultColors.length;ld++)
				{
					if(swatches[ed].name.toLowerCase() == library.defaultSwatches[ld])
					{
						$.writeln("Removing " + swatches[ed].name)
						removeSwatch(swatches[ed]);
						break;
					}
				}
			}
		}

		//remove default swatch folders
		try
		{
			docRef.swatchGroups['Grays'].remove();
			docRef.swatchGroups['Brights'].remove();
		}
		catch(e)
		{
			errorList.push("System: " + e);
			errorList.push("Failed while removing swatchGroups.");
		}

		return true;


		//local, private "remove swatch or send error" function
		function removeSwatch(swatch)
		{
			try
			{
				swatch.remove();
			}
			catch(e)
			{
				errorSwatches++;
				errorList.push("System: " + e);
				errorList.push("Couldn't remove one or more default swatches");
			}
		}
	}



	//fixFloSwatch Function Description
	//Ensure capitalized names of flo swatches
	//Fix naming convention for cut line, sew line and thru-cut
	function fixFloSwatches()
	{
		var floLibrary =
		{
			"Bright Purple B" :
			{
				fixedName : "BRIGHT PURPLE B"
			}
		}

		for(var fs=0;fs<swatches.length;fs++)
		{
			var thisSwatch = swatches[fs];
			if(floLibrary[thisSwatch.name] != undefined)
			{
				thisSwatch.name = floLibrary[thisSwatch.name].fixedName;
			}
		}
		return true;
	}



	////////End//////////
	///Logic Container///
	/////////////////////

	/*****************************************************************************/

	///////Begin////////
	////Data Storage////
	////////////////////

	var library = 
	{
		defaultSwatches : ['White','Black','White, Black','Orange, Yellow','Fading Sky','Super Soft Black Vignette','Foliage','Pompadour'],
		approvedColors : ['black b','white b','gray b','gray 2 b','steel b','navy b','navy 2 b','royal blue b','columbia b','teal b','dark green b','kelly green b','lime green b','optic yellow b','yellow b','athletic gold b','vegas gold b','orange b','texas orange b','red b','cardinal b','maroon b','hot pink b','pink b','soft pink b','purple b','flesh b','dark flesh b','brown b','cyan b','flo orange b','flo yellow b','flo pink b','twitch b','mint b','magenta b','neon coral b','flame b','bright purple b','dark charcoal b','info b','jock tag b','thru-cut','cut line','cutline','jrock charcoal','feeney purple b','feeney orange b','feeney orange body b','tailgater gold b','thru-cut','cut line','info b','jock tag b']

	}

	////////End/////////
	////Data Storage////
	////////////////////

	/*****************************************************************************/

	///////Begin////////
	///Function Calls///
	////////////////////

	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var swatches = docRef.swatches;
	var aB = docRef.artboards;
	var inkList = docRef.inkList;
	var errorList = [];

	var valid;
	var retry = false;

	valid = removeBlockLayer();

	if(valid)
		valid = exterminateDefault();

	if(valid)
		valid = fixFloSwatches();

	alert(valid);



	////////End/////////
	///Function Calls///
	////////////////////

	/*****************************************************************************/

}
container();