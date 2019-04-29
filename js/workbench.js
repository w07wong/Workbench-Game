// For snapping
var startPos = null;

var GAMELENGTH = 20;
var NUMBEROFTOOLS = 20

var PLAYER = null;
var AGE = null;

var dataToSave = {};
dataToSave.state = [{}];

var itemsPlaced = 0;

localStorage.removeItem('gameHistory');

var images = {
    "1": ["box1", "box"],
    "2": ["box2", "box"],
    "3": ["box3", "box"],
    "4": ["box4", "box"],
    "5": ["box5", "box"],
    "6": ["box6", "box"],
    "7": ["box7", "box"],
    "8": ["box8", "box"],
    "9": ["print1", "scrap"],
    "10": ["print2", "scrap"],
    "11": ["print3", "scrap"],
    "12": ["print4", "scrap"],
    "13": ["print5", "scrap"],
    "14": ["print6", "scrap"],
    "15": ["print7", "scrap"],
    "16": ["print8", "scrap"],
    "17": ["scrap1", "scrap"],
    "18": ["scrap2", "scrap"],
    "19": ["scrap3", "scrap"],
    "20": ["scrap4", "scrap"],
    "21": ["scrap5", "scrap"],
    "22": ["scrap6", "scrap"],
    "23": ["tool1", "tool"],
    "24": ["tool2", "tool"],
    "25": ["tool3", "tool"],
    "26": ["tool4", "tool"],
    "27": ["tool5", "tool"],
    "28": ["tool6", "tool"],
    "29": ["tool7", "tool"],
    "30": ["tool8", "tool"],
    "31": ["tube1", "tube"],
    "32": ["tube2", "tube"],
    "33": ["tube3", "tube"],
    "34": ["tube4", "tube"],
    "35": ["tube5", "tube"],
    "36": ["tube6", "tube"],
    "37": ["tube7", "tube"],
    "38": ["tube8", "tube"],
};

interact('.draggable')
    .draggable({
        snap: {
            targets: [startPos],
            range: Infinity,
            relativePoints: [{
                x: 0.5,
                y: 0.5
            }],
            endOnly: true
        },
        inertia: false,
        restrict: {
            restriction: "parent",
            endOnly: false,
            elementRect: {
                top: 0,
                left: 0,
                bottom: 1,
                right: 1
            }
        },
        onmove: dragMoveListener,
    });

function dragMoveListener(event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    // translate the element
    target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.setAttribute('data-true-x', $(target).offset().top);
    target.setAttribute('data-true-y', $(target).offset().left);
}

interact('.dropzone').dropzone({
    // Require a 25% element overlap for a drop to be possible
    overlap: .25,

    // listen for drop related events:

    ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
    },
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
            dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
    },
    ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        event.relatedTarget.classList.remove('dropped');

        // Remove snapping
        event.draggable.draggable({
            snap: {
                targets: [null]
            }
        });

        // Delete tool from toolsContained
        if ($(event.relatedTarget).attr('data-index') !== undefined) {
            $(event.target).data('toolsContained').splice($(event.relatedTarget).attr('data-index'), 1);
        }
    },
    ondrop: function (event) {
        event.relatedTarget.classList.add('dropped');
        // event.relatedTarget.textContent = 'Dropped';
        var toolName = event.relatedTarget.getAttribute('data-name');
        $(event.target).data('toolsContained').push(toolName);
        // Store tool index
        event.relatedTarget.setAttribute('data-index', $(event.target).data('toolsContained').length - 1);
    },
    ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
    }
});

var timerInterval = null;
var seconds = GAMELENGTH;

function timer(timerDisplay) {
    if (seconds >= 0) {
        if (seconds < GAMELENGTH / 2) {
            $("#done").fadeIn(500);
        }
        timerDisplay.innerText = seconds;
        seconds--;
        savePositions("state" + seconds);
    } else {
        saveGameToLocal(dataToSave, endGameFunctions);
    }
}

