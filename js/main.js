function changePage() {
    var top = $("#switch-top");
    top.show();
    top.animate({ top: "50vh"}, 800);

    var bottom = $("#switch-bottom");
    bottom.show();
    bottom.animate({ top: "0vh", left: 0 }, 800);

    var bar = $("#switch-bar");
    bar.delay(800).fadeIn(100);
    bar.delay(200).animate({ width: "20%", left: "40%" }, 800);


    setTimeout(function () {
        window.location.href = "form.html";
    }, 2400);
}

// Get leaderbaord on page load
var req = new XMLHttpRequest();
// req.open('GET', 'https://polar-tundra-56313.herokuapp.com/api/leaderboard', true);
req.open('GET', 'http://127.0.0.1:5000/api/leaderboard', true);
req.setRequestHeader('Content-Type', 'application/json');
req.onloadend = () => {
    var leaders = JSON.parse(req.response);
    
    document.getElementById("leaderboard-content").innerHTML = "";

    for (score in leaders) {
        var row = "";

        row += "<tr>";
        row += "<td>" + JSON.parse(leaders[score][1]) + "</td>";
        row += "<td>" + leaders[score][0] + "</td>";
        row += "</tr>";

        document.getElementById("leaderboard-content").innerHTML += row;
    }
}
req.send();

function showLeaderboard() {
    $('.leaderboard-popup').css({opacity: 0, display: 'flex'}).animate({
        opacity: 1
    }, 800);
}

function hideLeaderboard() {
    $('.leaderboard-popup').fadeOut(800);
}