function portOn(port, options){
    port.on('commonPortOn', function(arg){
        var e = arg.event, args = arg.args, token = arg.token;
        var done = function(){
            port.emit('commonPortOnCallback', {token:token, args:Array.prototype.slice.call(arguments)});
        };
        if(e === 'test'){
            done('test');
        }else if(e && options[e]){
            options[e].apply({
                done:done
            },args);
        } 
    });
}

///////////////////////////////////////////////////////////////////////////////

const pageMod = require('page-mod'),
    notifications = require('notifications'),
    self = require('self');

pageMod.PageMod({
    include: 'http://todoist.com/app*',
    contentScriptWhen: 'ready',
    contentScriptFile: self.data.url('content-script.js'),
    onAttach: function(worker){
        portOn(worker.port, {
            notify: function(options){
                notifications.notify(options);
                this.done();
            },
            error: function(options){
                notifications.notify({
                    title: '\u53d1\u751f\u9519\u8bef',
                    text: msg
                });
                this.done();
            }
        });
    }
});

try{
    const devmode = require('development-mode/main');
    if(devmode){
        notifications.notify({
            title:'\u5df2\u542f\u52a8',
            text:'\u81ea\u52a8\u5907\u4efd\u6269\u5c55\u5df2\u542f\u52a8 [\u4ec5\u8c03\u8bd5\u65f6\u4f1a\u6709\u8fd9\u4e2a\u4fe1\u606f]'
        });
        console.debug('The todoist-backup add-on is running.');
    }
}catch(e){}
