//initializing zoho assist app
$(document).ready( function() {
    app.initialized().then(
        function(client) {
            ScheduleUtil.scheduleObj   =   new ScheduleObj(client);
        }
    );
});

var  ScheduleUtil  =   {

	showPreloaderComponent 	: 	function(){
		$("#content").html("<div class=\"preloader\"></div>");
	},

	//edit schedule session

	getAvailableTimezones   :   function(){
        var availableTimezone      =   moment.tz.names();
        
        var list_of_timezones       =   [];
        
        for(var timezone in availableTimezone){
            
            var  timezone_obj       =   {
                timezone    :   availableTimezone[timezone],
                full_text_timezone  :   ScheduleUtil.getGMTOffsetFullText(availableTimezone[timezone])
            };
            
            list_of_timezones.push(timezone_obj);
        }

        return list_of_timezones;
    },

    getGMTOffset 			: 	function(timezone){

	    var minutes     =   moment.tz(timezone).utcOffset();

	    var temp_min    =   minutes;
	    if(temp_min     <   0){
	        temp_min    =   -temp_min;
	    }

	    var hour    =   temp_min/60;
	    hour        =   Math.floor(hour);
	    var seconds =   temp_min - (hour*60);
	    if((""+hour).length === 1){
	        hour    =  "0"+hour;
	    }
	    if((""+seconds).length === 1){
	        seconds    =  "0"+seconds;
	    }

	    if(minutes > 0){
	        return "+"+hour+":"+seconds;
	    }else{
	        return "-"+hour+":"+seconds;
	    }

	},

    getGMTOffsetFullText    :   function(timezone){
        
        var offset  =   ScheduleUtil.getGMTOffset(timezone);
        
        return "(GMT"+offset+") "+ timezone;
    },

    getNearestMinutes 		: 	function(timezone){
	    var mom_obj     =    moment.tz(timezone); 
	    
	    var minutes     =    mom_obj.add(5,'minutes').minutes();
	    
	    if(minutes > 0 && minutes <15){
	    
	        mom_obj.set('minute',15);
	    
	    }else if(minutes > 15 && minutes <30){
	    
	        mom_obj.set('minute',30);
	    
	    }else if(minutes > 30 && minutes <45){
	    
	        mom_obj.set('minute',45);
	    
	    }else if(minutes > 45){
	    
	        mom_obj.add(60-minutes,'minutes');
	    
	    }

	    return mom_obj;
	},

	convertTimestamp 	: 	function(timestamp) {
	    
	    var date 		= 	new Date(Number(timestamp));

	    var dd 			= 	date.getDate();

	    var month_list  =   ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

	    var month   	=   month_list[date.getMonth()];
	    
	    var yyyy 		= 	date.getFullYear();
	    
	    if(dd<10){
	        dd='0'+dd;
	    } 

	    var hours 		= 	date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
	    var am_pm 		= 	date.getHours() >= 12 ? "PM" : "AM";
	    hours 			= 	hours < 10 ? "0" + hours : hours;
	    
	    var minutes 	= 	date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	    
	    var time 		= 	hours + ":" + minutes + " " + am_pm;

	    return month +" "+dd+", "+yyyy+" "+time;
	
	},

	filterAvailableTimezones 	: 	function(search_str){

		var 	available_timezone 	= 	ScheduleUtil.getAvailableTimezones();

		//err case
		if(search_str 	=== 	null 	|| 	search_str === undefined || search_str === ''){
			return ScheduleUtil.getAvailableTimezones();
		}

        var filtered_timezones 	= 	[];
        
        for(var timezone in available_timezone){
            
            if(available_timezone[timezone].timezone.toLowerCase().includes(search_str.toLowerCase())){
        
                filtered_timezones.push(available_timezone[timezone]);
        
            }
        
        }

        return 	filtered_timezones;
	
	},

	showScheduleMainContainer    :   function(customer_email,ticket_subject,ticket_desc,timezone,display_moment,remainder,datepicker_callback){
        var source      =   $("#schedule_main_template").html();
        var template    =   Handlebars.compile(source);

        var context 	= 	{
        	customer_email 		: 	customer_email,
        	ticket_subject 		: 	ticket_subject,
        	ticket_description 	: 	ticket_desc,
        	timezone 			: 	timezone,
        	display_date 		: 	display_moment.format('MMM DD, YYYY'),
        	display_time 		: 	display_moment.format('h:mm A z'),
        	remainder 			: 	remainder
        };

        $("#content").html(template(context));

        ScheduleUtil.initDatePicker(timezone,datepicker_callback);
    },

    initDatePicker  			:	function(selected_timezone,callback){

		$('#schedule_date_id').daterangepicker({
			minDate             :   ScheduleUtil.getNearestMinutes(selected_timezone),
	        maxDate             :   moment.tz(selected_timezone).add(1,'year'),
	        singleDatePicker    :   true,
	        drops 				: 	"up",
	        timeZone            :   selected_timezone
		}, callback);

	},

	//End of the edit schedule session

	showScheduleSessionDetailsContainer    :   function(schedule_list , show_load_more){
        var source                      =   $("#schedule_session_list_component").html();
        var template                    =   Handlebars.compile(source);
        var get_schedule_session_html   =   template(schedule_list);

        //show more 
        var show_more_param     =   {
            show_load_more      :   show_load_more
        };
        var load_more_source            =   $("#schedule_load_more_component").html();
        var load_more_template          =   Handlebars.compile(load_more_source);
        var load_more_html              =   load_more_template(show_more_param);


        $("#content").html(get_schedule_session_html+load_more_html);
    },

    showNoScheduleSessionContainer(){

        $("#content").html($("#no_schedule_session_component").html());

    },

    showSuccessMessageContainer(message){

        $('#top_success_message').show();

        $('#top_success_message').html(message);

        setTimeout(function(){
            ScheduleUtil.hideSuccessMessageContainer();
        },3000);
    
    },

    hideSuccessMessageContainer(){

        $('#top_success_message').html('');

        $('#top_success_message').hide();
    
    },

    showErrorMessageContainer(message){

        $('#top_error_message').show();

        $('#top_error_message').html(message);

        setTimeout(function(){
            ScheduleUtil.hideErrorMessageContainer();
        },3000);
    
    },

    hideErrorMessageContainer(){

        $('#top_error_message').html('');

        $('#top_error_message').hide();
    
    }

};


