var pageMod = require('page-mod'),
    data = require('self').data;

pageMod.PageMod({
    include: 'http://todoist.com/app*',
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('initContentScript.js'),
    onAttach: function(w){
        w.port.on('backup', backup);
    }
});

console.debug('The todoist-backup add-on is running.');


function backup(p){
    console.debug('start backup');
    // TODO
    this.emit('backup_completed', {path:'foo bar'});
}