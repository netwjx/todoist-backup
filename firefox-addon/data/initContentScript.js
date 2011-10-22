var cont = document.getElementById('top_right'),
    link = document.createElement('a'),
    ref=document.getElementById('info_page');
link.innerHTML = 'Backup';
link.href = '#Backup';
link.className = 'action dark';
link.addEventListener('click',function(){
    self.port.emit('backup', {token:''});
    // TODO
});
cont.insertBefore(link,ref);
self.port.on('backup_completed',function(r){
    // TODO
    console.debug('backup_completed '+r.path);
});