function ScheduleObj(client){

	//assist details
    this.app_identity    =   "79202e7e27a30660111edd8d6a56d710119474a5";
    this.server          =   "https://assist.zoho.";
    this.domain          =   "com";
    this.iframe_url      =   "/assist-integration?app_identity="+this.app_identity;
    this.user_details    =   null;
    this.user_role       =   null;
    this.license_details =   null;
    this.app_detail      =   null;
    this.session_type    =   "rs";
    this.signed_in       =   false;


    //freshdesk details
    this.ticket_detail   =   null;
    this.ticket_id       =   null;
    this.ticket_subject  =   null;
    this.ticket_desc 	 = 	 null;
    this.customer_detail =   null;
    this.customer_email  =   null;
    this.customer_name   =   null;
    this.fd_client       =   client;

    //schedule session details
    this.index 			= 	 0;

    //edit schedule session details
    this.schedule_id 					= 	-1;
    this.context_identity 				= 	null;
    this.selected_timezone				= 	moment.tz.guess();
    this.available_timezone				= 	ScheduleUtil.getAvailableTimezones();
    this.display_date					= 	null;
    this.remainder 						= 	0;
    this.remainder_text 				= 	'No remainder';
    this.show_available_timezone 		= 	false;
    this.show_remaining_time 			= 	false;
    this.show_remainder_time 			= 	false;

    //function binding classes
    this.setAssistServerURL             =   this.setAssistServerURL.bind(this);
    this.setAssistServerURLCallback     =   this.setAssistServerURLCallback.bind(this);

    this.setFDTicketDetails             =   this.setFDTicketDetails.bind(this);
    this.setFDTicketDetailsCallback     =   this.setFDTicketDetailsCallback.bind(this);

    this.setFDCustomerDetails           =   this.setFDCustomerDetails.bind(this);
    this.setFDCustomerDetailsCallback   =   this.setFDCustomerDetailsCallback.bind(this);

    this.handleBasicPostMessageCallback =   this.handleBasicPostMessageCallback.bind(this);

    this.schedule_list 					= 	[];

    this.getScheduleSession 			= 	 this.getScheduleSession.bind(this);
    this.getScheduleSessionCallback 	= 	 this.getScheduleSessionCallback.bind(this);
    this.getScheduleSessionDetails 		= 	 this.getScheduleSessionDetails.bind(this);
    this.getScheduleSessionDetailsCallback 	= 	 this.getScheduleSessionDetailsCallback.bind(this);

    this.updateScheduleSession 			=	 this.updateScheduleSession.bind(this);
    this.updateScheduleSessionCallback 	= 	 this.updateScheduleSessionCallback.bind(this);

    //edit schedule session
    this.switchAvailableTimezone 		=	 this.switchAvailableTimezone.bind(this);
    this.showAvailableTimeZones 		=	 this.showAvailableTimeZones.bind(this);
    this.hideAvailableTimeZones 		= 	 this.hideAvailableTimeZones.bind(this);
    this.filterAvailableTimezones 		= 	 this.filterAvailableTimezones.bind(this);
    this.selectCustomerEmail 			= 	 this.selectCustomerEmail.bind(this);
    this.selectTicketSubject 			= 	 this.selectTicketSubject.bind(this);
    this.selectTicketDescription 		= 	 this.selectTicketDescription.bind(this);
    this.selectDate 					= 	 this.selectDate.bind(this);
    this.showTime 	 					= 	 this.showTime.bind(this);
    this.selectTime 					= 	 this.selectTime.bind(this);
    this.showRemainingTimeContainer 	= 	 this.showRemainingTimeContainer.bind(this);
    this.hideRemainingTimeContainer 	= 	 this.hideRemainingTimeContainer.bind(this);
    this.selectRemainder 				= 	 this.selectRemainder.bind(this);
    this.showRemainders 				= 	 this.showRemainders.bind(this);
    this.showRemainderTimeContainer 	= 	 this.showRemainderTimeContainer.bind(this);
    this.hideRemainingTimeContainer 	=  	 this.hideRemainingTimeContainer.bind(this);

    this.showUpdateScheduleSession 		= 	 this.showUpdateScheduleSession.bind(this);
    this.hideUpdateScheduleSession 		= 	 this.hideUpdateScheduleSession.bind(this);

    this.getScheduleSessionObjById 		= 	 this.getScheduleSessionObjById.bind(this);
    this.getScheduleSessionFormat       =    this.getScheduleSessionFormat.bind(this);

    this.deleteScheduleSession 			= 	 this.deleteScheduleSession.bind(this);
    this.deleteScheduleSessionCallback 	= 	 this.deleteScheduleSessionCallback.bind(this);
    this.delete_schedule_id             =    -1;

    this.getNextScheduleSession         =    this.getNextScheduleSession.bind(this);
    this.get_schedule_session_scroll_top=    0;
    this.show_load_more                 =    false;
    this.after_update_call              =    false;

    this.afterUpdateCallback            =    this.afterUpdateCallback.bind(this);

    //init all variables by init
    this.init();

}


