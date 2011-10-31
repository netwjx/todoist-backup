var pageMod = require('page-mod'),
    notifications = require('notifications'),
    data = require('self').data;


var ports = {
    backup: function(p){
        console.debug('start backup, token is ' + p.token);
        // TODO 实现备份主要操作
        this.emit('completed', {path:'foo bar'});
    },
    notify: function(p){
        notifications.notify(p);
    }
};


pageMod.PageMod({
    include: 'http://todoist.com/app*',
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('ctnScript.js'),
    onAttach: function(w){
        for(var i in ports){
            w.port.on(i,ports[i]);
        }
    }
});

console.debug('The todoist-backup add-on is running.');

