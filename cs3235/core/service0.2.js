/*
 *	Service object javascript.
 *	Note that user's passwords are not included in all methods except "authenticate"
 *	as the prototype is only meant for demonstration purposes. This is because
 *	authentication becomes more complex since users now have MFA as well. The "authenticate"
 *	method is used to facilitate the demonstration.
 */

var Service = (function(serviceName, masterSeed){


this.MasterSeed = masterSeed;
this.ServiceName = serviceName;
this.Cert = serviceName + ".com";
this.Users = new Object();




/*
 *	CreateServiceAccount
 *
 *	Creates user account for a selected service. The user account includes basic user 
 *	information as well as the new information required for the new protocol.
 */
this.CreateServiceAccount = function(userid, password){
	//	Check if username is not empty
	if (userid.length == 0)
		return "A account must have a userid..";
		
	//	Check if username already exist
	if (this.Users[userid])
		return "Tough luck! The username is already in used.";
		
	//	Check if password is not empty
	if (password.length == 0)
		return "A account must have a password..";
	
	//	Success
	var user = new Object();
	user['HashedPassword'] = sha256_digest(password);
	user['MinimumDeviceCount'] = 0;
	user['Devices'] = new Object();
	user['DevicesCount'] = 0;	//	Extra attribute for easy counting of device size
	this.Users[userid] = user;
	
	return "Congratulations, " + userid + " can now use " + this.ServiceName + "!";
};





/*
 *	DeleteServiceAccount
 *
 *	Delete service user account to allow for input errors
 */
this.DeleteServiceAccount = function(userid){
	//	Check if user exist
	if (!Users[userid])
		return "Hmm, it seems like, " + userid + ", does not exist in " + ServiceName + "'s records (yet)!";
	
	//	Success
	delete Users[username];
	return "Done! R.I.P. " + userid + " of " + ServiceName + "..";
};





/*
 *	SetMinimumDeviceCount
 *
 *	Set the minimum factors (excluding password) required in MFA. Password is not used 
 *	to reduce complexity of the demonstration.
 */
this.SetMinimumDeviceCount = function(userid, minimumDeviceCount){
	//	Check if user exist
	if (!this.Users[userid])
		return "Error: Hmm, it seems like, " + userid + ", does not exist in " + this.ServiceName + "'s records (yet)!";
	
	//	Check if minimumDeviceCount is a number
	if (isNaN(minimumDeviceCount))
		return "Error: " + minimumDeviceCount + " is obviously not a number..";
		
	//	Check if minimumDeviceCount is non-negative
	if (parseInt(minimumDeviceCount) < 0)
		return "Error: " + minimumDeviceCount + " is negative.. (and it shouldn't)";
		
	//	Check if minimumDeviceCount is not more than user's devices count
	var myDevicesCount = this.Users[userid]['DevicesCount'];
	if (minimumDeviceCount > myDevicesCount)
		return "Error: " + minimumDeviceCount + "? But you only have " + myDevicesCount + " devices added..";
	
	//	Success
	this.Users[userid]['MinimumDeviceCount'] = parseInt(minimumDeviceCount);
	return userid + " will now require " + minimumDeviceCount + " devices to authenticate.";
};





/*
 *	Authenticate
 *
 *	Login method. Consists of the typical username, password, but also the passcodes of the
 *	user's devices. The passcode will be checked to ensure that at least "minimumDeviceCount"
 *	of them are valid to allow the user to login successfully. The [Hint] text is meant to
 *	demonstration why authenication has failed. oneTimePasscodes is an Array.
 *
 *	Note that the oneTimePasscodes changes every minute. Thus, authenication will probably fail
 *	if the minute changes while executing this function.
 */
this.Authenticate = function(userid, password, oneTimePasscodes){
	//	Check if user exist
	if (!this.Users[userid])
		return "Either the username or password or passcodes are invalid. [Hint... " + userid + " does not exist in " + this.ServiceName + "'s records...]";
		
	//	Check if user password matches
	if (this.Users[userid]['HashedPassword'] != sha256_digest(password))
		return "Either the username or password or passcodes are invalid. [Hint... " + "Your password is incorrect.";
		
	//	Check if user passcodes matches
	currentValidPasscodes = 0;
	usersPasscode = new Object();
	var minute =  parseInt(new Date().getTime()/60000);
	for (var dev in this.Users[userid]['Devices']){
		var curOneTimeP = sha256_digest(this.Users[userid]['Devices'][dev] + minute);
		if (usersPasscode[curOneTimeP])
			usersPasscode[curOneTimeP]++;
		else
			usersPasscode[curOneTimeP] = 1;
	}
	
	for (var pass in oneTimePasscodes){
		if (usersPasscode[oneTimePasscodes[pass]]){
			usersPasscode[oneTimePasscodes[pass]]--;
			if (usersPasscode[oneTimePasscodes[pass]] == 0)
				delete usersPasscode[oneTimePasscodes[pass]];
			currentValidPasscodes++;
		}
	}
	
	var required = this.Users[userid]['MinimumDeviceCount'];
	if (currentValidPasscodes < required)
		return "Either the username or password or passcodes are invalid. [Hint... " + "Only " + currentValidPasscodes + " is/are valid. Require " + required + "...";
	
	//	Success
	return "Its complicated... but you are logged in anyway!";
}






/*
 *	GenerateRandomSeed
 *
 *	Generate a randomSeed during initialisation phrase of device. The randomSeed is generated
 *	based on username, masterSeed and time. Returns in the form "randomSeed,time" for example
 *	"gniuwerhgiwerbgerbgbergliubergiujbverg,13546385435". Password is not used 
 *	to reduce complexity of the demonstration.
 */
this.GenerateRandomSeed = function(userid){
	//	Check if user exist
	if (!this.Users[userid])
		return userid + " does not exist in " + this.ServiceName + "'s records...";
		
	//	Success
	var currentTime = new Date().getTime();
	return sha256_digest(this.MasterSeed + userid + currentTime) + "," + currentTime;
}




/*
 *	PairDevice
 *
 *	Pairs the device with the user of a service. The time sent to user is sent back to ensure
 *	that the randomSeed given is the same one that the server provided. Password is not used 
 *	to reduce complexity of the demonstration.
 */
this.PairDevice = function(userid, deviceName, randomSeed, time){
	//	Check if user exist
	if (!this.Users[userid])
		return userid + " does not exist in " + this.ServiceName + "'s records...";
		
	//	Check if deviceName is already used by the user
	if (this.Users[userid]['Devices'][deviceName])
		return "Hmm, you are already using " + deviceName + " as a MFA device.";
		
	//	Check if randomSeed is generated from service
	if (sha256_digest(this.MasterSeed + userid + time) != randomSeed)
		return "The randomSeed you sent is not the same one as what " + this.ServiceName + " provide!";
	
	//	Success
	this.Users[userid]['Devices'][deviceName] = randomSeed;
	this.Users[userid]['DevicesCount']++;
	return deviceName + " can now be use as a MFA device for " + userid + " of " + this.ServiceName + "!!";	
}




/*
 *	DeleteDevice
 *
 *	Deletes the device from the user's devices of a service
 */
this.DeleteDevice = function(userid, deviceName){
	//	Check if user exist
	if (!this.Users[userid])
		return userid + " does not exist in " + this.ServiceName + "'s records...";
		
	//	Check if deviceName is in the user's records
	if (!this.Users[userid]['Devices'][deviceName])
		return "Hmm, it seems like " + deviceName + " is not added to " + userid + " of " + this.ServiceName + "...";
		
	//	Success
	delete this.Users[userid]['Devices'][deviceName];
	this.Users[userid]['DevicesCount']--;
	return deviceName + " not longer acts as a MFA device for " + this.ServiceName;
}




});