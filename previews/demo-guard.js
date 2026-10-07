/* Local templates are catalogue samples, never live RSVP endpoints. */
(() => {
  'use strict';
  const errors = [];
  window.InvitationDemoDiagnostics = { errors, recoveries: [] };
  if(window.parent!==window){
    // Stop decoding media in backgrounded Android tabs. Resume only media
    // that was playing; preserve anything the visitor paused themselves.
    const playing=new Set();
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){
        document.querySelectorAll('video,audio').forEach(media=>{
          if(!media.paused && !media.ended){playing.add(media);media.pause();}
        });
      }else{
        playing.forEach(media=>{if(media.isConnected)media.play()?.catch(()=>{});});
        playing.clear();
      }
    });
  }
  window.addEventListener('error', event => {
    errors.push({message:event.message || event.target?.src || event.target?.href || 'Resource failed',
      file:event.filename || '', line:event.lineno || 0, column:event.colno || 0});
  }, true);
  window.addEventListener('unhandledrejection', event => {
    errors.push(String(event.reason?.message || event.reason));
  });
  document.addEventListener('submit', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    let notice = event.target.querySelector('[data-demo-notice]');
    if (!notice) {
      notice = document.createElement('p');
      notice.dataset.demoNotice = '';
      notice.setAttribute('role', 'status');
      event.target.append(notice);
    }
    notice.textContent = 'This is a sample invitation. Your response has not been sent.';
  }, true);
})();
