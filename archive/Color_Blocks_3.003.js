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

	Version 3.002
		14 September, 2016
		Continuing initial build. Slimmed down fixFloSwatches() function and tested.
		Currently working to remove all default swatches and swatch groups as well as fixing incorrectly named flo colors and/or cutline swatches.

	Version 3.003
		14 September, 2016
		Added checkSew and removeSewLines functions
		Utilized app.executeMenuCommand instead of the recursive loop from v2.0



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
			if(swatches[ed].name.indexOf("C=")>-1 || swatches[ed].name.indexOf("CMYK")>-1)
			{
				removeSwatch(swatches[ed]);
			}
			else
			{
				for(var ld=0;ld<library.defaultSwatches.length;ld++)
				{
					if(swatches[ed].name == library.defaultSwatches[ld])
					{
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
		var localValid = true;
		var floLibrary =
		{
			"Bright Purple B" : "BRIGHT PURPLE B",
			"Flo Yellow B" : "FLO YELLOW B",
			"Flame B" : "FLAME B",
			"Flo Blue B" : "FLO BLUE B",
			"Flo Orange B" : "FLO ORANGE B",
			"Flo Pink B" : "FLO PINK B",
			"Mint B" : "MINT B",
			"Neon Coral B" : "NEON CORAL B",
			"cutline" : "CUT LINE",
			"cut line" : "CUT LINE",
			"Cut Line" : "CUT LINE", 
			"CutLine" : "CUT LINE", 
			"CUTLINE" : "CUT LINE",
			"CUTline" : "CUT LINE",
			"sewline" : "SEW LINE",
			"sew line" : "SEW LINE",
			"SewLine" : "SEW LINE",
			"Sew Line" : "SEW LINE",
			"Sew Lines" : "SEW LINE",
			"ZUND CUT" : "Thru-cut",
			"ZUNDCUT" : "Thru-cut"
		}

		for(var fs=0;fs<swatches.length;fs++)
		{
			var thisSwatch = swatches[fs];
			if(floLibrary[thisSwatch.name]!= undefined)
			{
				try
				{
					thisSwatch.name = floLibrary[thisSwatch.name];
				}
				catch(e)
				{
					errorList.push("System: " + e);
					errorList.push("Failed while renaming a Flo Swatch.");
					localValid = false;
				}
			}
		}
		return localValid;
	}



	//checkSew Function Description
	//check for existence of sew lines in swatches panel
	function checkSew()
	{
		var exist = false;
		for(var s=0;s<swatches.length;s++)
		{
			if(swatches[s].name == "SEW LINE");
			{
				exist = true;
				break;
			}
		}
		return exist;
	}


	//removeSewLines Function Description
	//create a rectangle, apply sew line fill, select same and remove
	//repeat for stroke
	function removeSewLines()
	{
		docRef.selection = null;
		var item = docRef.pathItems.rectangle(100,100,100,100);
		item.filled = true;
		item.fillColor = swatches["SEW LINE"].color;
		item.selected = true;

	    //select same fill color
		app.executeMenuCommand("Find Fill Color menu item")

		//remove all selected items
		for(var a=docRef.selection.length-1;a>-1;a--)
		{
			docRef.selection[a].remove();
		}

		item = docRef.pathItems.rectangle(100,100,100,100);
		item.filled = false;
		item.stroked = true;
		item.strokeColor = swatches["SEW LINE"].color;
		item.selected = true;

		//select same stroke color
		app.executeMenuCommand("Find Stroke Color menu item");

		//remove all selected items
		for(var a=docRef.selection.length-1;a>-1;a--)
		{
			docRef.selection[a].remove();
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

	valid = removeBlockLayer();

	if(valid)
		valid = exterminateDefault();

	if(valid)
		valid = fixFloSwatches();

	if(valid && checkSew())
		valid = removeSewLines();

	alert(valid);



	////////End/////////
	///Function Calls///
	////////////////////

	/*****************************************************************************/

}
container();