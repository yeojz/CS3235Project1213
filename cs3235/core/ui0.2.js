function AllInOne(){
	output = [];
	
	
	output.push("<br>=== Device: CreateDevice");
	var device = new Device("My watch");
	output.push("Created " + device.DeviceName);
	var device2 = new Device("My glasses");
	output.push("Created " + device2.DeviceName);
	
	output.push("<br>=== Service: CreateService");
	var service = new Service("Facebook","this is facebook's master seed");
	output.push("Created " + service.ServiceName);
	var service2 = new Device("DBS","this is DBS's master seed");
	output.push("Created " + service2.ServiceName);
	
	output.push("<br>=== Service: CreateServiceAccount");
	output.push(service.CreateServiceAccount("", "thehacker"));
	output.push(service.CreateServiceAccount("harry", ""));
	output.push(service.CreateServiceAccount("harry", "thehacker"));
	output.push(service.CreateServiceAccount("harry", "thehacker"));
	
	output.push("<br>=== Service: GenerateRandomSeed");
	output.push(service.GenerateRandomSeed("harry wrong"));
	seedtime = service.GenerateRandomSeed("harry").split(",")
	output.push("Generated seedtime, "+seedtime[0]+","+seedtime[1]+".");

	//	Browser enforce only Facebook can request to add itself	
	output.push("<br>=== Device: AddService");
	output.push(device.AddService("Facebook", seedtime[0]));
	output.push(device.AddService("Facebook", seedtime[0]));

	output.push("<br>=== Service: PairDevice");
	output.push(service.PairDevice("harry wrong", device.DeviceName, seedtime[0], seedtime[1]));
	output.push(service.PairDevice("harry", device.DeviceName, seedtime[0]+" wrong", seedtime[1]));
	output.push(service.PairDevice("harry", device.DeviceName, seedtime[0], seedtime[1]));
	output.push(service.PairDevice("harry", device.DeviceName, seedtime[0], seedtime[1]));
	
	output.push("<br>=== Service: DeleteDevice");
	output.push(service.DeleteDevice("harry wrong", device.DeviceName));
	output.push(service.DeleteDevice("harry", device.DeviceName + " wrong"));
	output.push(service.DeleteDevice("harry", device.DeviceName));
	output.push(service.PairDevice("harry", device.DeviceName, seedtime[0], seedtime[1]));
	
	output.push("<br>=== Device: DeleteService");
	output.push(device.DeleteService("Facebook wrong"));
	output.push(device.DeleteService("Facebook"));
	output.push(device.AddService("Facebook",seedtime[0]));
	
	output.push("<br>=== Service: GenerateRandomSeed [Second device]");
	seedtime2 = service.GenerateRandomSeed("harry").split(",")
	output.push("Generated seedtime2, "+seedtime2[0]+","+seedtime2[1]+".");
	
	output.push("<br>=== Device: AddService [Second device]");
	output.push(device2.AddService("Facebook", seedtime2[0]));

	output.push("<br>=== Service: PairDevice [Second device]");
	output.push(service.PairDevice("harry", device2.DeviceName, seedtime2[0], seedtime2[1]));
	
	output.push("<br>=== Service: SetMinimumDeviceCount");
	output.push(service.SetMinimumDeviceCount("harry wrong", 0));
	output.push(service.SetMinimumDeviceCount("harry", 0));
	output.push(service.SetMinimumDeviceCount("harry", "Not a number"));
	output.push(service.SetMinimumDeviceCount("harry", -1));
	output.push(service.SetMinimumDeviceCount("harry", 99999));
	output.push(service.SetMinimumDeviceCount("harry", 2));
	
	output.push("<br>=== Device: SetDeviceActive");
	output.push(device.SetDeviceActive(false));
	output.push(device.GetServicePasscode("Facebook"));
	output.push(device.SetDeviceActive(true));
	
	output.push("<br>=== Device: GetServicePasscode");
	output.push(device.GetServicePasscode("Facebook wrong"));
	oneTimePasscodes = [];
	oneTimePasscodes.push(device.GetServicePasscode("Facebook"))
	
	output.push("<br>=== Service: Authenticate [1/2 device]");
	output.push(service.Authenticate("harry", "thehacker", oneTimePasscodes));
	
	output.push("<br>=== Service: Authenticate [2/2 device]");
	oneTimePasscodes.push(device2.GetServicePasscode("Facebook"))
	output.push(service.Authenticate("harry", "thehacker", oneTimePasscodes));
	
	document.getElementById('allInOne').innerHTML = output.join("<br>");
}	
