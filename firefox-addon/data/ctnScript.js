var emits = {
    backup: null,
    notify: null,
};
for(var i in emits){
    emits[i] = emitFunc(i);
}
function emitFunc(name){
    return function(p){
        self.port.emit(name, p);
        return this;
    };
}

var ports = {
    completed: function(p){
        // TODO 完成时是否还需要其它额外的提示信息
        progress({notify:'备份Todoist 已完成',text:'已完成'});
    },
    progress: progress
};
for(var i in ports){
    self.port.on(i, ports[i]);
}


var cont = document.getElementById('top_right'),
    link = document.createElement('a'),
    ref = document.getElementById('info_page');
link.innerHTML = 'Backup';
link.href = '#Backup';
link.className = 'action dark';
link.addEventListener('click', function(){
    progress({text:'获取备份token'});
    Request({
        url: 'http://todoist.com/Users/viewPrefs?page=account',
        onComplete: function(resp){
            var m;
            if(resp.status === 200){
                m = /var TOKEN = "([0-9a-f]{40})";/.exec(resp.text);
                if(m){
                    progress({text:'获取备份token成功,开始备份'});
                    emits.backup({token:m[1]});
                }else{
                    progress({text:'获取备份token失败,无法找到有效的token'});
                    console.debug(resp.text);
                }
            }else{
                progress({notify:'获取token失败, http ' + resp.status});
            }
        }
    });
});
cont.insertBefore(link,ref);

function Request(req){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            req.onComplete && req.onComplete.call(xhr, {
                text: xhr.responseText,
                status: xhr.status,
                statusText: xhr.statusText,
                headers: xhr.getAllResponseHeaders() // TODO 未实现和request模块兼容
            });
        }
    };
    req.contentType && xhr.setRequestHeader('Content-Type',req.contentType);
    xhr.open(req.method || 'GET', req.url, true);
    xhr.send(req.content || undefined);
}

function progress(m){
    if(typeof m.text !== 'undefined'){
        var info = link.getElementsByTagName('span');
        if(info.length === 0){
            info = document.createElement('span');
            info = link.appendChild(info);
        }else{
            info = info[0];
        }
        info.innerHTML = '(' + m.text + ')';
    }
    if(m.notify){
        emits.notify({
            title: m.title || '备份提示',
            text: m.notify
        });
    }
}