ScheduleObj.prototype.init = function(){

    //handling post messages
    window.addEventListener('message', this.handlePostMessageCommunication.bind(this), true);

    //setting basic varibales
    this.setAssistServerURL();

    this.setFDTicketDetails();

    this.setFDCustomerDetails();

    this.fd_client.instance.resize({ height: "500px" });

}

//Start of the Assist Server Setting

ScheduleObj.prototype.setAssistServerURL = function(){
    this.fd_client.iparams.get("domain").then(
        this.setAssistServerURLCallback,
        function(exc){
            //console.log(exc);
        });
}

ScheduleObj.prototype.setAssistServerURLCallback = function(data){

    if(data.domain      ===  	"EU"){
        this.domain    	=   	"eu";
    }

    //calling assist integration iframe
    this.server_url         =   this.server+this.domain;
    var     iframe_ele      =   document.getElementById("post_message_iframe");
    iframe_ele.src          =   this.server_url+this.iframe_url;

}

//End of the Assist Server Setting

//Start of the getting freshdesk ticket details

ScheduleObj.prototype.setFDTicketDetails = function(){
    this.fd_client.data.get("ticket").then(
        this.setFDTicketDetailsCallback,
        function(exc){
            // console.log(exc);
        });
}

ScheduleObj.prototype.setFDTicketDetailsCallback = function(data){

    this.ticket_detail      =       data.ticket;
    this.ticket_id          =       data.ticket.id;
    this.ticket_subject     =       data.ticket.subject;
    this.ticket_desc 		= 		data.ticket.description_text;

}

