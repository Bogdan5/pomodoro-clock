window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function (f) { return setTimeout(f, 1000 / 60) };

window.cancelAnimationFrame = window.cancelAnimationFrame
    || window.mozCancelAnimationFrame
    || function (requestID) { clearTimeout(requestID) };

var pomodoro = function () {
    var sessionLength = 0; //number of minutes of session
    var breakLength = 0;//number of minutes of break
    var continuousCycle = false;//set by button - true if at the end of the break another session restarts
    var isStopped = false;//true if user pauses the timer
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext('2d');
    var  timeLeft;//calculates time left
    var sessionUpd;//duration of break or session (in turn) updated to account for 
                    //instances when the clock is paused
    var strt = false;//the timestamp when timing begins
    var typeOfCycle;//string that can be session or break
    var start = -0.5 * Math.PI; //the starting point of the arc being drawn
    var nextStart;//the end point of arcs being dran
    var requestframeref;//variable needed to be able to cancel requestAnimationFrame
    var isRunning = false;//indicates when timer is working; used to block changes to durations while the animation occurs 
    
    //this function manages the input of duration length for sessions and breaks
    function setLength(type, x) {
        var sess = document.getElementById("sess"),
            brk = document.getElementById("brk");
        if (!isRunning) {
            if (type === 'sess') {
                if (((sessionLength !== 99) || (x === -1)) && ((sessionLength > 0) || (x === 1))) {
                    sessionLength += x;
                    sess.innerHTML = (sessionLength < 10) ? '0' + sessionLength : sessionLength;
                }
            } else {
                if (((breakLength !== 99) || (x === -1)) && ((breakLength > 0) || (x === 1))) {
                    breakLength += x;
                    brk.innerHTML = (breakLength < 10) ? '0' + breakLength : breakLength;
                }
            }
        }
        
    }
    //this function times the timer display and the graphic
    function timer(timestamp) {
        var timeDoc = document.getElementById("timer"); //displays the 
        var arr=[];//an array containing return from transformDuration, containing minutes and seconds left

        isRunning = true;
        timeDoc.innerHTML = sessionLength + ":00";
        ctx.lineWidth = 20;
        if ((sessionLength > 0) && (typeOfCycle==="session")) {
            document.getElementById('timerType').innerHTML = 'Session time left';
        } else if ((typeOfCycle === "break") && (breakLength > 0)) {
            document.getElementById('timerType').innerHTML = 'Break time left';
        }
        //strt saves the timestamp when the timing is initiated
        if (strt===true) {
            strt = timestamp;
        }
        //remaining time is calculated by deducting the duration between the moment timing //is initiated and the current timestamp
        timeLeft = Math.round(sessionUpd - timestamp + strt);
        arr = transformDuration(timeLeft);
        if ((arr[0]>0)||(arr[1]>0)) {
            timeDoc.innerHTML = arr[2];
            nextStart = start + 2 * arr[3] * Math.PI / (60 * (sessionLength + breakLength));
            drawCircle(start, nextStart, 1, typeOfCycle);
            
            requestframeref = requestAnimationFrame(timer);
        } else if ((arr[0] === 0)&&(arr[1] === 0)){ //starts the break cycle
            var alarm = new Audio();
            alarm.src = "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";
            alarm.play();
            if (typeOfCycle === "session") {
                timeDoc.innerHTML = arr[2];
                nextStart = start + 2 * arr[3] * Math.PI / (60 * (sessionLength + breakLength));
                drawCircle(start, nextStart, 1, typeOfCycle);
                timeDoc.innerHTML = "00:00";
                sessionUpd = breakLength * 60000;
                typeOfCycle = "break";
                strt = true;
                start = nextStart;
                nextStart = -0.5 * Math.PI;

                if (breakLength > 0) {
                    fillCircle("#990000");
                }
                requestframeref = requestAnimationFrame(timer);
            } else if (typeOfCycle === "break") {
                timeDoc.innerHTML = arr[2];
                nextStart = -0.5 * Math.PI;
                drawCircle(start, nextStart, 1, typeOfCycle);
                if (continuousCycle) {//restarts the cycle if cycleContinuous is true
                    sessionUpd = sessionLength * 60000;
                    typeOfCycle = "session";
                    strt = true;
                    start = -0.5 * Math.PI;
                    ctx.clearRect(0, 0, 350, 350);
                    if (sessionLength > 0) {
                        fillCircle("#4d4d00");
                    }
                    timeLeft = Math.round(sessionUpd - timestamp + strt);
                    arr = transformDuration(timeLeft);
                    timeDoc.innerHTML = arr[2];
                    timeDoc.innerHTML = "00:00";
                    requestframeref = requestAnimationFrame(timer);
                }
            }
        } else {
            isRunning = false;
        }
    }
    //returns an array with 4 elements:minutes left, seconds left, min:sec string, and
    //miliseconds left
    function transformDuration(x) {
        var resArray = [];
        var min = (x - x % 60000) / 60000;
        x -= min * 60000;
        var sec = (x - x % 1000) / 1000;
        resArray.push(min, sec);
        
        if (sec < 10) {
            resArray.push(min + ":0" + sec);
        } else {
            resArray.push(min + ":" + sec);
        }
        if (typeOfCycle==="session") {
            resArray.push(sessionLength*60-resArray[0]*60-resArray[1]);
        } else {
            resArray.push(breakLength * 60 - resArray[0] * 60 - resArray[1]);
        }
        return resArray;
    }
    //draws the circle and animation
    function drawCircle(start, end, opac, type) {
        ctx.beginPath();
        if (type==="session") {
            ctx.strokeStyle = "#4d4d00";
        } else {
            ctx.strokeStyle = "#990000";
        }
        ctx.globalAlpha = opac;
        ctx.arc(175, 175, 150, start, end);
        ctx.stroke();
    }
    //fills out the circle 
    function fillCircle(colour) {
        ctx.beginPath();
        ctx.strokeStyle = colour;
        ctx.lineWidth = 1;
        ctx.arc(175, 175, 120, 0, 2 * Math.PI);
        ctx.fillStyle = colour;
        ctx.fill();
        ctx.stroke();
    }
    //starts the timer
    function run() {
        isStopped = false;
        sessionUpd = sessionLength * 60000;
        typeOfCycle = "session";
        document.getElementById("timerDiv").style.opacity = 1;
        strt = true;
        start = -0.5 * Math.PI;
        ctx.clearRect(0, 0, 350, 350);
        if (sessionLength > 0) {
            fillCircle("#4d4d00");
        }
        requestAnimationFrame(timer);
    }
    //stops and restarts timer
    function stopCycle() {
            var st = document.getElementById("stopBtn");
            //restart the cycle
            if (isStopped) {
                strt = true;
                isStopped = false;
                st.innerHTML = "Pause";
                requestAnimationFrame(timer);
            } else {    //restarts the cycle
                isStopped = true;
                sessionUpd = timeLeft;
                st.innerHTML = "Continue";
                cancelAnimationFrame(requestframeref);
            }
    }

    function continuousCycleSet() {
        var cyc = document.getElementById("continuous");
        if (!continuousCycle) {
            continuousCycle = true;
            cyc.innerHTML = "Remove continuous repeat";
        } else {
            continuousCycle = false;
            cyc.innerHTML = "Set continuous repeat";
        }
    }

    return {
        init: setLength,
        run: run,
        stop: stopCycle,
        cycle: continuousCycleSet
    };
}();
