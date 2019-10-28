function goToWorkbench() {
    var playerName = document.getElementById("playerName").value;
    var playerAge = document.getElementById("playerAge").value;
    localStorage.setItem('playerName', JSON.stringify(playerName));
    localStorage.setItem('playerAge', JSON.stringify(playerAge));
    
    window.location.href = "bench.html";
}

$(function () {
    $( "#playerAge" ).change(function() {
    var max = parseInt($(this).attr('max'));
    var min = parseInt($(this).attr('min'));
    if ($(this).val() > max)
    {
       $(this).val(max);
    }
    else if ($(this).val() < min)
    {
       $(this).val(min);
    }       
  }); 
 });