//End of the getting freshdesk ticket details

//Start of the getting freshdesk customer details

ScheduleObj.prototype.setFDCustomerDetails = function(){
    this.fd_client.data.get("requester").then(
        this.setFDCustomerDetailsCallback,
        function(exc){
            // console.log(exc);
        });
}

ScheduleObj.prototype.setFDCustomerDetailsCallback = function(data){
    this.customer_detail    =   data.requester;
    this.customer_email     =   data.requester.email;
    this.customer_name      =   data.requester.name;
}

//end of the getting freshdesk customer details

//edit schedule session
//handling show and hide methods

ScheduleObj.prototype.switchAvailableTimezone = function(){
	
	if(this.show_available_timezone){
		
		this.hideAvailableTimeZones();
	
	}else{
	
		this.showAvailableTimeZones();
	
	}

}

ScheduleObj.prototype.filterAvailableTimezones 	= 	function(){
	
	var input 					= 	$('#timezone_filter_input').val();
	
	this.available_timezone 	= 	ScheduleUtil.filterAvailableTimezones(input);

	this.showAvailableTimeZones();
	
}

ScheduleObj.prototype.showAvailableTimeZones 	= 	function(){

	this.show_available_timezone   =   true;
    
    var source   =  $("#available_timezone_component").html();
    
    var template =  Handlebars.compile(source);
    
    var html     =  template(this.available_timezone);

    $("#available_timezone_with_filter").show();
    
    $("#available_timezone").html(html);
}

ScheduleObj.prototype.hideAvailableTimeZones 	= 	function(){
    
    this.show_available_timezone   	=   false;

    this.available_timezone 		= 	ScheduleUtil.getAvailableTimezones();
    
    $('#timezone_filter_input').val('');

    $("#available_timezone_with_filter").hide();

}

ScheduleObj.prototype.selectTimezone 	= 	function(timezone){

	this.show_available_timezone 	= 	false;
    
    this.selected_timezone   		=   timezone;

    this.display_date 				= 	ScheduleUtil.getNearestMinutes(timezone);

    this.available_timezone 		= 	ScheduleUtil.getAvailableTimezones();

    ScheduleUtil.showScheduleMainContainer(this.customer_email, this.ticket_subject, this.ticket_desc, this.selected_timezone, this.display_date, this.remainder_text , this.selectDate);

}

ScheduleObj.prototype.selectCustomerEmail 	= 	function(timezone){

	var value 						= 	$('#customer_email_id').val();

	this.customer_email 			= 	value;

}

ScheduleObj.prototype.selectTicketSubject 	= 	function(timezone){

	var value 						= 	$('#ticket_subject_id').val();

	this.ticket_subject 			= 	value;

}

ScheduleObj.prototype.selectTicketDescription 	= 	function(timezone){

	var value 						= 	$('#ticket_description_id').val();

	this.ticket_desc 				= 	value.substr(0,450);

}

