//initializing zoho assist app
$(document).ready( function() {
    app.initialized().then(
        function(client) {
            //initializing assist object
            AssistUtil.assistObj   =   new AssistObj(client);

            client.events.on("app.activated", AssistUtil.assistObj.createSupportSession);
        }
    );
});

//Assist Util for handling template and global obj's
var  AssistUtil  =   {
    integration_feature       :   "INTEGRATIONS"
};


function AssistObj(client){
    //assist details
    this.app_identity    =   "79202e7e27a30660111edd8d6a56d710119474a5";
    this.get_domain_url  =   "https://assist.zoho.com/integAppGetDomain";
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
    this.customer_detail =   null;
    this.customer_email  =   null;
    this.fd_client       =   client;

    //common things
    this.login_window    =   null;
    this.login_window_check_interval    =   null;

    //function binding classes
    this.setAssistServerURL             =   this.setAssistServerURL.bind(this);
    this.setAssistServerURLCallback     =   this.setAssistServerURLCallback.bind(this);

    this.setFDTicketDetails             =   this.setFDTicketDetails.bind(this);
    this.setFDTicketDetailsCallback     =   this.setFDTicketDetailsCallback.bind(this);

    this.setFDCustomerDetails           =   this.setFDCustomerDetails.bind(this);
    this.setFDCustomerDetailsCallback   =   this.setFDCustomerDetailsCallback.bind(this); 

    this.openLoginPage                  =   this.openLoginPage.bind(this);
    this.openInstallationPage           =   this.openInstallationPage.bind(this);
    this.checkLoginWindowClosed         =   this.checkLoginWindowClosed.bind(this);

    this.createSupportSession 			= 	this.createSupportSession.bind(this);

    //init all variables by init
    this.init();
}


AssistObj.prototype.init = function(){

    //handling post messages
    window.addEventListener('message', this.handlePostMessageCommunication.bind(this), true);

    //setting basic varibales
    this.setAssistServerURL();

    this.setFDTicketDetails();

    this.setFDCustomerDetails();

};

//Start of the Assist Server Setting

AssistObj.prototype.setAssistServerURL = function(){
    // this.fd_client.iparams.get("domain").then(
    //     this.setAssistServerURLCallback,
    //     function(exc){
    //         console.log(exc);
    //     });

    //calling assist integration iframe
    var     iframe_ele      =   document.getElementById("get_domain_iframe");
    iframe_ele.src          =   this.get_domain_url;
};

AssistObj.prototype.setAssistServerURLCallback = function(){

    // if(data.domain      ===  "EU"){
    //     this.domain    =   "eu";
    // }

    //calling assist integration iframe
    this.server_url         =   this.server+this.domain;
    var     iframe_ele      =   document.getElementById("post_message_iframe");
    iframe_ele.src          =   this.server_url+this.iframe_url;

};

//End of the Assist Server Setting

//Start of the getting freshdesk ticket details

AssistObj.prototype.setFDTicketDetails = function(){
    this.fd_client.data.get("ticket").then(
        this.setFDTicketDetailsCallback,
        function(exc){
            // console.log(exc);
        });
};

AssistObj.prototype.setFDTicketDetailsCallback = function(data){

    this.ticket_detail      =       data.ticket;
    this.ticket_id          =       data.ticket.id;
    this.ticket_subject     =       data.ticket.subject;
    this.ticket_desc        =       data.ticket.description_text;

};

//End of the getting freshdesk ticket details

//Start of the getting freshdesk customer details

AssistObj.prototype.setFDCustomerDetails = function(){
    this.fd_client.data.get("requester").then(
        this.setFDCustomerDetailsCallback,
        function(exc){
            // console.log(exc);
        });
};

AssistObj.prototype.setFDCustomerDetailsCallback = function(data){
    this.customer_detail    =   data.requester;
    this.customer_email     =   data.requester.email;
};

//end of the getting freshdesk customer details


//handling post message from assist
AssistObj.prototype.handlePostMessageCommunication = function(event){
    
    var response                    =   event.data;

    if(response.get_domain){

        if(!response.get_domain.domain){
            AssistUtil.showLoginPage();
            return;
        }

        this.domain     =   response.get_domain.domain;
        this.setAssistServerURLCallback();

        return;
    }

    //assigning variables from post messages
    this.signed_in                  =   response.signedIn;

    if(!this.signed_in){
        return;
    }

    this.user_details               =   response.user;
    
    this.license_details            =   this.user_details.remote_support_license;
    
    this.app_detail                 =   response.installed_app_detail;


    if(!this.license_details){
        return;
    }

    //check enabled remote support permission
    if(!this.license_details.is_enabled){
    	return;
    }

    // check for app installation in assist
    if(!this.app_detail.installed_app_details){
        return;
    }

    if(response.session                         !==     undefined){
    
        this.createSupportSessionCallback(response.session);
    
    }

};

