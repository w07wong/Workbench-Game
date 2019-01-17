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
    },
    ondrop: function (event) {
        event.relatedTarget.classList.add('dropped');
        event.relatedTarget.textContent = 'Dropped';
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
    } else {
        clearInterval(timerInterval);
        alert('Time\'s Up!');
    }
}

function startTimer() {
    document.getElementById('startButton').hidden = true;
    var timerDisplay = document.getElementById('timer');
    timerInterval = setInterval(function() {timer(timerDisplay)}, 1000);
}