ScheduleObj.prototype.selectDate 	= 	function(start,end){

	this.display_date 		= 		moment.tz(start.unix()*1000,this.selected_timezone);

	ScheduleUtil.showScheduleMainContainer(this.customer_email, this.ticket_subject, this.ticket_desc, this.selected_timezone, this.display_date, this.remainder_text , this.selectDate);

}

ScheduleObj.prototype.showTime 	= 	function() {

    var     time_now                 =       moment.tz(this.selected_timezone);

    if(time_now.date()  >  this.display_date.date()  
        && time_now.month()  >=  this.display_date.month()
        && time_now.year()  >=  this.display_date.year()){

        ScheduleUtil.showErrorMessageContainer('Schedule date is in past.');

        return;

    }

	if(this.show_remaining_time){
		this.hideRemainingTimeContainer();
		return;
	}

	var 	now 			= 		ScheduleUtil.getNearestMinutes(this.selected_timezone);

	var 	now_end_time 	= 		moment.tz(now.unix()*1000,this.selected_timezone).hours(23).minutes(59).seconds(59).unix()*1000;

	if(this.display_date.unix()*1000 > now_end_time){
			
			now 			= 		moment.tz(this.display_date.unix()*1000, this.selected_timezone);

			now.hours(0);

			now.minutes(0);

			now.seconds(0);
	
	}

	var next_date 			= 		moment.tz(now.unix()*1000, this.selected_timezone);

	next_date.add('days',1);

	next_date.hours(0);

	next_date.minutes(0);

	next_date.seconds(0);

	next_date 				= 		moment.tz(next_date.unix()*1000,this.selected_timezone);

	var diff_minutes 		= 		(next_date.diff(now,'minutes')+1)/15;

	var display_date_clone 	= 		moment.tz(now.unix()*1000,this.selected_timezone);

	var show_time_list 		= 		[];

	for(var i=0;i<diff_minutes-1;i++){
		
		display_date_clone.add(15,'minutes');
		
		show_time_list.push({
			timestamp 		: 	display_date_clone.unix()*1000,
			full_text_time 	:	display_date_clone.format('h:mm A z')
		});
	}

	this.showRemainingTimeContainer(show_time_list);

}

ScheduleObj.prototype.showRemainingTimeContainer 	=   function(show_time_list){

	this.show_remaining_time	= 	true;
    
    var source      			=   $("#time_list_component").html();
    var template    			=   Handlebars.compile(source);

    $("#available_time_filter").show();

    $("#available_time").html(template(show_time_list));

}

ScheduleObj.prototype.hideRemainingTimeContainer 	=   function(){

	this.show_remaining_time	= 	false;

    $("#available_time").html('');

    $("#available_time_filter").hide();

}

ScheduleObj.prototype.selectTime 	= 	function(timestamp) {

	this.display_date		= 	moment.tz(timestamp,this.selected_timezone);

	ScheduleUtil.showScheduleMainContainer(this.customer_email, this.ticket_subject, this.ticket_desc, this.selected_timezone, this.display_date, this.remainder_text , this.selectDate);

	this.show_remaining_time	= 	false;

}

ScheduleObj.prototype.showRemainders 	= 	function() {

	if(this.show_remainder_time){
		this.hideRemainderTimeContainer();
		return;
	}

	var 	now 				= 		moment.tz(this.selected_timezone);

    if(now.unix()   >=  this.display_date.unix()){

        ScheduleUtil.showErrorMessageContainer('Schedule time is in past.');

        return;
    }

	var minutes_diff 			= 		this.display_date.diff(now,'minutes');

	var hours_diff 				= 		this.display_date.diff(now,'hours');

	var day_diff 				= 		this.display_date.diff(now,'days');

	var show_remainder_list 	= 		[{
		minutes 				: 	0,
		full_text_remainder 	:	'No remainder'
	}];

	var remainder_minutes_arr 	= 		[5,10,15,30,45];

	for(var i in remainder_minutes_arr){
		if(minutes_diff > remainder_minutes_arr[i]){
			show_remainder_list.push(this.remianderList(remainder_minutes_arr[i],1,'minutes'));
		}
	}

	var remainder_hours_arr 	= 		[1,2,3,6,12];

	for(var i in remainder_hours_arr){
		if(hours_diff > remainder_hours_arr[i]){
			show_remainder_list.push(this.remianderList(remainder_hours_arr[i],60,'hours'));
		}
	}

	var remainder_day_arr 	= 		[1,2,3];

	for(var i in remainder_day_arr){
		if(day_diff > remainder_day_arr[i]){
			show_remainder_list.push(this.remianderList(remainder_day_arr[i],24*60,'days'));
		}
	}

	if(day_diff > 7){
		show_remainder_list.push(this.remianderList(1,7*24*60,'week'));
	}

	this.showRemainderTimeContainer(show_remainder_list);

}

