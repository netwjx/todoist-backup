function portOn(port, options){
    port.on('commonPortOn', function(arg){
        var e = arg.event, args = arg.args, token = arg.token;
        //console.debug('portOn ' + JSON.stringify(arg).slice(0,240) + ' ...');
        var done = function(){
            port.emit('commonPortOnCallback', {token:token, args:Array.prototype.slice.call(arguments)});
        };
        if(e === 'test'){
            done('test');
        }else if(e && options[e]){
            options[e].apply({
                done:done
            }, args);
        } 
    });
}

///////////////////////////////////////////////////////////////////////////////

const {Cc,Ci} = require('chrome');

const pageMod = require('page-mod'),
    ss = require("simple-storage"),
    notifications = require('notifications'),
    self = require('self'),
    file = require('file'),
    nsIFilePicker = Ci.nsIFilePicker;
    js_beautify = require("beautify").js_beautify;

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
            },
            chooseBackupPath: function(){
                var f, fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
                var parent = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator).getMostRecentWindow(null),
                    date = new Date(), defaultDir = ss.storage.defaultDir;
                fp.init(parent, '\u9009\u62e9\u5907\u4efd\u6587\u4ef6\u8def\u5f84', nsIFilePicker.modeSave);
                fp.appendFilter('todoist json \u5907\u4efd\u6587\u4ef6(*.json)', '*.json');
                fp.defaultExtension = 'json';
                fp.defaultString = 'todoist_backup' + 
                    date.getFullYear() + 
                    (date.getMonth() + 1 + '').replace(/^\d$/, '0$&') +
                    (date.getDate() + '').replace(/^\d$/, '0$&') +
                    '_' +
                    (date.getHours() + '').replace(/^\d$/, '0$&') +
                    (date.getMinutes() + '').replace(/^\d$/, '0$&') +
                    (date.getSeconds() + '').replace(/^\d$/, '0$&');
                if(defaultDir){
                    f = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
                    f.initWithPath(defaultDir);
                    fp.displayDirectory(f);
                }
                var ret = fp.show();
                if(ret === nsIFilePicker.returnOK || ret === nsIFilePicker.returnReplace){
                    f = fp.file;
                    ss.storage.defaultDir = f.parent.path;
                    this.done(f.path);
                }
                fp = parent = null;
            },
            saveToFile: function(ctx){
                var str = js_beautify(JSON.stringify(ctx.projects));
                //console.debug(str);
                var writer = file.open(ctx.path, 'w');
                try{
                    writer.write(str);
                }finally{
                    writer.close();
                    writer = null;
                }

                notifications.notify({
                    title:'\u5907\u4efd\u5b8c\u6210',
                    text:'\u5df2\u5c06todoist\u5907\u4efd\u81f3' + ctx.path
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
