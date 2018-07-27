//initializing zoho assist app
$(document).ready( function() {
    app.initialized().then(
        function(client) {
            //initializing assist object
            AssistUtil.assistObj   =   new AssistObj(client);
        }
    );
});

//Assist Util for handling template and global obj's
var  AssistUtil  =   {

    integration_feature       :   "INTEGRATIONS",

    screen_sharing_feature    :   "TWO_WAY_SCREEN_SHARING", 

    schedule_session_feature  :   "SCHEDULE_SESSION",
    
    showLoginPage           :   function(){
        $('#content').html($('#login_template').html());
    },

    showInstallationPage    :   function(){
        $("#content").html($('#app_not_installed_template').html());
    },

    showNoAccessPage        :   function(){
        var source      =   $("#message_template").html();
        var template    =   Handlebars.compile(source);
        var context     =   {
            primary_message     :   "You do not have the permission to initiate a session.", 
            secondary_message   :   "Kindly contact your Administrator."
        };
        var html        =   template(context);
        $("#content").html(html);
    },

    showSubdomainMismatchPage   :   function(subdomain){
        var source      =   $("#message_template").html();
        var template    =   Handlebars.compile(source);
        var context     =   {
            primary_message     :   "Your subdomain mismatches. Your have registered with '"+subdomain+"' subdomain.", 
            secondary_message   :   ""
        };
        var html        = template(context);
        $("#content").html(html);
    },

    showIntegrationDisabledPage  :   function(){
        var source      =   $("#message_template").html();
        var template    =   Handlebars.compile(source);
        var context     =   {
            primary_message     :   "Integration with Freshdesk has been disabled.", 
            secondary_message   :   "Kindly contact your Administrator."
        };
        var html        = template(context);
        $("#content").html(html);
    },

    getSessionTypeOptionTemplate    :   function(rs_checked){
        var source      =   $("#session_type_option_template").html();
        var template    =   Handlebars.compile(source);
        var context     =   {
            rs_checked     :   rs_checked
        };
        return template(context);
    },

    getSessionTypeTextTemplate    :   function(rs_checked){
        var source      =   $("#session_type_text_template").html();
        var template    =   Handlebars.compile(source);
        var context     =   {
            rs_checked     :   rs_checked
        };
        return template(context);
    },

    getSessionScheduleBtnTemplate    :   function(rs_checked){
        return $("#session_schedule_btn_template").html();
    },

    getScheduleSessionLinkTemplate    :   function(rs_checked){
        return $("#get_schedule_session_template").html();
    },

    showAssistMainTemplate       :       function(session_type_option_template,session_type_text_template,session_schedule_btn_template){
        var source      =   $("#main_template").html();
        var template    =   Handlebars.compile(source);
        var context     =   {
            session_type_option_template     :   session_type_option_template,
            session_type_text_template       :   session_type_text_template,
            session_schedule_btn_template    :   session_schedule_btn_template
        };
        var html        =    template(context);
        $("#content").html(html);
    }

};

function AssistObj(client){
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
    this.customer_detail =   null;
    this.customer_email  =   null;
    this.fd_client       =   client;

    //common things
    this.login_window    =   null;
    this.login_window_check_interval    =   null;
    this.first_time_loading             =   true;

    //function binding classes
    this.setAssistServerURL             =   this.setAssistServerURL.bind(this);
    this.setAssistServerURLCallback     =   this.setAssistServerURLCallback.bind(this);

    this.setFDTicketDetails             =   this.setFDTicketDetails.bind(this);
    this.setFDTicketDetailsCallback     =   this.setFDTicketDetailsCallback.bind(this);

    this.setFDCustomerDetails           =   this.setFDCustomerDetails.bind(this);
    this.setFDCustomerDetailsCallback   =   this.setFDCustomerDetailsCallback.bind(this); 

    this.receiveFDInterMessage          =   this.receiveFDInterMessage.bind(this);

    this.openLoginPage                  =   this.openLoginPage.bind(this);
    this.openInstallationPage           =   this.openInstallationPage.bind(this);
    this.checkLoginWindowClosed         =   this.checkLoginWindowClosed.bind(this);

    this.handleBasicPostMessageCallback =   this.handleBasicPostMessageCallback.bind(this);

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

    this.fd_client.instance.receive(this.receiveFDInterMessage);

}

//Start of the Assist Server Setting

AssistObj.prototype.setAssistServerURL = function(){
    this.fd_client.iparams.get("domain").then(
        this.setAssistServerURLCallback,
        function(exc){
            //console.log(exc);
        });
}