ScheduleObj.prototype.remianderList 	= 	function(display_time, multiply_time,time_format){
	return {
		minutes 				: 	display_time*multiply_time,
		full_text_remainder 	:	display_time + ' ' + time_format + ' before'
	};
}

ScheduleObj.prototype.showRemainderTimeContainer 	=   function(show_time_list){

	this.show_remainder_time	= 	true;

	$("#available_remainder_filter").show();
    
    var source      			=   $("#remainder_list_component").html();
    var template    			=   Handlebars.compile(source);

    $("#available_remainders").html(template(show_time_list));

}

ScheduleObj.prototype.hideRemainderTimeContainer 	=   function(){

	this.show_remainder_time	= 	false;

    $("#available_remainders").html('');

    $("#available_remainder_filter").hide();

}

ScheduleObj.prototype.selectRemainder 	= 	function(minutes,remainder_text){

	this.remainder 		= 		minutes;

	this.remainder_text = 		remainder_text;

	this.show_remainder_time	= 	false;

	ScheduleUtil.showScheduleMainContainer(this.customer_email, this.ticket_subject, this.ticket_desc, this.selected_timezone, this.display_date, this.remainder_text , this.selectDate);

}

ScheduleObj.prototype.getScheduleSessionObjById 	= 	function(schedule_id){

	for(var i in this.schedule_list){
		if(this.schedule_list[i].schedule_id 	=== 	schedule_id){
			return this.schedule_list[i];
		}
	}

	return null;

}

ScheduleObj.prototype.showUpdateScheduleSession 	= 	function(schedule_id){

	this.schedule_id 		= 		schedule_id;
	
	ScheduleUtil.showPreloaderComponent();
	
	this.getScheduleSessionDetails();
}

ScheduleObj.prototype.hideUpdateScheduleSession 	= 	function(){

    this.schedule_id        =       -1;

	this.handleBasicPostMessageCallback();
}

//end of handling show and hide methods

//handling post message from assist
ScheduleObj.prototype.handlePostMessageCommunication = function(event){
    
    var response                    =   event.data;

    //assigning variables from post messages
    this.signed_in                  =   response.signedIn;

    if(!this.signed_in){
        return;
    }

    this.user_details               =   response.user;
    
    this.license_details            =   this.user_details.remote_support_license;
    
    this.app_detail                 =   response.installed_app_detail;
    
    this.user_role                  =   response.user_role;

	if(response.get_schedule_session_list         !==     undefined){
    
        this.getScheduleSessionCallback(response.get_schedule_session_list);
    
    }else if(response.get_schedule_session_details         !==     undefined){
    
        this.getScheduleSessionDetailsCallback(response.get_schedule_session_details);
    
    }else if(response.update_schedule_session         !==     undefined){
    
        this.updateScheduleSessionCallback(response.update_schedule_session);
    
    }else if(response.delete_schedule_session         !==     undefined){
    
        this.deleteScheduleSessionCallback(response.delete_schedule_session);
    
    }else{

        this.handleBasicPostMessageCallback();

    }

}

ScheduleObj.prototype.getScheduleSession      =   function(){
    
    var data 		= 	{
        app_identity    :   this.app_identity,
        index 			: 	this.index,
        count 			: 	15

    };
    
    var schedule_session_details    =   {
        get_schedule_session_list    :    data
    };

    var iframeVar       =   document.getElementById("post_message_iframe");
    iframeVar.contentWindow.postMessage(schedule_session_details,'*');

}