//end of handling post message from assist

AssistObj.prototype.openLoginPage   =   function(){

    //init login window if closed
    this.login_window                       =       window.open("https://assist.zoho.com/integAppDomainRedirection","_blank","toolbar=yes,scrollbars=yes,resizable=yes,top=150,left=350,width=800,height=600");
    
    //set interval for checking login window closed
    this.login_window_check_interval        =       setInterval(this.checkLoginWindowClosed,2000);
};

AssistObj.prototype.openInstallationPage    =       function(){

    //init login window if closed
    this.login_window                       =       window.open(this.server_url+"/assist#/settings/integrations","_blank","toolbar=yes,scrollbars=yes,resizable=yes,top=150,left=350,width=800,height=600");
    
    //set interval for checking login window closed
    this.login_window_check_interval        =       setInterval(this.checkLoginWindowClosed,2000);
};

AssistObj.prototype.checkLoginWindowClosed   =   function(){

    if(this.login_window.closed){
        clearInterval(this.login_window_check_interval);
        
        this.login_window               =   null;
        
        document.location.reload(true);
    }

};

//Start of the validation function

AssistObj.prototype.checkForIntegrationgFeature  =   function(){

    return this.license_details.features.includes(AssistUtil.integration_feature);

};

AssistObj.prototype.showFDInfoNotification  =   function(message){

    var     messageObj  =   {
        type        :   "info",
        message     :   message
    };

    this.fd_client.interface.trigger("showNotify", messageObj);

};

AssistObj.prototype.showFDSuccessNotification  =   function(message){

    var     messageObj  =   {
        type        :   "success",
        message     :   message
    };

    this.fd_client.interface.trigger("showNotify", messageObj);

};

AssistObj.prototype.showFDWarningNotification  =   function(message){

    var     messageObj  =   {
        type        :   "warning",
        message     :   message
    };

    this.fd_client.interface.trigger("showNotify", messageObj);

};

AssistObj.prototype.showFDDangerNotification  =   function(message){

    var     messageObj  =   {
        type        :   "danger",
        message     :   message
    };

    this.fd_client.interface.trigger("showNotify", messageObj);

};

//end of the validation function

//Start of the Assist API calling and Response from post messages

AssistObj.prototype.createSupportSession            =   function(){

	//opening login page
	if(!this.signed_in){
		this.showFDInfoNotification("Please log in to Zoho Assist and try again.");
        return;
    }

    // check for app installation in assist
    if(!this.license_details){
        this.showFDInfoNotification("You haven't completed your configuration. Please complete the configuration process and try again.");
        return;
    }

    if(!this.checkForIntegrationgFeature()){
        this.showFDInfoNotification("Zoho Assist integration with Freshdesk is only available in Remote Support (Standard) and above.");
        return;
    }

    //check enabled remote support permission
    if(!this.license_details.is_enabled){
    	this.showFDInfoNotification("You do not have the permission to initiate a session.");
    	return;
    }

    // check for app installation in assist
    if(!this.app_detail.installed_app_details){
    	this.showFDInfoNotification("Looks like you have not completed your authorization process.");
        return;
    }

    // check for app installation in assist
    if(!this.app_detail.installed_app_details.enabled){
        this.showFDInfoNotification("Integration with Zoho Assist has been disabled.");
        return;
    }
    
    var data={
        app_identity    :   this.app_identity,
        customer_email  :   this.customer_email,
        issue_id        :   this.ticket_id,
        issue_topic     :   this.ticket_subject,
        type            :   this.session_type,
        issue_description : this.ticket_desc.substr(0,450)
    };
    
    var session_details =   {
        session: data
    };

    var iframeVar       =   document.getElementById("post_message_iframe");
    iframeVar.contentWindow.postMessage(session_details,'*');
    
    this.login_window   = window.open("","_blank");
};

AssistObj.prototype.createSupportSessionCallback    =   function(response){
    if(response.success){
        var technicianURL                   =   response.success.representation.technician_url;
        this.login_window.location.href     =   technicianURL;  
    }else{
        this.showFDDangerNotification("Error occured during session creation. Please contact support@zohoassist.com.");
    }
};