AssistObj.prototype.setAssistServerURLCallback = function(data){

    if(data.domain      ===  "EU"){
        this.domain    =   "eu";
    }

    //calling assist integration iframe
    this.server_url         =   this.server+this.domain+":8080";
    var     iframe_ele      =   document.getElementById("post_message_iframe");
    iframe_ele.src          =   this.server_url+this.iframe_url;

}

//End of the Assist Server Setting

//Start of the getting freshdesk ticket details

AssistObj.prototype.setFDTicketDetails = function(){
    this.fd_client.data.get("ticket").then(
        this.setFDTicketDetailsCallback,
        function(exc){
            console.log(exc);
        });
}

AssistObj.prototype.setFDTicketDetailsCallback = function(data){

    this.ticket_detail      =       data.ticket;
    this.ticket_id          =       data.ticket.id;
    this.ticket_subject     =       data.ticket.subject;

}

//End of the getting freshdesk ticket details

//Start of the getting freshdesk customer details

AssistObj.prototype.setFDCustomerDetails = function(){
    this.fd_client.data.get("requester").then(
        this.setFDCustomerDetailsCallback,
        function(exc){
            console.log(exc);
        });
}

AssistObj.prototype.setFDCustomerDetailsCallback = function(data){
    this.customer_detail    =   data.requester;
    this.customer_email     =   data.requester.email;
}

//end of the getting freshdesk customer details


//handling post message from assist
AssistObj.prototype.handlePostMessageCommunication = function(event){
    
    var response                    =   event.data;

    //assigning variables from post messages
    this.signed_in                  =   response.signedIn;

    //if signed in is undefined
    if(this.signed_in   ===     undefined){
        // this.receiveFDInterMessage(event);
        return;
    }

    if(!this.signed_in){
        AssistUtil.showLoginPage();
        return;
    }

    this.user_details               =   response.user;
    
    this.license_details            =   this.user_details.remote_support_license;
    
    this.app_detail                 =   response.installed_app_detail;
    
    this.user_role                  =   response.user_role;

    // check remote support enabled
    if(!this.license_details.is_enabled){
        AssistUtil.showNoAccessPage();
        return;
    }

    // check for app installation in assist
    if(!this.app_detail.installed_app_details){
        AssistUtil.showInstallationPage();
        return;
    }

    // check for app installation in assist
    if(!this.app_detail.installed_app_details.enabled){
        AssistUtil.showIntegrationDisabledPage();
        return;
    }

    if(response.session                         !==     undefined){
    
        this.createSupportSessionCallback(response.session);
    
    }else if(response.create_schedule_session         !==     undefined){
    
        this.createScheduleSessionCallback(response.create_schedule_session);
    
    }else if(response.get_schedule_session            !==     undefined){
    
        this.getScheduleSessionCallback(response.get_schedule_session);
    
    }else if(response.get_session_reports             !==     undefined){
    
        this.getSupportSessionReportsCallback(response.get_session_reports);
    
    }else{

        this.handleBasicPostMessageCallback();

    }

}

//end of handling post message from assist

AssistObj.prototype.openLoginPage   =   function(){

    //init login window if closed
    this.login_window                       =       window.open(this.server_url+"/html/blank.html","_blank","toolbar=yes,scrollbars=yes,resizable=yes,top=150,left=350,width=800,height=600");
    
    //set interval for checking login window closed
    this.login_window_check_interval        =       setInterval(this.checkLoginWindowClosed,2000);
}

AssistObj.prototype.openInstallationPage    =       function(){

    //init login window if closed
    this.login_window                       =       window.open(this.server_url+"/assist#/settings/integrations/freshdesk-support","_blank");
    
    //set interval for checking login window closed
    this.login_window_check_interval        =       setInterval(this.checkLoginWindowClosed,2000);
}

AssistObj.prototype.checkLoginWindowClosed   =   function(){

    if(this.login_window.closed){
        clearInterval(this.login_window_check_interval);
        
        this.login_window               =   null;
        
        document.location.reload(true);
    }

}

AssistObj.prototype.selectSessionType  =   function(option){
    
    if(option === 1 && !this.checkForScreenSharingFeature()){
        this.showFDInfoNotification("Share my screen is available only in Remote Support (Professional).");
    }
    else{
        this.session_type        =       (option    ===     0)?"rs":"dm";
    }

    this.handleBasicPostMessageCallback();

}

//Start of the validation function