ScheduleObj.prototype.getScheduleSessionCallback      =   function(response){
    if(response.success){

    	var current_schedule_list 		= 		response.success.representation;

        this.schedule_list              =       this.schedule_list.concat(current_schedule_list);

        //no-schedule-session
        if(this.schedule_list.length    <=      0){
            
            ScheduleUtil.showNoScheduleSessionContainer();

            return;
        }
    	
    	var 	formatted_schedule_list = 		this.getScheduleSessionFormat();

        this.show_load_more             =       current_schedule_list.length === 15

    	ScheduleUtil.showScheduleSessionDetailsContainer(formatted_schedule_list , this.show_load_more);

    }else{

    	this.fd_client.instance.close();

    }
}

ScheduleObj.prototype.getScheduleSessionFormat      =   function(){

    var     formatted_schedule_list =       [];

    for(var index   in  this.schedule_list){

        formatted_schedule_list.push({
            schedule_id         :   this.schedule_list[index].schedule_id,
            ticket_no           :   this.schedule_list[index].issue_id,
            ticket_title        :   this.schedule_list[index].context_title,
            schedule_time       :   moment.tz(Number(this.schedule_list[index].context_schedule_time),this.schedule_list[index].context_schedule_timezone).format('MMM DD,YYYY h:mm A z'),
            customer_email      :   this.schedule_list[index].context_customer_email,
            technician_email    :   this.schedule_list[index].context_owner_name,
            technician_url      :   this.server_url+"/assist-schedule?schedule_id="+this.schedule_list[index].schedule_id+"&digest="+this.schedule_list[index].context_identity+"&role=V"
         });
    }

    return  formatted_schedule_list;

}

ScheduleObj.prototype.getNextScheduleSession      =   function(){

    this.get_schedule_session_scroll_top          =       $(document).scrollTop().valueOf();

    this.index      =       this.schedule_list.length;

    this.handleBasicPostMessageCallback();

}

ScheduleObj.prototype.getScheduleSessionDetails      =   function(){
    
    var data 		= 	{
        schedule_id 	: 	this.schedule_id
    };
    
    var schedule_session_details    =   {
        get_schedule_session_details    :    data
    };

    var iframeVar       =   document.getElementById("post_message_iframe");
    iframeVar.contentWindow.postMessage(schedule_session_details,'*');

}

ScheduleObj.prototype.getScheduleSessionDetailsCallback      =   function(response){
    if(response.success){

    	var schedule_obj 				= 		response.success.representation;

    	this.context_identity 			= 		schedule_obj.context_identity;

    	this.customer_email 			= 		schedule_obj.context_customer_email;

    	this.ticket_subject 			= 		schedule_obj.context_title;

    	this.ticket_desc 	 			= 		schedule_obj.context_schedule_description;

    	this.selected_timezone 	 		= 		schedule_obj.context_schedule_timezone;

    	this.display_date 				= 		moment.tz(Number(schedule_obj.context_schedule_time) ,this.selected_timezone);

    	this.remainder 					= 		schedule_obj.context_schedule_reminder;

    	this.remainder_text 			= 		this.getRemainderText(this.remainder);

        if(this.after_update_call){
            
            this.afterUpdateCallback(schedule_obj);

            return;
        }

    	ScheduleUtil.showScheduleMainContainer(this.customer_email, this.ticket_subject, this.ticket_desc, this.selected_timezone, this.display_date, this.remainder_text , this.selectDate);

    }else{

    	this.fd_client.instance.close();

    }
}

ScheduleObj.prototype.getRemainderText      =   function(minutes){
    
	if(minutes === 0){
		return 'No remainder';
	}

	if(minutes 	< 	60){
		return minutes+' minutes before';
	}

	if(minutes 	< 	24*60){
		return 	(minutes/60)+' hours before';
	}

	if(minutes 	=== 7*24*60){
		return 	'1 week before';
	}

	if(minutes 	>= 	24*60){
		return 	(minutes/24*60)+' days before';
	}



}

