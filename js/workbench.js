// For snapping
var startPos = null;

var GAMELENGTH = 60;

var PLAYER = null;
var AGE = null;
var FEEDBACK = null;

var dataToSave = {};
dataToSave.state = [{}];

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
    "23": ["scrap7", "scrap"],
    "24": ["scrap8", "scrap"],
    "25": ["tool1", "tool"],
    "26": ["tool2", "tool"],
    "27": ["tool3", "tool"],
    "28": ["tool4", "tool"],
    "29": ["tool5", "tool"],
    "30": ["tool6", "tool"],
    "31": ["tool7", "tool"],
    "32": ["tool8", "tool"],
    "33": ["tube1", "tube"],
    "34": ["tube2", "tube"],
    "35": ["tube3", "tube"],
    "36": ["tube4", "tube"],
    "37": ["tube5", "tube"],
    "38": ["tube6", "tube"],
    "39": ["tube7", "tube"],
    "40": ["tube8", "tube"],
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
        // onstart: function (event) {
        //     var rect = interact.getElementRect(event.target);
        //     // record center point when starting the very first a drag
        //     startPos = {
        //         x: rect.left + rect.width  / 2,
        //         y: rect.top  + rect.height / 2
        //     }
        //     event.interactable.draggable({
        //         snap: {
        //             targets: [startPos]
        //         }
        //     });
        // },
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
    // only accept elements matching this CSS selector
    // accept: '#yes-drop',
    // Require a 75% element overlap for a drop to be possible
    overlap: .25,

    // listen for drop related events:

    ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
    },
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
            dropzoneElement = event.target,
            dropRect = interact.getElementRect(dropzoneElement);
        // dropCenter = {
        //   x: dropRect.left + dropRect.width  / 2,
        //   y: dropRect.top  + dropRect.height / 2
        // };

        // event.draggable.draggable({
        //     snap: {
        //         targets: [dropCenter]
        //     }
        // });

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
        // draggableElement.textContent = 'Dragged in';
    },
    ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        event.relatedTarget.classList.remove('dropped');
        // event.relatedTarget.textContent = 'Dragged out';

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
        timerDisplay.innerText = seconds;
        seconds--;
        savePositions("state" + seconds);
    } else {
        saveGameToLocal(dataToSave, endGameFunctions);
    }
}

function startTimer() {
    drawTools();
    addToolsStorage();
    // document.getElementById('startButton').hidden = true;
    var timerDisplay = document.getElementById('timer');
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
        // console.log(images[tool][0] + ": " + $(obj).attr('data-true-x') + ', ' + $(obj).attr('data-true-y'));
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
    var totalScore = 0;
    $('.dropzone').each(function (i, obj) {
        var toolsContained = $(obj).data('toolsContained');

        dataToSave["bin" + i] = [];

        var cutting = 0;
        var power = 0;
        var drilling = 0;
        var hand = 0;

        for (var j = 0; j < toolsContained.length; j++) {
            var tool = toolsContained[j];
            var toolName = images[tool][0];
            var toolCategory = images[tool][1];

            dataToSave["bin" + i].push(toolName);
            // console.log(toolName);

            switch (toolCategory) {
                case "cutting-tool":
                    cutting++;
                case "power-tool":
                    power++;
                case "drilling-tool":
                    drilling++;
                case "hand-tool":
                    hand++;
                default:
                    break;
            }
        }
        var binScore = parseInt((cutting / 2)) + parseInt((cutting / 2)) + parseInt((cutting / 2)) + parseInt((cutting / 2));
        console.log(binScore);
        totalScore += binScore;
    });
    alert("Times Up! \nYour score: " + totalScore);
}

var numTools;
var topZIndex;

