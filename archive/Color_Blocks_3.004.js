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

	Version 3.004
		14 September, 2016
		Added getDocInks function.
		Added error handling and sendErrors function to the flow of control

*/

function container()
{

	/*****************************************************************************/

	///////Begin/////////
	///Logic Container///
	/////////////////////

	//sendErrors Function Description
	//upon script failure, populate array of errors and display to user
	//exit script
	sendErrors(errorList)
	{
		alert("The following errors occured:\n" + errorList.join('\n'));
		return;
	}

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

		try
		{
			swatches["SEW LINE"].remove();
		}
		catch(e)
		{
			errorList.push("System: " + e);
			errorList.push("Failed while removing the Sew Line");
		}

		return true;
	}



	//getDocInks Function Description
	//generate the document's 'printable' inkList and return an array of swatchNames
	function getDocInks()
	{
		var inkList = docRef.inkList;
		var approvedColors = [];
		var undesirable = [];
		var localValid = true;

		for(var ink=0;ink<inkList.length;ink++)
		{
			isPrintable(inkList[ink]);
		}

		//check if current ink is printable
		function isPrintable(swatch)
		{
			if(swatch.inkInfo.printingStatus = InkPrintStatus.ENABLEINK)
				isApproved(swatch);
		}

		//check if current printable ink is an approved color
		//push to correct array accordingly
		function isApproved(swatch)
		{
			var approved = false;
			for(var ac=0;ac<library.approvedColors.length;ac++)
			{
				if(swatch.name == library.approvedColors[ac])
				{
					approvedColors.push(swatch.name);
					approved = true;
					break;
				}
			}
			if(!approved)
			{
				undesirable.push(swatch.name);
			}
		}

		if(undesirable.length > 0)
		{
			wrongColors = undesirable;
			localValid = false;
		}
		if(approvedColors.length == 0)
		{
			errorList.push("Hmm.. There were no colors found in your document...?\nMake sure you have run the 'Add_Artboards.jsx' script first.")
			localValid = false;
		}
		else
		{
			docInks = approvedColors;
		}

		return localValid;
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
		approvedColors : ['Black B','White B','Gray B','Gray 2 B','Steel B','Navy B','Navy 2 B','Royal Blue B','Columbia B','Teal B','Dark Green B','Kelly Green B','Lime Green B','Optic Yellow B','Yellow B','Athletic Gold B','Vegas Gold B','Orange B','Texas Orange B','Red B','Cardinal B','Maroon B','Hot Pink B','Pink B','Soft Pink B','Purple B','Flesh B','Dark Flesh B','Brown B','Cyan B','FLO ORANGE B','FLO YELLOW B','FLO PINK B','Twitch B','MINT B','Magenta B','NEON CORAL B','FLAME B','BRIGHT PURPLE B','Dark Charcoal B','Info B','Jock Tag B','Thru-cut','Cut Line','Cutline','Jrock Charcoal','Feeney Purple B','Feeney Orange B','Feeney Orange Body B','Tailgater Gold B','Thru-cut','Cut Line','Info B','Jock Tag B']

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
	var errorList = [];

	var valid;

	valid = removeBlockLayer();

	if(valid)
		valid = exterminateDefault();
	else
	{
		sendErrors(errorList);
		valid = false;
		return;
	}

	if(valid)
		valid = fixFloSwatches();
	else
	{
		sendErrors(errorList);
		valid = false;
		return;
	}

	if(valid && checkSew())
		valid = removeSewLines();
	else
	{
		sendErrors(errorList);
		valid = false;
		return;
	}

	if(valid)
	{
		var docInks = [];
		var wrongColors = [];
		valid = getDocInks();
	}
	else
	{
		sendErrors(errorList);
		valid = false;
		return;
	}

	if(valid)
	{
		//place color blocks on each artboard
	}
	else if(!valid && wrongColors.length > 0)
	{
		errorList.push("Your document has the following incorrect colors:\n" + wrongColors.join('\n'));
		sendErrors(errorList);
		//include scriptUI to override and continue
	}



	alert(valid);



	////////End/////////
	///Function Calls///
	////////////////////

	/*****************************************************************************/

}
container();