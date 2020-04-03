const goBack = document.getElementById('goBack');

goBack.addEventListener('click', function(){
   var count = -(this.dataset.count);
   window.history.go(count);
});
