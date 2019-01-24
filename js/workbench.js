interact('.draggable')
    .draggable({
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
}

interact('.dropzone').dropzone({
    // only accept elements matching this CSS selector
    // accept: '#yes-drop',
    // Require a 75% element overlap for a drop to be possible
    overlap: 1,

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
        draggableElement.textContent = 'Dragged in';
    },
    ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        event.relatedTarget.classList.remove('dropped');
        event.relatedTarget.textContent = 'Dragged out';
        // Delete tool from toolsContained
        if ($(event.relatedTarget).attr('data-index') !== undefined) {
            $(event.target).data('toolsContained').splice($(event.relatedTarget).attr('data-index'), 1);
        }
    },
    ondrop: function (event) {
        event.relatedTarget.classList.add('dropped');
        event.relatedTarget.textContent = 'Dropped';
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
var seconds = 5; 
function timer(timerDisplay) {
    if (seconds >= 0) {
        timerDisplay.innerText = seconds;
        seconds--;
    } else {
        clearInterval(timerInterval);
        alert('Time\'s Up!');
        saveGroupings();
    }
}

function startTimer() {
    drawTools();
    addToolsStorage();
    document.getElementById('startButton').hidden = true;
    var timerDisplay = document.getElementById('timer');
    timerInterval = setInterval(function() {timer(timerDisplay)}, 1000);
}

function addToolsStorage() {
    $('.dropzone').each(function(i, obj) {
        $(obj).data('toolsContained', new Array());
    });
}

function saveGroupings() {
    $('.dropzone').each(function(i, obj) {
        console.log($(obj).data('toolsContained'));
    }); 
    $('.draggable').each(function(i, obj) {
        // undefined if object is never clicked
        console.log($(obj).attr('data-name') + ": " + $(obj).attr('data-x') + ', ' + $(obj).attr('data-y'));
    }); 
}

var images = {
    "1": "angle-grinder",
    "2": "battery",
    "3": "circular-saw",
    "4": "drill",
    "5": "hammer-drill",
    "6": "hammer",
    "7": "hand-saw",
    "8": "impact-driver",
    "9": "jigsaw",
    "10": "orbital-sander",
    "11": "reciprocating-saw",
    "12": "right-angle-drill",
    "13": "side-cutter",
    "14": "snips",
    "15": "utility-knife",
    "16": "wrench"
};

var numTools;
var topZIndex;
function drawTools() {
    numTools = Math.floor(Math.random() * 20) + 20;
    topZIndex = numTools + 1;
    for (i = 0; i < numTools; i++) {
        var tool = Math.floor(Math.random() * Object.keys(images).length) + 1;
        var workbench = document.getElementById('workbench');

        var d = document.createElement('div');
        d.innerHTML = "<img data-name=\"" + images[tool] + "\" class=\"draggable\" src=\"images\\" + tool + ".png\" width=\"150\" height=\"150\">";
        var element = d.firstChild;
        element.addEventListener('click', moveToFront);

        workbench.appendChild(element);
        // add event listener
    }
}

function moveToFront() {
    $(this).css('z-index', topZIndex++);
}