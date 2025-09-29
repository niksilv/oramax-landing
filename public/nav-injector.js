(function(){
  const H = 56;
  function inject(html){
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.prepend(wrap.firstElementChild);
    document.body.style.marginTop = H + 'px';
  }
  fetch('/nav.html', {cache:'no-store'})
    .then(r => r.text())
    .then(inject)
    .catch(()=>{});
})();
