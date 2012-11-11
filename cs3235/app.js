


var CS3235App = Ember.Application.create({

	ready: function(){

		//console.log("Application Initialized");
		CS3235App.viewStateContent.transitionTo('start');
	},
	
});





CS3235App.Server = Ember.View.create({
  templateName: 'server',

  alertvalue: null,
  alert: false,

  serverNameToCreate: null,


  didInsertElement: function(){
      CS3235App.actions.server();
  }
});



CS3235App.Client= Ember.View.create({
  templateName: 'client',

  alertvalue: null,
  alert: false,
  

  didInsertElement: function(){
      CS3235App.actions.client();
  }  
})


CS3235App.Start= Ember.View.create({
  templateName: 'start',
})


CS3235App.viewStateContent =  Ember.StateManager.create({
    rootElement: '#content',  
   
    start: Ember.ViewState.create({
        view: CS3235App.Start
    }),
    client: Ember.ViewState.create({
        view: CS3235App.Client
    }),  

    server: Ember.ViewState.create({
        view: CS3235App.Server
    })    		
  
})
//Start the App








CS3235App.controls = Ember.Object.create({

	loginStart: function(){
		CS3235App.viewStateContent.transitionTo('start');
	},
	loginServer: function(){
		CS3235App.viewStateContent.transitionTo('server');

	},
	loginClient: function(){
		CS3235App.viewStateContent.transitionTo('client');
	},

	serviceCreate: function(){
		var name = $("#newService").attr("value");
		$("#newService").attr("value", "")

		if(name){

			if (CS3235App.serviceArr.findService(name) >= 0){
				CS3235App.Server.set("alertvalue", name + " Exists!");

			}else{
				var currentTime = new Date().getTime();
				var service = new Service(name, sha256_digest(currentTime+currentTime));

				CS3235App.serviceArr.addService(service, service.ServiceName);
				CS3235App.Server.set("alertvalue", service.ServiceName + " Created");

			}
		}
	},

	deviceCreate: function(){
		var name = $("#newDevice").attr("value");
		$("#newDevice").attr("value", "")

		if (name){
			if (CS3235App.deviceArr.findDevice(name) >= 0){
				CS3235App.Server.set("alertvalue", name + " Exists!");
			}else{
				var currentTime = new Date().getTime();
				var device = new Device(name)

				CS3235App.deviceArr.addDevice(device, device.DeviceName);
				CS3235App.Server.set("alertvalueDevice", device.DeviceName+ " Created");
			}
		}
	},



	setupProcess:function(){
		var seed = null
		var canvas = $("#setupProcess").siblings(".update-canvas");
		canvas.html("---");

		var serviceName = $("#serviceList option:selected").text();
		canvas.append("<br />Service Selected: " + serviceName);


		var deviceName = $("#deviceList option:selected").text();
		canvas.append("<br />Device Selected: " + deviceName);

		var service = CS3235App.serviceArr.getService(serviceName);
		var device = CS3235App.deviceArr.getDevice(deviceName);

		var user = $("#SAUser").val();
		//var pass = $("#SAPass").val();


		var result = "";
		if(service != -1 && device != -1){
			canvas.append("<br />Generating Random Seed for Account: "+ user)
			seed = service.GenerateRandomSeed(user).split(",");

			canvas.append("<br />"+device.AddService(service.ServiceName, seed[0]));
			canvas.append("<br />"+service.PairDevice(user, device.DeviceName, seed[0], seed[1]));

		}
		canvas.append("<br />End.<br/>----<br />")
	},




	authProcess: function(){
		

		var deviceName = []
		var devices = []
		var oneTimePass = []




		var canvas = $("#authProcess").siblings(".update-canvas")
		canvas.html("---")

		var serviceName = $("#auth-serviceList option:selected").text()
		canvas.append("<br />Service Selected: " + serviceName)

		$("#auth-deviceList option:selected").each(function(){
			deviceName.push($(this).text())
			canvas.append("<br />Device Selected: " + $(this).text())
		});



		var user = $("#auth-SAUser").val(); 
		var pass = $("#auth-SAPass").val();
		var count = $("#auth-minDevCount").val()
		var service = CS3235App.serviceArr.getService(serviceName)





		if(service != -1 && user){

			var devCountMsg = service.SetMinimumDeviceCount(user, count);
			canvas.append("<br />" + devCountMsg);

			if (devCountMsg.substring(0,5) != 'Error'){


				canvas.append("<br />User Selected: " + user)

				for (i = 0; i < deviceName.length; i++){
			
					var item = CS3235App.deviceArr.getDevice(deviceName[i])
				
					if (item != -1){
						oneTimePass.push(item.GetServicePasscode(service.ServiceName))
						canvas.append("<br />One Time Password Generated using: \"" + item.DeviceName + "\"")
					}
				}


				if (oneTimePass.length == deviceName.length  && pass && count){

					
					
					var rs = service.Authenticate(user, pass, oneTimePass)
					if(rs){
						canvas.append("<br />" + rs)
					}else{
						canvas.append("<br />Oops...An error has occurred")
					}
					
				
				}
			}
		} else {
			canvas.append("<br />Error: Could not get service and/or user")
		}
		canvas.append("<br />End.<br />----<br />")

	},


})












