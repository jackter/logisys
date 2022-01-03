function GoLoad (MOD, COM, ACT){
    this.GetDetail = function(GoData, GoCallback){

        var Destination = {
            mod		: MOD, 
            com		: COM, 
            act		: ACT
        };

        GoData = $.extend(Destination, GoData);

        var TheOptions = {
            type	: 'POST',
            timeout	: 60000,
            url		: GO,
            data	: GoData,
            success	: function(feedback){
                GoCallback(feedback);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("Error on Process : " + ACT);
                console.log(xhr.status);
                console.log(thrownError);

                $.toast({
                    heading: 'Error',
                    text: 'Error Found : ' + thrownError,
                    icon: 'error'
                });

                GoCallback(0);
            }
        };

        $.ajax(TheOptions);

    };
}

/* Begin Create Req */
function CreateReq(Data, RPL){

    var Data = $(Data).serializeArray();
    var Result = {};
    $(Data).each(function(i, obj){
        var TReg    = new RegExp(RPL, 'g');
        var TName   = obj.name;
            TName   = TName.replace(TReg, "");
        
        Result[TName] = obj.value;
    });

    return Result;

}

/* End Create Req */