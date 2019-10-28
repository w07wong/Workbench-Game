// For snapping
var startPos = null;

var GAMELENGTH = 60;
var NUMBEROFTOOLS = 20

var PLAYER = null;
var AGE = null;

var dataToSave = {};
dataToSave.state = [{}];

localStorage.removeItem('gameHistory');

var bins = ['tool', 'box', 'tube', 'print', 'scrap']

var images = {
    "1": ["box1", "box"],
    "2": ["box2", "box"],
    "3": ["box3", "box"],
    "4": ["box4", "box"],
    "5": ["box5", "box"],
    "6": ["box6", "box"],
    "7": ["box7", "box"],
    "8": ["box8", "box"],
    "9": ["print1", "print"],
    "10": ["print2", "print"],
    "11": ["print3", "print"],
    "12": ["print4", "print"],
    "13": ["print5", "print"],
    "14": ["print6", "print"],
    "15": ["print7", "print"],
    "16": ["print8", "print"],
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
        $("#done").fadeIn(500);
        timerDisplay.innerText = seconds;
        seconds--;
        savePositions("state" + seconds);
    } else {
        saveGameToLocal(dataToSave, endGameFunctions);
    }
}

function startTimer() {
    var timerDisplay = document.getElementById('timer');

    dataToSave.datetime = JSON.stringify(new Date());

    timerInterval = setInterval(function () {
        timer(timerDisplay)
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
        }
    });
    $('.timesup').css({opacity: 0, display: 'flex'}).animate({
        opacity: 1
    }, 500);
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
        var y;
        if (window.innerHeight < 800) {
            y = Math.floor(Math.random() * (window.innerHeight * 0.1)) + (window.innerHeight * 0.75);
        } else {
            y = Math.floor(Math.random() * (window.innerHeight * 0.2)) + (window.innerHeight * 0.65);
        }
        div.style.position = "absolute";
        div.style.left = x + "px";
        div.style.top = y - 100 + "px";

        $(div).prepend(img);

        div.setAttribute('data-true-x', x);
        div.setAttribute('data-true-y', y);

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
    $(".section").fadeOut(400);
    setTimeout(function () {
        startTimer();
    }, 400);
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
    bar.delay(200).animate({ width: "20%", left: "40%" }, 800);

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

function scoreGame() {
    var correct = 0;
    var incorrect = 0;

    $('.dropzone').each(function (i, obj) {
        var toolsContained = $(obj).data('toolsContained');
        var binCategory = bins[i];

        for (var j = 0; j < toolsContained.length; j++) {
            var tool = toolsContained[j];
            var toolCategory = images[tool][1];

            if (toolCategory == binCategory) {
                correct++;
            } else {
                incorrect++;
            }
        }
    });

    showResults(correct, incorrect, NUMBEROFTOOLS - (correct + incorrect));
}

function showResults(correct, incorrect, itemsPlaced) {
    $(".classifying").fadeOut(800);

    var score = 1000 * correct - 300 * incorrect - 200 * itemsPlaced;

    var req = new XMLHttpRequest();
    req.open('POST', 'https://polar-tundra-56313.herokuapp.com/api/score', true);
    // req.open('POST', 'http://127.0.0.1:5000/api/score', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify({'player': localStorage.getItem('playerName'), 'score': score, 'datetime': new Date().toString()}));

    setTimeout(() => {
        $(".post-classify").delay(800).fadeIn(800);
        document.getElementById("num-correct").innerText = correct;
        document.getElementById("num-incorrect").innerText = incorrect;
        document.getElementById("num-left").innerText = itemsPlaced;
        document.getElementById("score").innerText = score;
    }, 805);
}

function playAgain() {
    $(".timesup").hide();

    // Hide early done buttton
    $("#done").hide();

    // Remove old tools
    $(".draggable").remove();
    
    $(".section").fadeIn();

    $(".pre-classify").show();
    $(".classifying").hide();
    $(".post-classify").hide();

    setTimeout(function () {
        drawTools();
        addToolsStorage();
        timerInterval = null;
        seconds = GAMELENGTH;
        document.getElementById('timer').innerText = GAMELENGTH;
    }, 800);
}

function transitionToClassifying() {
    $(".pre-classify").fadeOut(400);
    $(".classifying").delay(400).fadeIn(400);
    // Score gameplay
    scoreGame();
}

function showLeaderboard() {
    // Get leaderbaord
    var req = new XMLHttpRequest();
    req.open('GET', 'https://polar-tundra-56313.herokuapp.com/api/leaderboard', true);
    // req.open('GET', 'http://127.0.0.1:5000/api/leaderboard', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.onloadend = () => {
        $(".leaderboard-loader").fadeOut(400);
        $(".leaderboard").delay(400).fadeIn(400);
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

    $('.leaderboard-popup').css({opacity: 0, display: 'flex'}).animate({
        opacity: 1
    }, 400);
}

function hideLeaderboard() {
    $('.leaderboard-popup').fadeOut(400);
}