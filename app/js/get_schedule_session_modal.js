//initializing zoho assist app
$(document).ready( function() {
    app.initialized().then(
        function(client) {
            ScheduleUtil.scheduleObj   =   new ScheduleObj(client);
        }
    );
});

var  ScheduleUtil  =   {


	showScheduleSessionDetailsContainer    :   function(schedule_list){
        var source      =   $("#schedule_session_list_component").html();
        var template    =   Handlebars.compile(source);

        $("#content").html(template(schedule_list));
    }

};


function ScheduleObj(client){

	//assist details
    this.app_identity    =   "79202e7e27a30660111edd8d6a56d710119474a5";
    this.server          =   "http://naveen-4630.csez.zohocorpin.";
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

    //function binding classes
    this.setAssistServerURL             =   this.setAssistServerURL.bind(this);
    this.setAssistServerURLCallback     =   this.setAssistServerURLCallback.bind(this);

    this.setFDTicketDetails             =   this.setFDTicketDetails.bind(this);
    this.setFDTicketDetailsCallback     =   this.setFDTicketDetailsCallback.bind(this);

    this.setFDCustomerDetails           =   this.setFDCustomerDetails.bind(this);
    this.setFDCustomerDetailsCallback   =   this.setFDCustomerDetailsCallback.bind(this);

    this.handleBasicPostMessageCallback =   this.handleBasicPostMessageCallback.bind(this);

    this.getScheduleSession 			= 	 this.getScheduleSession.bind(this);
    this.getScheduleSessionCallback 	= 	 this.getScheduleSessionCallback.bind(this);

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
    this.server_url         =   this.server+this.domain+":8080";
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

	if(response.get_schedule_session         !==     undefined){
    
        this.getScheduleSessionCallback(response.get_schedule_session);
    
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
        get_schedule_session    :    data
    };

    var iframeVar       =   document.getElementById("post_message_iframe");
    iframeVar.contentWindow.postMessage(schedule_session_details,'*');

}

ScheduleObj.prototype.getScheduleSessionCallback      =   function(response){
    if(response.success){

    	var 	schedule_list 			= 		response.success.representation;

    	console.log(schedule_list);
    	
    	var 	formatted_schedule_list = 		[];

    	for(var index 	in 	schedule_list){

    		formatted_schedule_list.push({
    			owner_name 			: 	schedule_list[index].context_owner_name,
                schedule_time 		: 	moment.tz(Number(schedule_list[index].context_schedule_time),schedule_list[index].context_schedule_timezone).format('MMM DD,YYYY h:mm A z'),
                created_time		: 	moment.tz(Number(schedule_list[index].context_added_time),moment.tz.guess()).format('MMM DD,YYYY h:mm A z'),
               	updated_by 			: 	schedule_list[index].context_edited_user_name,
                updated_time 		: 	moment.tz(Number(schedule_list[index].context_edited_time),moment.tz.guess()).format('MMM DD,YYYY h:mm A z')
            });
    	}

    	ScheduleUtil.showScheduleSessionDetailsContainer(formatted_schedule_list);

    }else{

    	this.fd_client.instance.close();

    }
}

ScheduleObj.prototype.handleBasicPostMessageCallback  =   function(){

    this.getScheduleSession();

}