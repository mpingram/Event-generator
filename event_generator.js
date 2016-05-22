var moment = require('moment');



var EventGenerator = function(){
	
	// pools
	// ---------------------
	this.firstNamePool = ['Richard', 'Flingus','Sid','Ebenezer', 'Rocky', 'Dontae', 'Margarette', 'Robin', 'Willow', 'Ola', 'Bonnie', 'Nicole', 'Diana', 'Dianna', 'Diananana', 'Michael', 'Jareth'];
	
	this.lastNamePool = ['Nye', 'Hatfield', 'Herring', 'Ingram', 'Lee', 'Li', 'Heaton', 'Cohen', 'Tomlinson', 'Brenner', 'Butler', 'King', 'Morris', 'Bungleton', 'Powerhat', 'Dolphin', 'the Goblin King', 'Goethe', 'Yang', 'Brown', 'Foghorn', 'Colton', 'Dongus'];
	
	this.eventTitlePool = ['Rap', 'Classical Music', 'Sting and the Police', 'Baby', 'Pillow', 'Chromolithograph', 'Men', 'Bath', 'German', 'Grasshopper', 'Peer-to-Peer', 'Forestry', 'Paramedic', 'Hot Doctor', 'Jellyfish', 'Angry Bears', 'Intersectionality', 'Shirt', 'Astronaut', 'Duck', 'Fashion', 'Gentrification', 'Yoga', 'Dance', 'Balloon'];
	
	this.eventSubtitlePool = ['Conference', 'Discussion', 'Lecture', 'Meeting', 'Round Table', 'Viewing', 'Competition', 'Battle', ': an Exploration', 'and the Sorcerer\'s Stone', 'Class', 'Intervention', '-splaining', 'Brunch', 'Coast to Coast', 'Meditation', 'Fight', 'Teleconference', 'Reading', 'Punching', 'Dissection', 'Marathon'];
	
	this.roomPool = ['EI', 'EII', 'EIII','EIV', 'WIa', 'WIb', 'WII', 'WIII', 'WIV', 'Lobby', 'Library', '120', '129'];
	
	this.eventTypePool = ['Class', 'Meeting', 'Internal Event', 'External Event'];
	
	this.roomSetupPool = ['U-shape', 'Hollow Square', 'Classroom', 'Lecture', 'Default'];	

	// keeps track of which rooms are in use for each timeslot.
	this.usedRooms = [];
};

EventGenerator.prototype.chooseOne = function(arr){
	// choose one element from array
	
	try {
		return arr[ (Math.random()*arr.length | 0) ];
	} catch (e) {
		console.log(arr);
		console.log(e);
	}	
};

EventGenerator.prototype.randBool = function(weight){
	// returns boolean with weighted probability,
	// with 1 being 10% chance of True and
	// 10 (or above) being 100% chance of True.
	// Accepts floats.
	
	weight = weight || 5;
	var rand = Math.random() + weight/10;
	if (rand>1){
		return true;
	} else {
		return false;
	}
};

EventGenerator.prototype.genEmail = function(name){
	// generates email from name formatted as "Lastname, Firstname".
	try { 
		name = name.split(', ').reverse();
		// first initial
		name[0] = name[0].slice(0,1);
		return name.join('.').split(' ').join('-').toLowerCase() + '@wombo.com';
	}
	catch (e) {
		console.log(e);
		throw 'Exception due to ' + name;
	}
};

EventGenerator.prototype.genName = function(type){
	// generates names of people or events
	// by randomly combining name pools.
	
	type = type || 'person';
	
	
	if (type === 'person'){
		var firstname = this.chooseOne(this.firstNamePool);
		var lastname = this.chooseOne(this.lastNamePool);
		
		return lastname + ', ' + firstname;
		
	} else if (type === 'event'){
		var title = this.chooseOne(this.eventTitlePool);
		var subtitle = this.chooseOne(this.eventSubtitlePool);
		
		return title + ' ' + subtitle;
		
	} else {
		throw 'Wrong parameter \n@ EventGenerator.prototype.getName(type)';
	}
};


EventGenerator.prototype.genRoomObject = function(start, end){
	
	var that = this;
	var roomObject = [];

	var numRooms;
	this.randBool(1) ? numRooms = 2 : numRooms = 1;


	for (var i=0; i<numRooms; i++){
		var thisRoomObj;
		var room;

		// randomly assign room and make sure it hasn't already been used
		// DEBUG: I got rid of the 'randomly'
		//do {
			room = this.chooseOne(this.roomPool);
		// if room is in usedRooms, do again
		//} while (this.usedRooms.indexOf(room) !== -1);
		
		thisRoomObj = {
				room: 					room,
				start: 					start.format('X'),
				end: 					end.format('X'),
				numAttending: 			Math.random()*100 | 0,
				approver:				that.genName(),
				roomSetup: 				that.chooseOne(that.roomSetupPool)
		};

		// add room to usedRooms, it's been compromised
		this.usedRooms.push(room);
		roomObject.push(thisRoomObj);
	}

	return roomObject;	
};

// TODO: check against data client is expecting
EventGenerator.prototype.generateOne = function(start, end){

	var e = {};

	e.eventName = 			this.genName('event');
	e.eventType = 			this.chooseOne(this.eventTypePool);
	e.repeating = 			this.randBool(7);
	e.organizer = 			this.genName();
	e.organizerEmail = 		this.genEmail(e.organizer);
	e.creator = 			this.genName();
	e.creatorEmail = 		this.genEmail(e.creator);

	
	e.roomObject = 			this.genRoomObject(start, end);

	// checking for multiple rooms
	if (e.roomObject.length > 1){
		e.multiroom = true;
	} else {
		e.multiroom = false;
	}
	return e;
};


EventGenerator.prototype.generateTimeSlot = function(start, end){

	var timeSlot = [];

	for (var i=0; i<this.roomPool.length-2; i++){

		timeSlot.push(this.generateOne(start, end));

	}

	return timeSlot;
};


EventGenerator.prototype.run = function(startDate, endDate) {
	// TODO: implement check against used rooms for each timeslot.
	// Main entry point for program.
	// ============================

	var output = [];
	
	// for each day between startDate and endDate
	for (var i = startDate; i <= endDate ; i.add(1, 'days') ){

		// morning timeslot
		var morningStart 	= i.hours(9);
		var morningEnd 		= i.hours(12);
		output = output.concat(this.generateTimeSlot(morningStart, morningEnd));

		// afternoon timeslot
		var eveningStart 	= i.hour(1);
		var eveningEnd 		= i.hour(5);
		output = output.concat(this.generateTimeSlot(eveningStart, eveningEnd));

	}
	
	console.log(output);
	return output;
};




module.exports = EventGenerator;

	

