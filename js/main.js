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