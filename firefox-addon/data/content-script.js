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


function Queue(ctx){
    var tasks = Array.prototype.slice.call(arguments,1),
        queue = {},
        n = 0;
    queue.done = function(){
        var t = tasks.shift();
        if(t && typeof t === 'function'){
            console.debug('Queue task '+ (n++) + ' ' +
                (t.toString().match(/function ([^\(]*)\(/)[1] || 'anonymous') + 
                ' function is run;');

            setTimeout(function(){
                t.call(queue, ctx);
            }, 0);
        }
        return queue;
    };
    return queue.done();
}
///////////////////////////////////////////////////////////////////////////////

// todoist 备份主过程
function todoistBackup(success){
    var ctx={};
    Queue(ctx,
        chooseBackupFile, 
        receiveAPIToken, 
        receiveProjects, 
        receiveTodos, 
        backupTodos,
        success
    );
}

// 选择备份文件路径
function chooseBackupFile(ctx){
    ctx.path = 'c:\\todoist_backup.json';
    this.done();
}

// 获取备份时使用的Token
function receiveAPIToken(ctx){
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            var token = /var TOKEN = "([0-9a-f]{40})";/.exec(xhr.responseText)[1];
            if(token){
                ctx.token = token;
                console.debug('receiveAPIToken ' + token);
                self.done();
                return;
            }
        }
        // TODO error
    };
    xhr.open('GET', 'http://todoist.com/Users/viewPrefs?page=account', true);
    xhr.send();
}

// 获取当前所有的project
function receiveProjects(ctx){
    this.done();
}

// 获取所有project下所有的todo,包括未完成和已完成的
function receiveTodos(ctx){
    this.done();
}

// 格式化并备份获取到的todo
function backupTodos(ctx){
    alert('备份完成');
    this.done();
}

(function(){
    var link = document.createElement('a')
    link.innerHTML = 'Backup';
    link.href = '#Backup';
    link.className = 'action go_premium';
    link.addEventListener('click', function(){
        todoistBackup();
    });

    var child = document.getElementById('top_icons'),
        container = document.getElementById('top_right');
    container.insertBefore(link, child);
}());
