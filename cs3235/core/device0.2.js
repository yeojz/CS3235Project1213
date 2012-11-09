/*
 *	Device object javascript.
 *
 */
var Device = (function(deviceName){
/*
 *	createDevice
 *
 *	Creates a wearable device with a deviceName and a masterPassword. Note that the
 *	masterPassword will be converted to a hashed value in this function using SHA256.
 */
 
this.DeviceName = deviceName;
this.Services = new Object();
this.Active = true;
 

 

/*
 *	SetDeviceActive
 *
 *	Set the device to active/inactive. In inactive mode, it will not respond to 
 *	request for passcode.
 */
this.SetDeviceActive = function(active){
	if (active == true){
		this.Active = true
		return "Set device to active."
	} else if (active == false){
		this.Active = false;
		return "Set device to inactive.";
	} else
		return "Please use either true or false..";
};




/*
 *	AddService
 *
 *	Add a service to a selected device. The randomSeed is provided by the service provider.
 */
this.AddService = function(serviceName, randomSeed){	
	//	Check if service already exist
	if (this.Services[serviceName])
		return "Ehm, " + this.DeviceName + " already contains an entry for " + serviceName;
	
	this.Services[serviceName] = randomSeed
	return "Tata! " + this.DeviceName + " now acts as a MFA device for " + serviceName;
};




/*
 *	DeleteService
 *
 *	Deletes a service to a selected device.
 */
this.DeleteService = function(serviceName){	
	//	Check if service exist
	if (!this.Services[serviceName])
		return "What? " + this.DeviceName + " does not contains any entry for " + serviceName;
		
	delete this.Services[serviceName] ;
	return this.DeviceName + " not longer acts as a MFA device for " + serviceName;
};




/*
 *	GetServicePasscode
 *
 *	Computes and return the passcode of a selected service on a selected device.
 *	The one-time passcode is generated based on the hashed value of the sum of the
 *	randomSeed and current time = (time since 1 Jan 1970)/(60000 milliseconds).
 *	Thus, the one-time passcode changes every 60 seconds.
 */
this.GetServicePasscode = function(serviceName){	
	//	Check if service exist
	if (!this.Services[serviceName])
		return "What? " + this.DeviceName + " does not contains any entry for " + serviceName;
		
	//	Check if device is active
	if (this.Active == false)
		return "I'm sorry but the device is set to inactive. Please set it to active..";
	
	return sha256_digest(this.Services[serviceName] + parseInt(new Date().getTime()/60000));
};



});