AssistObj.prototype.checkForIntegrationgFeature  =   function(){

    return this.license_details.features.includes(AssistUtil.integration_feature);

}

AssistObj.prototype.checkForScreenSharingFeature  =   function(){

    return this.license_details.features.includes(AssistUtil.screen_sharing_feature);

}


AssistObj.prototype.checkForScheduleSessionFeature  =   function(){

    return this.license_details.features.includes(AssistUtil.schedule_session_feature);

}

AssistObj.prototype.showFDInfoNotification  =   function(message){

    var     messageObj  =   {
        type        :   "info",
        message     :   message
    };

    this.fd_client.interface.trigger("showNotify", messageObj);

}

AssistObj.prototype.showFDSuccessNotification  =   function(message){

    var     messageObj  =   {
        type        :   "success",
        message     :   message
    };

    this.fd_client.interface.trigger("showNotify", messageObj);

}

AssistObj.prototype.showFDWarningNotification  =   function(message){

    var     messageObj  =   {
        type        :   "warning",
        message     :   message
    };

    this.fd_client.interface.trigger("showNotify", messageObj);

}

AssistObj.prototype.showFDDangerNotification  =   function(message){

    var     messageObj  =   {
        type        :   "danger",
        message     :   message
    };

    this.fd_client.interface.trigger("showNotify", messageObj);

}

AssistObj.prototype.receiveFDInterMessage  =   function(event){

    var data = event.helper.getData();
    
    if(data.message.location    ===     'create_schedule_session_dialog'  &&  data.sender.location  ===     'dialog'){

        this.showFDSuccessNotification('Successfully scheduled a session.');

        this.fd_client.interface.trigger('click',{id: "note", text: data.message.note_text, isPublic: false});
    }

}

//end of the validation function

//Start of the Assist API calling and Response from post messages

AssistObj.prototype.createSupportSession            =   function(){

    if(!this.checkForIntegrationgFeature()){
        this.showFDInfoNotification("Freshdesk Integration is available in Remote Support (Standard) and above.");
        return;
    }
    
    var data    =   {
        app_identity    :   this.app_identity,
        customer_email  :   this.customer_email,
        issue_id        :   this.ticket_id,
        issue_topic     :   this.ticket_subject,
        type            :   this.session_type
    };
    
    var session_details =   {
        session: data
    };

    var iframeVar       =   document.getElementById("post_message_iframe");
    iframeVar.contentWindow.postMessage(session_details,'*');
    
    this.login_window   = window.open("","_blank");
}

AssistObj.prototype.createSupportSessionCallback    =   function(response){
    console.log(response.success);
    console.log(response.success.representation);
    if(response.success){
        var technicianURL                   =   response.success.representation.technician_url;
        this.login_window.location.href     =   technicianURL;  
    }else{
        this.showFDDangerNotification("Error occured during session creation. Please contact support@zohoassist.com.");
    }
}

AssistObj.prototype.createScheduleSession      =   function(){

    if(!this.checkForScheduleSessionFeature()){
        this.showFDInfoNotification("Schedule session is available in Remote Support (Professional) and above.");
        return;
    }

    this.fd_client.interface.trigger("showDialog", { 
      title: "Schedule Session", 
      template: "schedule_session_modal.html" 
    });
}

AssistObj.prototype.createScheduleSessionCallback      =   function(response){
    console.log(response);
}

AssistObj.prototype.getSupportSessionReports   =   function(){
    console.log(this);
}

AssistObj.prototype.getSupportSessionReportsCallback   =   function(response){
    console.log(response);
}

AssistObj.prototype.getScheduleSession         =   function(){
    this.fd_client.interface.trigger("showDialog", { 
        title       :   "View Schedule Session", 
        template    :   "get_schedule_session_modal.html" 
    });
}

AssistObj.prototype.getScheduleSessionCallback         =   function(response){
    console.log(response);
}

AssistObj.prototype.handleBasicPostMessageCallback  =   function(){

    var rs_checked                      =     this.session_type === "rs";

    var session_type_option_template    =     AssistUtil.getSessionTypeOptionTemplate(rs_checked);

    var session_type_text_template      =     AssistUtil.getSessionTypeTextTemplate(rs_checked);

    var session_schedule_btn_template   =     AssistUtil.getSessionScheduleBtnTemplate();

    AssistUtil.showAssistMainTemplate(session_type_option_template,session_type_text_template,session_schedule_btn_template);

}

//End of the Assist API calling and Response from post messages