CS3235App.serviceArr = Ember.ArrayProxy.create({
	content: [],
	nameIdx: [],

	addService: function(value, id){
		this.content.pushObject(value);
		this.nameIdx.pushObject(id);
	},

	findService: function(name){
    	return $.inArray(name, this.nameIdx);
	},
	getService: function(name){
		var idx = this.findService(name)
		if(idx >= 0)
			return this.content[idx];
		else
			return -1

	}



})


CS3235App.deviceArr = Ember.ArrayProxy.create({
	content: [],
	nameIdx: [],


	addDevice: function(value, id){
		this.content.pushObject(value);
		this.nameIdx.pushObject(id);
	},

	findDevice: function(name){
    	return $.inArray(name, this.nameIdx);
	},
	getDevice: function(name){
		var idx = this.findDevice(name)
		if(idx >= 0)
			return this.content[idx];
		else
			return -1
	}
})



CS3235App.addServiceAccount = Ember.View.extend({
  	classNames: ['btn btn-primary'],
  	tagName: 'button',

  	click: function () {
      	var me = $("#"+this.get("elementId"));
		var user = me.siblings(".user").attr("value");
		var pass = me.siblings(".pass").attr("value");
		$(".user, .pass").attr("value", "");

		var idx = CS3235App.serviceArr.findService(this.value.ServiceName);
		if (idx >= 0 && user){
			var res = CS3235App.serviceArr.content[idx].CreateServiceAccount(user, pass)
			CS3235App.Server.set("alertvalue", res);

			var content = CS3235App.actions.addServiceAccount(idx)
			me.siblings(".userlist").html(content)
		}
  	}
});


CS3235App.addDeviceAccount = Ember.View.extend({
	classNames: ['btn btn-primary'],
	tagName: 'button',

	click: function(){
		var me = $("#"+this.get("elementId"));
		//console.log(me)
	}
})



CS3235App.actions = Ember.Object.create({

	server: function(){

		//console.log(CS3235App.serviceArr.get('content'))
		this.generateServiceAccount();


	},
	generateServiceAccount: function(){
		var store = CS3235App.serviceArr.get("nameIdx");
		for (i = 0; i < store.length; i++){
			var content = this.addServiceAccount(i);

			var me = $(".name").filter(function() {
        			return $(this).text() == store[i];
    			})

			me.siblings(".userlist").html(content)
		}

	}, 

	addServiceAccount: function(idx){
			//console.log(idx);
			var content = "<table class=\"table table-bordered\">";
			for (item in CS3235App.serviceArr.content[idx].Users){
				var curr = CS3235App.serviceArr.content[idx].Users[item];

				content += "<tr>"
					content+= "<td>"+item+"</td>"
					content+="<td class=\"dlist\"><div class=\"span3\">"
						content+="<h5>Device List</h5><ol>";
						//console.log(curr.Devices)
						for(dev in curr.Devices){
							content+="<li>"+dev+"</li>";
						}
						content+="</ol>";
					content+="</div></td>"
				content+="</tr>"
			}
			content+="</table>"
			return content;

	},
	




	device: function(){
	


	},


	client: function(){

	},




})


