function startTimer() {
    var timerDisplay = document.getElementById('timer');
    var timerWidthDecrease = $("#timer-bar").width() / 60;

    dataToSave.datetime = JSON.stringify(new Date());

    timerInterval = setInterval(function () {
        timer(timerDisplay)
        $("#timer-bar").width($("#timer-bar").width() - timerWidthDecrease);
        $("#timer-bar").css("left", "+=" + timerWidthDecrease / 2);
    }, 1000);
}

function addToolsStorage() {
    $('.dropzone').each(function (i, obj) {
        $(obj).data('toolsContained', new Array());
    });
}

function savePositions(state) {
    dataToSave.state[0][state] = {};
    $('.draggable').each(function (i, obj) {
        var tool = $(obj).attr('data-name');
        var id = $(obj).attr('data-object-id');
        // undefined if object is never clicked 
        dataToSave.state[0][state][images[tool][0] + "_" + id] = [$(obj).attr('data-true-x'), $(obj).attr('data-true-y')];
    });
}

function saveTools() {
    dataToSave.tools = [{}];
    $('.draggable').each(function (i, obj) {
        var tool = $(obj).attr('data-name');
        var id = $(obj).attr('data-object-id');
        dataToSave.tools[0][images[tool][0] + "_" + id] = [$(obj).attr('data-rotate'), $(obj).attr('data-blur')];
    });
}

function saveGroupings() {
    $('.dropzone').each(function (i, obj) {
        var toolsContained = $(obj).data('toolsContained');

        dataToSave["bin" + i] = [];

        for (var j = 0; j < toolsContained.length; j++) {
            var tool = toolsContained[j];
            var toolName = images[tool][0];

            dataToSave["bin" + i].push(toolName);
            itemsPlaced++;
        }
    });
    $('.timesup').css({opacity: 0, display: 'flex'}).animate({
        opacity: 1
    }, 1000);
}

var numTools;
var topZIndex;

function drawTools() {
    // numTools = Math.floor(Math.random() * 10) + 10;
    numTools = NUMBEROFTOOLS;
    topZIndex = numTools + 1;
    for (i = 0; i < numTools; i++) {
        var tool = Math.floor(Math.random() * Object.keys(images).length) + 1;
        var workbench = document.getElementById('workbench');

        var deg = Math.floor(Math.random() * 360);
        var blur = Math.floor(Math.random() * 2);

        var img = document.createElement("img");
        img.setAttribute("src", "./images/" + tool + ".png");
        img.setAttribute("height", "60%");
        img.setAttribute("width", "60%");
        img.setAttribute("style", "transform:rotate(" + deg + "deg);" + "filter: blur(" + blur + "px) brightness(125%)");
        // img.setAttribute("filter", "brightness(200%)");

        var div = document.createElement('div');
        div.setAttribute("class", "draggable");
        div.setAttribute("data-name", tool);
        div.setAttribute("data-rotate", deg);
        div.setAttribute("data-blur", blur);
        div.setAttribute("data-object-id", i);

        // Random x, y pos
        var x = Math.floor(Math.random() * (window.innerWidth * 0.9)) + (window.innerWidth * 0.05);
        var y = Math.floor(Math.random() * (window.innerHeight * 0.3)) + (window.innerHeight * 0.6);
        div.style.position = "absolute";
        div.style.left = x + "px";
        div.style.top = y - 100 + "px";

        $(div).prepend(img);

        div.addEventListener('mousedown', moveToFront);

        workbench.appendChild(div);
    }
    // Save the tool rotation & blur
    saveTools();
}

function moveToFront(deg) {
    $(this).css('z-index', topZIndex++);
}

jQuery(document).ready(checkContainer);