ScheduleObj.prototype.updateScheduleSession      =   function(){

    var     now     =   moment.tz(this.selected_timezone);

    if(now.unix()   >=  this.display_date.unix()){

        ScheduleUtil.showErrorMessageContainer('Schedule time is in past.');

        return;
    }

    this.get_schedule_session_scroll_top        =       $(document).scrollTop().valueOf();
    
    var data 		= 	{
        app_identity    :   this.app_identity,
        customer_email  :   this.customer_email,
        issue_id        :   this.ticket_id,
        title     		:   this.ticket_subject,
        schedule_time   :   this.display_date.unix()*1000,
        notes 		 	: 	this.ticket_desc,
        utc_offset      :   ScheduleUtil.getGMTOffset(this.selected_timezone),
        time_zone       :   this.selected_timezone,
        reminder       	:   this.remainder,
        schedule_id 	: 	this.schedule_id,
        identity 		: 	this.context_identity
    };
    
    var schedule_session_details    =   {
        update_schedule_session    :    data
    };

    var iframeVar       =   document.getElementById("post_message_iframe");
    iframeVar.contentWindow.postMessage(schedule_session_details,'*');

}

ScheduleObj.prototype.updateScheduleSessionCallback      =   function(response){
    
    if(response.success){

        ScheduleUtil.showSuccessMessageContainer('Schedule session successfully updated.');

        this.after_update_call     =    true;

    	this.getScheduleSessionDetails();
    
    }else{
    	
    	ScheduleUtil.showErrorMessageContainer('Oops! Some error occured.Please contact support@zohoassist.com.');
    
    }
}

ScheduleObj.prototype.afterUpdateCallback      =   function(schedule_obj){

    this.after_update_call                      =   false;

    for(var i in this.schedule_list){
        if(this.schedule_list[i].schedule_id    ===     schedule_obj.schedule_id){
            this.schedule_list[i]               =       schedule_obj;
        }
    }

    var     formatted_schedule_list =       this.getScheduleSessionFormat();

    ScheduleUtil.showScheduleSessionDetailsContainer(formatted_schedule_list , this.show_load_more);

    $([document.documentElement, document.body]).animate({
        scrollTop: $("#get_schedule_session_"+this.schedule_id).offset().top
    }, 2000);

    $("#get_schedule_session_"+this.schedule_id).addClass('updated-schedule-session');

}

ScheduleObj.prototype.deleteScheduleSession      =   function(schedule_id){

    this.get_schedule_session_scroll_top        =       $(document).scrollTop().valueOf();

    this.delete_schedule_id                     =       schedule_id;

	var data 		= 	{
        schedule_id 	: 	this.delete_schedule_id
    };
    
    var delete_schedule_session_details    =   {
        delete_schedule_session    :    data
    };

    var iframeVar       =   document.getElementById("post_message_iframe");
    iframeVar.contentWindow.postMessage(delete_schedule_session_details,'*');

}

ScheduleObj.prototype.deleteScheduleSessionCallback      =   function(response){

	if(response.success){

		this.removeScheduleObj(this.delete_schedule_id);

        ScheduleUtil.showSuccessMessageContainer('Schedule session successfully delete.');

        this.handleBasicPostMessageCallback();

	}else{

        ScheduleUtil.showErrorMessageContainer('Oops! Some error occured.Please contact support@zohoassist.com.');
    
    }

    this.delete_schedule_id     =   -1;

}

ScheduleObj.prototype.removeScheduleObj      =   function(schedule_id){

    var splice_position     =   this.schedule_list.length;
    for(var i in this.schedule_list){
        if(this.schedule_list[i].schedule_id    ===     schedule_id){
            this.schedule_list.splice(i,1);
        }
    }

}

ScheduleObj.prototype.handleBasicPostMessageCallback  =   function(){

    this.getScheduleSession();

    $(document).scrollTop(this.get_schedule_session_scroll_top);

}