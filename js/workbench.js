// For snapping
var startPos = null;

var PLAYER = null;
var AGE = null;
var FEEDBACK = null;

var dataToSave = {};
dataToSave.state = {};

var images = {
    "1": ["angle-grinder", "cutting-tool"],
    "2": ["battery", "power-tool"],
    "3": ["circular-saw", "cutting-tool"],
    "4": ["drill", "drilling-tool"],
    "5": ["hammer-drill", "drilling-tool"],
    "6": ["hammer", "hand-tool"],
    "7": ["hand-saw", "cutting-tool"],
    "8": ["impact-driver", "drilling-tool"],
    "9": ["jigsaw", "cutting-tool"],
    "10": ["orbital-sander", "power-tool"],
    "11": ["reciprocating-saw", "cutting-tool"],
    "12": ["right-angle-drill", "drilling-tool"],
    "13": ["side-cutter", "cutting-tool"],
    "14": ["snips", "cutting-tool"],
    "15": ["utility-knife", "cutting-tool"],
    "16": ["wrench", "hand-tool"],
};

interact('.draggable')
    .draggable({
        snap: {
            targets: [startPos],
            range: Infinity,
            relativePoints: [ {x: 0.5, y: 0.5 } ],
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
var seconds = 2; 
function timer(timerDisplay) {
    if (seconds >= 0) {
        timerDisplay.innerText = seconds;
        seconds--;
        savePositions("state" + seconds);
    } else {
        clearInterval(timerInterval);
        savePositions("state" + seconds);
        saveGroupings();
        saveTools();
        promptFeedback();
        sendToDB();
    }
}

function startTimer() {
    drawTools();
    addToolsStorage();
    // document.getElementById('startButton').hidden = true;
    var timerDisplay = document.getElementById('timer');
    timerInterval = setInterval(function() {timer(timerDisplay)}, 1000);
}

function addToolsStorage() {
    $('.dropzone').each(function(i, obj) {
        $(obj).data('toolsContained', new Array());
    });
}

function savePositions(state) {
    dataToSave.state[state]= {};
    $('.draggable').each(function(i, obj) {
        var tool = $(obj).attr('data-name');
        var id = $(obj).attr('data-object-id'); 
        // undefined if object is never clicked 
        // console.log(images[tool][0] + ": " + $(obj).attr('data-true-x') + ', ' + $(obj).attr('data-true-y'));
        dataToSave.state[state][images[tool][0] + "_" + id] = [$(obj).attr('data-true-x'), $(obj).attr('data-true-y')];
    }); 
}

function saveTools() {
    dataToSave.tools = {};
    $('.draggable').each(function(i, obj) {
        var tool = $(obj).attr('data-name');
        var id = $(obj).attr('data-object-id');
        dataToSave.tools[images[tool][0] + "_" + id] = [$(obj).attr('data-rotate'), $(obj).attr('data-blur')];
    }); 
}

function saveGroupings() {
    var totalScore = 0;
    $('.dropzone').each(function(i, obj) {
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

            switch(toolCategory) {
                case "cutting-tool": cutting++;
                case "power-tool": power++;
                case "drilling-tool": drilling++;
                case "hand-tool": hand++;
                default: break;
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
    numTools = 2;
    topZIndex = numTools + 1;
    for (i = 0; i < numTools; i++) {
        var tool = Math.floor(Math.random() * Object.keys(images).length) + 1;
        var workbench = document.getElementById('workbench');

        var deg = Math.floor(Math.random() * 360);
        var blur = Math.floor(Math.random() * 10);
        // console.log(deg);

        var img = document.createElement("img");
        img.setAttribute("src", "./images/" + tool + ".png");
        img.setAttribute("height", "150");
        img.setAttribute("width", "150");
        img.setAttribute("style", "transform:rotate(" + deg + "deg);" +
                                  "filter:blur(" + blur + "px)");

        var div = document.createElement('div');
        div.setAttribute("class", "draggable");
        div.setAttribute("data-name", tool);
        div.setAttribute("height", "100%");
        div.setAttribute("width", "100%");
        div.setAttribute("data-rotate", deg);
        div.setAttribute("data-blur", blur);
        div.setAttribute("data-object-id", i);

        $(div).prepend(img);

        div.addEventListener('mousedown', moveToFront);

        workbench.appendChild(div);
        // add event listener
    }
}

function moveToFront(deg) {
    $(this).css('z-index', topZIndex++);
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
}

function promptFeedback() {
    var feedback = prompt("What was your organization strategy?", "ex: By color, shape, utility, etc.");
    FEEDBACK = feedback;
    dataToSave.feedback = FEEDBACK;
}

function sendToDB() {
   var req = new XMLHttpRequest();
   req.open('POST', 'https://workbench-game.herokuapp.com/api/game', true);
   req.setRequestHeader('Content-Type', 'application/json');
   req.onreadystatechange = () => {
       if (this.status === 400){
           console.log(req.responseText);
       }
   }
   req.send(JSON.stringify(dataToSave));
}