function checkContainer() {
    if ($('#workbench').is(':visible')) { //if the container is visible on the page
        dataToSave.player = localStorage.getItem('playerName');
        dataToSave.age = localStorage.getItem('playerAge');
        drawTools();
        addToolsStorage();
    } else {
        setTimeout(checkContainer, 50); //wait 50 ms, then try again
    }
}

function startGame() {
    $(".section").fadeOut(800);
    setTimeout(function () {
        startTimer();
    }, 500);
}

function finishedGame() {
    savePositions("state0");
    setTimeout(function () {
        saveGameToLocal(dataToSave, endGameFunctions);
    }, 1000);
}

function quitGame() {
    localStorage.removeItem('gameHistory');

    var top = $("#switch-top");
    top.show();
    top.animate({ top: "50vh"}, 800);

    var bottom = $("#switch-bottom");
    bottom.show();
    bottom.animate({ top: "0vh", left: 0 }, 800);

    var bar = $("#switch-bar");
    bar.delay(800).fadeIn(100);
    bar.delay(800).animate({ width: "20%", left: "40%" }, 800);


    setTimeout(function () {
        window.location.href = "index.html";
    }, 2400);
}

function saveGameToLocal(game, callback) {
    // Save game to local storage to reduce requests to backend
    var gameHistory = JSON.parse(localStorage.getItem('gameHistory'));
    if (gameHistory == null) {
        gameHistory = [];
    }
    gameHistory.push(dataToSave);
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    callback();
}

function endGameFunctions() {
    // End timer
    clearInterval(timerInterval);
    // Save final positions
    savePositions("state" + seconds);
    // Save contents for each bin
    saveGroupings();
    // Save game data to database
    sendToDB();
}

function sendToDB() {
    var req = new XMLHttpRequest();
    req.open('POST', 'https://polar-tundra-56313.herokuapp.com/api/game', true);
    // req.open('POST', 'http://127.0.0.1:5000/api/game', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.onreadystatechange = () => {
        if (this.status === 400) {
            console.log(req.responseText);
        }
    }
    req.send(JSON.stringify(dataToSave));
}

function svmClassify() {
    var req = new XMLHttpRequest();
    req.open('POST', 'https://polar-tundra-56313.herokuapp.com/api/predict', true);
    // req.open('POST', 'http://127.0.0.1:5000/api/predict', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.onloadend = () => {
        console.log(req.responseText);
        showRobotResults(JSON.parse(req.responseText));
    }
    var gameHistory = localStorage.getItem('gameHistory');
    // gameHistory = "[" + gameHistory + "]";
    console.log(gameHistory);
    req.send(gameHistory);
}

function showRobotResults(results) {
    $(".classifying").fadeOut(800);
    $(".post-classify").delay(800).fadeIn(800);

    var accuracy = results["accuracy"];
    var correct = Math.round(itemsPlaced * accuracy);
    var incorrect = Math.round(itemsPlaced * (1 - accuracy));
    var score = 1000 * correct - 300 * incorrect - 200 * (NUMBEROFTOOLS - itemsPlaced);

    document.getElementById("num-correct").innerText = correct;
    document.getElementById("num-incorrect").innerText = incorrect;
    document.getElementById("score").innerText = score;
}

function playAgain() {
    $(".timesup").fadeOut(800);
    $(".pre-classify").show();
    $(".classifying").hide();
    $(".post-classify").hide();

    // Hide early done buttton
    $("#done").hide();

    // Reset timer bar
    $("#timer-bar").css("width", "80%");
    $("#timer-bar").css("left", "10%");

    // Remove old tools
    $(".draggable").remove();
    
    $(".section").fadeIn(800);

    setTimeout(function () {
        drawTools();
        addToolsStorage();
        timerInterval = null;
        seconds = GAMELENGTH;
    }, 800);
}

function transitionToClassifying() {
    $(".pre-classify").fadeOut(800);
    $(".classifying").delay(800).fadeIn(800);
    // Run classifier with gameplay
    svmClassify();
}