function drawTools() {
    // numTools = Math.floor(Math.random() * 10) + 10;
    numTools = 30;
    topZIndex = numTools + 1;
    for (i = 0; i < numTools; i++) {
        var tool = Math.floor(Math.random() * Object.keys(images).length) + 1;
        var workbench = document.getElementById('workbench');

        var deg = Math.floor(Math.random() * 360);
        var blur = Math.floor(Math.random() * 5);

        var img = document.createElement("img");
        img.setAttribute("src", "./images/" + tool + ".png");
        // img.setAttribute("height", "150");
        // img.setAttribute("width", "150");
        img.setAttribute("style", "transform:rotate(" + deg + "deg);" +
            "filter:blur(" + blur + "px)");

        var div = document.createElement('div');
        div.setAttribute("class", "draggable");
        div.setAttribute("data-name", tool);
        div.setAttribute("height", "100%");
        div.setAttribute("width", "150px");
        div.setAttribute("data-rotate", deg);
        div.setAttribute("data-blur", blur);
        div.setAttribute("data-object-id", i);

        // Random x, y pos
        var x = Math.floor(Math.random() * (window.innerWidth / 2)) + window.innerWidth / 5;
        var y = Math.floor(Math.random() * (window.innerHeight / 2)) + window.innerHeight / 5;
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
        promptUser();
        // startTimer();
    } else {
        setTimeout(checkContainer, 50); //wait 50 ms, then try again
    }
}

function promptUser() {
    promptName();
    promptAge();
    startTimer();
}

function promptName() {
    var person = prompt("Please enter your name:", "");
    PLAYER = person;
    dataToSave.player = PLAYER;
}

function promptAge() {
    var age = prompt("Please enter your age:", "");
    AGE = age;
    dataToSave.age = AGE;
    alert("Organize the workbench in the next 60 seconds!");
}

function promptFeedback() {
    var feedback = prompt("What was your organization strategy?", "ex: By color, shape, utility, etc.");
    FEEDBACK = feedback;
    dataToSave.feedback = FEEDBACK;
}

function saveGameToLocal(game, callback) {
    // Save game to local storage to reduce requests to backend
    var gameHistory = JSON.parse(localStorage.getItem('gameHistory'));
    if (gameHistory == null) {
        gameHistory = []
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
    // Ask user how they grouped tools
    promptFeedback();
    // Save game data to database
    sendToDB();
    // Run classifier with gameplay
    svmClassify();
}

function sendToDB() {
    var req = new XMLHttpRequest();
    // req.open('POST', 'https://polar-tundra-56313.herokuapp.com/api/game', true);
    req.open('POST', 'http://127.0.0.1:5000/api/game', true);
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
    // req.open('POST', 'https://polar-tundra-56313.herokuapp.com/api/predict', true);
    req.open('POST', 'http://127.0.0.1:5000/api/predict', true);
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
    var modal = document.getElementById('popup');
    modal.style.display = "block";
    document.getElementById("popup-accuracy").innerHTML = "Accuracy: " + results["accuracy"];

    document.getElementById("classify-table").innerHTML = "";

    for (key in results) {
        if (key !== "accuracy") {
            var row = "";

            row += "<tr>";
            row += "<td>" + key + "</td>";

            var classifications = "<td>";

            for (var i = 0; i < results[key].length; i++) {
                var t = results[key][i];
                var s = "";
                if (t[1]) {
                    s = "<span style=\"color:green;\">" + t[0] + "</span>";
                } else {
                    s = "<span style=\"color:red;\">" + t[0] + "</span>";
                }
                if (i !== results[key].length - 1) {
                    s += ", ";
                }
                classifications += s;
            }

            classifications += "</td>";

            row += classifications;
            document.getElementById("classify-table").innerHTML += row;
        }
    }
}

function closePopup() {
    var modal = document.getElementById('popup');
    modal.style.display = "none";
    
    // Play again?
    var playAgain = confirm("Play again?");
    if (playAgain !== true) {
        localStorage.removeItem('gameHistory');
    } else {
        // Remove old tools
        $(".draggable").remove();
        

        alert("Organize the workbench in the next 60 seconds!");
        timerInterval = null;
        seconds = GAMELENGTH;
        startTimer();
    }
}

function showBeforeBlur() {

}