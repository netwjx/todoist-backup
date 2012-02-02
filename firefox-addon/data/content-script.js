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
    this.portEmit = function(event){
        var funcs = [];
        var args = Array.prototype.slice.call(arguments, 1);
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
        assert(msg === 'test', 'Module is not use commonPortOn, Test portEmit fail!');
    }).run();
}());


function queue(ctx){
    var tasks = Array.prototype.slice.call(arguments,1),
        queue = {},
        n = 0;
    queue.done = function(){
        var t = tasks.shift();
        if(t && typeof t === 'function'){
            console.debug('Queue task '+ (n++) + ' ' +
                (t.toString().match(/function ([^\(]*)\(/)[1] || 'anonymous') + 
                ' function is running');

            setTimeout(function(){
                t.call(queue, ctx);
            }, 0);
        }
        return queue;
    };
    return queue.done();
}

function getTodoist(apiurl, params, cb){
    var url = 'http://todoist.com'+ apiurl, i, query=[];
    for(i in params){
        query.push(encodeURIComponent(i) + '=' + encodeURIComponent(params[i]));
    }
    query = query.join("&");
    url += '?' + query;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                cb(JSON.parse(xhr.responseText));
                return;
            }
            console.log('getTodoist ' + apiurl + ' fail: ' + xhr.status + ' ' + xhr.statusText);
            setTimeout(function(){
                getTodoist(apiurl, params, cb);
            },5000);
        }
    };
    xhr.open('GET', url);
    xhr.send();
}
///////////////////////////////////////////////////////////////////////////////

// todoist 备份主过程
function todoistBackup(success){
    var ctx={
        path: '',
        token: '',
        projects:[]
    };
    queue(ctx,
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
    var self = this;
    portEmit('chooseBackupPath').on(function(path){
        ctx.path = path;
        self.done();
    }).run();
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
    var self = this;
    getTodoist('/API/getProjects', {token:ctx.token}, function(data){
        ctx.projects = data;
        console.debug('projects count : ' + data.length);
        self.done();
    });
}

// 获取所有project下所有的todo,包括未完成和已完成的
function receiveTodos(ctx, i){
    var {token, projects} = ctx;
    var self = this, next = function(){
        //console.debug('receiveTodos ' + projects[i].id + ':' + escape(projects[i].name).replace(/%/g,'\\') + ' complete');
        i++;
        if(i < projects.length){
            receiveTodos.call(self, ctx, i);
        }else{
            //console.debug('receiveTodos all complete!');
            self.done();
        }
    };
    var flag = 2;
    if(typeof i === 'undefined') i = 0;
    getTodoist('/API/getUncompletedItems', {token:token, project_id:projects[i].id}, function(data){
        projects[i].uncompleted_items = data;
        flag--;
        if(flag === 0) next();
    });
    getTodoist('/API/getCompletedItems', {token:token, project_id:projects[i].id}, function(data){
        projects[i].completed_items = data;
        flag--;
        if(flag === 0) next();
    });
}

// 格式化并备份获取到的todo
function backupTodos(ctx){
    var self = this;
    portEmit('saveToFile', ctx).on(function(){
        self.done();
        console.debug('backup complete!');
    }).run();
}

(function(){
    var link = document.createElement('a')
    link.innerHTML = 'Backup';
    link.href = '#Backup';
    link.className = 'action go_premium';
    link.style.marginLeft = '20px';
    link.addEventListener('click', function(){
        todoistBackup();
    });

    var child = document.getElementById('top_icons'),
        container = document.getElementById('top_right');
    container.insertBefore(link, child);
}());
