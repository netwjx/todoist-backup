function assert(bool, msg){
    if(!bool){
        console.debug(msg || console.trace() || 'assert fail');
    }
}

(function(){
    var callbacks={};
    self.port.on('commonPortOnCallback', function(arg){
        var {token, args} = arg;
        var {funcs, ctx} = callbacks[token];
        if(funcs){
            if(funcs.length){
                for(var i=0; i<funcs.length; i++) funcs[i].apply(ctx, args);
            }
            delete callbacks[token];
        }
    });
    this.portEmit = function(event, args){
        var funcs=[];
        return {
            on:function(func){
                funcs.push(func);
                return this;
            },
            run:function(){
                var token='callback'+(+new Date());
                callbacks[token]={funcs:funcs, ctx:this};
                self.port.emit('commonPortOn', {event:event, args:args, token:token});
                return this;
            }
        };
    }

    portEmit('test').on(function(msg){
        assert(msg === 'test ', 'Module is not use commonPortOn, Test portEmit fail!');
    }).run();
}());

///////////////////////////////////////////////////////////////////////////////

(function(){
    var link = document.createElement('a')
    link.innerHTML = 'Backup';
    link.href = '#Backup';
    link.className = 'action go_premium';
    link.addEventListener('click', function(){
        // TODO 考虑已任务队列的方式实现
        selectBackupFile();
    });

    var child = document.getElementById('top_icons'),
        container = document.getElementById('top_right');
    container.insertBefore(link, child);
}());


function selectBackupFile(){
    var cfg = {};
    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, '选择备份文件路径', nsIFilePicker.modeSave);
    fp.appendFilters('*.json');
    var rv = fp.show();
    if(rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace){
        cfg.file = fp.file;
        cfg.path = fp.file.path;
        RequestToken(cfg);
    }
}

function RequestToken(cfg){
    alert('ok');
}
